import Link from 'next/link';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/sabores', label: 'Sabores' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/stock', label: 'Stock' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/cupones', label: 'Cupones' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/exportar', label: 'Exportar' },
  { href: '/admin/logs', label: 'Historial' },
  { href: '/admin/integraciones', label: 'Integraciones' },
];

export function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4 flex flex-col gap-2">
      <h2 className="text-xl font-bold mb-6">Admin</h2>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-800 font-medium"
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
