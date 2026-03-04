---
name: luffa-did
description: "Use this skill when the user asks to 'manage my identity', 'view my credentials', 'verify my identity', 'create a DID', 'resolve a username', 'look up a Luffa user', 'check if a handle is taken', 'issue a credential', 'verify a credential', or mentions decentralized identity (DID), verifiable credentials, identity verification, on-chain identity, or resolving Luffa handles to wallet addresses. Do NOT use for wallet operations (use luffa-wallet) or messaging (use luffa-messenger)."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa DID (Decentralized Identity) API

Luffa's identity layer is built on the Endless protocol and provides each user with a self-sovereign DID. This DID is the universal identifier across all Luffa services — wallet, messaging, channels, and Super Box. DIDs can be resolved to wallet addresses, public keys, and verifiable credentials.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

## DID Format

Luffa DIDs follow the W3C DID specification:

```
did:luffa:<unique-identifier>
```

Users can also be referenced by their human-readable handle: `@username`

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | GET | `/did/resolve` | Resolve a DID or handle to a DID document |
| 2 | GET | `/did/credentials` | Get verifiable credentials for a DID |
| 3 | POST | `/did/credential/issue` | Issue a verifiable credential |
| 4 | POST | `/did/credential/verify` | Verify a credential |
| 5 | GET | `/did/lookup` | Look up a user by handle |
| 6 | GET | `/did/profile` | Get a user's public profile |

## API Reference

### 1. GET /did/resolve

Resolve a DID or handle to a full DID document containing public keys, service endpoints, and metadata.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `did` | string | Yes* | The DID to resolve (e.g., `did:luffa:abc123`) |
| `handle` | string | Yes* | The handle to resolve (e.g., `@alice`) |

*Provide either `did` or `handle`, not both.

**Response**:

```json
{
  "code": "0",
  "data": {
    "did": "did:luffa:abc123",
    "handle": "@alice",
    "walletAddress": "0xAliceAddress",
    "publicKey": "0x...",
    "serviceEndpoints": {
      "messaging": "luffa://msg/did:luffa:abc123",
      "channel": "https://luffa.im/channel/alice"
    },
    "createdAt": "2025-01-15T00:00:00Z",
    "verifiedAt": "2025-06-01T00:00:00Z"
  },
  "msg": "success"
}
```

**Example**:

```typescript
// Resolve a handle to get wallet address
const resolved = await luffaFetch('GET', '/did/resolve?handle=@alice');
const walletAddress = resolved.data.walletAddress;
// Now use walletAddress with luffa-wallet skill
```

### 2. GET /did/credentials

Get the verifiable credentials associated with a DID.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `did` | string | Yes | The DID |
| `type` | string | No | Filter by credential type: `kyc`, `social`, `achievement`, `membership` |

**Response**:

```json
{
  "code": "0",
  "data": {
    "credentials": [
      {
        "id": "cred_xyz",
        "type": "SocialVerification",
        "issuer": "did:luffa:luffa-platform",
        "subject": "did:luffa:abc123",
        "claims": {
          "platform": "twitter",
          "handle": "@alice_crypto",
          "verified": true
        },
        "issuedAt": "2025-06-01T00:00:00Z",
        "expiresAt": null
      }
    ]
  },
  "msg": "success"
}
```

### 3. POST /did/credential/issue

Issue a verifiable credential to a DID. Requires appropriate issuer permissions.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `subject` | string | Yes | The recipient DID |
| `type` | string | Yes | Credential type (e.g., `Membership`, `Achievement`) |
| `claims` | object | Yes | Key-value claims to include in the credential |
| `expiresAt` | string | No | ISO 8601 expiry date |

**Example**:

```typescript
// Issue a membership credential to a subscriber
const credential = await luffaFetch('POST', '/did/credential/issue', {
  subject: 'did:luffa:abc123',
  type: 'ChannelMembership',
  claims: {
    channelId: 'ch_abc123',
    channelName: 'Alpha Signals',
    tier: 'premium',
    joinedAt: '2026-03-04',
  },
});
```

### 4. POST /did/credential/verify

Verify the authenticity and validity of a verifiable credential.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `credentialId` | string | Yes | The credential ID to verify |

**Response**:

```json
{
  "code": "0",
  "data": {
    "valid": true,
    "issuer": "did:luffa:channel-alpha-signals",
    "subject": "did:luffa:abc123",
    "notExpired": true,
    "issuerTrusted": true
  },
  "msg": "success"
}
```

### 6. GET /did/profile

Get the public profile of a Luffa user.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `did` | string | Yes* | The DID |
| `handle` | string | Yes* | The handle |

**Response**:

```json
{
  "code": "0",
  "data": {
    "did": "did:luffa:abc123",
    "handle": "@alice",
    "displayName": "Alice",
    "bio": "Crypto trader & DeFi enthusiast",
    "avatar": "https://cdn.luffa.im/avatars/alice.png",
    "channel": "https://luffa.im/channel/alice",
    "followers": 1250,
    "isVerified": true
  },
  "msg": "success"
}
```

## Cross-Skill Workflows

### Workflow A: Send Tokens by Handle

```
1. luffa-did     GET /did/resolve?handle=@alice         → get wallet address
2. luffa-wallet  GET /wallet/balance                    → check sender balance
3. luffa-wallet  POST /wallet/transfer                  → send tokens
4. luffa-messenger POST /messenger/send                 → notify recipient
```

### Workflow B: Issue Membership Credentials

```
1. luffa-channel GET /channel/subscribers               → get new paid subscribers
2. luffa-did     POST /did/credential/issue (loop)      → issue membership credential
3. luffa-messenger POST /messenger/send                 → notify subscribers of their credential
```

### Workflow C: Token-Gated Access Verification

```
1. luffa-did     GET /did/credentials?type=membership   → check user credentials
2. luffa-did     POST /did/credential/verify            → verify credential validity
3. [Grant or deny access based on verification result]
```

## Operation Flow

### Step 1: Identify Intent

- Look up a user → `GET /did/resolve` or `GET /did/profile`
- View credentials → `GET /did/credentials`
- Issue a credential → `POST /did/credential/issue`
- Verify a credential → `POST /did/credential/verify`

### Step 2: Collect Parameters

- Missing identifier → ask user for the handle or DID
- For credential issuance → ask what claims to include

Never expose internal API paths or skill names to the user in your response.
