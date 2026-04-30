import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';

const resolveUrl = (baseUrl: string, target?: string | null) => {
  if (!target) return baseUrl;
  if (target.startsWith('http')) return target;
  const urlObj = new URL(baseUrl);
  if (target.startsWith('//')) return `${urlObj.protocol}${target}`;
  if (target.startsWith('/')) return `${urlObj.protocol}//${urlObj.host}${target}`;
  return `${urlObj.protocol}//${urlObj.host}/${target}`;
};

const normalizeText = (value: unknown) => String(value || '').trim();

const normalizeShopifyProducts = (feedUrl: string, json: any) => {
  const base = String(feedUrl || '').replace(/\/products\.json.*$/i, '');
  return (json.products || []).map((p: any) => {
    const prices = (p.variants || []).map((v: any) => Number.parseFloat(v.price)).filter((v: number) => Number.isFinite(v) && v > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const sizeOpt = (p.options || []).find((o: any) => String(o.name || '').toLowerCase().includes('size'));
    const sizes = sizeOpt?.values?.length ? sizeOpt.values : [...new Set((p.variants || []).map((v: any) => v.title).filter(Boolean))];
    return {
      title: p.title,
      price: minPrice ? `$${Math.round(minPrice)}` : '',
      imageUrl: p.images?.[0]?.src || '',
      url: `${base}/products/${p.handle}`,
      tags: p.tags || [],
      productType: p.product_type || '',
      sizes: sizes.length ? sizes : ['One Size'],
      available: Boolean((p.variants || []).some((v: any) => v.available)),
    };
  });
};

const getBody = (req: VercelRequest) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { url, type } = getBody(req) as { url?: string; type?: string };
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
      return res.status(200).json({ products, sourceType: 'shopify-products', count: products.length, url });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!response.ok) return res.status(response.status).json({ error: `Failed to fetch URL: ${response.statusText}` });

    const responseContentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (responseContentType.includes('application/json') || /\/products\.json(\?|$)/i.test(String(url))) {
      try {
        const json = await response.json();
        if (json && Array.isArray(json.products)) {
          const products = normalizeShopifyProducts(url, json);
          return res.status(200).json({ products, sourceType: 'shopify-products-failsafe', count: products.length, url });
        }
      } catch {
        // continue below
      }
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    if (normalizedType === 'search') {
      const products: Array<{ title: string; price: string; imageUrl: string; url: string }> = [];
      const items = $('.product-item, .product-card, [class*="product"], article').slice(0, 24);
      items.each((_, el) => {
        const name = normalizeText($(el).find('h1, h2, h3, [class*="title"], [class*="name"]').first().text());
        const price = normalizeText($(el).find('[class*="price"]').first().text()) || ($(el).text().match(/\$[\d,.]+(\.\d{2})?/)?.[0] ?? '');
        const img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
        const link = $(el).find('a').first().attr('href');
        if (name && (price || img || link)) {
          products.push({
            title: name,
            price,
            imageUrl: resolveUrl(url, img),
            url: resolveUrl(url, link),
          });
        }
      });

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
            // ignore malformed JSON-LD
          }
        });
      }

      return res.status(200).json({ products, sourceType: 'search', count: products.length, url });
    }

    if (normalizedType === 'location') {
      const title = $('title').text();
      const address = $('address').first().text() || $('[class*="address"]').first().text();
      return res.status(200).json({
        name: title.trim(),
        address: address ? address.trim() : 'Address not found',
        url,
      });
    }

    return res.status(200).json({
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content'),
      url,
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
