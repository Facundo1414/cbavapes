import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { lat, lon } = await req.json();

  const origin = encodeURIComponent('Manir Fatala 1593, Córdoba');
  const destination = `${lat},${lon}`;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') {
    return NextResponse.json({ error: 'No se pudo calcular la distancia' }, { status: 400 });
  }

  const route = data.routes[0];
  const leg = route.legs[0];
  const distanceInKm = leg.distance.value / 1000;

  return NextResponse.json({
    distance: distanceInKm,
    duration: leg.duration.text,
    origin: leg.start_address,
    destination: leg.end_address,
  });
}
