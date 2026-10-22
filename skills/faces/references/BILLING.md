# Billing & Credits

All billing commands are `faces billing:COMMAND`. Add `--json` (or `--toon`) for structured
output.

## Plans

| plan | price | what it includes |
|---|---|---|
| `free` | $0 | Everything is paid as it goes, from credits |
| `connect` | $17/month | The allowances below; Codex-eligible models (`codex_eligible: true` in `GET /v1/models`) run on a linked ChatGPT plan at `/v1/responses` |
| `pro` | $49/month | Larger allowances, and the same ChatGPT route |

A subscription is an **allowance**, not a fee per request. It covers compiling and a face's
**cause** (in chat, `/v1/causes` and decisions), up to the limits below. The **answering
model** (`alias@model`, or a decision model) is never part of it: on every plan it is paid at
the provider's price plus 5%, unless it runs on the linked ChatGPT plan. So a Connect or Pro
user still needs credit for most chats, and always for `faces decide`.

| allowance | Connect | Pro |
|---|---|---|
| compile, per month | 250k source tokens | 1M source tokens |
| cause, per month | 10M tokens | 25M tokens |
| cause, per week | 2.5M | 6.25M |
| cause, per 5 hours (rolling) | 640k | 1.6M |

- **Compile** counts a source's tokens **each time** it is compiled; a recompile counts again.
- **A cause** counts the tokens it read plus 1,500. A cause reads the message it answers and up
  to the four turns before it, within 30,000 tokens; on Connect and Pro a chat with `@model`
  reads within 10,000. A face alone, `/v1/causes` and decisions read within 30,000 on every
  plan.
- The month is the subscription's 30-day window, weeks are 7-day blocks of it, and the 5-hour
  window rolls.

**Past an allowance**, the `api_fallback` preference decides:

- **on:** the work carries on, paid from credits at the pay-as-you-go rates. With no credit it
  is a `402`.
- **off** (the default): refused with a `429`, and nothing is charged. The message names the
  allowance and when it resets. Show it as it is, and offer
  `faces account:preferences api_fallback true` only if the user agrees to pay from credits.

**Pay-as-you-go rates** (Free, and past an allowance with fallback on):

| | rate |
|---|---|
| A cause (chat, causes, decisions) | $0.75 per million tokens: the tokens it read plus 1,500 |
| Compile | $25 per million source tokens |
| Any model you name (`@model`, a decision model) | the provider's price plus 5% |

The live figures are public at `GET /v1/rates` (no key needed), and per model in the model
catalog (`faces models:list`, or `GET /v1/models`): the cause model is `faces-causes-latest`
and the compile model `faces-compile-latest` (`faces models:list --kind cause,compile`). Quote
them from there, not from memory.

## Check the plan and its allowances

```bash
faces billing:subscription
faces billing:subscription --json
```

Shows the plan, the renewal date and, on a paid plan, a meter of each allowance:

```
Connect allowances (tokens):
  causes, rolling 5 hours  3018 of 640k (0%)  rolls
  causes, this week        3018 of 2.5M (0%)  resets 2026-10-26 09:44 UTC
  causes, this month       32.5k of 10M (0%)  resets 2026-10-28 09:44 UTC
  compile, this month      4072 of 250k (2%)  resets 2026-10-28 09:44 UTC
```

In `--json`, `allowances` holds `cause_5h`, `cause_week`, `cause_month` and `compile_month`,
each `{limit, used, remaining, resets_at}`. It is `null` on Free. `cause_5h` rolls, so its
`resets_at` is `null`. `rates` carries the pay-as-you-go rates.

## Subscribe

```bash
faces billing:subscribe --plan connect      # alias of billing:subscription:activate
faces billing:subscribe --plan pro
```

From Free, prints a Stripe Checkout URL. Only the human can complete it, in a browser; the page
takes a **promotion code**, which can make a plan free for a while or add credits. If the
subscription is set to cancel and is still in its period, this keeps it instead.

Checkout is for a **first** subscription only: already subscribed, it is refused (`409`).
Switch instead.

## Switch between Connect and Pro

```bash
faces billing:subscription:plan pro         # asks to confirm; --yes skips that
faces billing:subscription:plan connect
```

Switches in place, prorated on the default card, and the new allowances apply at once. Confirm
with the user first: it charges. A `409` means there is no subscription to switch (subscribe
instead). While the plan is set to cancel, the switch is refused with
`409 cancellation_pending` before anything is charged: keep the plan first with
`faces billing:subscription:activate`.

