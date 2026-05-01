const toRad = (d) => (d * Math.PI) / 180;

const haversineKm = (aLat, aLng, bLat, bLng) => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
};

const cleanAddress = (tags = {}) => [
  tags['addr:housenumber'],
  tags['addr:street'],
  tags['addr:suburb'] || tags['addr:city'],
  tags['addr:state'],
  tags['addr:postcode'],
].filter(Boolean).join(' ');

const getBody = (req) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
};

const FIXED_SYDNEY_STORES = [
  {
    id: 'fixed-pam',
    name: 'P.A.M. Store Sydney',
    address: '304 Palmer St, Darlinghurst NSW 2010',
    lat: -33.8779,
    lng: 151.2206,
    website: 'https://perksandmini.com/',
  },
  {
    id: 'fixed-goelia',
    name: 'GOELIA Fashion',
    address: 'Suite2, Level 6/428 George St, Sydney NSW 2000',
    lat: -33.8734,
    lng: 151.2069,
    website: 'https://www.goelia1995.com/en-au',
  },
  {
    id: 'fixed-stily',
    name: 'Sorry Thanks I Love You',
    address: 'Westfield Sydney, Cnr Pitt St Mall &, Market St, Sydney NSW 2000',
    lat: -33.8708,
    lng: 151.2073,
    website: 'https://sorrythanksiloveyou.com/',
  },
  {
    id: 'fixed-social-outfit',
    name: 'The Social Outfit',
    address: '188 King St, Newtown NSW 2042',
    lat: -33.8970,
    lng: 151.1790,
    website: 'https://thesocialoutfit.org/',
  },
];

const toStorePayload = (userLat, userLng, list) =>
  list
    .map((s) => {
      const distanceKm = Number(haversineKm(userLat, userLng, s.lat, s.lng).toFixed(1));
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        locationLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`,
        lat: s.lat,
        lng: s.lng,
        website: s.website || '',
        distanceKm,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = getBody(req);
    const lat = Number(body.lat ?? -33.8688);
    const lng = Number(body.lng ?? 151.2093);
    const radiusMeters = Number(body.radiusMeters ?? 35000);

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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'gatekeep-1/1.0 (+https://gatekeep-1-wine.vercel.app)',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      return res.status(200).json({
        stores: toStorePayload(lat, lng, FIXED_SYDNEY_STORES),
        source: 'fixed-fallback',
        warning: `Overpass unavailable (${response.status})`,
      });
    }

    const json = await response.json();
    const stores = [];
    const seen = new Set();

    for (const el of (json.elements || [])) {
      const sLat = el.lat ?? (el.center && el.center.lat);
      const sLng = el.lon ?? (el.center && el.center.lon);
      const name = String((el.tags && (el.tags.name || el.tags.brand)) || '').trim();
      if (!name || !Number.isFinite(sLat) || !Number.isFinite(sLng)) continue;

      const key = `${name.toLowerCase()}|${Number(sLat).toFixed(3)}|${Number(sLng).toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const website = String((el.tags && (el.tags.website || el.tags['contact:website'])) || '').trim();
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

    if (!stores.length) {
      return res.status(200).json({
        stores: toStorePayload(lat, lng, FIXED_SYDNEY_STORES),
        source: 'fixed-fallback',
      });
    }

    return res.status(200).json({
      stores: stores.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 120),
      source: 'overpass',
    });
  } catch (error) {
    return res.status(200).json({
      stores: toStorePayload(-33.8688, 151.2093, FIXED_SYDNEY_STORES),
      source: 'fixed-fallback',
      warning: String(error),
    });
  }
};
