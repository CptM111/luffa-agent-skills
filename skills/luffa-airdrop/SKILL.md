---
name: luffa-airdrop
description: "Use this skill when the user asks to 'create an airdrop', 'airdrop tokens to my community', 'send tokens to all subscribers', 'reward my followers', 'distribute tokens', 'run a token campaign', 'check my airdrop status', or mentions token distribution, community rewards, loyalty programs, or airdrop campaigns on Luffa. Always confirm the airdrop details with the user before executing. Do NOT use for individual transfers (use luffa-wallet)."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Airdrop API

Luffa Airdrop enables creators, brands, and communities to distribute tokens to targeted audiences — channel subscribers, group members, or custom lists — with a single API call. Airdrops are executed on-chain and can be used for community rewards, loyalty programs, event participation, and more.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

**CRITICAL**: Always confirm airdrop details with the user before calling `POST /airdrop/execute`. Airdrops are irreversible on-chain transactions.

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | POST | `/airdrop/create` | Create an airdrop campaign |
| 2 | POST | `/airdrop/execute` | Execute a created airdrop |
| 3 | GET | `/airdrop/status` | Check airdrop status |
| 4 | GET | `/airdrop/history` | Get airdrop history |
| 5 | POST | `/airdrop/estimate` | Estimate gas and total cost |
| 6 | GET | `/airdrop/campaigns` | List all airdrop campaigns |

## API Reference

### 1. POST /airdrop/create

Create a new airdrop campaign. This does NOT execute the airdrop — it only creates the campaign for review.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Campaign name |
| `token` | string | Yes | Token symbol or contract address |
| `network` | string | Yes | Network to execute on |
| `amountPerRecipient` | string | Yes | Amount per recipient (in token units) |
| `recipients` | object | Yes | Recipient specification (see below) |
| `message` | string | No | Message to send with the airdrop |
| `scheduledAt` | string | No | ISO 8601 datetime to schedule execution |

**Recipients Object**:

```json
{
  "type": "channel_subscribers",
  "channelId": "ch_abc123",
  "filter": {
    "tier": "all",
    "minSubscribedDays": 7
  }
}
```

Or provide a custom list:

```json
{
  "type": "custom_list",
  "addresses": ["0xAddress1", "0xAddress2", "@alice"]
}
```

Or target a group:

```json
{
  "type": "group_members",
  "groupId": "grp_xyz"
}
```

**Response**:

```json
{
  "code": "0",
  "data": {
    "campaignId": "airdrop_abc123",
    "status": "draft",
    "estimatedRecipients": 1250,
    "totalAmount": "12500.00",
    "token": "EDS",
    "estimatedGasUSD": "2.50",
    "totalCostUSD": "25002.50"
  },
  "msg": "success"
}
```

**Example**:

```typescript
// Create an airdrop for channel subscribers
const campaign = await luffaFetch('POST', '/airdrop/create', {
  name: 'March Community Reward',
  token: 'EDS',
  network: 'endless',
  amountPerRecipient: '10',
  recipients: {
    type: 'channel_subscribers',
    channelId: 'ch_abc123',
    filter: { tier: 'all' },
  },
  message: 'Thank you for being part of our community! 🎉',
});
```

### 2. POST /airdrop/execute

Execute a previously created airdrop campaign. **Always confirm with user before calling this.**

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `campaignId` | string | Yes | The campaign ID to execute |
| `confirm` | boolean | Yes | Must be `true` to proceed |

**Response**:

```json
{
  "code": "0",
  "data": {
    "campaignId": "airdrop_abc123",
    "status": "executing",
    "txHashes": ["0x...", "0x..."],
    "recipientsProcessed": 1250,
    "estimatedCompletion": "2026-03-04T00:05:00Z"
  },
  "msg": "success"
}
```

### 3. GET /airdrop/status

Check the execution status of an airdrop campaign.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `campaignId` | string | Yes | The campaign ID |

**Response**:

```json
{
  "code": "0",
  "data": {
    "campaignId": "airdrop_abc123",
    "status": "completed",
    "recipientsTotal": 1250,
    "recipientsSucceeded": 1248,
    "recipientsFailed": 2,
    "totalAmountDistributed": "12480.00",
    "completedAt": "2026-03-04T00:04:30Z"
  },
  "msg": "success"
}
```

### 5. POST /airdrop/estimate

Estimate the total cost (tokens + gas) for an airdrop before creating it.

**Request Body**: Same as `POST /airdrop/create`

**Response**:

```json
{
  "code": "0",
  "data": {
    "estimatedRecipients": 1250,
    "totalTokenAmount": "12500.00",
    "estimatedGasUSD": "2.50",
    "estimatedTotalCostUSD": "25002.50",
    "senderBalanceSufficient": true
  },
  "msg": "success"
}
```

## Cross-Skill Workflows

### Workflow A: Community Reward Airdrop

```
1. luffa-channel GET /channel/subscribers               → get subscriber count
2. luffa-wallet  GET /wallet/balance                    → verify sufficient tokens
3. luffa-airdrop POST /airdrop/estimate                 → estimate total cost
4. [Confirm with user]
5. luffa-airdrop POST /airdrop/create                   → create campaign
6. luffa-airdrop POST /airdrop/execute                  → execute (after user confirms)
7. luffa-channel POST /channel/post                     → announce airdrop to channel
```

### Workflow B: Event Participation Reward

```
1. [Collect event participant addresses]
2. luffa-airdrop POST /airdrop/create (custom_list)     → create targeted airdrop
3. luffa-airdrop POST /airdrop/execute                  → execute
4. luffa-messenger POST /messenger/send                 → notify participants
```

### Workflow C: Token-Gated Loyalty Program

```
1. luffa-channel GET /channel/subscribers?tier=premium → get premium subscribers
2. luffa-did     POST /did/credential/issue (loop)      → issue loyalty credentials
3. luffa-airdrop POST /airdrop/create                   → create monthly reward
4. luffa-airdrop POST /airdrop/execute                  → distribute rewards
```

## Operation Flow

### Step 1: Identify Intent

- Create an airdrop → `POST /airdrop/create` (then confirm before `POST /airdrop/execute`)
- Estimate cost → `POST /airdrop/estimate`
- Check status → `GET /airdrop/status`
- View history → `GET /airdrop/history`

### Step 2: Collect Parameters

- Missing token → ask user which token to airdrop
- Missing amount → ask user how many tokens per recipient
- Missing recipients → ask if targeting channel subscribers, group members, or a custom list
- Always estimate cost before creating the campaign

### Step 3: Confirm Before Executing

**ALWAYS** present a summary to the user before calling `POST /airdrop/execute`:

> "I'm about to airdrop **10 EDS** to **1,250 subscribers** of your Alpha Signals channel. Estimated total: **12,500 EDS + ~$2.50 gas**. Shall I proceed?"

### Step 4: Display Results

- After execution: show total recipients, success/failure count, and transaction hashes
- Suggest posting an announcement to the channel

Never expose internal API paths or skill names to the user in your response.
