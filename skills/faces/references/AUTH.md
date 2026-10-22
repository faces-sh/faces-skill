# Authentication & Registration

## Registering a new account

A new account starts with a $0 balance. Its first payment, made by the human in a browser,
activates it.

### Step 1: Create the account

Ask the user which plan they want, then register with `--plan`:

```bash
# Free: add $5 of credit to start, then everything is paid as it goes from credits
faces auth:register \
  --email user@example.com \
  --password 'SecurePass123' \
  --username alice \
  --json

# Connect ($17/month) or Pro ($49/month): monthly allowances for compiling and causes,
# and Codex-eligible models run on a linked ChatGPT plan
faces auth:register \
  --email user@example.com \
  --password 'SecurePass123' \
  --username alice \
  --plan connect \
  --json
```

- `--plan` is `free` (the default), `connect` or `pro`.
- `--username`: 1 to 32 characters, starting with a lowercase letter, then lowercase letters,
  numbers or underscores (no dashes).
- The password needs 8 to 64 characters, with at least one uppercase letter, one lowercase
  letter and one digit.

The response:

```json
{
  "status": "registered",
  "user_id": "...",
  "checkout_url": "https://checkout.stripe.com/c/pay/...",
  "plan": "free",
  "amount": "$5 (added as API credits)"
}
```

On Connect or Pro, `checkout_url` is the subscription checkout and `amount` is `$17/mo` or
`$49/mo`. If the CLI could not fetch a checkout link, `checkout_url` is missing and
`checkout_error` says why.

The JWT is saved automatically. The account exists but is not active yet.

### Step 2: Activate with a payment

`checkout_url` is a Stripe Checkout page. Only the human can complete it, in a browser.

Tell the user:

> Paste this link into your browser and complete the payment. When you see the confirmation
> page, come back here and let me know it's done.
>
> `<checkout_url>`

Do **not** try to open the URL or complete payment programmatically.

### Step 3: Confirm activation

Once the user says payment is done:

```bash
faces billing:balance --json | jq '.is_active'
```

If it is `false`, the payment may not have gone through: ask them to try the link again.

## Logging in

```bash
faces auth:login --email user@example.com --password 'SecurePass123'
faces auth:whoami     # verify
```

`--email` also accepts the username. The JWT is saved to `~/.faces/config.json` and lasts 24
hours: `faces auth:refresh` exchanges a valid one for a fresh one, or log in again.

## API keys

For non-interactive use (scripts, deployed agents), prefer an API key:

```bash
# Create a key (needs a JWT). The new key is saved to ~/.faces/config.json as api_key,
# so later faces commands use it at once.
faces keys:create --name "my-agent" --budget 10.00 --expires-days 30

# A key from elsewhere:
faces config:set api_key sk-faces-...

# Or the environment:
export FACES_API_KEY=sk-faces-...
```

`--no-save` prints the key without saving it, for a key meant for another machine or person:

```bash
faces keys:create --name "other-machine" --no-save
```

Restrictions, all optional:

- `--face ALIAS`: only chat with these faces (repeatable)
- `--model NAME`: only use these models (repeatable)
- `--budget F`: a lifetime spend cap in USD; past it, requests answer `402`
- `--expires-days N`: expiry, 1 to 36500 days. Fixed when the key is made: to change it,
  revoke the key and create another.

A request with a face or model the key does not allow is a `403`.

### One-time secret

The full key is returned **once**, in the `keys:create` response (`key`). `keys:list`,
`config:show` and `auth:whoami` only ever show it shortened. To get a usable key again, create
a new one.

Some agent environments redact `sk-`-prefixed strings from displayed output. The key is still
valid, and with the default save it is already in `~/.faces/config.json`. Use it; do not try to
read it back.

## Plans

| plan | price | what it includes |
|---|---|---|
| Free | $0 | Everything is paid as it goes from credits; start by adding $5 |
| Connect | $17/month | Allowances for compiling and causes; Codex-eligible models run on a linked ChatGPT plan |
| Pro | $49/month | Larger allowances, and the same ChatGPT route |

Pay-as-you-go rates, on Free and past an allowance: a cause $0.75 per million tokens (the
tokens it reads plus 1,500), compiling $25 per million source tokens, and any model you name
at the provider's price plus 5%. Read the live figures from `GET /v1/rates`. Details in
[BILLING.md](BILLING.md); the ChatGPT route in [OAUTH.md](OAUTH.md).

On Connect and Pro, a ChatGPT failure or a used-up allowance is refused by default rather than
billed. `faces account:preferences api_fallback true` lets it continue on credits.

### Checking the plan

```bash
faces billing:subscription --json   # plan, status, period end, allowances
faces billing:balance --json        # credit balance, is_active
faces compile:stats --json          # this month's compiling against the allowance
```

### Subscribing, switching, canceling

```bash
faces billing:subscribe --plan connect     # or --plan pro; prints a Stripe Checkout URL
faces billing:subscription:plan pro        # already subscribed: switch in place, prorated
faces billing:subscription:cancel          # keeps the plan until the period ends
```

Only the human can complete a checkout. See [BILLING.md](BILLING.md).

## JWT or API key

| Command group | Needs |
|---|---|
| `auth:login`, `auth:register` | neither: they create the JWT |
| `auth:connect`, `auth:disconnect`, `auth:refresh`, `keys:*` | a JWT: run `faces auth:login` first |
| everything else | a JWT or an API key |

## Credential storage

Credentials live in `~/.faces/config.json`, or come from the environment:

| Variable | Purpose |
|---|---|
| `FACES_TOKEN` | JWT |
| `FACES_API_KEY` | API key |
| `FACES_BASE_URL` | API base URL (default `https://api.faces.sh`) |

## Account preferences

Stored on the account, so they hold across machines:

```bash
faces account:preferences                                  # view
faces account:preferences default_model gpt-5.4-mini       # model new faces inherit
faces account:preferences api_fallback true                # allow credits when ChatGPT or an allowance refuses
```

`auto_style` and `auto_style_thresholds` are covered in
[REFERENCE.md → Account preferences](REFERENCE.md#account-preferences).
