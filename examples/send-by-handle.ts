/**
 * Example: Send Tokens by Handle
 * 
 * Demonstrates how to resolve a Luffa handle to a wallet address
 * and then send tokens — a common cross-skill workflow.
 * 
 * Skills used: luffa-did → luffa-wallet → luffa-messenger
 */

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

async function sendTokensByHandle(
  senderAddress: string,
  recipientHandle: string,
  amount: string,
  token: string,
) {
  console.log(`=== Sending ${amount} ${token} to ${recipientHandle} ===\n`);

  // Step 1: Resolve handle to wallet address (luffa-did)
  console.log(`Step 1: Resolving ${recipientHandle} to wallet address...`);
  const resolved = await luffaFetch('GET', `/did/resolve?handle=${recipientHandle}`);
  const recipientAddress = resolved.walletAddress;
  console.log(`  Resolved: ${recipientHandle} → ${recipientAddress}\n`);

  // Step 2: Check sender balance (luffa-wallet)
  console.log('Step 2: Checking sender balance...');
  const balance = await luffaFetch('GET', `/wallet/balance?address=${senderAddress}`);
  const tokenBalance = balance.tokens.find((t: { symbol: string }) => t.symbol === token);
  console.log(`  ${token} balance: ${tokenBalance?.balance ?? '0'}`);

  if (!tokenBalance || parseFloat(tokenBalance.balance) < parseFloat(amount)) {
    console.error(`Insufficient ${token} balance. Aborting.`);
    return;
  }
  console.log('  Balance sufficient ✓\n');

  // Step 3: Execute transfer (luffa-wallet) — confirm with user in production
  console.log('Step 3: Executing transfer...');
  const transfer = await luffaFetch('POST', '/wallet/transfer', {
    from: senderAddress,
    to: recipientAddress,
    amount,
    symbol: token,
    network: 'endless',
    memo: `Sent via Luffa Agent Skills`,
  });
  console.log(`  Transaction hash: ${transfer.txHash}`);
  console.log(`  Status: ${transfer.status}\n`);

  // Step 4: Notify recipient via message (luffa-messenger)
  console.log('Step 4: Sending notification message...');
  const message = await luffaFetch('POST', '/messenger/send', {
    to: recipientHandle,
    content: `You received ${amount} ${token}! Transaction: ${transfer.txHash}`,
    type: 'text',
  });
  console.log(`  Message sent: ${message.messageId}\n`);

  console.log('=== Transfer Complete ===');
}

// Example usage
sendTokensByHandle(
  '0xYourWalletAddress',
  '@alice',
  '10',
  'EDS',
).catch(console.error);
