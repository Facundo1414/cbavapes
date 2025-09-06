'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
// Define the Flavor type locally if not available elsewhere
export interface Flavor {
  flavorId: number
  productId: number
  flavor: string
  stock: number
  purchasedQuantity: number
  quantitySold: number
  discountsGifts: number
  price: number
}
import { toast, Toaster } from 'sonner' 



export default function FlavorsTable({
  flavors,
  setFlavors,
}: {
  flavors: Flavor[]
  setFlavors: React.Dispatch<React.SetStateAction<Flavor[]>>
}) {
  const [addingNewFlavor, setAddingNewFlavor] = useState(false)
  const [newFlavor, setNewFlavor] = useState<Omit<Flavor, 'flavorId'>>({
    productId: 0,
    flavor: '',
    stock: 0,
    purchasedQuantity: 0,
    quantitySold: 0,
    discountsGifts: 0,
    price: 0,
  })

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedFlavors = flavors.slice(startIndex, endIndex)


  function handleChange(
    flavorId: number,
    field: 'purchasedQuantity' | 'quantitySold' | 'discountsGifts',
    value: number
  ) {
    setFlavors((prev) =>
      prev.map((f) =>
        f.flavorId === flavorId ? { ...f, [field]: value } : f
      )
    )
  }

async function handleSave(flavor: Flavor | Omit<Flavor, 'flavorId'>, isNew = false) {
  try {
    const res = await fetch('/api/stock/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sabor: flavor.flavor,
        cantidadIngresada: flavor.purchasedQuantity,
        cantidadVendida: flavor.quantitySold,
        descuentosRegalos: flavor.discountsGifts,
        precio: flavor.price,
        productId: flavor.productId,
      }),
    })
    if (!res.ok) throw new Error('Error al actualizar sabor')

    toast(isNew ? 'Sabor creado correctamente' : 'Actualizado correctamente')

    const fresh = await fetch('/api/stock/update').then(r => r.json())
    setFlavors(fresh)

    if (isNew) {
      setNewFlavor({
        productId: 0,
        flavor: '',
        stock: 0,
        purchasedQuantity: 0,
        quantitySold: 0,
        price: 0,
        discountsGifts: 0,
      })
      setAddingNewFlavor(false)
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      alert(e.message)
    } else {
      alert(String(e))
    }
  }
}


  return (
    <main className="p-4 mx-auto">
      <Table className="text-sm border border-gray-300 rounded shadow bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>flavorId</TableHead>
            <TableHead>productId</TableHead>
            <TableHead>Sabor</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Comprados</TableHead>
            <TableHead>Vendidos</TableHead>
            <TableHead>Precio (ARS)</TableHead>
            <TableHead>Descuentos / Regalos</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFlavors.map((f) => (
            <TableRow key={f.flavorId}>
              <TableCell>{f.flavorId}</TableCell>
              <TableCell>{f.productId}</TableCell>
              <TableCell>{f.flavor}</TableCell>
              <TableCell>{f.purchasedQuantity - f.quantitySold}</TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={f.purchasedQuantity}
                  min={0}
                  onChange={(e) =>
                    handleChange(f.flavorId, 'purchasedQuantity', Number(e.target.value))
                  }
                  className="w-16 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={f.quantitySold}
                  min={0}
                  onChange={(e) =>
                    handleChange(f.flavorId, 'quantitySold', Number(e.target.value))
                  }
                  className="w-16 border rounded p-1"
                />
              </TableCell>
              <TableCell>{f.price}</TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={f.discountsGifts}
                  min={0}
                  onChange={(e) =>
                    handleChange(f.flavorId, 'discountsGifts', Number(e.target.value))
                  }
                  className="w-20 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleSave(f)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Guardar
                </button>
              </TableCell>
            </TableRow>
          ))}

          {addingNewFlavor && (
            <TableRow>
              <TableCell>—</TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newFlavor.productId}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, productId: Number(e.target.value) })
                  }
                  className="w-20 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <input
                  value={newFlavor.flavor}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, flavor: e.target.value })
                  }
                  className="w-32 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                {(newFlavor.purchasedQuantity - newFlavor.quantitySold) || 0}
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newFlavor.purchasedQuantity}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, purchasedQuantity: Number(e.target.value) })
                  }
                  className="w-16 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newFlavor.quantitySold}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, quantitySold: Number(e.target.value) })
                  }
                  className="w-16 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newFlavor.price}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, price: Number(e.target.value) })
                  }
                  className="w-20 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newFlavor.discountsGifts.toString()}
                  onChange={(e) =>
                    setNewFlavor({ ...newFlavor, discountsGifts: e.target.value === '' ? 0 : parseInt(e.target.value) })
                  }
                  className="w-20 border rounded p-1"
                />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => handleSave(newFlavor, true)}
                  className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                >
                  Crear
                </button>
                <button
                  onClick={() => setAddingNewFlavor(false)}
                  className="bg-gray-400 text-white px-2 py-1 rounded"
                >
                  Cancelar
                </button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de paginación abajo */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {currentPage} de {Math.ceil(flavors.length / rowsPerPage)}
        </span>

        <button
          onClick={() =>
            setCurrentPage((p) =>
              Math.min(p + 1, Math.ceil(flavors.length / rowsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(flavors.length / rowsPerPage)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {!addingNewFlavor && (
        <button
          onClick={() => setAddingNewFlavor(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar nuevo sabor
        </button>
      )}
        <Toaster
          duration={2000}
        />

    </main>
  )
}


