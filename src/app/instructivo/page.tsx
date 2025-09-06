'use client';
import Image from 'next/image';
import { useSaboresMasVendidos } from "../admin/integraciones/hooks";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

const flavorExamples = [
  {
    name: 'Frutales',
    description: 'Sabores frescos y dulces como mango, frutilla, uva. Ideales para quienes buscan algo suave y refrescante.',
    image: 'https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/f_frutales.webp',
  },
  {
    name: 'Tabaquiles',
    description: 'Recuerdan al tabaco tradicional, perfectos para quienes buscan una experiencia similar a fumar cigarrillos.',
    image: 'https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/f_tabaquiles.webp',
  },
  {
    name: 'Dulces',
    description: 'Sabores como vainilla, pastel, chocolate. Recomendados para los que disfrutan de algo goloso.',
    image: 'https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/f_dulces.webp',
  },
  {
    name: 'Mentolados',
    description: 'Frescos y potentes, ideales para quienes buscan una sensación refrescante en cada calada.',
    image: 'https://ykurqspfcolpubcgkpmy.supabase.co/storage/v1/object/public/products/f_mentolados.webp',
  },
];

const recommendations = [
  {
    title: 'Principiante',
    text: 'Si es tu primera vez, te recomendamos sabores frutales o dulces, ya que suelen ser suaves y agradables.'
  },
  {
    title: 'Experimentado',
    text: '¿Ya probaste varios sabores? Prueba los tabaquiles o mentolados para una experiencia más intensa.'
  },
  {
    title: 'Indeciso',
    text: '¿No sabes qué elegir? Consulta nuestro ranking de favoritos.'
  },
];



export default function InstructivoPage() {
  const { data: sabores, loading: loadingSabores } = useSaboresMasVendidos();
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-2 flex flex-col items-center font-sans text-gray-900">
      <div className="w-full max-w-3xl">
        <PageHeader title="Instructivo" />
      </div>
      <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 text-center mb-2">¿No sabés qué sabor elegir?</h2>
      <p className="text-lg md:text-xl mb-8 text-gray-800 text-center max-w-2xl">Te ayudamos a encontrar el sabor ideal para tu experiencia de vapeo. Seguí estos pasos y conocé nuestras recomendaciones.</p>
      <section className="w-full max-w-3xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flavorExamples.map((flavor) => (
            <div key={flavor.name} className="relative rounded-xl shadow-md overflow-hidden flex items-center justify-center h-56 md:h-64 bg-gray-200">
              <Image src={flavor.image} alt={flavor.name} fill priority className="object-cover w-full h-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-3 bg-black/40">
                <h3 className="text-2xl font-bold text-white mb-2 px-3 py-1 rounded bg-gray-900/80 drop-shadow-lg text-center">{flavor.name}</h3>
                <p className="text-white text-center bg-gray-900/60 px-3 py-2 rounded shadow-lg max-w-xs md:max-w-sm">{flavor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="w-full max-w-2xl mb-10">
        <h2 className="text-2xl font-bold mb-4 text-neutral-900">¿Qué te recomendamos?</h2>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <motion.div
              key={rec.title}
              initial={{ borderColor: "transparent", opacity: 0, y: 40 }}
              whileInView={{ borderColor: "#3b82f6", opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="bg-gray-100 rounded-lg p-4 shadow border-2 transition-all duration-300"
            >
              <h4 className="font-bold text-gray-900 mb-1">{rec.title}</h4>
              <p className="text-gray-800">{rec.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="w-full max-w-xl flex flex-col items-center text-center mb-10">
        <h2 className="text-xl font-bold mb-2 text-neutral-900">Ranking de sabores más vendidos</h2>
        {loadingSabores ? (
          <p className="text-gray-500">Cargando ranking...</p>
        ) : (
          <ul className="w-full max-w-md mx-auto bg-white rounded-lg shadow divide-y divide-gray-200">
            {sabores.slice(0, 5).map((sabor, idx) => (
              <li key={sabor.name} className="flex justify-between items-center px-4 py-3">
                <span className="font-semibold text-gray-900">{idx + 1}. {sabor.name}</span>
                <span className="text-gray-600">{sabor.ventas.toLocaleString('es-AR')} ventas</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="w-full max-w-xl flex flex-col items-center text-center">
        <h2 className="text-xl font-bold mb-2 text-neutral-900">¿Aún tenés dudas?</h2>
        <p className="text-gray-800 mb-4">Contactanos por WhatsApp o consultá nuestro ranking de sabores favoritos. ¡Estamos para ayudarte!</p>
        <a href="https://wa.me/5493513479404" target="_blank" rel="noopener" className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-green-600 transition">Contactar por WhatsApp</a>
      </section>
    </main>
  );
}
