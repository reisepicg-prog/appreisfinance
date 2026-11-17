const TICKER_PATTERN = /^[A-Z0-9]{4}[0-9]{1,2}F?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
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

  const startDate = String(req.query.startDate || '');
  const endDate = String(req.query.endDate || '');
  if ((startDate && !DATE_PATTERN.test(startDate)) || (endDate && !DATE_PATTERN.test(endDate))) {
    return res.status(400).json({ error: true, code: 'BAD_DATE' });
  }

  const url = new URL('https://brapi.dev/api/v2/stocks/dividends');
  url.searchParams.set('symbols', symbols.join(','));
  if (startDate) url.searchParams.set('startDate', startDate);
  if (endDate) url.searchParams.set('endDate', endDate);
  url.searchParams.set('sortBy', 'paymentDate');
  url.searchParams.set('sortOrder', 'asc');

  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) return res.status(401).json({ error: true, code: 'UNAUTHORIZED' });
    if (response.status === 403) return res.status(403).json({ error: true, code: 'PLAN_REQUIRED' });
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: true, code: 'RATE_LIMIT_EXCEEDED', retryAfter: retryAfter || null });
    }
    if (response.status === 404) return res.status(200).json({ events: [] });
    if (!response.ok) return res.status(502).json({ error: true, code: 'UPSTREAM_ERROR' });

    const data = await response.json();
    const events = [];
    for (const series of Array.isArray(data?.results) ? data.results : []) {
      const symbol = String(series?.requestedSymbol || series?.symbol || '').toUpperCase();
      const cashDividends = Array.isArray(series?.data?.cashDividends) ? series.data.cashDividends : [];
      for (const event of cashDividends) {
        if (!event || event.rate === null || event.rate === undefined) continue;
        events.push({
          ticker: symbol,
          label: event.label || 'Provento',
          rate: Number(event.rate),
          paymentDate: event.paymentDate || '',
          lastDatePrior: event.lastDatePrior || '',
          exDate: event.exDate || '',
          approvedOn: event.approvedOn || '',
          relatedTo: event.relatedTo || '',
          verified: event.verified === true,
          paymentDateIsDeadline: event.paymentDateIsDeadline === true,
          remarks: event.remarks || ''
        });
      }
    }
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(502).json({ error: true, code: 'UPSTREAM_ERROR' });
  }
};
