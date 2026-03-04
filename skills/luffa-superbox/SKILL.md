---
name: luffa-superbox
description: "Use this skill when the user asks to 'discover mini-programs', 'launch a mini-program', 'build a mini-program', 'find apps in Luffa', 'access Super Box', 'create a mini-program', 'submit a mini-program for review', or mentions Luffa Super Box, mini-programs, in-app experiences, DeFi apps, games, or e-commerce within Luffa. Do NOT use for channel management (use luffa-channel) or direct messaging (use luffa-messenger)."
license: Apache-2.0
metadata:
  author: luffa
  version: "1.0.0"
  homepage: "https://www.luffa.im"
---

# Luffa Super Box API

Luffa Super Box is an open mini-program platform that enables developers to build lightweight, no-installation apps directly within the Luffa ecosystem. Mini-programs can be linked to channels, shared in groups, and accessed by any Luffa user. Use cases include DeFi dashboards, games, e-commerce, loyalty programs, and AI-powered tools.

**Developer Portal**: [https://super.luffa.im](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf)

**Documentation**: [https://luffa.im/SuperBox/docs/en/](https://luffa.im/SuperBox/docs/en/quickStartGuide/quickStartGuide.html)

**Base URL**: `https://api.luffa.im/v1`

**Auth**: Bearer token via `Authorization` header.

## Authentication & Credentials

Read credentials from environment variables:
- `LUFFA_API_KEY` → API key from the developer portal
- `LUFFA_SECRET_KEY` → Secret key for signing requests

## Endpoint Index

| # | Method | Path | Description |
|---|---|---|---|
| 1 | GET | `/superbox/discover` | Discover available mini-programs |
| 2 | GET | `/superbox/categories` | List mini-program categories |
| 3 | GET | `/superbox/app` | Get details of a specific mini-program |
| 4 | POST | `/superbox/app/create` | Register a new mini-program |
| 5 | POST | `/superbox/app/submit` | Submit a mini-program for review |
| 6 | GET | `/superbox/app/status` | Check review status |
| 7 | GET | `/superbox/app/analytics` | Get mini-program usage analytics |

## API Reference

### 1. GET /superbox/discover

Discover available mini-programs in the Super Box marketplace.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `category` | string | No | Filter by category: `defi`, `gaming`, `ecommerce`, `tools`, `social`, `nft` |
| `search` | string | No | Search by name or description |
| `sortBy` | string | No | `popular` (default), `new`, `trending` |
| `limit` | number | No | Number of results (default: 20) |

**Response**:

```json
{
  "code": "0",
  "data": {
    "miniPrograms": [
      {
        "id": "mp_defi_001",
        "name": "Luffa Swap",
        "description": "Swap tokens directly within Luffa",
        "category": "defi",
        "icon": "https://cdn.luffa.im/icons/luffa-swap.png",
        "installs": 15420,
        "rating": 4.8,
        "developer": "Luffa Team"
      }
    ],
    "total": 87
  },
  "msg": "success"
}
```

**Example**:

```typescript
// Discover DeFi mini-programs
const apps = await luffaFetch('GET', '/superbox/discover?category=defi&sortBy=popular');
console.log(`Found ${apps.data.total} DeFi mini-programs`);
```

### 3. GET /superbox/app

Get detailed information about a specific mini-program.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | The mini-program ID |

**Response**:

```json
{
  "code": "0",
  "data": {
    "id": "mp_defi_001",
    "name": "Luffa Swap",
    "description": "Swap tokens directly within Luffa using the best rates across multiple DEXs",
    "category": "defi",
    "version": "2.1.0",
    "developer": "Luffa Team",
    "shareLink": "https://luffa.im/superbox/luffa-swap",
    "permissions": ["wallet_read", "wallet_sign"],
    "screenshots": ["https://cdn.luffa.im/screenshots/swap-1.png"],
    "installs": 15420,
    "rating": 4.8,
    "reviews": 892
  },
  "msg": "success"
}
```

### 4. POST /superbox/app/create

Register a new mini-program in the Super Box developer console.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Mini-program name |
| `description` | string | Yes | Description of the mini-program |
| `category` | string | Yes | Category |
| `icon` | string | Yes | URL of the app icon (512x512 PNG) |
| `permissions` | string[] | No | Required permissions: `wallet_read`, `wallet_sign`, `messaging`, `identity` |

**Response**:

```json
{
  "code": "0",
  "data": {
    "appId": "mp_new_xyz",
    "appKey": "your-app-key",
    "status": "draft",
    "developerPortal": "https://super.luffa.im/console/mp_new_xyz"
  },
  "msg": "success"
}
```

### 5. POST /superbox/app/submit

Submit a mini-program version for platform review.

**Request Body**:

| Param | Type | Required | Description |
|---|---|---|---|
| `appId` | string | Yes | The mini-program ID |
| `version` | string | Yes | Version string (e.g., `1.0.0`) |
| `changeLog` | string | Yes | Description of changes in this version |
| `bundleUrl` | string | Yes | URL to the compiled mini-program bundle |

### 6. GET /superbox/app/status

Check the review status of a submitted mini-program.

**Query Parameters**:

| Param | Type | Required | Description |
|---|---|---|---|
| `appId` | string | Yes | The mini-program ID |

**Response**:

```json
{
  "code": "0",
  "data": {
    "appId": "mp_new_xyz",
    "status": "under_review",
    "submittedAt": "2026-03-04T00:00:00Z",
    "estimatedReviewTime": "2-3 business days",
    "reviewNotes": null
  },
  "msg": "success"
}
```

## Developer Collaboration Process

When a user wants to build and publish a Super Box mini-program, guide them through these steps:

1. **Register** at [super.luffa.im](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf)
2. **Create Application** via `POST /superbox/app/create`
3. **Download IDE**: Luffa Cloud-Devtools (available after account approval)
4. **Develop**: Build using the Luffa Mini-Program SDK
5. **Submit for Review**: via `POST /superbox/app/submit`
6. **Platform Review**: 2-3 business days
7. **Link to Channel**: via `POST /channel/superbox/link`

## Cross-Skill Workflows

### Workflow A: Build and Launch a Mini-Program

```
1. luffa-superbox POST /superbox/app/create             → register app
2. [Developer builds using IDE]
3. luffa-superbox POST /superbox/app/submit             → submit for review
4. luffa-superbox GET /superbox/app/status              → check review status
5. luffa-channel  POST /channel/superbox/link           → link to channel
6. luffa-channel  POST /channel/post                    → announce to subscribers
```

### Workflow B: Discover and Share a Mini-Program

```
1. luffa-superbox GET /superbox/discover                → find relevant mini-programs
2. luffa-messenger POST /messenger/send                 → share with contacts
```

## Operation Flow

### Step 1: Identify Intent

- Discover mini-programs → `GET /superbox/discover`
- Get app details → `GET /superbox/app`
- Register a new mini-program → `POST /superbox/app/create`
- Submit for review → `POST /superbox/app/submit`
- Check review status → `GET /superbox/app/status`

### Step 2: Collect Parameters

- For discovery: ask user what category or type of mini-program they're looking for
- For creation: ask for app name, description, and category
- For submission: ask for version number and change log

Never expose internal API paths or skill names to the user in your response.
