# Billing & Credits

All billing commands: `faces billing:COMMAND`. Use `--json` on any command for
structured output.

## Check balance

```bash
faces billing:balance --json
```

Returns credit balance and payment method status.

## Top up credits

```bash
faces billing:topup --amount 5
```

Minimum $1. Requires a saved payment method. Credits are applied immediately.

## Add a payment method

```bash
faces billing:card-setup
```

Opens a Stripe session to save a card. Required before `billing:topup` can
charge.

## Check subscription

```bash
faces billing:subscription --json
```

Returns plan type (`free` = pay-per-token, or `connect` = Subscription Connect), face count, and renewal date.

## Activate Subscription Connect

```bash
faces billing:subscription:activate
```

Prints a Stripe Checkout URL to activate the Subscription Connect plan ($17/mo). If the user previously canceled and is still within the billing period, this reactivates instead of creating a new checkout.

## Cancel subscription

```bash
faces billing:subscription:cancel
```

Soft cancel — keeps Connect access until the current period ends, then reverts to pay-per-token. To reactivate before the period ends, run `billing:subscription:activate`.

## Check compilation stats

```bash
faces compile:stats --json
```

Shows per-face compilation stats. Key fields per face: `alias`, `tokens_compiled_current` (current size of cognitive primitives), `tokens_compiled_alltime` (cumulative tokens across all compilation runs), `profile_token_count`, `last_synced_at`.

## View LLM pricing

```bash
faces billing:llm-costs --json
faces billing:llm-costs --provider openai
faces billing:llm-costs --provider anthropic
```

Lists available LLMs and their per-token costs. Filter by provider.

## Usage analytics

```bash
faces billing:usage --json
faces billing:usage --group-by model --from 2026-03-01 --to 2026-03-31
```

Aggregated usage analytics. Group by `api_key`, `model`, `llm`, or `date`.

## Rough cost reference

| Operation | Approximate cost |
|-----------|-----------------|
| Audio/video transcription | ~$0.37/hour |
| Text document compilation | Minimal (pennies for typical documents) |
| Chat message | Varies by model — see `faces billing:llm-costs` for per-token pricing |

## Common scenarios

**402 during compilation:** Balance is empty. Run `faces billing:balance --json`
to confirm, then `faces billing:topup --amount <USD>` to add credits and retry.

**422 oauth_rejected:** OAuth request failed and fallback is disabled. Enable
fallback: `faces account:preferences api_fallback true`. If no credits, run
`faces billing:topup` first. See [OAUTH.md](OAUTH.md) for details.

**Subscription Connect users:** Link your ChatGPT account (`faces auth:connect openai`)
to use select OpenAI models at no extra cost for both compilation and chat. If OAuth
is not linked, those models fall back to paid credits (5% markup). If `api_fallback`
is `false` (default), requests that fail OAuth return 422 instead — enable fallback
with `faces account:preferences api_fallback true`.
