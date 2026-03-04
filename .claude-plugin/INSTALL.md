# Luffa Agent Skills — Claude Code Installation

Follow these steps to install Luffa Agent Skills in Claude Code.

## Quick Install

Run the following command inside Claude Code:

```
/plugin marketplace add luffa/luffa-agent-skills
/plugin install luffa-agent-skills
```

## Manual Install

If the above does not work, you can manually install by telling Claude:

```
Fetch and follow instructions from https://raw.githubusercontent.com/luffa/luffa-agent-skills/main/.claude-plugin/INSTALL.md
```

## Configuration

After installation, set your Luffa API credentials:

```shell
export LUFFA_API_KEY="your-api-key"
export LUFFA_SECRET_KEY="your-secret-key"
```

Or create a `.env` file in your project root:

```
LUFFA_API_KEY=your-api-key
LUFFA_SECRET_KEY=your-secret-key
```

## Verify Installation

Ask Claude: "Check my Luffa wallet balance for address 0x..."

Claude should use the `luffa-wallet` skill to respond.

## Available Skills

- `luffa-wallet` — Wallet balance, tokens, transfers
- `luffa-messenger` — Encrypted messaging, groups
- `luffa-channel` — Channel management, content publishing
- `luffa-superbox` — Mini-program discovery and management
- `luffa-did` — Decentralized identity and credentials
- `luffa-airdrop` — Token airdrops and community rewards

## Support

- Documentation: https://luffa.im/SuperBox/docs/en/
- Email: superbox-cs@luffa.im
- Customer Support: https://callup.luffa.im/p/9uXei6q5KXy
