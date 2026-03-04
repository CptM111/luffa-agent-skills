# Luffa Agent Skills

<div align="center">

**Turn conversations into on-chain actions.**

AI agent skills for the [Luffa](https://www.luffa.im) Web3 × AI SuperConnector — wallet, messaging, channels, Super Box, identity, and airdrops, all accessible through natural language.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Twitter](https://img.shields.io/badge/Twitter-@LuffaMessage-1DA1F2?logo=twitter)](https://x.com/LuffaMessage)
[![Telegram](https://img.shields.io/badge/Telegram-LuffaMessage-2CA5E0?logo=telegram)](https://t.me/LuffaMessage)

</div>

---

## What is Luffa?

Luffa is a groundbreaking **Web3 × AI Super Connector** that integrates decentralized identity (DID), AI agents, Web3-native wallets, encrypted social features, and mini-programs into a unified ecosystem. It empowers users, communities, brands, and AI developers to build programmable economic models, deploy loyalty programs, and collaborate in a verifiable, secure environment.

**Luffa Agent Skills** bring this ecosystem to your AI coding assistant. Using the battle-tested `SKILL.md` format, any AI agent — Claude, Cursor, Codex, or your own — can now interact with Luffa's full feature set through natural language.

---

## Available Skills

| Skill | Description | Key Actions |
|---|---|---|
| [`luffa-wallet`](skills/luffa-wallet/SKILL.md) | Multi-chain Web3 wallet | Check balance, view holdings, send tokens |
| [`luffa-messenger`](skills/luffa-messenger/SKILL.md) | E2EE encrypted messaging | Send messages, read inbox, create groups |
| [`luffa-channel`](skills/luffa-channel/SKILL.md) | On-chain creator channels | Publish content, manage subscribers, monetize |
| [`luffa-superbox`](skills/luffa-superbox/SKILL.md) | Mini-program platform | Discover apps, register and submit mini-programs |
| [`luffa-did`](skills/luffa-did/SKILL.md) | Decentralized identity | Resolve handles, issue/verify credentials |
| [`luffa-airdrop`](skills/luffa-airdrop/SKILL.md) | Token airdrops | Distribute tokens to communities and subscribers |

---

## Quick Start

### Option 1: One-Line Install (Recommended)

```shell
npx skills add luffa/luffa-agent-skills
```

This auto-detects your environment (Claude Code, Cursor, Codex CLI, or OpenCode) and installs accordingly.

### Option 2: Claude Code

```
/plugin marketplace add luffa/luffa-agent-skills
/plugin install luffa-agent-skills
```

### Option 3: Codex CLI

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/luffa/luffa-agent-skills/main/.codex/INSTALL.md
```

### Option 4: OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/luffa/luffa-agent-skills/main/.opencode/INSTALL.md
```

---

## Prerequisites

All skills require Luffa API credentials. Register at the [Luffa Super Box Developer Portal](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf).

Create a `.env` file in your project root:

```shell
LUFFA_API_KEY="your-api-key"
LUFFA_SECRET_KEY="your-secret-key"
```

> **Security warning**: Never commit your `.env` file to git. Add it to `.gitignore` and never expose credentials in logs, screenshots, or chat messages.

---

## Skill Workflows

Luffa Agent Skills are designed to compose together into powerful multi-step workflows:

### Community Reward Airdrop

> "Airdrop 10 EDS to all my channel subscribers"

```
luffa-channel  → check subscriber count
luffa-wallet   → verify available balance
luffa-airdrop  → estimate cost, create campaign
luffa-airdrop  → execute (after user confirms)
luffa-channel  → post announcement
```

### Send Tokens by Handle

> "Send 50 EDS to @alice"

```
luffa-did      → resolve @alice to wallet address
luffa-wallet   → verify sender balance
luffa-wallet   → execute transfer (after user confirms)
luffa-messenger → notify @alice via message
```

### Launch a Creator Channel

> "Create a channel called Alpha Signals with a $9.99/month premium tier"

```
luffa-channel  → create on-chain channel
luffa-channel  → set up paid subscription tier
luffa-channel  → publish first post
luffa-superbox → link a DeFi mini-program
```

### Token-Gated Membership

> "Issue membership credentials to all my premium subscribers"

```
luffa-channel  → get premium subscriber list
luffa-did      → issue ChannelMembership credential to each
luffa-messenger → notify subscribers of their credential
```

---

## Example Code

See the [`examples/`](examples/) directory for complete workflow implementations:

- [`community-reward-workflow.ts`](examples/community-reward-workflow.ts) — Full airdrop campaign
- [`send-by-handle.ts`](examples/send-by-handle.ts) — DID-resolved token transfer

---

## API Key Security Notice & Disclaimer

This repository does not include shared or demo API keys. You must obtain your own credentials from the [Luffa Developer Portal](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf).

By using these skills, you acknowledge that:

- You are solely responsible for the security and management of your API credentials.
- Irreversible on-chain actions (transfers, airdrops) must be confirmed by the user before execution.
- Luffa is not liable for any losses resulting from improper credential management or unauthorized agent actions.

---

## Developer Resources

| Resource | Link |
|---|---|
| Luffa Website | [luffa.im](https://www.luffa.im) |
| Developer Portal | [super.luffa.im](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf) |
| Documentation | [luffa.im/SuperBox/docs](https://luffa.im/SuperBox/docs/en/quickStartGuide/quickStartGuide.html) |
| User Guide | [userguide.luffa.im](https://userguide.luffa.im) |
| Twitter | [@LuffaMessage](https://x.com/LuffaMessage) |
| Telegram | [t.me/LuffaMessage](https://t.me/LuffaMessage) |
| Support Email | [superbox-cs@luffa.im](mailto:superbox-cs@luffa.im) |
| Customer Support | [callup.luffa.im](https://callup.luffa.im/p/9uXei6q5KXy) |

---

## License

Apache-2.0 — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for the Luffa ecosystem. <br/>
<strong>Attention → Ownership. Connections → Commerce.</strong>
</div>