## Cancel

```bash
faces billing:subscription:cancel
```

Keeps the plan until the current period ends, then the account returns to Free. To keep it,
run `faces billing:subscription:activate` before then.

## Credits

```bash
faces billing:balance --json                 # balance_usd, has_payment_method (a default card exists)
faces billing:topup --amount 5               # charges the default card; minimum $1, whole cents
faces billing:topup --amount 5 --card pm_…   # charges another saved card
```

The same amount again within two minutes is a `409 duplicate_topup`, and nothing is charged: it
usually means the first went through. Check `faces billing:balance` before trying again, and
repeat it only if the user confirms, with `--allow-duplicate` (`allow_duplicate: true` on the
API). `--yes` does not imply it.

Credits apply at once. A `402` anywhere means there is no credit for that request, including
`faces decide` on Connect and Pro, whose decision model is always paid. Top up and retry.

## Cards

An account can save several cards. One is the **default**: the subscription renews on it, and
a top-up charges it unless `--card` names another. The card used at checkout becomes the
default.

```bash
faces billing:cards                          # newest first: brand, last 4, expiry, id, (default)
faces billing:card-setup                     # alias billing:card:add: a Stripe link to save a card
faces billing:card-setup --no-default        # save it without making it the default
faces billing:card:default pm_…              # the next renewal charges this one
faces billing:card:remove pm_…  [--yes]
```

- Saving a card charges nothing. The new card becomes the default unless `--no-default`; the
  first card always does. It is listed a few seconds after the user finishes: if
  `billing:cards` does not show it yet, wait and look again.
- Removing the default makes the newest other card the default. The **last** card cannot be
  removed while a paid subscription renews on it (`409`): add another first, or cancel.
- `404` means the card is not on this account: list them with `billing:cards`.

## Compile usage

```bash
faces compile:stats --json
```

```
Plan: connect
Compiled this month: 4,072 of 250,000 source tokens (2%), resets 2026-10-28
Pay-as-you-go compile rate: $25 per million source tokens (past the allowance, with api_fallback on)
```

`--json` is `{plan, compile_this_month: {limit, used, remaining, resets_at}, pay_as_you_go:
{usd_per_million_source_tokens}}`; `compile_this_month` is `null` on Free. Per-face numbers are
in `faces face:stats`.

## Model prices

```bash
faces billing:llm-costs --json
faces billing:llm-costs --provider openai
```

Lists the models with their per-token prices, one row per model under the id its lab gives it.
`--provider` filters by that **lab** (openai, anthropic, xai, qwen, z-ai, moonshot, and so on).
Prices are listed before the markup; each row carries `markup_rate` (`0.05` is 5%). A model's
price is the same whichever way it is served, so read it here rather than quoting one from
memory. Transcription is priced per hour, in the same list.

## Usage

```bash
faces billing:usage --json
faces billing:usage --group-by model --from 2026-03-01 --to 2026-03-31
```

Group by `api_key`, `model`, `llm` or `date`. A face's causes appear as `faces-causes-latest`
and compiling as `faces-compile-latest`. `absorbed_cost_usd` is cost the platform paid that was
not billed per token, such as a compile, which is billed by its source tokens instead.
`faces billing:usage` shows it as a COVERED column when there is any.

## What to do on

**402:** no credit for the request. `faces billing:balance --json` to confirm, then
`faces billing:topup --amount <USD>` (with no card saved, `faces billing:card-setup` first),
and retry.

**429 naming an allowance:** a plan's allowance is used up and `api_fallback` is off. Wait for
the reset the message names, or, if the user agrees to pay from credits,
`faces account:preferences api_fallback true`.

**429 Rate limit:** every route that runs a model or a compile counts against a per-account,
per-minute limit set by plan (`limits.requests_per_minute` in `GET /v1/rates`). Nothing is
charged for the refused request. The CLI waits the `Retry-After` once and asks again; after a
second refusal, wait the seconds the message names. Never retry in a loop: parallel agents on
one account share the limit.

**422 oauth_only_unavailable:** `--oauth-only` where the ChatGPT route cannot serve the request:
always on Free, and on Connect or Pro when the model or the link cannot. Nothing is charged.
Drop the flag to pay from credits, or, on Free, subscribe to Connect to use a linked ChatGPT
account.

**422 oauth_rejected:** ChatGPT refused and fallback is off. `faces account:preferences
api_fallback true` to allow credits (top up first if there are none). See [OAUTH.md](OAUTH.md).
