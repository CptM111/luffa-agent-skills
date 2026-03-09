/**
 * Luffa MCP Server — Integration Test (Dry Run)
 *
 * Tests all Luffa API client methods in dry-run mode.
 * No real credentials needed.
 *
 * Run: LUFFA_DRY_RUN=true LUFFA_APP_ID=test LUFFA_APP_SECRET=test node dist/test/integration.test.js
 */

import { LuffaClient } from "../luffa-client.js";

// ─── Test harness ──────────────────────────────────────────────────────────────

interface TestResult {
  name: string;
  passed: boolean;
  result?: unknown;
  error?: string;
  duration_ms: number;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: (client: LuffaClient) => Promise<unknown>,
  client: LuffaClient
): Promise<void> {
  const start = Date.now();
  try {
    const result = await fn(client);
    const duration_ms = Date.now() - start;
    results.push({ name, passed: true, result, duration_ms });
    console.log(`  ✓ ${name} (${duration_ms}ms)`);
  } catch (err) {
    const duration_ms = Date.now() - start;
    const error = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error, duration_ms });
    console.error(`  ✗ ${name}: ${error}`);
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     Luffa MCP Server — Integration Tests (Dry Run)  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Force dry-run
  process.env.LUFFA_DRY_RUN = "true";
  process.env.LUFFA_APP_ID = "test_app_id";
  process.env.LUFFA_APP_SECRET = "test_app_secret";

  const client = new LuffaClient({
    appId: "test_app_id",
    appSecret: "test_app_secret",
    dryRun: true,
  });

  // ── Token ──────────────────────────────────────────────────────────────────
  console.log("── Service Account ─────────────────────────────────────");

  await test("getAccessToken", async (c) => {
    const token = await c.getAccessToken();
    if (!token || token.length < 10) throw new Error("Token too short");
    return { token_preview: token.slice(0, 20) + "..." };
  }, client);

  // Token caching: second call should return same token
  await test("getAccessToken (cached)", async (c) => {
    const t1 = await c.getAccessToken();
    const t2 = await c.getAccessToken();
    if (t1 !== t2) throw new Error("Token not cached correctly");
    return { cached: true };
  }, client);

  // ── Messaging ──────────────────────────────────────────────────────────────
  console.log("\n── Messaging ───────────────────────────────────────────");

  await test("sendCustomMessage (text)", async (c) => {
    const r = await c.sendCustomMessage("openid_001", "text", { content: "Hello Luffa!" });
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("sendCustomMessage (image)", async (c) => {
    const r = await c.sendCustomMessage("openid_001", "image", { media_id: "media_abc" });
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("sendCustomMessage (news)", async (c) => {
    const r = await c.sendCustomMessage("openid_001", "news", {
      articles: [{
        title: "Luffa Agent Skills",
        description: "Build AI-powered bots for Luffa",
        url: "https://github.com/CptM111/luffa-agent-skills",
        picurl: "https://www.luffa.im/og.png",
      }],
    });
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("broadcastMessage (all followers)", async (c) => {
    const r = await c.broadcastMessage("text", { content: "📢 Community update!" });
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("broadcastMessage (by tag)", async (c) => {
    const r = await c.broadcastMessage("text", { content: "🎁 VIP airdrop ready!" }, 100);
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("sendTemplateMessage", async (c) => {
    const r = await c.sendTemplateMessage(
      "openid_001",
      "tmpl_001",
      {
        header: { value: "Transaction Confirmed", color: "#173177" },
        amount: { value: "500 EDS", color: "#FF6B35" },
        remark: { value: "Airdrop reward distributed" },
      },
      "https://www.luffa.im"
    );
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  await test("getTemplates", async (c) => {
    const r = await c.getTemplates();
    if (!r.template_list || r.template_list.length === 0) throw new Error("No templates returned");
    return { count: r.template_list.length, first: r.template_list[0].title };
  }, client);

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("\n── Users / Followers ───────────────────────────────────");

  await test("getFollowers (first page)", async (c) => {
    const r = await c.getFollowers();
    if (!r.data?.openids || r.data.openids.length === 0) throw new Error("No followers returned");
    return { count: r.count, openids: r.data.openids };
  }, client);

  await test("getFollowers (paginated)", async (c) => {
    const r = await c.getFollowers("mock_openid_003");
    return { count: r.count };
  }, client);

  await test("getUserInfo", async (c) => {
    const r = await c.getUserInfo("mock_openid_001");
    if (!r.openid) throw new Error("No openid in response");
    if (!r.wallet_address) throw new Error("Missing Luffa-specific wallet_address field");
    if (!r.did) throw new Error("Missing Luffa-specific did field");
    return {
      openid: r.openid,
      nickname: r.nickname,
      wallet_address: r.wallet_address,
      did: r.did,
    };
  }, client);

  // ── Tags ───────────────────────────────────────────────────────────────────
  console.log("\n── Tags ────────────────────────────────────────────────");

  await test("getTags", async (c) => {
    const r = await c.getTags();
    if (!r.tags || r.tags.length === 0) throw new Error("No tags returned");
    return { count: r.tags.length, tags: r.tags.map((t) => t.name) };
  }, client);

  await test("createTag", async (c) => {
    const r = await c.createTag("AirdropParticipants");
    if (!r.tag?.id) throw new Error("No tag ID returned");
    return { tag_id: r.tag.id, name: r.tag.name };
  }, client);

  await test("batchTagUsers", async (c) => {
    const r = await c.batchTagUsers(["openid_001", "openid_002"], 100);
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  // ── Menu ───────────────────────────────────────────────────────────────────
  console.log("\n── Menu ────────────────────────────────────────────────");

  await test("getMenu", async (c) => {
    const r = await c.getMenu();
    if (!r.menu?.button) throw new Error("No menu buttons returned");
    return { button_count: r.menu.button.length };
  }, client);

  await test("createMenu", async (c) => {
    const r = await c.createMenu([
      { type: "click", name: "Latest News", key: "news_event" },
      {
        name: "Services",
        sub_button: [
          { type: "view", name: "Open App", url: "https://luffa.im" },
          { type: "click", name: "My Wallet", key: "wallet_event" },
        ],
      },
      { type: "view", name: "Docs", url: "https://userguide.luffa.im" },
    ]);
    if (r.errcode !== 0) throw new Error(`errcode ${r.errcode}: ${r.errmsg}`);
    return r;
  }, client);

  // ── Mini Program ───────────────────────────────────────────────────────────
  console.log("\n── Mini Program / SuperBox ─────────────────────────────");

  await test("verifyMiniProgramCode", async (c) => {
    const r = await c.verifyMiniProgramCode("wx_login_code_abc123");
    if (!r.openid) throw new Error("No openid returned");
    if (!r.wallet_address) throw new Error("Missing wallet_address");
    if (!r.did) throw new Error("Missing DID");
    // session_key should NOT be in the response (handled by the MCP tool layer)
    return { openid: r.openid, wallet_address: r.wallet_address, did: r.did };
  }, client);

  await test("uploadMedia", async (c) => {
    const r = await c.uploadMedia("image", "https://www.luffa.im/banner.png");
    if (!r.media_id) throw new Error("No media_id returned");
    return { media_id: r.media_id, type: r.type };
  }, client);

  // ── Summary ────────────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalMs = results.reduce((sum, r) => sum + r.duration_ms, 0);

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║  Results: ${passed} passed, ${failed} failed  (${totalMs}ms total)`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (failed > 0) {
    console.error("Failed tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  ✗ ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }

  // Show sample result
  const sample = results.find((r) => r.name === "getUserInfo");
  if (sample?.result) {
    console.log("Sample result (getUserInfo):");
    console.log(JSON.stringify(sample.result, null, 2));
  }

  console.log("\n✅ All tests passed! The Luffa MCP server is ready.\n");
  console.log("Next steps:");
  console.log("  1. Register at https://super.luffa.im to get App ID + Secret");
  console.log("  2. Set LUFFA_APP_ID and LUFFA_APP_SECRET");
  console.log("  3. Add to Claude Desktop config (see README.md)");
  console.log("  4. Start using AI to manage your Luffa Service Account!\n");
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
