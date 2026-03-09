# Luffa Messenger Skill

This skill provides AI agents with the ability to send and manage messages through a Luffa Service Account. It is a client for the `luffa-mcp-server`.

## Core Concepts

- **Service Account Messaging**: All messages are sent *from* the Service Account *to* its followers.
- **48-Hour Window**: You can only send free-form messages (text, images, news) to a follower if they have interacted with your Service Account in the last 48 hours.
- **Template Messages**: To message a user outside the 48-hour window, you must use a pre-approved template message. These are for transactional notifications (e.g., payment confirmation, shipping update).
- **Broadcasts**: You can send a message to all followers (or a tagged segment) at once. This is rate-limited.

## Available Tools

These tools are available via the `luffa` MCP server.

### 1-to-1 Messaging (within 48 hours)

- **`message_send_text`**: Send a plain text message to a follower.
- **`message_send_image`**: Send an image to a follower.
- **`message_send_news`**: Send a clickable news card to a follower.

### Broadcast Messaging

- **`message_broadcast_text`**: Send a text message to all followers or a specific segment based on a tag.

### Template Messaging (outside 48 hours)

- **`message_send_template`**: Send a structured template message for notifications.
- **`message_get_templates`**: List all available templates for your account.

## Example Workflow: Customer Support

1.  **Webhook Received**: A user sends a message "I have a problem with my order" to the Service Account. Luffa sends a webhook to your server.
2.  **Agent Triggered**: The webhook handler triggers an AI agent, providing the user's `openid` and the message content.
3.  **Agent Analyzes**: The agent understands the user's intent.
4.  **Agent Responds**: The agent calls `message_send_text` to reply to the user: "I understand you have an issue with your order. Can you please provide the order ID?"
5.  **User Replies**: The user sends the order ID.
6.  **Agent Acts**: The agent uses another tool (e.g., a Shopify skill) to look up the order status.
7.  **Agent Resolves**: The agent finds the order is delayed and sends a final message using `message_send_text`: "I found your order. It appears to be delayed by one day. We apologize for the inconvenience and have credited your account with 100 Luffa points."

```
# Step 4: Agent sends an initial reply
manus-mcp-cli tool call message_send_text --server luffa --input \
  '{
    "openid": "user_openid_from_webhook",
    "content": "I understand you have an issue with your order. Can you please provide the order ID?"
  }'

# Step 7: Agent sends a resolution message
manus-mcp-cli tool call message_send_text --server luffa --input \
  '{
    "openid": "user_openid_from_webhook",
    "content": "I found your order. It appears to be delayed by one day. We apologize for the inconvenience and have credited your account with 100 Luffa points."
  }'
```
