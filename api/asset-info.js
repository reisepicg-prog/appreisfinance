const TICKER_PATTERN = /^[A-Z0-9]{4}[0-9]{1,2}F?$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: true, code: 'METHOD_NOT_ALLOWED' });
  }

  const token = process.env.BRAPI_TOKEN;
  if (!token) return res.status(503).json({ error: true, code: 'MISSING_API_TOKEN' });

  const symbols = Array.from(new Set(
    String(req.query.symbols || '').split(',').map(value => value.trim().toUpperCase()).filter(Boolean)
  ));
  if (!symbols.length || symbols.length > 30 || symbols.some(symbol => !TICKER_PATTERN.test(symbol))) {
    return res.status(400).json({ error: true, code: 'BAD_REQUEST' });
  }

  const assets = {};
  const unavailable = [];
  for (const symbol of symbols) {
    try {
      const url = new URL('https://brapi.dev/api/quote/list');
      url.searchParams.set('search', symbol);
      url.searchParams.set('limit', '50');
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 401) return res.status(401).json({ error: true, code: 'UNAUTHORIZED' });
      if (response.status === 403) return res.status(403).json({ error: true, code: 'PLAN_REQUIRED' });
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        if (retryAfter) res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({ error: true, code: 'RATE_LIMIT_EXCEEDED', retryAfter: retryAfter || null });
      }
      if (!response.ok) {
        unavailable.push(symbol);
        continue;
      }
      const data = await response.json();
      const match = (Array.isArray(data?.stocks) ? data.stocks : []).find(item => String(item?.stock || '').toUpperCase() === symbol);
      if (!match) {
        unavailable.push(symbol);
        continue;
      }
      assets[symbol] = {
        name: match.name || symbol,
        assetType: match.subType || match.type || '',
        sector: match.sector || '',
        subsector: match.subsector || ''
      };
    } catch (error) {
      unavailable.push(symbol);
    }
  }
  return res.status(200).json({ assets, unavailable });
};
