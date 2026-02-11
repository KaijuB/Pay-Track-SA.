-- PayTrack SA MVP schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Rental', 'School', 'Gym', 'SME')),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consumers (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  consent_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, id_number)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id BIGSERIAL PRIMARY KEY,
  consumer_id BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
  month CHAR(7) NOT NULL,
  amount_due NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL,
  date_paid TEXT,
  status TEXT NOT NULL CHECK (status IN ('Paid','Late','Missed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (consumer_id, month)
);

CREATE TABLE IF NOT EXISTS risk_score_history (
  id BIGSERIAL PRIMARY KEY,
  consumer_id BIGINT NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
  month CHAR(7) NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 1000),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (consumer_id, month)
);

CREATE INDEX IF NOT EXISTS idx_consumers_org ON consumers(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_consumer ON payment_records(consumer_id);
CREATE INDEX IF NOT EXISTS idx_risk_consumer ON risk_score_history(consumer_id);
CREATE INDEX IF NOT EXISTS idx_payment_month ON payment_records(month);
CREATE INDEX IF NOT EXISTS idx_risk_month ON risk_score_history(month);
