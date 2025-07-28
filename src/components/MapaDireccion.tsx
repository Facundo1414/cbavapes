'use client'

import { useEffect, useState } from 'react'

export function useGeoLocation() {
  const [location, setLocation] = useState({ city: '', region: '', country: '' })

  useEffect(() => {
    const city = document?.cookie.match(/x-geo-city=([^;]+)/)?.[1] || ''
    const region = document?.cookie.match(/x-geo-region=([^;]+)/)?.[1] || ''
    const country = document?.cookie.match(/x-geo-country=([^;]+)/)?.[1] || ''
    setLocation({ city, region, country })
  }, [])

  return location
}
