const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const csvRoutes = require('./routes/csv');
const riskRoutes = require('./routes/risk');
const dashboardRoutes = require('./routes/dashboard');
const lettersRoutes = require('./routes/letters');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Routes follow the diagram exactly
app.use('/api', authRoutes);
app.use('/api', csvRoutes);
app.use('/api', riskRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', lettersRoutes);

app.use(notFound);
app.use(errorHandler);

// Local dev server
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`PayTrack SA backend listening on :${port}`));
}

module.exports = app;
