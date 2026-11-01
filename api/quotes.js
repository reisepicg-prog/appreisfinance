const TICKER_PATTERN = /^[A-Z0-9]{4}[0-9]{1,2}F?$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: true, code: 'METHOD_NOT_ALLOWED' });
  }

  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    return res.status(503).json({ error: true, code: 'MISSING_API_TOKEN' });
  }

  const symbols = Array.from(new Set(
    String(req.query.symbols || '').split(',').map(symbol => symbol.trim().toUpperCase()).filter(Boolean)
  ));

  if (!symbols.length || symbols.length > 30 || symbols.some(symbol => !TICKER_PATTERN.test(symbol))) {
    return res.status(400).json({ error: true, code: 'BAD_REQUEST' });
  }

  const prices = {};
  const unavailable = [];

  // The free brapi plan allows one ticker per request. Keep each call on the v2
  // quote endpoint; aggregate results for the app and tolerate missing symbols.
  for (const symbol of symbols) {
    try {
      const url = new URL('https://brapi.dev/api/v2/stocks/quote');
      url.searchParams.set('symbols', symbol);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        return res.status(401).json({ error: true, code: 'UNAUTHORIZED' });
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({ error: true, code: 'RATE_LIMIT_EXCEEDED', retryAfter: retryAfter || null });
      }
      if (response.status === 404) {
        unavailable.push(symbol);
        continue;
      }
      if (!response.ok) {
        unavailable.push(symbol);
        continue;
      }

      const data = await response.json();
      const quote = Array.isArray(data?.results)
        ? data.results.find(item => item.requestedSymbol === symbol || item.symbol === symbol) || data.results[0]
        : null;
      const value = quote?.data?.regularMarketPrice;

      if (value !== null && value !== undefined && Number.isFinite(Number(value))) {
        prices[symbol] = Number(value);
      } else {
        unavailable.push(symbol);
      }
    } catch (error) {
      unavailable.push(symbol);
    }
  }

  if (!Object.keys(prices).length && unavailable.length) {
    return res.status(404).json({ error: true, code: 'NOT_FOUND', unavailable });
  }

  return res.status(200).json({ prices, unavailable });
};
