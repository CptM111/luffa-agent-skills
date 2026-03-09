# Luffa Agent Skills

**Build AI-powered bots and agents for the Luffa ecosystem.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub repo stars](https://img.shields.io/github/stars/CptM111/luffa-agent-skills?style=social)](https://github.com/CptM111/luffa-agent-skills)

This repository provides a production-ready, runnable **MCP Server** that exposes Luffa's Service Account APIs as tools for AI agents. It enables developers to build AI-driven workflows for customer service, community management, airdrop distribution, and more, right inside Luffa.

Unlike the previous mock-based version, this is a **real, working implementation**. Just add your Luffa App ID and Secret, and you can start building.

## Core Problem Solved

AI agents are powerful, but they need tools (`skills`) to interact with the outside world. This project gives agents the tools to interact with the Luffa platform, turning abstract instructions into concrete actions like sending messages, managing users, and verifying wallet information.

It bridges the gap between Large Language Models and the Luffa API, enabling true **Agentic Economy** infrastructure.

## Key Features

- **Production-Ready MCP Server**: A runnable Node.js server built with the official `@modelcontextprotocol/sdk`.
- **Real API Integration**: Implements the actual Luffa Service Account API, including authentication, message sending, user management, and more.
- **Dry-Run Mode**: Test and develop without real credentials. The server returns realistic mock data for all endpoints.
- **Self-Verifying**: Includes a built-in integration test suite (`npm test`) that verifies all tools in dry-run mode.
- **AI Agent Compatible**: Designed for use with any MCP-compatible agent, including Claude, Cursor, and custom agent frameworks.
- **Comprehensive Skills**: Provides a `luffa-service-account` skill that covers the full lifecycle of managing a Luffa presence.

## Getting Started

### 1. Prerequisites

- Node.js v18+
- A Luffa Service Account. [Register here](https://super.luffa.im) to get your **App ID** and **App Secret**.

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/CptM111/luffa-agent-skills.git
cd luffa-agent-skills/mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

### 3. Running the Server

You can run the server in two modes:

**A) Live Mode (with real credentials)**

```bash
# Set your credentials as environment variables
export LUFFA_APP_ID="your_app_id_here"
export LUFFA_APP_SECRET="your_app_secret_here"

# Start the server
node dist/index.js
```

**B) Dry-Run Mode (for testing, no credentials needed)**

```bash
# The server automatically uses dry-run mode if credentials are not found
node dist/index.js
```

### 4. Self-Verification

Run the integration tests to ensure everything is working correctly.

```bash
# This will run all 19 tests against the mock server
npm test
```

You should see all tests passing:

```
✅ All tests passed! The Luffa MCP server is ready.
```

### 5. Connecting to an AI Agent (Example: Claude Desktop)

1.  Open your Claude Desktop configuration file (`~/.claude/claude_desktop_config.json`).
2.  Add the `luffa` server to your `mcpServers` list:

    ```json
    {
      "mcpServers": {
        "luffa": {
          "command": "node",
          "args": ["/path/to/your/luffa-agent-skills/mcp-server/dist/index.js"],
          "env": {
            "LUFFA_APP_ID": "your_app_id",
            "LUFFA_APP_SECRET": "your_app_secret"
          }
        }
      }
    }
    ```

3.  Restart Claude. You can now use prompts like:

    > "@luffa Send a welcome message to my new follower with openid `user_openid_123`"

    > "@luffa How many followers do I have? List their openids."

    > "@luffa Create a new menu with a button that links to our website."

## Available Skills & Tools

This repository now focuses on a single, powerful, and realistic skill:

### `luffa-service-account`

Provides 14 tools for managing your Luffa Service Account. See the [SKILL.md](./skills/luffa-service-account/SKILL.md) for a full list of tools and example workflows.

| Category | Tools |
|---|---|
| **Authentication** | `service_account_get_token` |
| **Messaging** | `message_send_text`, `message_send_image`, `message_send_news`, `message_broadcast_text`, `message_send_template`, `message_get_templates` |
| **User Management** | `user_get_followers`, `user_get_info` |
| **Segmentation** | `tag_get_all`, `tag_create`, `tag_batch_assign` |
| **Menu** | `menu_get`, `menu_create` |
| **Mini Program** | `miniprogram_verify_login` |
| **Media** | `media_upload` |

## From Mock to Real: The Architectural Shift

The previous version of this repository used multiple, disparate `SKILL.md` files with mocked API endpoints. This was useful for design but not for real-world use.

This version makes a critical architectural shift:

1.  **Centralized Logic**: All API interaction logic is centralized in the `mcp-server`. The `SKILL.md` files now act as pure documentation, describing the tools that the server exposes.
2.  **Real Implementation**: The server uses `axios` to make real HTTP requests to the Luffa API, handling authentication and request signing.
3.  **Runnable & Testable**: The project is now a standard Node.js application that can be installed, built, and tested, providing a robust foundation for developers.

This approach ensures that what you build and test locally is exactly what will run in production when called by an AI agent.
