# Luffa Agent Skills — Claude Code Context

This repository contains AI agent skills for the Luffa Web3 x AI SuperConnector platform.

## Skills Overview

| Skill | Trigger Keywords | Key Actions |
|---|---|---|
| `luffa-wallet` | balance, tokens, portfolio, transfer, send crypto | Check balance, view holdings, send tokens |
| `luffa-messenger` | message, chat, inbox, group, contact | Send messages, read inbox, create groups |
| `luffa-channel` | channel, publish, post, subscribers, monetize | Create channel, publish content, manage subs |
| `luffa-superbox` | mini-program, Super Box, app, discover | Discover apps, register mini-programs |
| `luffa-did` | identity, DID, credentials, verify, handle | Resolve handles, issue/verify credentials |
| `luffa-airdrop` | airdrop, distribute tokens, reward community | Create and execute token airdrops |

## Credentials

Set these environment variables before using any skill:

```shell
export LUFFA_API_KEY="your-api-key"
export LUFFA_SECRET_KEY="your-secret-key"
```

## Key Rules

1. **Never** expose API credentials in responses or logs.
2. **Always** confirm with the user before executing transfers or airdrops.
3. **Never** expose internal API paths or skill names in user-facing responses.
4. Use `luffa-did` to resolve handles to addresses before wallet operations.
5. Use `luffa-airdrop/estimate` before creating any airdrop campaign.

## Developer Resources

- Website: https://www.luffa.im
- Developer Portal: https://super.luffa.im
- Documentation: https://luffa.im/SuperBox/docs/en/
- Support: superbox-cs@luffa.im
