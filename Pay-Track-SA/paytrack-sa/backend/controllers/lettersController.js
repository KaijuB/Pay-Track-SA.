const { z } = require('zod');
const { config } = require('../config');
const { getConsumerById } = require('../models/consumers');
const { listPaymentsByConsumer } = require('../models/payments');
const { listRiskHistoryByConsumer } = require('../models/risk');

const LetterSchema = z.object({
  consumer_id: z.number().int().positive(),
});

function buildTemplate({ orgType, consumer, latestPayment, latestRisk }) {
  const status = latestPayment?.status || 'Unknown';
  const month = latestPayment?.month || '...';
  const amountDue = latestPayment?.amount_due || 0;
  const amountPaid = latestPayment?.amount_paid || 0;
  const score = latestRisk?.score ?? 'N/A';

  const tone = status === 'Missed' ? 'final notice' : status === 'Late' ? 'urgent reminder' : 'friendly reminder';

  return `PAYTRACK SA — ${tone.toUpperCase()}

Date: ${new Date().toISOString().slice(0, 10)}

To: ${consumer.full_name} (ID: ${consumer.id_number})

Subject: Payment status for ${month}

Dear ${consumer.full_name},

Our records for ${orgType} indicate that your payment for ${month} is currently marked as "${status}".

- Amount due: R${Number(amountDue).toFixed(2)}
- Amount paid: R${Number(amountPaid).toFixed(2)}

Your current risk score is ${score} (0–1000). We encourage you to settle the outstanding balance as soon as possible or contact us to arrange a payment plan.

If you believe this notice was sent in error, please respond with proof of payment and the correct reference.

Sincerely,
Accounts Team
PayTrack SA (Beta)

POPIA notice: This communication is generated for the lawful purpose of account administration. If you have not provided consent for processing, please contact us immediately.`;
}

async function maybeUseOpenAI(template, context) {
  if (!config.openaiApiKey) return template;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an assistant that drafts concise, legally cautious payment reminder letters for South African small organizations. Do not include threats or unlawful language. Keep it under 250 words. Keep POPIA awareness.' },
          { role: 'user', content: `Rewrite the following letter to be clearer and more professional, while keeping all facts.\n\nContext:\n${context}\n\nDraft:\n${template}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!resp.ok) return template;
    const data = await resp.json();
    const out = data?.choices?.[0]?.message?.content;
    return out || template;
  } catch (e) {
    return template;
  }
}

async function generateLetter(req, res, next) {
  try {
    const orgId = req.user.orgId;
    const orgType = req.user.type || 'Organization';

    const { consumer_id } = LetterSchema.parse(req.body);
    const consumer = await getConsumerById(consumer_id, orgId);
    if (!consumer) return res.status(404).json({ error: 'Consumer not found' });

    if (!consumer.consent_flag) {
      return res.status(400).json({ error: 'Cannot generate letter: POPIA consent not recorded for this consumer.' });
    }

    const payments = await listPaymentsByConsumer(consumer_id);
    const riskHistory = await listRiskHistoryByConsumer(consumer_id);

    const latestPayment = payments[payments.length - 1] || null;
    const latestRisk = riskHistory[riskHistory.length - 1] || null;

    const draft = buildTemplate({ orgType, consumer, latestPayment, latestRisk });
    const context = JSON.stringify({ consumer: { full_name: consumer.full_name, id_number: consumer.id_number }, latestPayment, latestRisk });
    const letter = await maybeUseOpenAI(draft, context);

    return res.json({ consumer_id, letter });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.flatten() });
    return next(err);
  }
}

module.exports = { generateLetter };
