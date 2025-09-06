export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-6 mt-8 text-center text-sm opacity-90">
      <div className="container mx-auto flex flex-col items-center gap-2">
        <span>&copy; {new Date().getFullYear()} Cba Vapes. Todos los derechos reservados.</span>
        <span className="text-xs text-gray-400">Hecho con ❤️ por Facundo Allende</span>
      </div>
    </footer>
  );
}
