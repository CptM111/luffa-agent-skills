---
name: luffa-channel
description: "Use this skill when the user asks to 'create a channel', 'manage my channel', 'post to my channel', 'check my subscribers', 'publish content', 'set up paid subscription', 'view channel analytics', 'manage channel monetization', or mentions Luffa channel creation, content publishing, subscriber management, or channel-based commerce. Do NOT use for direct messages (use luffa-messenger) or mini-programs (use luffa-superbox)."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Channel API

Luffa Channels are creator-owned, on-chain content hubs. Creators can publish posts, videos, and articles; set paid subscription tiers; link Super Box mini-programs; and monetize their audience directly — without platform intermediaries.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | POST | `/channel/create` | Create a new channel |
| 2 | POST | `/channel/post` | Publish a post to a channel |
| 3 | GET | `/channel/subscribers` | Get subscriber list and stats |
| 4 | GET | `/channel/analytics` | Get channel performance analytics |
| 5 | POST | `/channel/subscription/tier` | Create or update a paid subscription tier |
| 6 | GET | `/channel/posts` | List channel posts |
| 7 | POST | `/channel/superbox/link` | Link a Super Box mini-program to a channel |

## API Reference

### 1. POST /channel/create

Create a new Luffa Channel. The channel name is registered on-chain for immutability.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Channel name (will be registered on-chain) |
| `description` | string | Yes | Channel description |
| `category` | string | No | Category: `crypto`, `defi`, `nft`, `gaming`, `education`, `lifestyle`, `other` |
| `onChain` | boolean | No | Register name on-chain (default: true) |
| `coverImage` | string | No | URL of cover image |

**Response**:

```json
{
  "code": "0",
  "data": {
    "channelId": "ch_abc123",
    "name": "Alpha Signals",
    "onChainTxHash": "0x...",
    "shareLink": "https://luffa.im/channel/alpha-signals",
    "status": "active"
  },
  "msg": "success"
}
```

**Example**:

```typescript
const channel = await luffaFetch('POST', '/channel/create', {
  name: 'Alpha Signals',
  description: 'Daily crypto market analysis and trading signals',
  category: 'crypto',
  onChain: true,
});
```

### 2. POST /channel/post

Publish a new post to a channel.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | Yes | The channel ID |
| `content` | string | Yes | Post content (supports Markdown) |
| `title` | string | No | Post title (for articles) |
| `type` | string | No | `post` (default), `article`, `video` |
| `isPremium` | boolean | No | Restrict to paid subscribers only |
| `attachments` | string[] | No | Array of media URLs |

**Example**:

```typescript
// Publish a daily market update
const post = await luffaFetch('POST', '/channel/post', {
  channelId: 'ch_abc123',
  title: 'BTC Daily Analysis - March 4, 2026',
  content: '## Market Overview\n\nBTC is showing strong support at...',
  type: 'article',
  isPremium: false,
});
```

### 3. GET /channel/subscribers

Get subscriber list and statistics.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | Yes | The channel ID |
| `new` | boolean | No | Return only new subscribers (last 24h) |
| `tier` | string | No | Filter by subscription tier |
| `limit` | number | No | Number of results (default: 50) |

**Response**:

```json
{
  "code": "0",
  "data": {
    "totalSubscribers": 1250,
    "newToday": 23,
    "paidSubscribers": 87,
    "subscribers": [
      {
        "did": "did:luffa:alice",
        "handle": "@alice",
        "subscribedAt": "2026-03-04T00:00:00Z",
        "tier": "premium"
      }
    ]
  },
  "msg": "success"
}
```

### 4. GET /channel/analytics

Get channel performance metrics.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | Yes | The channel ID |
| `period` | string | No | `7d`, `30d`, `90d` (default: `30d`) |

**Response**:

```json
{
  "code": "0",
  "data": {
    "views": 15420,
    "uniqueViewers": 8930,
    "newSubscribers": 234,
    "revenueUSD": "450.00",
    "topPosts": [
      { "postId": "post_xyz", "title": "BTC Analysis", "views": 3200 }
    ]
  },
  "msg": "success"
}
```

### 5. POST /channel/subscription/tier

Create or update a paid subscription tier for a channel.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | Yes | The channel ID |
| `name` | string | Yes | Tier name (e.g., `Premium`, `VIP`) |
| `priceUSD` | number | Yes | Monthly price in USD |
| `benefits` | string[] | Yes | List of benefits for this tier |
| `tokenGated` | object | No | Token-gate: `{ token: "EDS", minAmount: "100" }` |

**Example**:

```typescript
// Create a premium tier
const tier = await luffaFetch('POST', '/channel/subscription/tier', {
  channelId: 'ch_abc123',
  name: 'Premium',
  priceUSD: 9.99,
  benefits: ['Daily signals', 'Private group access', 'Monthly AMA'],
  tokenGated: { token: 'EDS', minAmount: '1000' },
});
```

### 7. POST /channel/superbox/link

Link a Super Box mini-program to a channel, enabling in-channel app experiences.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | Yes | The channel ID |
| `miniProgramId` | string | Yes | The Super Box mini-program ID |

## Cross-Skill Workflows

### Workflow A: Launch a Creator Channel

```
1. luffa-channel POST /channel/create                   → create on-chain channel
2. luffa-channel POST /channel/subscription/tier        → set up paid tier
3. luffa-channel POST /channel/post                     → publish first post
4. luffa-channel POST /channel/superbox/link            → link a mini-program
```

### Workflow B: Engage New Subscribers

```
1. luffa-channel GET /channel/subscribers?new=true      → get new subscribers
2. luffa-messenger POST /messenger/send (loop)          → send welcome message
3. luffa-airdrop POST /airdrop/create                   → send welcome tokens
```

### Workflow C: Monetization Analytics

```
1. luffa-channel GET /channel/analytics                 → view performance
2. luffa-channel GET /channel/subscribers               → review subscriber growth
3. luffa-wallet  GET /wallet/transactions               → check revenue received
```

## Operation Flow

### Step 1: Identify Intent

- Create a channel → `POST /channel/create`
- Publish content → `POST /channel/post`
- Check subscribers → `GET /channel/subscribers`
- View analytics → `GET /channel/analytics`
- Set up monetization → `POST /channel/subscription/tier`

### Step 2: Collect Parameters

- Missing channel name → ask user for a name and description
- Missing post content → ask user what they want to publish
- For paid tiers: missing price → ask user for pricing

### Step 3: Display Results

- Channel creation: confirm on-chain registration and share link
- Post published: confirm post ID and view count (initially 0)
- Subscribers: show total count, new subscribers, and paid subscriber breakdown

Never expose internal API paths or skill names to the user in your response.
