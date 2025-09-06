"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

export default function DemoPage() {


  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="¿Querés tu propio e-commerce?" />
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Tienda online moderna y autoadministrable</h2>
        <p className="text-gray-700 mb-4">
          Esta plataforma incluye catálogo, carrito, checkout, panel de administración, integración con WhatsApp y mucho más. Es 100% mobile friendly y fácil de usar.
        </p>

      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative rounded-lg shadow overflow-hidden flex flex-col items-center justify-end min-h-[220px] aspect-[16/10]">
          <Image src="https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/demo_mobile.webp" alt="Vista del catálogo y compra" fill className="object-cover absolute inset-0 w-full h-full z-0" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="relative z-20 p-6 w-full flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-white drop-shadow">Catálogo y compra</h3>
            <p className="text-gray-100 text-sm text-center drop-shadow">Productos, filtros, carrito y checkout optimizados para conversión.</p>
          </div>
        </div>
        <div className="relative rounded-lg shadow overflow-hidden flex flex-col items-center justify-end min-h-[220px] aspect-[16/10]">
          <Image src="https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/demo_admin.webp" alt="Vista del panel de administración" fill className="object-cover absolute inset-0 w-full h-full z-0" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="relative z-20 p-6 w-full flex flex-col items-center">
            <h3 className="font-semibold text-lg mb-2 text-white drop-shadow">Panel de administración</h3>
            <p className="text-gray-100 text-sm text-center drop-shadow">Gestioná productos, stock, pedidos, clientes y más desde cualquier dispositivo.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="font-semibold text-lg mb-4 text-center">¿Qué incluye?</h3>
        <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
          <ul className="flex-1 list-disc pl-6 text-gray-700 space-y-2">
            <li>Catálogo de productos con imágenes y descripciones</li>
            <li>Carrito de compras y checkout simple</li>
            <li>Integración con WhatsApp para pedidos</li>
            <li>Panel admin: productos, stock, pedidos, clientes, cupones</li>
          </ul>
          <ul className="flex-1 list-disc pl-6 text-gray-700 space-y-2 mt-4 md:mt-0">
            <li>Soporte para mobile y desktop</li>
            <li>Filtros por marca y categoría</li>
            <li>Gestión de usuarios y permisos</li>
            <li>Estadísticas y reportes</li>
          </ul>
        </div>
      </section>

      <section className="text-center mb-12">
        <h3 className="font-semibold text-lg mb-2">¿Te interesa?</h3>
        <p className="mb-4">Contactame por WhatsApp y te ayudo a tener tu propia tienda online.</p>
        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
          <a href="https://wa.me/5493513479404?text=Hola%20estoy%20interesado%20en%20hacer%20mi%20propio%20ecommerce%20para%20mi%20negocio%20y%20me%20gustar%C3%ADa%20saber%20m%C3%A1s" target="_blank" rel="noopener noreferrer">
            ¡Hablá conmigo ahora!
          </a>
        </Button>
      </section>
    </div>
  );
}
