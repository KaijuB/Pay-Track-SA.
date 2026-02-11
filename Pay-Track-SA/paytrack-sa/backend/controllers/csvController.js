const { z } = require('zod');
const { parse } = require('csv-parse/sync');
const { upsertConsumer } = require('../models/consumers');
const { insertPaymentRecord } = require('../models/payments');
const { recomputeRiskHistory } = require('./riskController');

const UploadSchema = z.object({
  mapping: z.record(z.string(), z.string()).refine(
    (m) => !!m.id_number && !!m.full_name && !!m.month && !!m.amount_due && !!m.amount_paid,
    { message: 'Mapping must include: id_number, full_name, month, amount_due, amount_paid' }
  ),
  consent_confirmed: z.boolean().refine((v) => v === true, {
    message: 'POPIA consent must be confirmed before uploading consumer data.'
  }),
});

function toMonth(value) {
  const v = String(value ?? '').trim();
  const m = v.match(/^(\d{4})[-\/](\d{2})$/);
  if (!m) throw new Error(`Invalid month format: "${v}". Expected YYYY-MM.`);
  return `${m[1]}-${m[2]}`;
}

function toNumber(value, fieldName) {
  const n = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${fieldName}`);
  return n;
}

function statusFrom({ amount_due, amount_paid }) {
  if (amount_paid >= amount_due && amount_due > 0) return 'Paid';
  if (amount_paid > 0 && amount_paid < amount_due) return 'Late';
  return 'Missed';
}

async function uploadCsv(req, res, next) {
  try {
    const orgId = req.user.orgId;

    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Missing CSV file' });
    }

    const body = {
      mapping: req.body.mapping ? JSON.parse(req.body.mapping) : {},
      consent_confirmed: req.body.consent_confirmed === 'true' || req.body.consent_confirmed === true,
    };

    const { mapping } = UploadSchema.parse(body);

    const records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'CSV contained no rows' });
    }

    const affectedConsumerIds = new Set();

    for (const row of records) {
      const id_number = String(row[mapping.id_number] ?? '').trim();
      const full_name = String(row[mapping.full_name] ?? '').trim();
      const month = toMonth(row[mapping.month]);
      const amount_due = toNumber(row[mapping.amount_due], 'amount_due');
      const amount_paid = toNumber(row[mapping.amount_paid], 'amount_paid');

      if (!id_number || !full_name) throw new Error('Missing id_number or full_name');

      const contact_email = mapping.contact_email ? String(row[mapping.contact_email] ?? '').trim() : null;
      const contact_phone = mapping.contact_phone ? String(row[mapping.contact_phone] ?? '').trim() : null;
      const date_paid = mapping.date_paid ? (String(row[mapping.date_paid] ?? '').trim() || null) : null;

      const consumer = await upsertConsumer({
        organization_id: orgId,
        full_name,
        id_number,
        contact_email,
        contact_phone,
        consent_flag: true,
      });

      const status = statusFrom({ amount_due, amount_paid });

      await insertPaymentRecord({
        consumer_id: consumer.id,
        month,
        amount_due,
        amount_paid,
        date_paid,
        status,
      });

      affectedConsumerIds.add(consumer.id);
    }

    // recompute risk for affected consumers
    const recomputed = [];
    for (const consumer_id of affectedConsumerIds) {
      const history = await recomputeRiskHistory(consumer_id);
      recomputed.push({ consumer_id, latest: history[history.length - 1] || null });
    }

    return res.json({ ok: true, rows: records.length, recomputed });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.flatten() });
    return next(err);
  }
}

module.exports = { uploadCsv };
