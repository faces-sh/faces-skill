# Authentication & Registration

## Registering a new account

Registration requires a credit card payment to activate. The flow is:

### Step 1 — Create the account

Ask the user which plan they want, then register with `--plan`:

```bash
# Free plan ($5 activation, then everything pays as it goes from credits)
faces auth:register \
  --email user@example.com \
  --password 'SecurePass123!' \
  --username alice \
  --json

# Connect ($17/month) or Pro ($49/month): allowances for compiling and reasoning,
# and gpt-5.x chat free on a linked ChatGPT account
faces auth:register \
  --email user@example.com \
  --password 'SecurePass123!' \
  --username alice \
  --plan connect \
  --json
```

`--plan` is `free` (the default), `connect` or `pro` (`pro` from faces-cli 1.17.0). Team is by
promo code only, and Standard is retired.

The response includes:

```json
{
  "status": "registered",
  "user_id": "...",
  "activation_required": true,
  "activation_checkout_url": "https://checkout.stripe.com/c/pay/..."
}
```

The JWT is saved automatically. The account exists but is not yet active.

### Step 2 — Activate via payment

The `activation_checkout_url` is a Stripe Checkout page. The human must open it in a browser and complete payment.

Tell the user:

> Paste this link into your browser and complete the payment. When you see the confirmation page, come back here and let me know it's done.
>
> `<activation_checkout_url>`

Do **not** attempt to open the URL or complete payment programmatically. Only a human can do this step.

### Step 3 — Confirm activation

Once the user says payment is done:

```bash
faces billing:balance --json
```

Check that `is_active` is `true`. If not, tell the user the payment may not have gone through and ask them to try the link again.

### Full example

```bash
# 1. Register (use --plan connect for Subscription Connect plan)
RESULT=$(faces auth:register --email user@example.com --password 'SecurePass123!' --username alice --json)
URL=$(echo "$RESULT" | jq -r '.activation_checkout_url')

# 2. Give URL to human, wait for them to confirm payment

# 3. Verify
faces billing:balance --json | jq '.is_active'
```

## Logging in

For existing accounts:

```bash
faces auth:login --email user@example.com --password 'SecurePass123!'
```

The JWT is saved to `~/.faces/config.json` automatically.

To verify:

```bash
faces auth:whoami
```

## API key authentication

For non-interactive use (scripts, deployed agents), API keys are preferred over JWT:

```bash
# Create a key (requires JWT). The new key is saved to
# ~/.faces/config.json as api_key automatically — subsequent
# faces commands authenticate with it immediately.
faces keys:create --name "my-agent" --budget 10.00 --expires-days 30

# Already have a key from elsewhere? Set it directly:
faces config:set api_key sk-faces-...

# Or use the environment variable:
export FACES_API_KEY=sk-faces-...
```

Pass `--no-save` to `keys:create` if you want to print the key without persisting it locally (e.g. minting a key for another machine or user):

```bash
faces keys:create --name "other-machine" --no-save
```

API keys support optional restrictions:
- `--face ALIAS` — restrict to specific faces (repeatable)
- `--model NAME` — restrict to specific LLM models (repeatable)
- `--budget F` — spending cap in USD
- `--expires-days N` — auto-expiry

### One-time secret

The plaintext key is returned **only once** — in the `keys:create` response (JSON field: `key`). `faces keys:list`, `faces config:show`, and `faces auth:whoami` only ever show it truncated by design (the server stores a hash, not the secret). Never try to recover a usable key from those commands; mint a new one instead.

### Sandbox redaction (for agent operators)

Some agent environments run a terminal security scanner that redacts `sk-`-prefixed strings from displayed output. This is purely cosmetic — the key is still valid, and with default-save it is already written to `~/.faces/config.json`. Don't conclude "the CLI masked the key" or try to bypass the CLI by hitting the API directly; the CLI returns the full key verbatim. The agent's job is to *use* the key (automatic with default-save), not to *read* it.

## Plans

### Free

- **Activation:** $5 minimum initial spend (added as API credits).
- **Pricing:** everything pays as it goes from credits: a face's reasoning at $0.75 per million reasoning tokens (each turn's input tokens plus 1,500), compiling at $28 per million source tokens, the answering model at the provider's price plus 5%.
- **No monthly fee.**

### Connect ($17/month) and Pro ($49/month)

- **Allowances** for compiling and a face's reasoning: Connect 250k source tokens and 10M reasoning tokens a month, Pro 1M and 25M (with weekly and 5-hour limits too). See [BILLING.md](BILLING.md#plans).
- **The answering model** is still paid at the provider's price plus 5%, except:
- **ChatGPT passthrough:** Link your ChatGPT Plus or Pro account via `faces auth:connect openai` and gpt-5.x models run free on it. See [OAUTH.md](OAUTH.md) for supported models.
- **Fallback:** By default, OAuth failures and a used-up allowance are refused, never silently billed. Enable fallback with `faces account:preferences api_fallback true`.

### Team

Comped: no limits, never charged. By promo code only.

### Checking the current plan

```bash
faces billing:subscription --json   # plan, status, period end
faces billing:balance --json        # credit balance, is_active
faces compile:stats --json          # this month's compile usage against the allowance (1.18.0+)
```

### Subscribing, and switching plans

```bash
faces billing:subscribe --plan connect     # or --plan pro; alias of billing:subscription:activate
faces billing:subscription:plan pro        # already subscribed: switch in place, prorated
```

`billing:subscribe` prints a Stripe Checkout URL (it takes a promo code). The human must open it in a browser to complete payment. If previously canceled, this reactivates the existing subscription. Already subscribed, use `billing:subscription:plan` instead. See [BILLING.md](BILLING.md).

### Canceling

```bash
faces billing:subscription:cancel
```

Soft cancel — keeps access until the current billing period ends.

## JWT vs API key

| Command group | Requires |
|---|---|
| `faces auth:*`, `faces keys:*` | JWT only — run `faces auth:login` first |
| Everything else | JWT **or** API key |

## Credential storage

Credentials are stored in `~/.faces/config.json`. The CLI reads from there automatically, or from environment variables:

| Variable | Purpose |
|---|---|
| `FACES_TOKEN` | JWT authentication token |
| `FACES_API_KEY` | API key authentication |

## Account preferences

Server-side settings stored on the user's account:

```bash
faces account:preferences                            # view current
faces account:preferences default_model gpt-5.4      # set default model for new faces
faces account:preferences api_fallback true           # allow paid fallback when OAuth fails
```

| Key | Values | Default | Effect |
|---|---|---|---|
| `api_fallback` | `true` / `false` | `false` | When false, OAuth failures return 422 instead of falling back to paid system keys |
| `default_model` | any valid model | `gpt-5.4` | Model inherited by new faces that don't specify `--default-model` |

Note: these are server-side preferences (not local config). They persist across devices and sessions.

## Refreshing a token

If a JWT expires:

```bash
faces auth:refresh    # refresh existing token
faces auth:login ...  # or re-login
```
