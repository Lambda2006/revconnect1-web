-- VictoryRevConnect Boaters — Eval Test Boat Seed (PWA)
--
-- Creates one test boat per supported model for the eval test user,
-- and inserts an active subscription row so the agent route's subscription
-- gate passes without a real Stripe flow.
--
-- Usage:
--   1. Create an eval user via Supabase Dashboard → Auth → Users → Add user
--      Email: eval@victoryrevconnect.internal  Password: choose a strong password
--      (Use this email + password as EVAL_USER_EMAIL / EVAL_USER_PASSWORD in your shell)
--   2. Copy the new user's UUID and replace EVAL_USER_UUID below
--   3. Paste this SQL into Supabase Dashboard → SQL Editor → Run
--   4. Copy the returned boat UUIDs into eval/runner.ts BOAT_ID_MAP
--      OR export them as env vars (EVAL_BOAT_MC_X24, etc.)

DO $$
DECLARE
  eval_user_id UUID := 'REPLACE_WITH_EVAL_USER_UUID';
BEGIN

  -- ── Subscription row ───────────────────────────────────────────────────────
  -- Gives the eval user active app_and_agent access so the agent route passes
  -- the subscription gate. Uses a placeholder stripe_customer_id — not real.
  INSERT INTO subscriptions (
    user_id, stripe_customer_id, stripe_sub_id,
    plan, status, trial_ends_at, current_period_end, created_at
  )
  VALUES (
    eval_user_id,
    'cus_eval_placeholder',
    'sub_eval_placeholder',
    'app_and_agent',
    'active',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '30 days',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active',
        plan = 'app_and_agent',
        current_period_end = NOW() + INTERVAL '30 days';

  -- ── Test boats ─────────────────────────────────────────────────────────────

  -- MasterCraft X24 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'MasterCraft', 'X24', 2022, 'inboard', 150, true, 'Eval test boat — MasterCraft X24')
  ON CONFLICT DO NOTHING;

  -- MasterCraft NXT22 2021
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'MasterCraft', 'NXT22', 2021, 'inboard', 200, false, 'Eval test boat — MasterCraft NXT22')
  ON CONFLICT DO NOTHING;

  -- MasterCraft XT23 2023
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'MasterCraft', 'XT23', 2023, 'inboard', 50, false, 'Eval test boat — MasterCraft XT23')
  ON CONFLICT DO NOTHING;

  -- Malibu Boats Wakesetter 23 LSV 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Malibu Boats', 'Wakesetter 23 LSV', 2022, 'inboard', 120, false, 'Eval test boat — Malibu 23 LSV')
  ON CONFLICT DO NOTHING;

  -- Malibu Boats Response TXi 2021
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Malibu Boats', 'Response TXi', 2021, 'inboard', 300, false, 'Eval test boat — Malibu Response TXi')
  ON CONFLICT DO NOTHING;

  -- Malibu Boats 21 MLX 2023
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Malibu Boats', '21 MLX', 2023, 'inboard', 80, false, 'Eval test boat — Malibu 21 MLX')
  ON CONFLICT DO NOTHING;

  -- Boston Whaler 270 Dauntless 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Boston Whaler', '270 Dauntless', 2022, 'outboard', 180, false, 'Eval test boat — BW 270 Dauntless')
  ON CONFLICT DO NOTHING;

  -- Boston Whaler 330 Outrage 2021
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Boston Whaler', '330 Outrage', 2021, 'outboard', 400, false, 'Eval test boat — BW 330 Outrage')
  ON CONFLICT DO NOTHING;

  -- Boston Whaler Montauk 170 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Boston Whaler', 'Montauk 170', 2022, 'outboard', 90, false, 'Eval test boat — BW Montauk 170')
  ON CONFLICT DO NOTHING;

  -- Grady-White Canyon 336 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Grady-White', 'Canyon 336', 2022, 'outboard', 250, false, 'Eval test boat — GW Canyon 336')
  ON CONFLICT DO NOTHING;

  -- Grady-White Freedom 235 2023
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Grady-White', 'Freedom 235', 2023, 'outboard', 60, false, 'Eval test boat — GW Freedom 235')
  ON CONFLICT DO NOTHING;

  -- Grady-White Fisherman 236 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Grady-White', 'Fisherman 236', 2022, 'outboard', 140, false, 'Eval test boat — GW Fisherman 236')
  ON CONFLICT DO NOTHING;

  -- Sea Ray SPX 210 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Sea Ray', 'SPX 210', 2022, 'sterndrive', 160, false, 'Eval test boat — Sea Ray SPX 210')
  ON CONFLICT DO NOTHING;

  -- Sea Ray SDX 270 2022
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Sea Ray', 'SDX 270', 2022, 'sterndrive', 220, false, 'Eval test boat — Sea Ray SDX 270')
  ON CONFLICT DO NOTHING;

  -- Sea Ray Sundancer 320 2021
  INSERT INTO boats (owner_id, make, model, year, engine_type, engine_hours, is_primary, notes)
  VALUES (eval_user_id, 'Sea Ray', 'Sundancer 320', 2021, 'sterndrive', 350, false, 'Eval test boat — Sea Ray Sundancer 320')
  ON CONFLICT DO NOTHING;

END $$;

-- After running, retrieve the created boat IDs to populate BOAT_ID_MAP:
SELECT id, make, model, year, engine_type
FROM boats
WHERE notes LIKE 'Eval test boat%'
ORDER BY make, model;
