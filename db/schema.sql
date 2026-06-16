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

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_stripe_customer_id_uidx
  ON subscribers (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscribers_active_due_idx
  ON subscribers (subscription_status, last_sent_at)
  WHERE subscription_status = 'active';
