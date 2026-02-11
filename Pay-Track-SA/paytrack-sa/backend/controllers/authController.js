const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { config } = require('../config');
const { createOrganization, getOrganizationByEmail } = require('../models/organizations');

const RegisterSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['Rental', 'School', 'Gym', 'SME']),
  email: z.string().email(),
  password: z.string().min(8),
  consent_flag: z.boolean(),
});

async function registerOrg(req, res, next) {
  try {
    const parsed = RegisterSchema.parse(req.body);

    if (!parsed.consent_flag) {
      return res.status(400).json({ error: 'POPIA consent is required to create an account.' });
    }

    const existing = await getOrganizationByEmail(parsed.email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(parsed.password, 10);
    const org = await createOrganization({
      name: parsed.name,
      type: parsed.type,
      email: parsed.email,
      password_hash,
    });

    const token = jwt.sign(
      { orgId: org.id, email: org.email, type: org.type },
      config.jwtSecret,
      { expiresIn: '12h' }
    );

    return res.status(201).json({ organization: org, token });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.flatten() });
    return next(err);
  }
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function login(req, res, next) {
  try {
    const parsed = LoginSchema.parse(req.body);
    const org = await getOrganizationByEmail(parsed.email);
    if (!org) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(parsed.password, org.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { orgId: org.id, email: org.email, type: org.type },
      config.jwtSecret,
      { expiresIn: '12h' }
    );

    return res.json({ token, organization: { id: org.id, name: org.name, type: org.type, email: org.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.flatten() });
    return next(err);
  }
}

module.exports = { registerOrg, login };
