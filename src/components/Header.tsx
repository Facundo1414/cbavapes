'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MdMenu, MdLocationOn } from 'react-icons/md'
import { FaInstagram } from 'react-icons/fa'
import { LoadingSpinner } from './ui/loading-spinner'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  const instagramUrl = 'https://www.instagram.com/cbavapes_/'
  const homeUrl = '/'

  // Link de Google Maps para Barrio Smata, Córdoba
  const mapsUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3373.527665988235!2d-64.25091178491672!3d-31.419749981444327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94329f22b184425b%3A0x8e735e19909e5b4b!2sBarrio%20Smata%2C%20C%C3%B3rdoba%2C%20Argentina!5e0!3m2!1ses!2sar!4v1689975000000!5m2!1ses!2sar'

  return (
    <>
      {/* Header */}
      <header className="fixed  w-full top-0 z-50 bg-black border-b  py-2 px-4 flex justify-between items-center">
        {/* Menu tipo Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger aria-label="Toggle menu" className="focus:outline-none text-white">
            <MdMenu size={28} />
          </SheetTrigger>

          <SheetContent side="left" className="w-64 pt-16">
            <SheetTitle className="sr-only">Menú principal</SheetTitle>

            <nav className="flex flex-col gap-4 px-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-violet-600"
              >
                <FaInstagram size={20} />
                Instagram
              </a>
            <button
              onClick={() => {
                setOpen(false);
                setIsLoadingMap(true);     // 👈 Mostrar loading
                setShowMapModal(true);     // Mostrar modal
              }}
              className="flex items-center gap-2 text-left text-lg font-medium text-gray-700 hover:text-violet-600"
            >
              <MdLocationOn size={20} />
              Ubicación
            </button>

            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo a la derecha */}
        <a href={homeUrl} className="text-xl font-bold text-gray-900">
          <img src="/images/logo.png" alt="cba vapes" className="h-16 self-center " />
        </a>
      </header>

      {/* Modal para Google Maps */}
{showMapModal && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100]">
    <div className="bg-white rounded-lg w-11/12 max-w-lg p-4 relative shadow-lg">
      <button
        onClick={() => {
          setShowMapModal(false);
          setIsLoadingMap(false);
        }}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold leading-none"
        aria-label="Cerrar mapa"
      >
        &times;
      </button>
      <h2 className="text-lg font-semibold mb-4">Dónde retirar pedidos</h2>

      <div className="w-full h-64 flex items-center justify-center relative">
        {isLoadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <LoadingSpinner className="w-8 h-8 text-violet-600" />
          </div>
        )}
        <iframe
          src={mapsUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Ubicación Google Maps - Barrio Smata Córdoba"
          onLoad={() => setIsLoadingMap(false)} // 👈 Oculta spinner al cargar
        />
      </div>
    </div>
  </div>
)}

    </>
  )
}
