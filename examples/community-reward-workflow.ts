/**
 * Example: Community Reward Workflow
 * 
 * This example demonstrates how to use multiple Luffa Agent Skills together
 * to run a community reward campaign:
 * 
 * 1. Check channel subscribers
 * 2. Verify wallet balance
 * 3. Estimate airdrop cost
 * 4. Execute airdrop (after user confirmation)
 * 5. Send announcement to channel
 * 6. Message new subscribers
 * 
 * This is a reference implementation — adapt it to your use case.
 */

// In a real implementation, import from the SDK:
// import { LuffaClient, WalletAPI } from 'luffa-agent-skills';

const BASE_URL = 'https://api.luffa.im/v1';
const LUFFA_API_KEY = process.env.LUFFA_API_KEY ?? 'demo-key';

async function luffaFetch(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'X-Luffa-API-Key': LUFFA_API_KEY,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const json = await res.json();
  if (json.code !== '0') throw new Error(`Luffa API error: ${json.msg}`);
  return json.data;
}

async function runCommunityRewardWorkflow() {
  const CHANNEL_ID = 'ch_your_channel_id';
  const SENDER_ADDRESS = '0xYourWalletAddress';
  const AIRDROP_TOKEN = 'EDS';
  const AMOUNT_PER_RECIPIENT = '10';

  console.log('=== Luffa Community Reward Workflow ===\n');

  // Step 1: Check channel subscribers
  console.log('Step 1: Checking channel subscribers...');
  const subscribers = await luffaFetch('GET', `/channel/subscribers?channelId=${CHANNEL_ID}`);
  console.log(`  Total subscribers: ${subscribers.totalSubscribers}`);
  console.log(`  New today: ${subscribers.newToday}\n`);

  // Step 2: Verify wallet balance
  console.log('Step 2: Verifying wallet balance...');
  const balance = await luffaFetch('GET', `/wallet/balance?address=${SENDER_ADDRESS}`);
  console.log(`  Portfolio value: $${balance.totalValueUSD}`);
  const edsToken = balance.tokens.find((t: { symbol: string }) => t.symbol === AIRDROP_TOKEN);
  console.log(`  ${AIRDROP_TOKEN} balance: ${edsToken?.balance ?? '0'}\n`);

  // Step 3: Estimate airdrop cost
  console.log('Step 3: Estimating airdrop cost...');
  const estimate = await luffaFetch('POST', '/airdrop/estimate', {
    token: AIRDROP_TOKEN,
    network: 'endless',
    amountPerRecipient: AMOUNT_PER_RECIPIENT,
    recipients: {
      type: 'channel_subscribers',
      channelId: CHANNEL_ID,
      filter: { tier: 'all' },
    },
  });
  console.log(`  Estimated recipients: ${estimate.estimatedRecipients}`);
  console.log(`  Total tokens: ${estimate.totalTokenAmount} ${AIRDROP_TOKEN}`);
  console.log(`  Estimated gas: $${estimate.estimatedGasUSD}`);
  console.log(`  Balance sufficient: ${estimate.senderBalanceSufficient}\n`);

  if (!estimate.senderBalanceSufficient) {
    console.error('Insufficient balance for airdrop. Aborting.');
    return;
  }

  // Step 4: Create and execute airdrop (in production, confirm with user first)
  console.log('Step 4: Creating airdrop campaign...');
  const campaign = await luffaFetch('POST', '/airdrop/create', {
    name: 'March Community Reward',
    token: AIRDROP_TOKEN,
    network: 'endless',
    amountPerRecipient: AMOUNT_PER_RECIPIENT,
    recipients: {
      type: 'channel_subscribers',
      channelId: CHANNEL_ID,
      filter: { tier: 'all' },
    },
    message: 'Thank you for being part of our community! 🎉',
  });
  console.log(`  Campaign created: ${campaign.campaignId}\n`);

  // In production: await user confirmation before executing
  console.log('Step 5: Executing airdrop (requires user confirmation in production)...');
  const execution = await luffaFetch('POST', '/airdrop/execute', {
    campaignId: campaign.campaignId,
    confirm: true,
  });
  console.log(`  Status: ${execution.status}`);
  console.log(`  Recipients processed: ${execution.recipientsProcessed}\n`);

  // Step 6: Post announcement to channel
  console.log('Step 6: Posting announcement to channel...');
  const post = await luffaFetch('POST', '/channel/post', {
    channelId: CHANNEL_ID,
    title: '🎉 Community Airdrop Complete!',
    content: `We just airdropped **${AMOUNT_PER_RECIPIENT} ${AIRDROP_TOKEN}** to all ${subscribers.totalSubscribers} of our community members! Thank you for your support. 🙏`,
    type: 'post',
    isPremium: false,
  });
  console.log(`  Post published: ${post.postId}\n`);

  console.log('=== Workflow Complete ===');
}

runCommunityRewardWorkflow().catch(console.error);
