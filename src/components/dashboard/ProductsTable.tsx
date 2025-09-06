'use client'

import { useState } from 'react'
// Define the Product type here or import from the correct location
export interface Product {
  productId: string
  brand: string
  name: string
  price: number
  images: string[]
}
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function ProductsTable({ products }: { products: Product[] }) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const openImagesModal = (images: string[]) => {
    setSelectedImages(images)
  }

  return (
    <>
      <Table className="text-sm border border-gray-300 rounded shadow bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio (ARS)</TableHead>
            <TableHead>Imágenes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.productId}>
              <TableCell>{p.productId}</TableCell>
              <TableCell>{p.brand}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell>${p.price}</TableCell>
              <TableCell>
                {p.images.length > 0 ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openImagesModal(p.images)}
                      >
                        Ver imágenes ({p.images.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Imágenes del producto</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedImages.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`img-${i}`}
                            className="w-24 h-24 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-gray-500">Sin imágenes</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
