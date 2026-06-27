export async function geocodeLocation(locationText: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(locationText + ', ישראל');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=il`,
      { headers: { 'Accept-Language': 'he' } }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (results.length === 0) return null;

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
