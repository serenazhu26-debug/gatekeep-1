const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const cheerio = require('cheerio');

const loadEnvFile = (fileName) => {
  const envPath = path.resolve(__dirname, fileName);
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf-8');
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
};

loadEnvFile('.env.local');
loadEnvFile('.env');

const resolveUrl = (baseUrl, target) => {
  if (!target) return baseUrl;
  if (target.startsWith('http')) return target;
  const urlObj = new URL(baseUrl);
  if (target.startsWith('//')) return `${urlObj.protocol}${target}`;
  if (target.startsWith('/')) return `${urlObj.protocol}//${urlObj.host}${target}`;
  return `${urlObj.protocol}//${urlObj.host}/${target}`;
};

const normalizeText = (value) => String(value || '').trim();

const normalizeShopifyProducts = (feedUrl, json) => {
  const base = String(feedUrl || '').replace(/\/products\.json.*$/i, '');
  return (json.products || []).map((p) => {
    const prices = (p.variants || []).map(v => Number.parseFloat(v.price)).filter(v => Number.isFinite(v) && v > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const sizeOpt = (p.options || []).find(o => String(o.name || '').toLowerCase().includes('size'));
    const sizes = sizeOpt?.values?.length ? sizeOpt.values : [...new Set((p.variants || []).map(v => v.title).filter(Boolean))];
    return {
      title: p.title,
      price: minPrice ? `$${Math.round(minPrice)}` : '',
      imageUrl: p.images?.[0]?.src || '',
      url: `${base}/products/${p.handle}`,
      tags: p.tags || [],
      productType: p.product_type || '',
      sizes: sizes.length ? sizes : ['One Size'],
      available: Boolean((p.variants || []).some(v => v.available)),
    };
  });
};

module.exports = {
  mode: 'development',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(tsx?|jsx?)$/,
        exclude: /node_modules\/(?!(react-leaflet|@react-leaflet)\/)/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: false,
    before(app) {
      app.use((req, res, next) => {
        if (req.method !== 'POST') return next();
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        req.on('end', () => {
          try {
            req.body = data ? JSON.parse(data) : {};
          } catch {
            req.body = {};
          }
          next();
        });
      });

      app.post('/api/scrape', async (req, res) => {
        const { url, type } = req.body || {};
        if (!url) return res.status(400).json({ error: 'URL is required' });
        const normalizedType = String(type || '').toLowerCase();
        const isShopifyFeedUrl = /\/products\.json(\?|$)/i.test(String(url));

        try {
          if (normalizedType === 'shopify-products' || isShopifyFeedUrl) {
            const response = await fetch(url);
            if (!response.ok) return res.status(response.status).json({ error: `Failed to fetch feed: ${response.statusText}` });
            const json = await response.json();
            if (!json || !Array.isArray(json.products)) {
              return res.status(502).json({ error: 'Invalid Shopify products response', url });
            }
            const products = normalizeShopifyProducts(url, json);
            return res.json({
              products,
              sourceType: 'shopify-products',
              count: products.length,
              url,
            });
          }

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });
          if (!response.ok) return res.status(response.status).json({ error: `Failed to fetch URL: ${response.statusText}` });

          // Failsafe: if the fetched URL is JSON with Shopify products, normalize it.
          const responseContentType = String(response.headers.get('content-type') || '').toLowerCase();
          if (responseContentType.includes('application/json') || /\/products\.json(\?|$)/i.test(String(url))) {
            try {
              const json = await response.json();
              if (json && Array.isArray(json.products)) {
                const products = normalizeShopifyProducts(url, json);
                return res.json({
                  products,
                  sourceType: 'shopify-products-failsafe',
                  count: products.length,
                  url,
                });
              }
            } catch {
              // continue to HTML parsing branch below
            }
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          if (type === 'search') {
            const products = [];
            const items = $('.product-item, .product-card, [class*="product"], article').slice(0, 12);
            items.each((_, el) => {
              const name = normalizeText($(el).find('h1, h2, h3, [class*="title"], [class*="name"]').first().text());
              const price = normalizeText($(el).find('[class*="price"]').first().text()) || $(el).text().match(/\$[\d,.]+(\.\d{2})?/)?.[0];
              const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
              const link = $(el).find('a').first().attr('href');
              if (name && (price || img)) {
                products.push({
                  title: name,
                  price: price || '',
                  imageUrl: resolveUrl(url, img),
                  url: resolveUrl(url, link),
                });
              }
            });

            // JSON-LD fallback for stores that render product lists with scripts.
            if (!products.length) {
              $('script[type="application/ld+json"]').each((_, el) => {
                try {
                  const raw = normalizeText($(el).html());
                  if (!raw) return;
                  const parsed = JSON.parse(raw);
                  const nodes = Array.isArray(parsed) ? parsed : [parsed];
                  for (const node of nodes) {
                    const candidates = node?.itemListElement || node?.mainEntity?.itemListElement || [];
                    for (const entry of candidates) {
                      const item = entry?.item || entry;
                      const name = normalizeText(item?.name);
                      const productUrl = item?.url || item?.['@id'];
                      const image = Array.isArray(item?.image) ? item.image[0] : item?.image;
                      const offer = Array.isArray(item?.offers) ? item.offers[0] : item?.offers;
                      const price = normalizeText(offer?.price ? `$${offer.price}` : '');
                      if (!name || !productUrl) continue;
                      products.push({
                        title: name,
                        price,
                        imageUrl: resolveUrl(url, image),
                        url: resolveUrl(url, productUrl),
                      });
                    }
                  }
                } catch {
                  // ignore malformed JSON-LD blocks
                }
              });
            }

            return res.json({ products });
          }

          if (type === 'location') {
            const title = $('title').text();
            const address = $('address').first().text() || $('[class*="address"]').first().text();
            return res.json({
              name: title.trim(),
              address: address ? address.trim() : 'Address not found',
              url,
            });
          }

          return res.json({
            title: $('title').text(),
            description: $('meta[name="description"]').attr('content'),
            url,
          });
        } catch (error) {
          return res.status(500).json({ error: String(error) });
        }
      });

      app.post('/api/sydney-stores', async (req, res) => {
        const toRad = (d) => (d * Math.PI) / 180;
        const haversineKm = (aLat, aLng, bLat, bLng) => {
          const dLat = toRad(bLat - aLat);
          const dLng = toRad(bLng - aLng);
          const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
          return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
        };

        const cleanAddress = (tags) => [
          tags?.['addr:housenumber'],
          tags?.['addr:street'],
          tags?.['addr:suburb'] || tags?.['addr:city'],
          tags?.['addr:state'],
          tags?.['addr:postcode'],
        ].filter(Boolean).join(' ');

        try {
          const lat = Number(req.body?.lat ?? -33.8688);
          const lng = Number(req.body?.lng ?? 151.2093);
          const radiusMeters = Number(req.body?.radiusMeters ?? 35000);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ error: 'Invalid lat/lng' });
          }

          const overpassQuery = `
[out:json][timeout:35];
(
  node["shop"~"^(clothes|fashion|boutique|shoes|department_store)$"](around:${radiusMeters},${lat},${lng});
  way["shop"~"^(clothes|fashion|boutique|shoes|department_store)$"](around:${radiusMeters},${lat},${lng});
);
out center body;
`.trim();

          const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(overpassQuery)}`,
          });
          if (!response.ok) {
            return res.status(response.status).json({ error: `Overpass failed: ${response.statusText}` });
          }

          const json = await response.json();
          const stores = [];
          const seen = new Set();

          for (const el of (json.elements || [])) {
            const sLat = el.lat ?? el.center?.lat;
            const sLng = el.lon ?? el.center?.lon;
            const name = String(el.tags?.name || el.tags?.brand || '').trim();
            if (!name || !Number.isFinite(sLat) || !Number.isFinite(sLng)) continue;
            const key = `${name.toLowerCase()}|${Number(sLat).toFixed(3)}|${Number(sLng).toFixed(3)}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const website = String(el.tags?.website || el.tags?.['contact:website'] || '').trim();
            const address = cleanAddress(el.tags || {});
            const distanceKm = Number(haversineKm(lat, lng, Number(sLat), Number(sLng)).toFixed(1));
            stores.push({
              id: `osm-${el.id}`,
              name,
              address: address || 'Sydney NSW',
              locationLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || `${name} Sydney NSW`)}`,
              lat: Number(sLat),
              lng: Number(sLng),
              website,
              distanceKm,
            });
          }

          return res.json({
            stores: stores
              .sort((a, b) => a.distanceKm - b.distanceKm)
              .slice(0, 120),
          });
        } catch (error) {
          return res.status(500).json({ error: String(error) });
        }
      });

      app.post('/api/claude/intent', async (req, res) => {
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) return res.status(503).json({ error: 'CLAUDE_API_KEY missing', mode: 'fallback' });
        try {
          const { prompt = '', budget = 0, location = '', uploads = [] } = req.body || {};
          const promptTrimmed = String(prompt || '').trim();
          const userPrompt = [
            'You are a fashion intent parser for outfit shopping recommendations.',
            'Return STRICT JSON only.',
            'Schema:',
            '{"intentSummary":"string","styleKeywords":["string"],"occasion":"string","timeHint":"day|night|any","promptSignal":"string"}',
            'Rules:',
            '1) intentSummary must reference at least 2 concrete details from the Prompt.',
            '2) styleKeywords must be specific fashion terms (max 8).',
            '3) promptSignal must be a short quote or phrase from the Prompt proving you used it.',
            `Prompt: ${promptTrimmed}`,
            `Budget: ${budget}`,
            `Location: ${location}`,
            `Upload count: ${Array.isArray(uploads) ? uploads.length : 0}`,
          ].join('\n');

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 180,
              temperature: 0,
              messages: [{ role: 'user', content: userPrompt }],
            }),
          });
          if (!response.ok) {
            const errorBody = await response.text();
            return res.status(response.status).json({ error: 'Claude request failed', details: errorBody.slice(0, 400), mode: 'fallback' });
          }
          const json = await response.json();
          const text = (json.content || []).filter(block => block.type === 'text').map(block => block.text).join('\n').trim();
          let parsed;
          try {
            const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            const direct = JSON.parse(cleaned);
            parsed = direct;
          } catch {
            parsed = null;
          }
          if (!parsed && text.includes('{') && text.includes('}')) {
            try {
              const start = text.indexOf('{');
              const end = text.lastIndexOf('}');
              parsed = JSON.parse(text.slice(start, end + 1));
            } catch {
              parsed = null;
            }
          }

          const styleKeywords = Array.isArray(parsed?.styleKeywords)
            ? parsed.styleKeywords.map(v => String(v).trim()).filter(Boolean).slice(0, 8)
            : [];
          const summary = normalizeText(parsed?.intentSummary || '');
          const promptSignal = normalizeText(parsed?.promptSignal || '');
          const fallbackSummary = promptTrimmed
            ? `Prompt intent for "${promptTrimmed.slice(0, 80)}" in ${location} with budget ${budget}.`
            : `Prompt intent for budget ${budget} in ${location}.`;

          return res.json({
            intentSummary: summary || text || fallbackSummary,
            styleKeywords,
            occasion: parsed?.occasion || '',
            timeHint: parsed?.timeHint || '',
            promptSignal: promptSignal || promptTrimmed.slice(0, 60),
            mode: 'live',
          });
        } catch (error) {
          return res.status(500).json({ error: 'Claude intent failed', details: String(error), mode: 'fallback' });
        }
      });
    },
  },
  devtool: 'eval-cheap-module-source-map',
  performance: { hints: false },
};
