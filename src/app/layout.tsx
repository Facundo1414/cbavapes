import './globals.css'
import { ReactNode } from 'react'
import { CartProvider } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'
import CartBarMobile from '@/components/CartBarMobile'
import Header from '@/components/Header'
import DesktopBlocker from '@/components/DesktopBlocker'


import { Inter } from 'next/font/google'
import ServiceWorkerRegister from '@/components/hook/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })


export const metadata = {
  title: 'Cba Vapes',
  description: 'Cordoba Vapes',
  icons: {
  icon: '/favicon.ico',
},
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col relative font-sans">
        <ServiceWorkerRegister/>
        <DesktopBlocker />
        <CartProvider>
          <Header />
          <CartSidebar />
          <CartBarMobile />
          <main className="flex-1 bg-gray-50">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
