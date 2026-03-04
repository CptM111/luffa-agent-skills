---
name: luffa-messenger
description: "Use this skill when the user asks to 'send a message', 'message someone on Luffa', 'check my messages', 'read my inbox', 'create a group chat', 'manage my contacts', 'send a voice message', or mentions encrypted messaging, private chats, group conversations, or contacting someone via Luffa. Do NOT use for channel posts (use luffa-channel) or airdrop notifications (use luffa-airdrop). Do NOT use for general programming questions about messaging APIs."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Messenger API

Luffa Messenger provides end-to-end encrypted (E2EE) messaging built on the Endless protocol. All messages are encrypted using a hybrid RSA + AES architecture. No intermediary — including Luffa itself — can read message content.

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

**Never** output credentials to logs or user-visible interfaces.

```typescript
const BASE_URL = 'https://api.luffa.im/v1';
const LUFFA_API_KEY = process.env.LUFFA_API_KEY || 'demo-key';

async function luffaFetch(method: 'GET' | 'POST' | 'DELETE', path: string, body?: object) {
  const headers: Record<string, string> = {
    'X-Luffa-API-Key': LUFFA_API_KEY,
    'Content-Type': 'application/json',
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`Luffa API error: ${res.status}`);
  return res.json();
}
```

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | POST | `/messenger/send` | Send an encrypted message |
| 2 | GET | `/messenger/inbox` | Get inbox messages |
| 3 | GET | `/messenger/conversation` | Get messages in a conversation |
| 4 | POST | `/messenger/group/create` | Create a group chat |
| 5 | GET | `/messenger/contacts` | List contacts |
| 6 | POST | `/messenger/contacts/add` | Add a contact |

## API Reference

### 1. POST /messenger/send

Send an end-to-end encrypted message to a user or group.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `to` | string | Yes | Recipient's Luffa DID, handle (@username), or group ID |
| `content` | string | Yes | Message content (will be encrypted before sending) |
| `type` | string | No | Message type: `text` (default), `image`, `file` |
| `replyTo` | string | No | Message ID to reply to |
| `selfDestruct` | number | No | Auto-delete after N seconds (0 = never) |

**Response**:

```json
{
  "code": "0",
  "data": {
    "messageId": "msg_abc123",
    "status": "sent",
    "timestamp": "2026-03-04T00:00:00Z"
  },
  "msg": "success"
}
```

**Example**:

```typescript
// Send a message to a user
const result = await luffaFetch('POST', '/messenger/send', {
  to: '@alice',
  content: 'Hello! Your token transfer of 10 EDS has been confirmed.',
  type: 'text',
});
```

### 2. GET /messenger/inbox

Get the user's inbox with recent conversations.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `limit` | number | No | Number of conversations (default: 20) |
| `unreadOnly` | boolean | No | Return only unread conversations |

**Response**:

```json
{
  "code": "0",
  "data": {
    "conversations": [
      {
        "conversationId": "conv_xyz",
        "with": "@alice",
        "lastMessage": "Thanks for the transfer!",
        "lastMessageTime": "2026-03-04T00:00:00Z",
        "unreadCount": 2,
        "type": "direct"
      }
    ]
  },
  "msg": "success"
}
```

### 3. GET /messenger/conversation

Get messages in a specific conversation.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `conversationId` | string | Yes | The conversation ID |
| `limit` | number | No | Number of messages (default: 50) |
| `before` | string | No | Get messages before this message ID |

### 4. POST /messenger/group/create

Create a new encrypted group chat.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Group name |
| `members` | string[] | Yes | Array of member DIDs or handles |
| `description` | string | No | Group description |
| `onChain` | boolean | No | Register group name on-chain for immutability |

**Example**:

```typescript
// Create a community group
const group = await luffaFetch('POST', '/messenger/group/create', {
  name: 'Alpha Traders',
  members: ['@alice', '@bob', '@charlie'],
  description: 'Private trading signals group',
  onChain: true,
});
```

## Cross-Skill Workflows

### Workflow A: Post-Transfer Notification

```
1. luffa-wallet  POST /wallet/transfer                  → execute transfer
2. luffa-messenger POST /messenger/send                 → notify recipient
```

### Workflow B: Welcome New Subscribers

```
1. luffa-channel GET /channel/subscribers?new=true      → get new subscribers
2. luffa-messenger POST /messenger/send (loop)          → send welcome message to each
3. luffa-airdrop POST /airdrop/create                   → optionally airdrop welcome tokens
```

### Workflow C: Group Announcement

```
1. luffa-messenger POST /messenger/group/create         → create announcement group
2. luffa-messenger POST /messenger/send                 → send announcement to group
```

## Operation Flow

### Step 1: Identify Intent

- Send a message → `POST /messenger/send`
- Check inbox → `GET /messenger/inbox`
- Read a conversation → `GET /messenger/conversation`
- Create a group → `POST /messenger/group/create`

### Step 2: Collect Parameters

- Missing recipient → ask user for the recipient's Luffa handle or DID
- Missing message content → ask user what they want to say
- For groups: missing members → ask user who to include

### Step 3: Display Results

- Sent message: confirm delivery status
- Inbox: show conversation list with unread counts
- Conversation: show messages in chronological order

### Step 4: Suggest Next Steps

| Just called | Suggest |
|---|---|
| `POST /messenger/send` | 1. Send tokens to this person → `luffa-wallet` 2. View conversation history |
| `GET /messenger/inbox` | 1. Reply to a message 2. Create a group with contacts → `POST /messenger/group/create` |

Never expose internal API paths or skill names to the user in your response.
