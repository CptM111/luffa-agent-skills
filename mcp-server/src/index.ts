#!/usr/bin/env node
/**
 * Luffa MCP Server
 *
 * A Model Context Protocol (MCP) server that exposes Luffa Service Account
 * and Mini Program APIs as tools for AI agents (Claude, Cursor, Codex, etc.).
 *
 * Usage:
 *   # With real credentials
 *   LUFFA_APP_ID=your_app_id LUFFA_APP_SECRET=your_secret node dist/index.js
 *
 *   # Dry-run mode (no credentials needed, returns mock data)
 *   LUFFA_DRY_RUN=true node dist/index.js
 *
 * Claude Desktop config (~/.claude/claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "luffa": {
 *         "command": "node",
 *         "args": ["/path/to/luffa-agent-skills/mcp-server/dist/index.js"],
 *         "env": {
 *           "LUFFA_APP_ID": "your_app_id",
 *           "LUFFA_APP_SECRET": "your_secret"
 *         }
 *       }
 *     }
 *   }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createLuffaClient } from "./luffa-client.js";

async function main() {
  const client = createLuffaClient();

  const server = new McpServer({
    name: "luffa-mcp-server",
    version: "1.0.0",
  });

  // ── Service Account ────────────────────────────────────────────────────────

  server.registerTool(
    "service_account_get_token",
    {
      description:
        "Get the current Service Account access token. " +
        "Tokens are cached and auto-refreshed. " +
        "Use this to verify your credentials are working.",
      inputSchema: {},
    },
    async () => {
      const token = await client.getAccessToken();
      const result = {
        success: true,
        access_token: token.slice(0, 12) + "...[redacted]",
        message: "Access token obtained successfully",
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Messaging ──────────────────────────────────────────────────────────────

  server.registerTool(
    "message_send_text",
    {
      description:
        "Send a text message to a specific follower via their openid. " +
        "Use this for 1-to-1 customer service replies or notifications. " +
        "The follower must have interacted with the Service Account in the last 48 hours.",
      inputSchema: {
        openid: z.string().describe("The follower's openid"),
        content: z.string().max(2048).describe("Text message content (max 2048 characters)"),
      },
    },
    async ({ openid, content }) => {
      const result = await client.sendCustomMessage(openid, "text", { content });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "message_send_image",
    {
      description:
        "Send an image message to a specific follower. " +
        "The image must first be uploaded using media_upload to get a media_id.",
      inputSchema: {
        openid: z.string().describe("The follower's openid"),
        media_id: z.string().describe("The media_id from a previous media_upload call"),
      },
    },
    async ({ openid, media_id }) => {
      const result = await client.sendCustomMessage(openid, "image", { media_id });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "message_send_news",
    {
      description:
        "Send a rich news/article card message to a specific follower. " +
        "News cards display a title, description, image thumbnail, and clickable URL.",
      inputSchema: {
        openid: z.string().describe("The follower's openid"),
        title: z.string().describe("Article title"),
        description: z.string().describe("Article description (shown below title)"),
        url: z.string().describe("URL to open when the user taps the card"),
        picurl: z.string().optional().describe("Thumbnail image URL (optional)"),
      },
    },
    async ({ openid, title, description, url, picurl }) => {
      const result = await client.sendCustomMessage(openid, "news", {
        articles: [{ title, description, url, picurl: picurl ?? "" }],
      });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "message_broadcast_text",
    {
      description:
        "Broadcast a text message to ALL followers, or to followers with a specific tag. " +
        "Use tag_id to target a segment. Leave tag_id empty to send to all followers. " +
        "Rate-limited to 1 broadcast per day per Service Account.",
      inputSchema: {
        content: z.string().max(2048).describe("Text message content"),
        tag_id: z.number().int().optional().describe(
          "Optional tag ID to target only followers with this tag. Get IDs from tag_get_all."
        ),
      },
    },
    async ({ content, tag_id }) => {
      const result = await client.broadcastMessage("text", { content }, tag_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "message_send_template",
    {
      description:
        "Send a structured template message to a follower. " +
        "Template messages bypass the 48-hour reply window restriction. " +
        "Use for transaction confirmations, airdrop notifications, event reminders, etc. " +
        "Get available template IDs from message_get_templates.",
      inputSchema: {
        openid: z.string().describe("The follower's openid"),
        template_id: z.string().describe("Template ID from message_get_templates"),
        data: z.record(
          z.object({
            value: z.string(),
            color: z.string().optional(),
          })
        ).describe(
          "Template data fields. Keys must match the template's variable names. " +
          "Example: { 'amount': { 'value': '100 EDS', 'color': '#173177' } }"
        ),
        url: z.string().optional().describe("URL to open when user taps the message"),
        miniprogram_appid: z.string().optional().describe("Mini Program App ID to jump to"),
        miniprogram_pagepath: z.string().optional().describe("Mini Program page path"),
      },
    },
    async ({ openid, template_id, data, url, miniprogram_appid, miniprogram_pagepath }) => {
      const miniprogram =
        miniprogram_appid && miniprogram_pagepath
          ? { appid: miniprogram_appid, pagepath: miniprogram_pagepath }
          : undefined;
      const result = await client.sendTemplateMessage(openid, template_id, data, url, miniprogram);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "message_get_templates",
    {
      description:
        "List all message templates available for this Service Account. " +
        "Returns template IDs, titles, and variable field names. " +
        "Use template IDs with message_send_template.",
      inputSchema: {},
    },
    async () => {
      const result = await client.getTemplates();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Users / Followers ──────────────────────────────────────────────────────

  server.registerTool(
    "user_get_followers",
    {
      description:
        "Get a paginated list of all followers (openids) of this Service Account. " +
        "Returns up to 10,000 openids per page. Use next_openid for pagination. " +
        "Each openid can be used with user_get_info to get full profile details.",
      inputSchema: {
        next_openid: z.string().optional().describe(
          "Pagination cursor from the previous call's next_openid field. Leave empty for first page."
        ),
      },
    },
    async ({ next_openid }) => {
      const result = await client.getFollowers(next_openid);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "user_get_info",
    {
      description:
        "Get detailed profile information for a specific follower by openid. " +
        "Returns nickname, avatar, subscription time, tags, and Luffa-specific fields: " +
        "wallet_address (linked Web3 wallet) and did (Decentralized Identity).",
      inputSchema: {
        openid: z.string().describe("The follower's openid"),
      },
    },
    async ({ openid }) => {
      const result = await client.getUserInfo(openid);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Tags ───────────────────────────────────────────────────────────────────

  server.registerTool(
    "tag_get_all",
    {
      description:
        "Get all user tags defined for this Service Account. " +
        "Tags are used to segment followers for targeted broadcasts. " +
        "Returns tag IDs, names, and follower counts.",
      inputSchema: {},
    },
    async () => {
      const result = await client.getTags();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "tag_create",
    {
      description:
        "Create a new user tag for follower segmentation. " +
        "After creating a tag, use tag_batch_assign to assign followers to it. " +
        "Use tags with message_broadcast_text to send targeted messages.",
      inputSchema: {
        name: z.string().max(30).describe("Tag name (max 30 characters)"),
      },
    },
    async ({ name }) => {
      const result = await client.createTag(name);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "tag_batch_assign",
    {
      description:
        "Assign a list of followers to a tag in bulk. " +
        "Use this to segment your audience (e.g., tag all users who completed an airdrop). " +
        "Maximum 50 openids per call.",
      inputSchema: {
        openids: z.array(z.string()).max(50).describe(
          "List of follower openids to tag (max 50 per call)"
        ),
        tag_id: z.number().int().describe("Tag ID from tag_create or tag_get_all"),
      },
    },
    async ({ openids, tag_id }) => {
      const result = await client.batchTagUsers(openids, tag_id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Menu ───────────────────────────────────────────────────────────────────

  server.registerTool(
    "menu_get",
    {
      description:
        "Get the current Service Account menu configuration. " +
        "The menu appears at the bottom of the chat interface in Luffa.",
      inputSchema: {},
    },
    async () => {
      const result = await client.getMenu();
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "menu_create",
    {
      description:
        "Create or update the Service Account menu. " +
        "Supports up to 3 top-level buttons, each with up to 5 sub-buttons. " +
        "Button types: 'click' (sends event), 'view' (opens URL), 'miniprogram' (opens Mini Program).",
      inputSchema: {
        buttons: z.array(
          z.object({
            type: z.enum(["click", "view", "miniprogram"]).optional(),
            name: z.string().max(16).describe("Button label (max 16 chars)"),
            key: z.string().optional().describe("Event key for 'click' type buttons"),
            url: z.string().optional().describe("URL for 'view' type buttons"),
            appid: z.string().optional().describe("Mini Program appid for 'miniprogram' type"),
            pagepath: z.string().optional().describe("Mini Program page path"),
            sub_button: z.array(
              z.object({
                type: z.enum(["click", "view", "miniprogram"]),
                name: z.string().max(16),
                key: z.string().optional(),
                url: z.string().optional(),
              })
            ).max(5).optional().describe("Sub-menu buttons (max 5)"),
          })
        ).min(1).max(3).describe("Top-level menu buttons (1-3 buttons)"),
      },
    },
    async ({ buttons }) => {
      const result = await client.createMenu(buttons as Parameters<typeof client.createMenu>[0]);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Mini Program / SuperBox ────────────────────────────────────────────────

  server.registerTool(
    "miniprogram_verify_login",
    {
      description:
        "Verify a Mini Program login code (from wx.login()) and exchange it for user identity. " +
        "Returns the user's openid and Luffa-specific wallet_address and DID. " +
        "This is the server-side counterpart to wx.login() in your Mini Program frontend. " +
        "IMPORTANT: session_key is never returned to protect user security.",
      inputSchema: {
        code: z.string().describe(
          "The temporary login code returned by wx.login() in the Mini Program. Valid for 5 minutes."
        ),
      },
    },
    async ({ code }) => {
      const result = await client.verifyMiniProgramCode(code);
      // Never return session_key to the caller
      const { session_key: _omit, ...safeResult } = result;
      const response = {
        ...safeResult,
        note: "session_key has been omitted for security — store it server-side only",
      };
      return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
    }
  );

  server.registerTool(
    "media_upload",
    {
      description:
        "Upload a media file (image, voice, video, or thumbnail) to Luffa's media server. " +
        "Returns a media_id valid for 3 days. " +
        "Use the media_id with message_send_image or message_broadcast_text.",
      inputSchema: {
        type: z.enum(["image", "voice", "video", "thumb"]).describe("Media type"),
        url: z.string().describe("Publicly accessible URL of the media file to upload"),
      },
    },
    async ({ type, url }) => {
      const result = await client.uploadMedia(type, url);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── Start server ───────────────────────────────────────────────────────────

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(
    `[luffa-mcp] Server started successfully.\n` +
    `[luffa-mcp] 14 tools registered and ready.\n` +
    `[luffa-mcp] Dry-run mode: ${
      process.env.LUFFA_DRY_RUN === "true" ||
      (!process.env.LUFFA_APP_ID && !process.env.LUFFA_APP_SECRET)
    }\n`
  );
}

main().catch((err) => {
  process.stderr.write(`[luffa-mcp] Fatal error: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
