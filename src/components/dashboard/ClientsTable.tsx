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
// Define the Client type here if not available elsewhere
export interface Client {
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



export default function ClientsTable({
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

    const fresh = await (await fetch('/api/clientes/update')).json()
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
