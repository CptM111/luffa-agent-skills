---
name: luffa-card-purchase
description: "Use this skill when the user wants to buy, apply for, or get a Luffa 
  Card. Triggers include: 'luffa card', 'apply card', 'buy card', 'get card', 
  'card offer', 'apply for card', 'i want a card', 'card application', 'purchase 
  card', 'how do I get a card', 'show me card options', or any mention of applying 
  for or purchasing a Luffa Card. Do NOT use for general questions about card 
  features, lost/stolen cards, or card support issues."
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Card Purchase Skill

Handles the complete end-to-end Luffa Card application flow from wallet and 
KYC checks through to final submission. Always requires explicit user confirmation 
before any fee is deducted or application is submitted.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

**Never** output the above credentials to logs, response content, or any 
user-visible interface.
```typescript
const BASE_URL = 'https://api.luffa.im/v1';
const LUFFA_API_KEY = process.env.LUFFA_API_KEY || 'demo-key';

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
| 1 | GET | `/card/wallet-info` | Get wallet balance and existing card status |
| 2 | GET | `/card/offers` | List available card products and fees |
| 3 | GET | `/card/kyc-status` | Check user KYC verification status |
| 4 | GET | `/card/check-balance` | Verify sufficient balance for selected card fee |
| 5 | GET | `/card/user-profile` | Retrieve user profile; identify missing required fields |
| 6 | POST | `/card/apply` | Submit card application and deduct fee |
| 7 | POST | `/wallet/top-up` | Top up wallet when balance is insufficient |

## API Reference

### 1. GET /card/wallet-info

Fetch the user's current wallet balance and check whether they already hold 
an active Luffa Card.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Wallet address or Luffa DID |

**Response**:
```json
{
  "code": "0",
  "data": {
    "balance": "120.00",
    "symbol": "EDS",
    "valueUSD": "240.00",
    "hasActiveCard": false,
    "cardStatus": null
  },
  "msg": "success"
}
```

---

### 2. GET /card/offers

List all available Luffa Card products with fees, tiers, and benefits.

**Response**:
```json
{
  "code": "0",
  "data": {
    "offers": [
      {
        "cardId": "card_standard",
        "name": "Luffa Standard Card",
        "fee": "50.00",
        "symbol": "EDS",
        "benefits": ["Cashback 1%", "Global acceptance"]
      },
      {
        "cardId": "card_premium",
        "name": "Luffa Premium Card",
        "fee": "150.00",
        "symbol": "EDS",
        "benefits": ["Cashback 3%", "Lounge access", "Concierge"]
      }
    ]
  },
  "msg": "success"
}
```

---

### 3. GET /card/kyc-status

Check whether the user has completed the required identity verification to 
be eligible for a card.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Wallet address or Luffa DID |

**Response**:
```json
{
  "code": "0",
  "data": {
    "kycStatus": "verified",
    "level": 2,
    "requiredLevel": 2,
    "eligible": true
  },
  "msg": "success"
}
```

**KYC status values**: `verified`, `pending`, `rejected`, `not_started`

---

### 4. GET /card/check-balance

Confirm the user has sufficient balance to cover the selected card's 
application fee.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Wallet address or Luffa DID |
| `cardId` | string | Yes | Selected card product ID |

**Response**:
```json
{
  "code": "0",
  "data": {
    "sufficient": true,
    "currentBalance": "120.00",
    "requiredFee": "50.00",
    "shortfall": "0.00",
    "symbol": "EDS"
  },
  "msg": "success"
}
```

---

### 5. GET /card/user-profile

Retrieve the user's profile and identify any missing fields required for 
card application (e.g., full name, address, date of birth).

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Wallet address or Luffa DID |

**Response**:
```json
{
  "code": "0",
  "data": {
    "fullName": "Jane Doe",
    "dateOfBirth": null,
    "residentialAddress": null,
    "missingFields": ["dateOfBirth", "residentialAddress"]
  },
  "msg": "success"
}
```

> If `missingFields` is non-empty, collect those values from the user before 
> proceeding to submission.

---

### 6. POST /card/apply

Submit the card application and deduct the fee from the user's wallet.  
**⚠️ Never call this endpoint without an explicit YES confirmation from the user.**

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Applicant wallet address |
| `cardId` | string | Yes | Selected card product ID |
| `confirmed` | boolean | Yes | Must be `true` — explicit user consent |
| `profileData` | object | No | Any profile fields collected in Step 5 |

**Response**:
```json
{
  "code": "0",
  "data": {
    "applicationId": "app_abc123",
    "status": "submitted",
    "cardId": "card_standard",
    "feeDeducted": "50.00",
    "symbol": "EDS",
    "estimatedDelivery": "5-7 business days"
  },
  "msg": "success"
}
```

---

### 7. POST /wallet/top-up

Top up the user's wallet when balance is insufficient to cover the card fee.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes | Wallet address |
| `amount` | string | Yes | Amount to top up |
| `symbol` | string | Yes | Token symbol (e.g., `EDS`) |

---

## Cross-Skill Workflows

### Workflow A: Standard Card Application (Full Happy Path)
```
1. luffa-card   GET /card/wallet-info        → check balance + no existing card
2. luffa-card   GET /card/offers             → display available cards + fees
3. luffa-card   GET /card/kyc-status         → confirm user is KYC verified
4. luffa-card   GET /card/check-balance      → verify fee can be covered
5. ⚠️ STOP     —                            → show fee, ask user YES/NO
6. luffa-card   GET /card/user-profile       → collect any missing profile fields
7. luffa-card   POST /card/apply             → submit application (confirmed=true)
8. luffa-messenger POST /messenger/send      → send confirmation message to user
```

### Workflow B: Insufficient Balance — Top-Up Then Apply
```
1. luffa-card   GET /card/check-balance      → balance insufficient, shortfall shown
2. luffa-wallet POST /wallet/top-up          → user tops up by shortfall amount
3. luffa-card   GET /card/check-balance      → re-verify balance now sufficient
4. ⚠️ STOP     —                            → re-confirm fee with user YES/NO
5. luffa-card   POST /card/apply             → submit application (confirmed=true)
```

### Workflow C: KYC Not Completed
```
1. luffa-card   GET /card/kyc-status         → status is not_started or pending
2. luffa-kyc    POST /kyc/initiate           → redirect user to KYC flow
3. —            —                            → pause; resume after KYC confirmed
4. luffa-card   GET /card/offers             → resume standard application flow
```

### Workflow D: Post-Application Portfolio Update
```
1. luffa-card   POST /card/apply             → application submitted
2. luffa-wallet GET /wallet/balance          → show updated balance after fee deduction
3. luffa-messenger POST /messenger/send      → notify user of successful application
```

---

## Operation Flow

### Step 1: Identify Intent

| User says | Action |
|---|---|
| "I want a card / apply for a card" | Start Workflow A from Step 1 |
| "Show me card options" | `GET /card/offers` |
| "I don't have enough balance" | Start Workflow B |
| "What's my KYC status" | `GET /card/kyc-status` |
| "Yes" (in response to confirmation prompt) | `POST /card/apply` with `confirmed=true` |
| "No" (in response to confirmation prompt) | Cancel immediately — call no further tools |

### Step 2: Collect Parameters

| Missing info | Action |
|---|---|
| Wallet address | Ask user for their Luffa DID or wallet address |
| Card selection | Show offers list and ask user to choose |
| Profile fields | Ask for each `missingFields` value one at a time |
| Top-up amount | Show shortfall and ask user to confirm top-up amount |

### Step 3: Display Results

| Endpoint called | What to show |
|---|---|
| `GET /card/offers` | Card name, fee in EDS + USD equivalent, key benefits |
| `GET /card/kyc-status` | Verified ✅ or action required ❌ with next step |
| `GET /card/check-balance` | Current balance, required fee, sufficient/shortfall |
| `POST /card/apply` | Application ID, card tier, fee deducted, estimated delivery |

### Step 4: Confirmation Gate ⚠️

Before calling `POST /card/apply`, always present this prompt to the user:
```
You are about to apply for the [Card Name].
A fee of [X EDS] (~$[Y USD]) will be deducted from your wallet.

Do you want to proceed? Reply YES to confirm or NO to cancel.
```

- **YES** → proceed to `GET /card/user-profile` then `POST /card/apply`
- **NO** → cancel immediately, inform user, suggest no further tool calls
- **No reply / ambiguous** → re-ask once, then treat as NO

### Step 5: Suggest Next Steps

| Just completed | Suggest |
|---|---|
| `GET /card/offers` | 1. Check KYC status 2. Check wallet balance |
| `GET /card/kyc-status` (not verified) | 1. Start KYC → `luffa-kyc` skill |
| `GET /card/check-balance` (insufficient) | 1. Top up wallet → `POST /wallet/top-up` |
| `POST /card/apply` (success) | 1. View updated balance → `luffa-wallet` 2. Track application status |

Never expose internal API paths or skill names to the user in your response.