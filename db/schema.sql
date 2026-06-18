-- Taiyi schema — idempotent. Run against Neon:
--   psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS subscribers (
  id                     SERIAL PRIMARY KEY,
  email                  TEXT        NOT NULL,
  type                   TEXT        NOT NULL,
  dob                    TEXT,
  tob                    TEXT,
  pob                    TEXT,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  subscription_status    TEXT,
  last_sent_at           TIMESTAMPTZ,
  delete_requested_at    TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email, type)
);

ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS subscription_status    TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_sent_at           TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS delete_requested_at    TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS clerk_user_id          TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS gender                 TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS current_country        TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS onboarded_at           TIMESTAMPTZ;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS stripe_session_id      TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_stripe_customer_id_uidx
  ON subscribers (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_clerk_user_id_uidx
  ON subscribers (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscribers_active_due_idx
  ON subscribers (subscription_status, last_sent_at)
  WHERE subscription_status = 'active';

CREATE INDEX IF NOT EXISTS subscribers_active_onboarded_idx
  ON subscribers (subscription_status, onboarded_at)
  WHERE subscription_status = 'active' AND onboarded_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id             SERIAL PRIMARY KEY,
  subscriber_id  INT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,
  energy         TEXT,
  focus          TEXT,
  weight         TEXT,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at    TIMESTAMPTZ,
  UNIQUE (subscriber_id, week_start)
);

CREATE TABLE IF NOT EXISTS letters (
  id              SERIAL PRIMARY KEY,
  subscriber_id   INT NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_tokens    INT,
  output_tokens   INT,
  cost_usd        NUMERIC(10,6),
  status          TEXT NOT NULL,
  guardrail_fails TEXT[],
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  UNIQUE (subscriber_id, week_start)
);

CREATE INDEX IF NOT EXISTS letters_send_queue_idx
  ON letters (week_start, status)
  WHERE status = 'approved' AND sent_at IS NULL;
