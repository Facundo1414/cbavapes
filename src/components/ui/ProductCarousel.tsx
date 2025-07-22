'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import clsx from 'clsx'

interface CarouselProps {
  images: string[]
}

export const ProductCarousel = ({ images }: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll('.carousel-item')

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aCenter = Math.abs(a.boundingClientRect.left + a.boundingClientRect.width / 2 - window.innerWidth / 2)
            const bCenter = Math.abs(b.boundingClientRect.left + b.boundingClientRect.width / 2 - window.innerWidth / 2)
            return aCenter - bCenter
          })

        if (visibleEntries[0]) {
          const index = parseInt(visibleEntries[0].target.getAttribute('data-index') || '0', 10)
          setFocusedIndex(index)
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.6,
      }
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const handleClickImage = (src: string) => {
    setSelectedImage(src)
    setOpen(true)
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory px-4 py-0 h-72 overflow-y-hidden"
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            data-index={index}
            alt={`Producto ${index + 1}`}
            onClick={() => handleClickImage(src)}
            className={clsx(
              'carousel-item rounded-lg shadow-md object-cover flex-shrink-0 cursor-pointer snap-center transition-all duration-300',
              focusedIndex === index ? 'w-72 h-72 scale-105 z-10' : 'w-52 h-52 opacity-80'
            )}
            style={{ margin: 0 }}
          />
        ))}
      </div>



      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Imagen ampliada</DialogTitle>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="w-full h-full max-h-[90vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
