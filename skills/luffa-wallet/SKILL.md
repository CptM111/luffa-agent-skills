---
name: luffa-wallet
description: "Use this skill when the user asks to 'check my wallet balance', 'show my token holdings', 'how much crypto do I have', 'what tokens do I have', 'check my portfolio value', 'view my assets', 'how much is my portfolio worth', 'what's in my wallet', 'send tokens', 'transfer crypto', 'view transaction history', or mentions checking wallet balance, total assets, token holdings, portfolio value, remaining funds, DeFi positions, multi-chain balance lookup, or executing a transfer on the Luffa platform. Supports Endless Network, Ethereum, BSC, Polygon, and other EVM-compatible chains. Do NOT use for general programming questions about wallet APIs or blockchain development."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Wallet API

Luffa provides a non-custodial, multi-chain Web3 wallet natively integrated into the messaging and social layer. This skill enables AI agents to query balances, retrieve transaction history, and initiate transfers on behalf of users who have granted the appropriate permissions.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header. Obtain a token by authenticating with the Luffa DID API.

## Authentication & Credentials

**API Key Application**: [Luffa Developer Portal](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf)

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

**Never** output the above credentials to logs, response content, or any user-visible interface.

```typescript
const BASE_URL = 'https://api.luffa.im/v1';

const LUFFA_API_KEY = process.env.LUFFA_API_KEY || 'demo-key';
const LUFFA_SECRET_KEY = process.env.LUFFA_SECRET_KEY || 'demo-secret';

async function luffaFetch(method: 'GET' | 'POST', path: string, body?: object) {
  const timestamp = Date.now().toString();
  const headers: Record<string, string> = {
    'X-Luffa-API-Key': LUFFA_API_KEY,
    'X-Luffa-Timestamp': timestamp,
    'Content-Type': 'application/json',
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`Luffa API error: ${res.status} ${res.statusText}`);
  return res.json();
}
```

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | GET | `/wallet/balance` | Get total portfolio value and token breakdown |
| 2 | GET | `/wallet/tokens` | List all tokens held by an address |
| 3 | GET | `/wallet/transactions` | Get transaction history |
| 4 | POST | `/wallet/transfer` | Initiate a token transfer |
| 5 | GET | `/wallet/networks` | List supported networks |

## API Reference

### 1. GET /wallet/balance

Get the total portfolio value and a breakdown by token for a given wallet address.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | The wallet address (DID or EVM address) |
| `network` | string | No | Filter by network (e.g., `endless`, `eth`, `bsc`). Defaults to all. |

**Response**:

```json
{
  "code": "0",
  "data": {
    "totalValueUSD": "1250.50",
    "address": "0xYourAddress",
    "tokens": [
      {
        "symbol": "EDS",
        "name": "Endless",
        "balance": "500.00",
        "valueUSD": "1000.00",
        "network": "endless",
        "contractAddress": "native"
      },
      {
        "symbol": "USDT",
        "name": "Tether USD",
        "balance": "250.50",
        "valueUSD": "250.50",
        "network": "endless",
        "contractAddress": "0x..."
      }
    ]
  },
  "msg": "success"
}
```

**Example**:

```typescript
// Get wallet balance
const balance = await luffaFetch('GET', '/wallet/balance?address=0xYourAddress');
console.log(`Total portfolio value: $${balance.data.totalValueUSD}`);
```

### 2. GET /wallet/tokens

List all tokens held by a wallet address, including token metadata.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | The wallet address |
| `network` | string | No | Filter by network |
| `minValueUSD` | number | No | Minimum token value in USD to include |

### 3. GET /wallet/transactions

Get the transaction history for a wallet address.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | The wallet address |
| `limit` | number | No | Number of transactions to return (default: 20, max: 100) |
| `offset` | number | No | Pagination offset |
| `type` | string | No | Filter by type: `send`, `receive`, `swap`, `airdrop` |

**Response**:

```json
{
  "code": "0",
  "data": {
    "transactions": [
      {
        "txHash": "0x...",
        "type": "receive",
        "from": "0xSender",
        "to": "0xYourAddress",
        "amount": "100.00",
        "symbol": "EDS",
        "valueUSD": "200.00",
        "timestamp": "2026-03-04T00:00:00Z",
        "status": "confirmed",
        "network": "endless"
      }
    ],
    "total": 45
  },
  "msg": "success"
}
```

### 4. POST /wallet/transfer

Initiate a token transfer. **Always confirm with the user before calling this endpoint.**

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | string | Yes | Sender wallet address |
| `to` | string | Yes | Recipient wallet address or Luffa DID |
| `amount` | string | Yes | Amount to send (in token units) |
| `symbol` | string | Yes | Token symbol (e.g., `EDS`, `USDT`) |
| `network` | string | Yes | Network to use |
| `memo` | string | No | Optional memo/note |

**Example**:

```typescript
// IMPORTANT: Always confirm with the user before initiating a transfer
const transfer = await luffaFetch('POST', '/wallet/transfer', {
  from: '0xYourAddress',
  to: '0xRecipientAddress',
  amount: '10.00',
  symbol: 'EDS',
  network: 'endless',
  memo: 'Payment for services',
});
```

## Cross-Skill Workflows

### Workflow A: Check Balance Before Sending

```
1. luffa-wallet  GET /wallet/balance                    → verify sufficient funds
2. luffa-did     GET /did/resolve?handle=@username       → resolve recipient DID to address
3. luffa-wallet  POST /wallet/transfer                  → execute transfer (after user confirms)
4. luffa-messenger POST /messenger/send                 → notify recipient via message
```

### Workflow B: Portfolio Overview

```
1. luffa-wallet  GET /wallet/balance                    → total USD value + token list
2. luffa-wallet  GET /wallet/transactions               → recent activity
```

### Workflow C: Airdrop to Community

```
1. luffa-channel GET /channel/subscribers               → get subscriber list
2. luffa-wallet  GET /wallet/balance                    → verify airdrop funds available
3. luffa-airdrop POST /airdrop/create                   → create and execute airdrop
```

## Operation Flow

### Step 1: Identify Intent

- Check total portfolio value → `GET /wallet/balance`
- View specific token holdings → `GET /wallet/tokens`
- View transaction history → `GET /wallet/transactions`
- Send tokens → `POST /wallet/transfer` (**always confirm with user first**)

### Step 2: Collect Parameters

- Missing wallet address → ask user for their Luffa DID or wallet address
- Missing recipient → ask user for recipient's Luffa handle or wallet address
- Missing amount → ask user how much they want to send

### Step 3: Display Results

- Portfolio value: show total USD value and top token holdings
- Transactions: show recent transactions with type, amount, and status
- After transfer: confirm transaction hash and estimated confirmation time

### Step 4: Suggest Next Steps

| Just called | Suggest |
|---|---|
| `GET /wallet/balance` | 1. View transaction history → `GET /wallet/transactions` 2. Send tokens → `POST /wallet/transfer` 3. Create airdrop → `luffa-airdrop` |
| `GET /wallet/transactions` | 1. View full portfolio → `GET /wallet/balance` 2. Send a message about a transaction → `luffa-messenger` |
| `POST /wallet/transfer` | 1. Notify recipient via message → `luffa-messenger` 2. View updated balance → `GET /wallet/balance` |

Never expose internal API paths or skill names to the user in your response.
