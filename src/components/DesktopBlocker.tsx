'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function DesktopBlocker() {
  const [isDesktop, setIsDesktop] = useState(false)
  const pathname = usePathname()

  // Rutas que permitís en desktop
  const allowOnDesktop = ['/dashboard', '/admin', '/login']

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  if (!isDesktop) return null
  if (allowOnDesktop.some(path => pathname?.startsWith(path))) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-2xl font-bold mb-2">Versión no disponible</h1>
      <p className="text-gray-700">Este sitio solo está disponible en dispositivos móviles.</p>
    </div>
  )
}
