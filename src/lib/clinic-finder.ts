// Type for FQHC site data
interface FQHCSite {
  id: string;
  name: string;
  org: string;
  addr: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  web: string;
  orgWeb: string;
  lat: number;
  lng: number;
  type: string;
}

export interface NearbyClinic {
  id: string;
  name: string;
  orgName: string;
  orgWeb: string | null;
  addr: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number; // miles
}

// Haversine formula for distance between two lat/lng points
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestClinics(zipCode: string, count: number = 3): NearbyClinic[] {
  const fqhcSites: FQHCSite[] = require('@/data/fqhc-sites.json');
  const zipCentroids: Record<string, [number, number]> = require('@/data/zip-centroids.json');

  const zip5 = zipCode.substring(0, 5);
  const centroid = zipCentroids[zip5];
  if (!centroid) return [];

  const [userLat, userLng] = centroid;

  // Get top 30 nearest sites
  const withDistance = fqhcSites
    .map((site) => ({
      ...site,
      distance: Math.round(haversineDistance(userLat, userLng, site.lat, site.lng) * 10) / 10,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 30);

  // Group by org, pick closest per org
  const seenOrgs = new Map<string, typeof withDistance[0]>();
  for (const site of withDistance) {
    if (!seenOrgs.has(site.org)) {
      seenOrgs.set(site.org, site);
    }
  }

  // Return top N unique orgs
  return Array.from(seenOrgs.values())
    .slice(0, count)
    .map((site) => ({
      id: site.id,
      name: site.name,
      orgName: site.org,
      orgWeb: site.orgWeb || null,
      addr: site.addr,
      city: site.city,
      state: site.state,
      zip: site.zip,
      phone: site.phone,
      lat: site.lat,
      lng: site.lng,
      distance: site.distance,
    }));
}
