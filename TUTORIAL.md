# Luffa Agent Skills: User Tutorial

Welcome to the future of AI-powered Web3 interaction! This guide will walk you through configuring and using Luffa Agent Skills with your favorite AI coding assistant. You'll learn how to turn simple conversations into powerful on-chain actions like checking your wallet balance, sending tokens, managing your creator channel, and even launching community airdrops.

---

## Table of Contents

1.  [What Are Luffa Agent Skills?](#what-are-luffa-agent-skills)
2.  [Prerequisites: Getting Your API Keys](#prerequisites-getting-your-api-keys)
3.  [Installation & Configuration](#installation--configuration)
4.  [Using the Skills: Practical Examples](#using-the-skills-practical-examples)
    - [Luffa Wallet: Your Crypto Portfolio](#luffa-wallet-your-crypto-portfolio)
    - [Luffa Messenger: Encrypted Comms](#luffa-messenger-encrypted-comms)
    - [Luffa Channel: Your Creator Hub](#luffa-channel-your-creator-hub)
    - [Luffa Super Box: In-App Ecosystem](#luffa-super-box-in-app-ecosystem)
    - [Luffa DID: Your Sovereign Identity](#luffa-did-your-sovereign-identity)
    - [Luffa Airdrop: Community Rewards](#luffa-airdrop-community-rewards)
5.  [Full Workflow: Community Airdrop](#full-workflow-community-airdrop)
6.  [Security Best Practices](#security-best-practices)
7.  [Support & Resources](#support--resources)

---

## What Are Luffa Agent Skills?

Luffa Agent Skills are a set of standardized commands that allow AI agents to interact with the Luffa ecosystem. Instead of writing complex code, you can simply tell your AI assistant what you want to do in natural language. The agent understands your intent and uses the appropriate skill to perform the action.

This enables you to manage your digital assets, communicate securely, run your creator channel, and engage with your community, all from within your coding environment.

## Prerequisites: Getting Your API Keys

Before you can use the skills, you need to get API credentials from the Luffa Super Box Developer Portal. This is a quick, one-time setup.

1.  **Navigate to the Developer Portal**: Open your browser and go to [https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf).

2.  **Register an Account**: Complete the account registration process. You will receive a confirmation email.

3.  **Initial Communication**: The Luffa team will contact you via your registered email to confirm your development intentions. This is a standard verification step.

4.  **Access Your Credentials**: Once your account is approved, log in to the developer portal. Navigate to the "API Keys" or "Credentials" section to find your `LUFFA_API_KEY` and `LUFFA_SECRET_KEY`.

5.  **Save Your Keys**: Copy these keys and keep them in a secure location. You will need them in the next step. **Do not share them publicly.**

## Installation & Configuration

Installation is a simple, one-line command. Once installed, you just need to tell your agent where to find your API keys.

### Step 1: Install the Skills

Open your AI assistant (Claude Code, Cursor, etc.) and run the following command:

```shell
npx skills add luffa/luffa-agent-skills
```

This command automatically detects your environment and installs the skills.

### Step 2: Configure Your API Keys

Create a file named `.env` in the root directory of your project. Add your API keys to this file as follows:

```
LUFFA_API_KEY="your-api-key-from-luffa-portal"
LUFFA_SECRET_KEY="your-secret-key-from-luffa-portal"
```

Your AI agent will automatically read these keys. Remember to add `.env` to your `.gitignore` file to prevent accidentally committing your credentials.

## Using the Skills: Practical Examples

Now for the fun part! Here are some examples of what you can do with each skill.

### Luffa Wallet: Your Crypto Portfolio

> "Check my Luffa wallet balance."

> "How much Endless token do I have?"

> "Send 10 EDS to @alice." (The agent will ask for confirmation first!)

> "Show me my last 5 transactions."

### Luffa Messenger: Encrypted Comms

> "Send a message to @bob: 'Let's connect tomorrow to discuss the project.'"

> "Create a new group chat with @alice and @charlie called 'Project Phoenix'."

> "What are my unread messages?"

### Luffa Channel: Your Creator Hub

> "Post to my 'Alpha Signals' channel: 'BTC is showing strong momentum. Watching the $70k level closely.'"

> "How many new subscribers did I get today?"

> "Create a new premium subscription tier for $19.99/month with access to exclusive content."

### Luffa Super Box: In-App Ecosystem

> "Find popular DeFi mini-programs in the Super Box."

> "I want to build a new mini-program called 'NFT Portfolio Tracker'. Register it for me."

> "What's the review status of my 'NFT Portfolio Tracker' app?"

### Luffa DID: Your Sovereign Identity

> "What is the wallet address for @alice?"

> "Issue a 'Community Contributor' credential to @david."

> "Show me the public profile for @eve."

### Luffa Airdrop: Community Rewards

> "I want to airdrop 20 EDS to all subscribers of my 'Alpha Signals' channel. What would that cost?"

> "Create the 'Q1 Community Reward' airdrop campaign."

> "Execute the 'Q1 Community Reward' airdrop." (The agent will ask for confirmation.)

## Full Workflow: Community Airdrop

Let's tie it all together. Here’s how you could run a full community reward campaign with a single conversation flow:

**You:** "I want to reward my community. Let's airdrop 10 EDS to every subscriber of my 'Alpha Signals' channel."

**Agent (using `luffa-airdrop/estimate`):** "Your 'Alpha Signals' channel has 1,250 subscribers. An airdrop of 10 EDS to each would total 12,500 EDS, plus an estimated gas fee of ~$2.50. Your current EDS balance is sufficient. Shall I create the campaign?"

**You:** "Yes, go ahead."

**Agent (using `luffa-airdrop/create`):** "I have created the 'Community Reward - March 2026' airdrop campaign. It is now in draft. Are you ready to execute the airdrop? This action is irreversible."

**You:** "Yes, execute it."

**Agent (using `luffa-airdrop/execute`):** "Executing the airdrop now. This may take a few minutes to confirm on-chain. I will notify you upon completion."

**(A few minutes later)**

**Agent (using `luffa-airdrop/status`):** "The airdrop is complete. 1,248 subscribers successfully received 10 EDS each. Would you like to post an announcement to your channel?"

**You:** "Yes, announce it."

**Agent (using `luffa-channel/post`):** "Done. I've published a post to your channel announcing the airdrop."

## Security Best Practices

- **Never Share Your Keys**: Treat your `LUFFA_API_KEY` and `LUFFA_SECRET_KEY` like passwords. Never commit them to Git or share them in public.
- **Confirm Transactions**: Always double-check the details your agent provides before confirming irreversible actions like transfers and airdrops.
- **Use a `.env` File**: Keep your credentials in a `.env` file and add it to your `.gitignore`.

## Support & Resources

- **Luffa Website**: [luffa.im](https://www.luffa.im)
- **Developer Portal**: [super.luffa.im](https://super.luffa.im/luffasuperapp/login-operate/809d6e666cd85e877aa0a75a28e58ebf)
- **Official Documentation**: [luffa.im/SuperBox/docs/en/](https://luffa.im/SuperBox/docs/en/quickStartGuide/quickStartGuide.html)
- **Customer Support**: [callup.luffa.im/p/9uXei6q5KXy](https://callup.luffa.im/p/9uXei6q5KXy)
- **Email**: [superbox-cs@luffa.im](mailto:superbox-cs@luffa.im)
