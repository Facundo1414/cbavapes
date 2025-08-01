// app/dashboard/page.tsx
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

// Tipos
export type Flavor = {
  flavorId: number
  productId: number
  flavor: string
  stock: number
  purchasedQuantity: number
  quantitySold: number
  price: number
  discountsGifts: number
}

export type Client = {
  clienteId: number
  nombre: string
  telefono: string
  fechaCompra: string
  producto: string
  sabor: string
  precio: number
  pagado: string
  entregado: string
  seguimiento: string
  cupon: string
  notas: string
}

export default function DashboardPage() {
  const [view, setView] = useState<'flavors' | 'clientes'>('flavors')
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])


useEffect(() => {
  const fetchData = async () => {
    if ((view === 'flavors' && flavors.length > 0) || (view === 'clientes' && clients.length > 0)) {
      return
    }

    setLoadingData(true)
    setError('')
    const url = view === 'flavors' ? '/api/stock/update' : '/api/clientes/update'
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error al obtener ${view}`)
      const data = await res.json()
      if (view === 'flavors') setFlavors(data)
      else setClients(data)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError(String(e))
      }
    } finally {
      setLoadingData(false)
    }
  }
  fetchData()
}, [view, flavors.length, clients.length])



    if (!user) {
    return null
  }


  return (
    <main className="p-4 max-w-7xl mx-auto pt-24">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <div className="mb-6 flex gap-4">
        <Button
          variant={view === 'flavors' ? 'default' : 'outline'}
          onClick={() => setView('flavors')}
        >
          Sabores
        </Button>
        <Button
          variant={view === 'clientes' ? 'default' : 'outline'}
          onClick={() => setView('clientes')}
        >
          Clientes
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loadingData ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : view === 'flavors' ? (
        <FlavorsTable flavors={flavors} setFlavors={setFlavors} />
      ) : (
        <>
          <Button
            onClick={async () => {
              setLoadingData(true)
              setError('')
              try {
                const res = await fetch('/api/clientes/update')
                if (!res.ok) throw new Error('Error al obtener clientes')
                const data = await res.json()
                setClients(data)
              } catch (e: any) {
                setError(e.message)
              } finally {
                setLoadingData(false)
              }
            }}
            className="mb-4"
          >
            Actualizar clientes
          </Button>

          <ClientsTable clients={clients} setClients={setClients} />
        </>
      )}

    </main>
  )
}


function FlavorsTable({
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

  useEffect(() => {
    setCurrentPage(1)
  }, [flavors])

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

    alert(isNew ? 'Sabor creado correctamente' : 'Actualizado correctamente')

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
    </main>
  )
}



function ClientsTable({
  clients,
  setClients,
}: {
  clients: Client[]
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
}) {
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [addingNew, setAddingNew] = useState(false)

  const [newClient, setNewClient] = useState<Omit<Client, 'clienteId'>>({
    nombre: '',
    telefono: '',
    fechaCompra: '',
    producto: '',
    sabor: '',
    precio: 0,
    pagado: 'No',
    entregado: 'No',
    seguimiento: 'No',
    cupon: 'FALSE',
    notas: '',
  })

  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [clients])

async function saveClient(client: Client | Omit<Client, 'clienteId'>, isNew = false) {
  const url = '/api/clientes/update'
  const method = isNew ? 'POST' : 'PUT'

  const clientToSave = {
    ...client,
    fechaCompra: desnormalizarFecha(client.fechaCompra),
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToSave),
    })
    if (!res.ok) throw new Error('Error al guardar cliente')
    alert('Cliente guardado')

    const fresh = await (await fetch('/api/clients/update')).json()
    setClients(fresh)

    setNewClient({
      nombre: '',
      telefono: '',
      fechaCompra: '',
      producto: '',
      sabor: '',
      precio: 0,
      pagado: 'No',
      entregado: 'No',
      seguimiento: 'No',
      cupon: 'FALSE',
      notas: '',
    })
    setAddingNew(false)
    setEditingId(null)
    setEditingClient(null)
  } catch (e: unknown) {
    if (e instanceof Error) {
      alert(e.message)
    } else {
      alert(String(e))
    }
  }
}


  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentClients = clients.slice(startIndex, endIndex)

  return (
    <>
      <Table className="mb-6">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha Compra</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Sabor</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Pagado</TableHead>
            <TableHead>Entregado</TableHead>
            <TableHead>Seguimiento</TableHead>
            <TableHead>Cupón</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentClients.map(c => {
            if (c.clienteId == null) return null
            const isEditing = editingId === c.clienteId && editingClient

            return (
              <TableRow key={c.clienteId}>
                {isEditing ? (
                  <>
                    <TableCell>{c.clienteId}</TableCell>
                    <TableCell>
                      <input
                        value={editingClient.nombre || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, nombre: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.telefono || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, telefono: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="date"
                        value={normalizarFecha(editingClient.fechaCompra || '')}
                        onChange={e =>
                          setEditingClient({ ...editingClient, fechaCompra: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.producto || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, producto: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.sabor || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, sabor: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={editingClient.precio || 0}
                        onChange={e =>
                          setEditingClient({
                            ...editingClient,
                            precio: parseFloat(e.target.value),
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.pagado || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, pagado: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.entregado || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, entregado: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.seguimiento || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, seguimiento: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.cupon || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, cupon: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={editingClient.notas || ''}
                        onChange={e =>
                          setEditingClient({ ...editingClient, notas: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => saveClient(editingClient as Client)}
                        className="mr-2 text-sm bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditingClient(null)
                        }}
                        className="text-sm bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{c.clienteId}</TableCell>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.telefono}</TableCell>
                    <TableCell>{c.fechaCompra}</TableCell>
                    <TableCell>{c.producto}</TableCell>
                    <TableCell>{c.sabor}</TableCell>
                    <TableCell>{c.precio}</TableCell>
                    <TableCell>{c.pagado}</TableCell>
                    <TableCell>{c.entregado}</TableCell>
                    <TableCell>{c.seguimiento}</TableCell>
                    <TableCell>{c.cupon}</TableCell>
                    <TableCell>{c.notas}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          setEditingId(c.clienteId)
                          setEditingClient({ ...c })
                        }}
                        className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Editar
                      </button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            )
          })}

          {addingNew && (
            <TableRow>
              <TableCell>—</TableCell>
              <TableCell>
                <input
                  value={newClient.nombre}
                  onChange={e => setNewClient({ ...newClient, nombre: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.telefono}
                  onChange={e => setNewClient({ ...newClient, telefono: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  type="date"
                  value={normalizarFecha(newClient.fechaCompra)}
                  onChange={e => setNewClient({ ...newClient, fechaCompra: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.producto}
                  onChange={e => setNewClient({ ...newClient, producto: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.sabor}
                  onChange={e => setNewClient({ ...newClient, sabor: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  type="number"
                  value={newClient.precio}
                  onChange={e =>
                    setNewClient({ ...newClient, precio: parseFloat(e.target.value) })
                  }
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.pagado}
                  onChange={e => setNewClient({ ...newClient, pagado: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.entregado}
                  onChange={e => setNewClient({ ...newClient, entregado: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.seguimiento}
                  onChange={e => setNewClient({ ...newClient, seguimiento: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.cupon}
                  onChange={e => setNewClient({ ...newClient, cupon: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <input
                  value={newClient.notas}
                  onChange={e => setNewClient({ ...newClient, notas: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <button
                  onClick={() => saveClient(newClient, true)}
                  className="mr-2 text-sm bg-green-600 text-white px-2 py-1 rounded"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setAddingNew(false)}
                  className="text-sm bg-gray-400 text-white px-2 py-1 rounded"
                >
                  Cancelar
                </button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {currentPage} de {Math.ceil(clients.length / rowsPerPage)}
        </span>

        <button
          onClick={() =>
            setCurrentPage((p) =>
              Math.min(p + 1, Math.ceil(clients.length / rowsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(clients.length / rowsPerPage)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {!addingNew && (
        <button
          onClick={() => setAddingNew(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar nuevo cliente
        </button>
      )}
    </>
  )
}




function normalizarFecha(fecha: string): string {
  if (!fecha) return ''

  // Ya en formato YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha

  const partes = fecha.split('/')

  // Validación: si no hay 2 o 3 partes, no se puede continuar
  if (partes.length < 2) return ''

  let [dia, mes, anio] = partes

  // Si el año no está presente, usar el actual
  if (!anio) {
    const hoy = new Date()
    anio = hoy.getFullYear().toString()
  }

  // Asegurar dos dígitos en día y mes
  if (dia.length === 1) dia = '0' + dia
  if (mes.length === 1) mes = '0' + mes

  return `${anio}-${mes}-${dia}`
}


function desnormalizarFecha(fecha: string): string {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
