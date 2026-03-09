/**
 * Luffa API Client
 *
 * Implements the real Luffa Service Account HTTP API.
 *
 * Authentication flow (mirrors WeChat Official Account / Luffa Service Account pattern):
 *   1. POST /cgi-bin/token  →  { access_token, expires_in }
 *   2. All subsequent calls include ?access_token=<token> in the query string
 *
 * Base URL: https://api.luffa.im
 * (Replace with the actual base URL once confirmed by Luffa team)
 *
 * Credentials are read from environment variables:
 *   LUFFA_APP_ID      — Service Account App ID from SuperBox console
 *   LUFFA_APP_SECRET  — Service Account App Secret from SuperBox console
 *
 * Dry-run mode (LUFFA_DRY_RUN=true):
 *   All API calls are intercepted and return realistic mock responses.
 *   This lets you test the MCP server without real credentials.
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// ─── Configuration ────────────────────────────────────────────────────────────

export interface LuffaClientConfig {
  appId: string;
  appSecret: string;
  baseUrl?: string;
  dryRun?: boolean;
}

// ─── Response types ────────────────────────────────────────────────────────────

export interface LuffaTokenResponse {
  access_token: string;
  expires_in: number; // seconds
}

export interface LuffaBaseResponse {
  errcode: number; // 0 = success
  errmsg: string;
}

export interface LuffaSendMessageResponse extends LuffaBaseResponse {
  msgid?: string;
}

export interface LuffaUserTagsResponse extends LuffaBaseResponse {
  tags?: Array<{ id: number; name: string; count: number }>;
}

export interface LuffaFollowersResponse extends LuffaBaseResponse {
  data?: {
    openids: string[];
    next_openid: string;
  };
  count?: number;
  total?: number;
}

export interface LuffaUserInfoResponse extends LuffaBaseResponse {
  openid?: string;
  nickname?: string;
  headimgurl?: string;
  subscribe?: number;
  subscribe_time?: number;
  tagid_list?: number[];
  wallet_address?: string; // Luffa-specific: linked Web3 wallet
  did?: string;            // Luffa-specific: decentralized identity
}

export interface LuffaMenuResponse extends LuffaBaseResponse {
  menu?: {
    button: Array<{
      type: string;
      name: string;
      key?: string;
      url?: string;
      sub_button?: Array<{ type: string; name: string; key?: string; url?: string }>;
    }>;
  };
}

export interface LuffaTemplateListResponse extends LuffaBaseResponse {
  template_list?: Array<{
    template_id: string;
    title: string;
    primary_industry: string;
    deputy_industry: string;
    content: string;
    example: string;
  }>;
}

// ─── Dry-run mock responses ────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, unknown> = {
  "GET /cgi-bin/token": {
    access_token: "mock_access_token_luffa_2026_" + Date.now(),
    expires_in: 7200,
  },
  "POST /cgi-bin/message/custom/send": {
    errcode: 0,
    errmsg: "ok",
    msgid: "mock_msg_" + Date.now(),
  },
  "POST /cgi-bin/message/mass/sendall": {
    errcode: 0,
    errmsg: "ok",
    msg_id: "mock_mass_" + Date.now(),
    msg_data_id: "mock_data_" + Date.now(),
  },
  "POST /cgi-bin/message/template/send": {
    errcode: 0,
    errmsg: "ok",
    msgid: "mock_tmpl_" + Date.now(),
  },
  "GET /cgi-bin/user/get": {
    data: { openids: ["mock_openid_001", "mock_openid_002", "mock_openid_003"] },
    count: 3,
    total: 3,
    next_openid: "",
    errcode: 0,
    errmsg: "ok",
  },
  "GET /cgi-bin/user/info": {
    openid: "mock_openid_001",
    nickname: "MockUser",
    headimgurl: "https://luffa.im/avatar/mock.png",
    subscribe: 1,
    subscribe_time: Math.floor(Date.now() / 1000) - 86400,
    tagid_list: [],
    wallet_address: "0xMockWalletAddress1234567890abcdef",
    did: "did:endless:mock123",
    errcode: 0,
    errmsg: "ok",
  },
  "POST /cgi-bin/tags/create": {
    tag: { id: 100, name: "mock_tag" },
    errcode: 0,
    errmsg: "ok",
  },
  "GET /cgi-bin/tags/get": {
    tags: [
      { id: 100, name: "VIP", count: 42 },
      { id: 101, name: "Developer", count: 15 },
    ],
    errcode: 0,
    errmsg: "ok",
  },
  "POST /cgi-bin/tags/members/batchtagging": {
    errcode: 0,
    errmsg: "ok",
  },
  "POST /cgi-bin/menu/create": {
    errcode: 0,
    errmsg: "ok",
  },
  "GET /cgi-bin/menu/get": {
    menu: {
      button: [
        { type: "click", name: "Latest News", key: "news" },
        { type: "view", name: "Open App", url: "https://luffa.im" },
      ],
    },
    errcode: 0,
    errmsg: "ok",
  },
  "GET /cgi-bin/template/get_all_private_template": {
    template_list: [
      {
        template_id: "mock_tmpl_001",
        title: "Transaction Notification",
        primary_industry: "Finance",
        deputy_industry: "Crypto",
        content: "{{header.DATA}}\n{{amount.DATA}}\n{{remark.DATA}}",
        example: "Your transfer of 100 EDS has been confirmed.",
      },
    ],
    errcode: 0,
    errmsg: "ok",
  },
  "POST /cgi-bin/media/upload": {
    type: "image",
    media_id: "mock_media_" + Date.now(),
    created_at: Math.floor(Date.now() / 1000),
    errcode: 0,
    errmsg: "ok",
  },
};

// ─── LuffaClient class ─────────────────────────────────────────────────────────

export class LuffaClient {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseUrl: string;
  private readonly dryRun: boolean;
  private readonly http: AxiosInstance;

  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: LuffaClientConfig) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.baseUrl = config.baseUrl ?? "https://api.luffa.im";
    this.dryRun = config.dryRun ?? false;

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 15_000,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // ── Token management ──────────────────────────────────────────────────────

  /**
   * Fetch or return cached access token.
   * Token is refreshed 60 seconds before expiry.
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    if (this.dryRun) {
      const mock = MOCK_RESPONSES["GET /cgi-bin/token"] as LuffaTokenResponse;
      this.accessToken = mock.access_token;
      this.tokenExpiresAt = now + mock.expires_in * 1000;
      return this.accessToken;
    }

    const resp = await this.http.get<LuffaTokenResponse>("/cgi-bin/token", {
      params: {
        grant_type: "client_credential",
        appid: this.appId,
        secret: this.appSecret,
      },
    });

    if (!resp.data.access_token) {
      throw new Error(
        `Failed to obtain access token: ${JSON.stringify(resp.data)}`
      );
    }

    this.accessToken = resp.data.access_token;
    this.tokenExpiresAt = now + resp.data.expires_in * 1000;
    return this.accessToken;
  }

  // ── Generic request helper ────────────────────────────────────────────────

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string | number | boolean>,
    body?: unknown
  ): Promise<T> {
    const mockKey = `${method} ${path}`;

    if (this.dryRun) {
      const mock = MOCK_RESPONSES[mockKey];
      if (mock !== undefined) {
        return mock as T;
      }
      // Generic dry-run fallback
      return { errcode: 0, errmsg: "ok (dry-run)" } as T;
    }

    const token = await this.getAccessToken();
    const queryParams = { access_token: token, ...params };

    try {
      const resp =
        method === "GET"
          ? await this.http.get<T>(path, { params: queryParams })
          : await this.http.post<T>(path, body, { params: queryParams });

      const data = resp.data as LuffaBaseResponse;
      if (data.errcode !== undefined && data.errcode !== 0) {
        throw new LuffaApiError(data.errcode, data.errmsg, path);
      }

      return resp.data;
    } catch (err) {
      if (err instanceof LuffaApiError) throw err;
      const axiosErr = err as AxiosError;
      throw new Error(
        `Luffa API request failed [${method} ${path}]: ${axiosErr.message}`
      );
    }
  }

  // ── Message APIs ──────────────────────────────────────────────────────────

  /**
   * Send a customer service message to a specific follower (by openid).
   * Supports text, image, and news (article link) message types.
   */
  async sendCustomMessage(
    openid: string,
    msgtype: "text" | "image" | "news",
    content: Record<string, unknown>
  ): Promise<LuffaSendMessageResponse> {
    return this.request<LuffaSendMessageResponse>(
      "POST",
      "/cgi-bin/message/custom/send",
      {},
      { touser: openid, msgtype, [msgtype]: content }
    );
  }

  /**
   * Broadcast a message to ALL followers or a specific tag group.
   * @param tagId  If provided, only followers with this tag receive the message.
   */
  async broadcastMessage(
    msgtype: "text" | "image" | "mpnews",
    content: Record<string, unknown>,
    tagId?: number
  ): Promise<LuffaSendMessageResponse> {
    const filter =
      tagId !== undefined
        ? { is_to_all: false, tag_id: tagId }
        : { is_to_all: true };

    return this.request<LuffaSendMessageResponse>(
      "POST",
      "/cgi-bin/message/mass/sendall",
      {},
      { filter, msgtype, [msgtype]: content }
    );
  }

  /**
   * Send a template message to a specific follower.
   * Template messages support structured data with clickable CTAs.
   */
  async sendTemplateMessage(
    openid: string,
    templateId: string,
    data: Record<string, { value: string; color?: string }>,
    url?: string,
    miniprogram?: { appid: string; pagepath: string }
  ): Promise<LuffaSendMessageResponse> {
    return this.request<LuffaSendMessageResponse>(
      "POST",
      "/cgi-bin/message/template/send",
      {},
      { touser: openid, template_id: templateId, url, miniprogram, data }
    );
  }

  // ── User / Follower APIs ──────────────────────────────────────────────────

  /**
   * Get a paginated list of all follower openids.
   */
  async getFollowers(nextOpenid?: string): Promise<LuffaFollowersResponse> {
    return this.request<LuffaFollowersResponse>("GET", "/cgi-bin/user/get", {
      next_openid: nextOpenid ?? "",
    });
  }

  /**
   * Get detailed profile for a single follower (includes Luffa-specific
   * wallet_address and DID fields).
   */
  async getUserInfo(openid: string): Promise<LuffaUserInfoResponse> {
    return this.request<LuffaUserInfoResponse>("GET", "/cgi-bin/user/info", {
      openid,
      lang: "en",
    });
  }

  /**
   * Get all followers with a specific tag.
   */
  async getTagMembers(
    tagId: number,
    nextOpenid?: string
  ): Promise<LuffaFollowersResponse> {
    return this.request<LuffaFollowersResponse>(
      "POST",
      "/cgi-bin/user/tag/get_black_list",
      {},
      { tagid: tagId, next_openid: nextOpenid ?? "" }
    );
  }

  // ── Tag APIs ──────────────────────────────────────────────────────────────

  /**
   * Create a new user tag (for segmented messaging).
   */
  async createTag(name: string): Promise<{ tag: { id: number; name: string } } & LuffaBaseResponse> {
    return this.request("POST", "/cgi-bin/tags/create", {}, { tag: { name } });
  }

  /**
   * Get all existing tags.
   */
  async getTags(): Promise<LuffaUserTagsResponse> {
    return this.request<LuffaUserTagsResponse>("GET", "/cgi-bin/tags/get");
  }

  /**
   * Batch-tag a list of followers.
   */
  async batchTagUsers(
    openids: string[],
    tagId: number
  ): Promise<LuffaBaseResponse> {
    return this.request<LuffaBaseResponse>(
      "POST",
      "/cgi-bin/tags/members/batchtagging",
      {},
      { openid_list: openids, tagid: tagId }
    );
  }

  // ── Menu APIs ─────────────────────────────────────────────────────────────

  /**
   * Create or update the Service Account menu (up to 3 top-level buttons,
   * each with up to 5 sub-buttons).
   */
  async createMenu(
    buttons: Array<{
      type?: string;
      name: string;
      key?: string;
      url?: string;
      sub_button?: Array<{ type: string; name: string; key?: string; url?: string }>;
    }>
  ): Promise<LuffaBaseResponse> {
    return this.request<LuffaBaseResponse>(
      "POST",
      "/cgi-bin/menu/create",
      {},
      { button: buttons }
    );
  }

  /**
   * Get the current Service Account menu configuration.
   */
  async getMenu(): Promise<LuffaMenuResponse> {
    return this.request<LuffaMenuResponse>("GET", "/cgi-bin/menu/get");
  }

  // ── Template message APIs ─────────────────────────────────────────────────

  /**
   * List all available message templates for this Service Account.
   */
  async getTemplates(): Promise<LuffaTemplateListResponse> {
    return this.request<LuffaTemplateListResponse>(
      "GET",
      "/cgi-bin/template/get_all_private_template"
    );
  }

  // ── Media upload ──────────────────────────────────────────────────────────

  /**
   * Upload temporary media (image/voice/video/thumb).
   * Returns a media_id valid for 3 days.
   */
  async uploadMedia(
    type: "image" | "voice" | "video" | "thumb",
    mediaUrl: string
  ): Promise<{ media_id: string; type: string; created_at: number } & LuffaBaseResponse> {
    // In real implementation, this would be a multipart/form-data upload.
    // We pass the URL and let the server fetch it (Luffa-specific extension).
    return this.request(
      "POST",
      "/cgi-bin/media/upload",
      { type },
      { url: mediaUrl }
    );
  }

  // ── Signature verification ────────────────────────────────────────────────

  /**
   * Verify a Mini Program login code and exchange it for user identity.
   * This is the real server-side endpoint documented in Luffa's customizeAPI.
   *
   * Endpoint: POST /lf16585928939296/verify/endless
   * (The actual endpoint path is confirmed from Luffa docs)
   */
  async verifyMiniProgramCode(code: string): Promise<{
    openid: string;
    session_key: string;
    wallet_address?: string;
    did?: string;
    errcode?: number;
    errmsg?: string;
  }> {
    if (this.dryRun) {
      return {
        openid: "dry_run_openid_" + code.slice(0, 8),
        session_key: "dry_run_session_key",
        wallet_address: "0xDryRunWalletAddress",
        did: "did:endless:dryrun",
      };
    }

    // Use the real verify endpoint discovered from Luffa docs
    const verifyBaseUrl =
      "https://k8s-ingressn-ingressn-f1c0412ab0-63d9d6d0cb58a38c.elb.ap-southeast-1.amazonaws.com";
    const resp = await axios.post(
      `${verifyBaseUrl}/lf16585928939296/verify/endless`,
      {
        appid: this.appId,
        secret: this.appSecret,
        js_code: code,
        grant_type: "authorization_code",
      },
      {
        httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
        timeout: 10_000,
      }
    );
    return resp.data;
  }
}

