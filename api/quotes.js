const TICKER_PATTERN = /^[A-Z0-9]{4}[0-9]{1,2}F?$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'missing_api_token' });
  }

  const rawSymbols = String(req.query.symbols || '');
  const symbols = Array.from(new Set(rawSymbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)));

  if (!symbols.length || symbols.length > 30 || symbols.some(symbol => !TICKER_PATTERN.test(symbol))) {
    return res.status(400).json({ error: 'invalid_symbols' });
  }

  const prices = {};
  const unavailable = [];

  // Query individually: the free BrAPI plan limits tickers per request and
  // one unavailable symbol should not prevent the rest of the portfolio loading.
  for (const symbol of symbols) {
    try {
      const response = await fetch(`https://brapi.dev/api/quote/${encodeURIComponent(symbol)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        unavailable.push(symbol);
        continue;
      }

      const data = await response.json();
      const quote = data && Array.isArray(data.results)
        ? data.results.find(item => item.symbol === symbol) || data.results[0]
        : null;

      if (quote && Number.isFinite(Number(quote.regularMarketPrice))) {
        prices[symbol] = Number(quote.regularMarketPrice);
      } else {
        unavailable.push(symbol);
      }
    } catch (error) {
      unavailable.push(symbol);
    }
  }

  return res.status(200).json({ prices, unavailable });
};
