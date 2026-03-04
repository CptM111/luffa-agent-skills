# Luffa Agent Skills — Agent Context

This file provides context for AI agents using Luffa Agent Skills.

## Platform Overview

Luffa is a Web3 x AI SuperConnector that integrates:
- **Decentralized Identity (DID)** — Self-sovereign identity on the Endless protocol
- **Multi-chain Wallet** — Non-custodial wallet supporting Endless, ETH, BSC, and more
- **Encrypted Messaging** — E2EE messaging with auto-delete and safe space features
- **Channels** — On-chain creator channels with monetization and paid subscriptions
- **Super Box** — Mini-program platform for DeFi, gaming, e-commerce, and more
- **AI Bots** — Programmable bots that can be deployed in channels and groups

## Skill Routing Guide

When a user makes a request, route to the appropriate skill:

| User Intent | Skill to Use |
|---|---|
| "What's in my wallet?" | `luffa-wallet` |
| "Send 10 EDS to @alice" | `luffa-wallet` (after confirming with user) |
| "Message @alice" | `luffa-messenger` |
| "Create a group with @alice and @bob" | `luffa-messenger` |
| "Post to my channel" | `luffa-channel` |
| "How many subscribers do I have?" | `luffa-channel` |
| "Find DeFi apps" | `luffa-superbox` |
| "Build a mini-program" | `luffa-superbox` |
| "Who is @alice?" | `luffa-did` |
| "Verify this credential" | `luffa-did` |
| "Airdrop tokens to my community" | `luffa-airdrop` |
| "Reward my subscribers" | `luffa-airdrop` |

## Safety Rules

1. **Irreversible actions** (transfers, airdrops, on-chain registrations) MUST be confirmed by the user before execution.
2. **Credentials** (API keys, secret keys) MUST never appear in responses.
3. **Handle resolution**: Always use `luffa-did` to resolve `@handles` to addresses before wallet operations.
4. **Airdrop estimation**: Always call `luffa-airdrop/estimate` before creating an airdrop campaign.

## Environment Variables

```shell
LUFFA_API_KEY=your-api-key
LUFFA_SECRET_KEY=your-secret-key
```

## Links

- Website: https://www.luffa.im
- Twitter: https://x.com/LuffaMessage
- Telegram: https://t.me/LuffaMessage
- Developer Portal: https://super.luffa.im
- Documentation: https://luffa.im/SuperBox/docs/en/
- Support: superbox-cs@luffa.im
