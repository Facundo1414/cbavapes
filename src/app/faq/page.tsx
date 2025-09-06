"use client";

import PageHeader from "@/components/PageHeader";

export default function FaqPage() {

  const faqs = [
    {
      question: "¿Cómo hago un pedido?",
      answer: "Seleccioná tus productos, agregalos al carrito y seguí el proceso de compra. Si tenés dudas, contactanos por WhatsApp."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos efectivo, transferencia bancaria y Mercado Pago."
    },
    {
      question: "¿Hacen envíos?",
      answer: "Sí, realizamos envíos por Uber en Córdoba Capital y alrededores. Consultá costos y zonas por WhatsApp."
    },
    {
      question: "¿Cómo elijo el sabor ideal?",
      answer: "Podés consultar nuestra guía de sabores o ver el ranking de los más vendidos en la sección instructivo."
    },
    {
      question: "¿Qué hago si tengo un problema con mi pedido?",
      answer: "Contactanos por WhatsApp y te ayudamos a resolverlo lo antes posible."
    }
  ];

  return (
  <main className="min-h-screen bg-gray-50 px-4 py-2 flex flex-col items-center font-sans text-gray-900">
      <div className="w-full max-w-3xl">
        <PageHeader title="Información" />
      </div>
  <h2 className="text-3xl font-bold mb-3 text-neutral-900 tracking-tight text-center">Preguntas frecuentes</h2>
  <p className="text-lg md:text-xl text-gray-700 text-center max-w-2xl mb-8">Respuestas a las dudas más comunes sobre compras, envíos y productos.</p>
      <section className="w-full max-w-2xl">
        <ul className="space-y-6">
          {faqs.map((faq, idx) => (
            <li key={idx} className="bg-white rounded-xl shadow-md border border-black p-6">
              <h2 className="text-xl font-bold text-black mb-2">{faq.question}</h2>
              <p className="text-gray-700 text-base">{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
