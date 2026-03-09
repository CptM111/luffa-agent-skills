/**
 * Luffa MCP Tool Definitions
 *
 * Each tool maps directly to a real Luffa Service Account API endpoint.
 * Tools are organized into logical groups:
 *   - service_account_*  : Service Account management
 *   - message_*          : Messaging (custom, broadcast, template)
 *   - user_*             : Follower/user management
 *   - tag_*              : User segmentation via tags
 *   - menu_*             : Service Account menu management
 *   - miniprogram_*      : Mini Program (SuperBox) integration
 */

import { z } from "zod";
import { LuffaClient } from "./luffa-client.js";

// ─── Tool registry type ────────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (client: LuffaClient, args: unknown) => Promise<unknown>;
}

// ─── Tool definitions ──────────────────────────────────────────────────────────

export const tools: ToolDefinition[] = [

  // ── Service Account ──────────────────────────────────────────────────────

  {
    name: "service_account_get_token",
    description:
      "Get the current Service Account access token. " +
      "Tokens are cached and auto-refreshed. " +
      "Use this to verify your credentials are working.",
    inputSchema: z.object({}),
    handler: async (client) => {
      const token = await client.getAccessToken();
      return {
        success: true,
        access_token: token.slice(0, 12) + "...[redacted]",
        message: "Access token obtained successfully",
      };
    },
  },

  // ── Messaging ────────────────────────────────────────────────────────────

  {
    name: "message_send_text",
    description:
      "Send a text message to a specific follower via their openid. " +
      "Use this for 1-to-1 customer service replies or notifications. " +
      "The follower must have interacted with the Service Account in the last 48 hours.",
    inputSchema: z.object({
      openid: z.string().describe("The follower's openid (from user_get_followers or user_get_info)"),
      content: z.string().max(2048).describe("Text message content (max 2048 characters)"),
    }),
    handler: async (client, args) => {
      const { openid, content } = args as { openid: string; content: string };
      return client.sendCustomMessage(openid, "text", { content });
    },
  },

  {
    name: "message_send_image",
    description:
      "Send an image message to a specific follower via their openid. " +
      "The image must first be uploaded using media_upload to get a media_id.",
    inputSchema: z.object({
      openid: z.string().describe("The follower's openid"),
      media_id: z.string().describe("The media_id from a previous media_upload call"),
    }),
    handler: async (client, args) => {
      const { openid, media_id } = args as { openid: string; media_id: string };
      return client.sendCustomMessage(openid, "image", { media_id });
    },
  },

  {
    name: "message_send_news",
    description:
      "Send a rich news/article card message to a specific follower. " +
      "News cards display a title, description, image thumbnail, and clickable URL.",
    inputSchema: z.object({
      openid: z.string().describe("The follower's openid"),
      title: z.string().describe("Article title"),
      description: z.string().describe("Article description (shown below title)"),
      url: z.string().url().describe("URL to open when the user taps the card"),
      picurl: z.string().url().optional().describe("Thumbnail image URL (optional)"),
    }),
    handler: async (client, args) => {
      const { openid, title, description, url, picurl } = args as {
        openid: string;
        title: string;
        description: string;
        url: string;
        picurl?: string;
      };
      return client.sendCustomMessage(openid, "news", {
        articles: [{ title, description, url, picurl: picurl ?? "" }],
      });
    },
  },

  {
    name: "message_broadcast_text",
    description:
      "Broadcast a text message to ALL followers, or to followers with a specific tag. " +
      "Use tag_id to target a segment. Leave tag_id empty to send to all followers. " +
      "Note: broadcasts are rate-limited to 1 per day per Service Account.",
    inputSchema: z.object({
      content: z.string().max(2048).describe("Text message content"),
      tag_id: z.number().int().optional().describe(
        "Optional tag ID to target only followers with this tag. " +
        "Get tag IDs from tag_get_all."
      ),
    }),
    handler: async (client, args) => {
      const { content, tag_id } = args as { content: string; tag_id?: number };
      return client.broadcastMessage("text", { content }, tag_id);
    },
  },

  {
    name: "message_send_template",
    description:
      "Send a structured template message to a follower. " +
      "Template messages bypass the 48-hour reply window restriction. " +
      "Use for transaction confirmations, airdrop notifications, event reminders, etc. " +
      "Get available template IDs from message_get_templates.",
    inputSchema: z.object({
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
      url: z.string().url().optional().describe("URL to open when user taps the message"),
      miniprogram_appid: z.string().optional().describe("Mini Program App ID to jump to"),
      miniprogram_pagepath: z.string().optional().describe("Mini Program page path"),
    }),
    handler: async (client, args) => {
      const { openid, template_id, data, url, miniprogram_appid, miniprogram_pagepath } = args as {
        openid: string;
        template_id: string;
        data: Record<string, { value: string; color?: string }>;
        url?: string;
        miniprogram_appid?: string;
        miniprogram_pagepath?: string;
      };
      const miniprogram =
        miniprogram_appid && miniprogram_pagepath
          ? { appid: miniprogram_appid, pagepath: miniprogram_pagepath }
          : undefined;
      return client.sendTemplateMessage(openid, template_id, data, url, miniprogram);
    },
  },

  {
    name: "message_get_templates",
    description:
      "List all message templates available for this Service Account. " +
      "Returns template IDs, titles, and variable field names. " +
      "Use template IDs with message_send_template.",
    inputSchema: z.object({}),
    handler: async (client) => {
      return client.getTemplates();
    },
  },

  // ── Users / Followers ─────────────────────────────────────────────────────

  {
    name: "user_get_followers",
    description:
      "Get a paginated list of all followers (openids) of this Service Account. " +
      "Returns up to 10,000 openids per page. Use next_openid for pagination. " +
      "Each openid can be used with user_get_info to get full profile details.",
    inputSchema: z.object({
      next_openid: z.string().optional().describe(
        "Pagination cursor from the previous call's next_openid field. " +
        "Leave empty for the first page."
      ),
    }),
    handler: async (client, args) => {
      const { next_openid } = args as { next_openid?: string };
      return client.getFollowers(next_openid);
    },
  },

  {
    name: "user_get_info",
    description:
      "Get detailed profile information for a specific follower by openid. " +
      "Returns nickname, avatar, subscription time, tags, and Luffa-specific fields: " +
      "wallet_address (linked Web3 wallet) and did (Decentralized Identity).",
    inputSchema: z.object({
      openid: z.string().describe("The follower's openid"),
    }),
    handler: async (client, args) => {
      const { openid } = args as { openid: string };
      return client.getUserInfo(openid);
    },
  },

  // ── Tags ──────────────────────────────────────────────────────────────────

  {
    name: "tag_get_all",
    description:
      "Get all user tags defined for this Service Account. " +
      "Tags are used to segment followers for targeted broadcasts. " +
      "Returns tag IDs, names, and follower counts.",
    inputSchema: z.object({}),
    handler: async (client) => {
      return client.getTags();
    },
  },

  {
    name: "tag_create",
    description:
      "Create a new user tag for follower segmentation. " +
      "After creating a tag, use tag_batch_assign to assign followers to it. " +
      "Use tags with message_broadcast_text to send targeted messages.",
    inputSchema: z.object({
      name: z.string().max(30).describe("Tag name (max 30 characters)"),
    }),
    handler: async (client, args) => {
      const { name } = args as { name: string };
      return client.createTag(name);
    },
  },

  {
    name: "tag_batch_assign",
    description:
      "Assign a list of followers to a tag in bulk. " +
      "Use this to segment your audience (e.g., tag all users who completed an airdrop). " +
      "Maximum 50 openids per call.",
    inputSchema: z.object({
      openids: z.array(z.string()).max(50).describe(
        "List of follower openids to tag (max 50 per call)"
      ),
      tag_id: z.number().int().describe("Tag ID from tag_create or tag_get_all"),
    }),
    handler: async (client, args) => {
      const { openids, tag_id } = args as { openids: string[]; tag_id: number };
      return client.batchTagUsers(openids, tag_id);
    },
  },

  // ── Menu ──────────────────────────────────────────────────────────────────

  {
    name: "menu_get",
    description:
      "Get the current Service Account menu configuration. " +
      "The menu appears at the bottom of the chat interface in Luffa.",
    inputSchema: z.object({}),
    handler: async (client) => {
      return client.getMenu();
    },
  },

  {
    name: "menu_create",
    description:
      "Create or update the Service Account menu. " +
      "Supports up to 3 top-level buttons, each with up to 5 sub-buttons. " +
      "Button types: 'click' (sends event), 'view' (opens URL), 'miniprogram' (opens Mini Program).",
    inputSchema: z.object({
      buttons: z.array(
        z.object({
          type: z.enum(["click", "view", "miniprogram"]).optional(),
          name: z.string().max(16).describe("Button label (max 16 chars)"),
          key: z.string().optional().describe("Event key for 'click' type buttons"),
          url: z.string().url().optional().describe("URL for 'view' type buttons"),
          appid: z.string().optional().describe("Mini Program appid for 'miniprogram' type"),
          pagepath: z.string().optional().describe("Mini Program page path"),
          sub_button: z.array(
            z.object({
              type: z.enum(["click", "view", "miniprogram"]),
              name: z.string().max(16),
              key: z.string().optional(),
              url: z.string().url().optional(),
            })
          ).max(5).optional().describe("Sub-menu buttons (max 5)"),
        })
      ).min(1).max(3).describe("Top-level menu buttons (1-3 buttons)"),
    }),
    handler: async (client, args) => {
      const { buttons } = args as { buttons: Array<Record<string, unknown>> };
      return client.createMenu(buttons as Parameters<typeof client.createMenu>[0]);
    },
  },

  // ── Mini Program / SuperBox ───────────────────────────────────────────────

  {
    name: "miniprogram_verify_login",
    description:
      "Verify a Mini Program login code (from wx.login()) and exchange it for user identity. " +
      "Returns the user's openid, session_key, and Luffa-specific wallet_address and DID. " +
      "This is the server-side counterpart to wx.login() in your Mini Program frontend. " +
      "IMPORTANT: Never expose session_key to the client.",
    inputSchema: z.object({
      code: z.string().describe(
        "The temporary login code returned by wx.login() in the Mini Program. " +
        "Valid for 5 minutes."
      ),
    }),
    handler: async (client, args) => {
      const { code } = args as { code: string };
      const result = await client.verifyMiniProgramCode(code);
      // Never return session_key to the caller — it must stay server-side
      const { session_key: _omit, ...safeResult } = result;
      return {
        ...safeResult,
        note: "session_key has been omitted for security — store it server-side only",
      };
    },
  },

  {
    name: "media_upload",
    description:
      "Upload a media file (image, voice, video, or thumbnail) to Luffa's media server. " +
      "Returns a media_id valid for 3 days. " +
      "Use the media_id with message_send_image or message_broadcast_text.",
    inputSchema: z.object({
      type: z.enum(["image", "voice", "video", "thumb"]).describe("Media type"),
      url: z.string().url().describe("Publicly accessible URL of the media file to upload"),
    }),
    handler: async (client, args) => {
      const { type, url } = args as { type: "image" | "voice" | "video" | "thumb"; url: string };
      return client.uploadMedia(type, url);
    },
  },
];

// ─── Tool lookup map ───────────────────────────────────────────────────────────

export const toolMap = new Map<string, ToolDefinition>(
  tools.map((t) => [t.name, t])
);