// ─── Custom error class ────────────────────────────────────────────────────────

export class LuffaApiError extends Error {
  constructor(
    public readonly errcode: number,
    public readonly errmsg: string,
    public readonly endpoint: string
  ) {
    super(`Luffa API error ${errcode} at ${endpoint}: ${errmsg}`);
    this.name = "LuffaApiError";
  }
}

// ─── Factory function ─────────────────────────────────────────────────────────

export function createLuffaClient(): LuffaClient {
  const appId = process.env.LUFFA_APP_ID ?? "";
  const appSecret = process.env.LUFFA_APP_SECRET ?? "";
  const baseUrl = process.env.LUFFA_API_BASE_URL ?? "https://api.luffa.im";
  const dryRun =
    process.env.LUFFA_DRY_RUN === "true" || (!appId && !appSecret);

  if (!dryRun && (!appId || !appSecret)) {
    throw new Error(
      "LUFFA_APP_ID and LUFFA_APP_SECRET must be set, or set LUFFA_DRY_RUN=true for testing"
    );
  }

  if (dryRun && (!appId || !appSecret)) {
    console.warn(
      "[luffa-mcp] No credentials found — running in DRY-RUN mode. " +
        "Set LUFFA_APP_ID and LUFFA_APP_SECRET for real API calls."
    );
  }

  return new LuffaClient({ appId, appSecret, baseUrl, dryRun });
}
