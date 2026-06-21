const axios = require('axios');

// Cache to avoid hitting APIs on every refresh (store for 60 seconds)
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Helper: fetch Bitcoin balance (in BTC)
async function getBtcBalance(address) {
  const cacheKey = `btc:${address}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await axios.get(`https://blockchain.info/balance?active=${address}`);
    // satoshi to BTC
    const satoshi = res.data[address]?.final_balance || 0;
    const btc = satoshi / 1e8;
    setCache(cacheKey, btc);
    return btc;
  } catch (error) {
    console.error('BTC balance fetch error:', error.message);
    return 0;
  }
}

// Helper: fetch Ethereum balance (ETH + tokens via Ethplorer)
async function getEthBalance(address) {
  const cacheKey = `eth:${address}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await axios.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
    const data = res.data;
    // ETH balance
    const eth = data.ETH?.balance || 0;
    // Tokens
    const tokens = (data.tokens || []).map(t => ({
      symbol: t.tokenInfo.symbol,
      name: t.tokenInfo.name,
      balance: t.balance / Math.pow(10, t.tokenInfo.decimals),
      address: t.tokenInfo.address
    }));
    const result = { eth, tokens };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('ETH balance fetch error:', error.message);
    return { eth: 0, tokens: [] };
  }
}

// Helper: fetch BSC balance (BNB + tokens via BscScan)
// Requires BSCSCAN_API_KEY in .env for real data
async function getBscBalance(address) {
  const cacheKey = `bsc:${address}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  const apiKey = process.env.BSCSCAN_API_KEY;
  if (!apiKey) {
    // No API key – return zero without making a request
    return { bnb: 0, tokens: [] };
  }

  try {
    // BNB balance
    const bnbRes = await axios.get(
      `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey}`
    );
    const bnb = (parseInt(bnbRes.data.result, 10) || 0) / 1e18;

    // BEP‑20 token balances (simple – only USDT if needed)
    // BscScan doesn't have a free token list endpoint like Ethplorer, so we'll skip for now and return empty tokens.
    const result = { bnb, tokens: [] };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('BSC balance fetch error:', error.message);
    return { bnb: 0, tokens: [] };
  }
}

// Helper: fetch XRP balance
async function getXrpBalance(address) {
  const cacheKey = `xrp:${address}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await axios.get(`https://data.ripple.com/v2/accounts/${address}/balances?currency=XRP`);
    const balance = parseFloat(res.data.balances?.[0]?.value || 0);
    setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    console.error('XRP balance fetch error:', error.message);
    return 0;
  }
}

// Helper: fetch USDT balance on Ethereum (ERC‑20)
async function getUsdtEthBalance(address) {
  // We'll get it from Ethplorer already; this is a placeholder if needed separately.
  return 0; // will not be called directly
}

// Price feed (simple, using Coingecko free API)
async function getCoinPrice(coinId, vsCurrency = 'usd') {
  const cacheKey = `price:${coinId}:${vsCurrency}`;
  const cached = getCached(cacheKey);
  if (cached !== null) return cached;

  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`
    );
    const price = res.data[coinId]?.[vsCurrency] || 0;
    setCache(cacheKey, price);
    return price;
  } catch (error) {
    console.error(`Price fetch error for ${coinId}:`, error.message);
    return 0;
  }
}

// Get USD value for common coins/tokens
async function getUsdValueForSymbol(symbol) {
  const map = {
    btc: 'bitcoin',
    eth: 'ethereum',
    bnb: 'binancecoin',
    xrp: 'ripple',
    usdt: 'tether'   // USDT is usually $1
  };
  const coinId = map[symbol.toLowerCase()];
  if (!coinId) return 0;
  if (coinId === 'tether') return 1; // USDT pegged to 1 USD
  return getCoinPrice(coinId);
}

// Explorer URL generators
function getExplorerUrl(chain, address) {
  const urls = {
    btc: `https://www.blockchain.com/btc/address/${address}`,
    eth: `https://etherscan.io/address/${address}`,
    usdt: `https://etherscan.io/address/${address}`, // if ERC‑20
    bnb: `https://bscscan.com/address/${address}`,
    xrp: `https://xrpscan.com/account/${address}`
  };
  return urls[chain] || '#';
}

module.exports = {
  getBtcBalance,
  getEthBalance,
  getBscBalance,
  getXrpBalance,
  getUsdValueForSymbol,
  getExplorerUrl
};
