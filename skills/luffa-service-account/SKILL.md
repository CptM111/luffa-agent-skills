# Luffa Service Account Skill

This skill provides AI agents with the ability to manage and interact with a Luffa Service Account. It allows agents to perform actions such as sending messages, managing followers, creating menus, and interacting with connected Mini Programs.

This skill is a client for the `luffa-mcp-server`, which must be running and configured with valid Luffa Service Account credentials (App ID and App Secret).

## Core Concepts

- **Service Account**: A brand or developer account on the Luffa platform, similar to a WeChat Official Account. It can have followers, send broadcast messages, and provide customer service.
- **Followers**: Luffa users who have subscribed to the Service Account.
- **OpenID**: A unique identifier for a follower within a specific Service Account.
- **Template Messages**: Structured messages that can be sent to followers for specific events (e.g., transaction confirmations, reminders), bypassing the 48-hour reply window.
- **Menu**: A persistent menu at the bottom of the chat interface, providing quick access to key features or links.
- **Mini Program (SuperBox)**: A lightweight app that runs within the Luffa ecosystem. Service Accounts can be linked to Mini Programs.

## Authentication

All actions require a running `luffa-mcp-server` configured with a valid Luffa App ID and App Secret. The server handles the `access_token` lifecycle automatically.

## Available Tools

This skill provides access to the following tools via the `luffa` MCP server.

### Service Account Management

- **`service_account_get_token`**: Verifies credentials by fetching the access token.

### Messaging

- **`message_send_text`**: Send a 1-to-1 text message to a follower.
- **`message_send_image`**: Send a 1-to-1 image message to a follower.
- **`message_send_news`**: Send a rich news/article card to a follower.
- **`message_broadcast_text`**: Broadcast a text message to all followers or a tagged segment.
- **`message_send_template`**: Send a structured template message.
- **`message_get_templates`**: List all available message templates.

### User & Follower Management

- **`user_get_followers`**: Get a list of all follower OpenIDs.
- **`user_get_info`**: Get detailed profile information for a follower, including their linked Web3 wallet address and DID.

### Tagging & Segmentation

- **`tag_get_all`**: Get all user tags.
- **`tag_create`**: Create a new user tag.
- **`tag_batch_assign`**: Assign a tag to a list of followers.

### Menu Management

- **`menu_get`**: Get the current Service Account menu configuration.
- **`menu_create`**: Create or update the menu.

### Mini Program (SuperBox) Integration

- **`miniprogram_verify_login`**: Exchange a `wx.login()` code from a Mini Program for a user's OpenID and identity information.

### Media

- **`media_upload`**: Upload an image, video, or other media file to get a `media_id` for use in messages.

## Example Workflow: Airdrop Notification

This workflow demonstrates how an agent can use multiple tools to perform a complex task: notifying a specific user segment about a successful airdrop.

1.  **Identify Target Users**: The agent has a list of wallet addresses that received the airdrop.
2.  **Find Followers**: The agent paginates through all followers using `user_get_followers`.
3.  **Match Wallets**: For each follower, the agent calls `user_get_info` to retrieve their `wallet_address`.
4.  **Create Tag**: If a follower's wallet is on the airdrop list, the agent creates a new tag called "Airdrop Recipients Q2" using `tag_create`.
5.  **Assign Tag**: The agent adds the matched followers to the new tag using `tag_batch_assign`.
6.  **Send Template Message**: The agent finds a suitable "Transaction Notification" template with `message_get_templates`.
7.  **Notify Users**: The agent iterates through the tagged users and sends a personalized template message via `message_send_template`, filling in the transaction details.

```
# Step 1: Get all followers
manus-mcp-cli tool call user_get_followers --server luffa

# Step 2: Get info for a specific follower
manus-mcp-cli tool call user_get_info --server luffa --input '{"openid": "mock_openid_001"}'

# Step 3: Create a tag for the airdrop recipients
manus-mcp-cli tool call tag_create --server luffa --input '{"name": "Airdrop Recipients Q2"}'

# Step 4: Assign the tag to the matched users
manus-mcp-cli tool call tag_batch_assign --server luffa --input '{"openids": ["mock_openid_001"], "tag_id": 102}'

# Step 5: Send a template message notification
manus-mcp-cli tool call message_send_template --server luffa --input '{
  "openid": "mock_openid_001",
  "template_id": "mock_tmpl_001",
  "data": {
    "header": { "value": "Airdrop Received!", "color": "#00FF00" },
    "amount": { "value": "1,000 LUFFA", "color": "#173177" },
    "remark": { "value": "Thank you for being a valued community member." }
  }
}'
```
