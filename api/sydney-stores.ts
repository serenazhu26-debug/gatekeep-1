
const toRad = (d: number) => (d * Math.PI) / 180;
const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
};

const cleanAddress = (tags: Record<string, any>) => [
  tags?.['addr:housenumber'],
  tags?.['addr:street'],
  tags?.['addr:suburb'] || tags?.['addr:city'],
  tags?.['addr:state'],
  tags?.['addr:postcode'],
].filter(Boolean).join(' ');

const getBody = (req: any) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = getBody(req) as { lat?: number; lng?: number; radiusMeters?: number };
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Overpass failed: ${response.statusText}` });
    }

    const json = await response.json();
    const stores: Array<{
      id: string;
      name: string;
      address: string;
      locationLink: string;
      lat: number;
      lng: number;
      website: string;
      distanceKm: number;
    }> = [];

    const seen = new Set<string>();
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

    return res.status(200).json({
      stores: stores.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 120),
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
