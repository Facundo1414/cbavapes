import './globals.css'
import { ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'
import CartBarMobile from '@/components/CartBarMobile'
import Header from '@/components/Header'

export const metadata = {
  title: 'Tienda Vapers',
  description: 'Tu tienda de vapers online',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col relative">
        <CartProvider>
          <Header />
          <div className="h-2" /> {/* Spacer igual alto que Header (56px) */}
          <CartSidebar />
          <CartBarMobile />
          <main className="flex-grow">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
