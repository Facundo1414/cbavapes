// utils/geocode.ts
export async function geocodeAddress(address: string): Promise<{ lat: number, lon: number }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.results || data.results.length === 0) {
    throw new Error('No se pudo geocodificar la dirección')
  }

  const location = data.results[0].geometry.location
  return { lat: location.lat, lon: location.lng }
}
