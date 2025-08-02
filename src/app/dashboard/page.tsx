// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import ClientsTable from '@/components/dashboard/ClientsTable'
import FlavorsTable from '@/components/dashboard/FlavorsTable'
import ProductsTable from '@/components/dashboard/ProductsTable'

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

export type Product = {
  productId: string
  brand: string
  name: string
  images: string[]
  price: number
  flavors: Flavor[]
}


export default function DashboardPage() {
  const [view, setView] = useState<'flavors' | 'clientes' | 'productos'>('flavors')
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
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
  if (
    (view === 'flavors' && flavors.length > 0) ||
    (view === 'clientes' && clients.length > 0) ||
    (view === 'productos' && products.length > 0)
  ) {
    return
  }

  setLoadingData(true)
  setError('')

  let url = ''
  if (view === 'flavors') url = '/api/stock/update'
  else if (view === 'clientes') url = '/api/clientes/update'
  else if (view === 'productos') url = '/api/products/update'

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error al obtener ${view}`)
    const data = await res.json()
    if (view === 'flavors') setFlavors(data)
    else if (view === 'clientes') setClients(data)
    else if (view === 'productos') setProducts(data.products)
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : String(e))
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
          variant={view === 'productos' ? 'default' : 'outline'}
          onClick={() => setView('productos')}
        >
          Productos
        </Button>
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
        ) : view === 'clientes' ? (
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
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : String(e))
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
        ) : (
          <ProductsTable products={products} />
        )}


    </main>
  )
}


