import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const mobileNavItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/orders', label: 'Ordenes' },
  { to: '/app/products', label: 'Productos' },
  { to: '/app/categories', label: 'Categorias' },
  { to: '/app/customers', label: 'Clientes' },
  { to: '/app/settings', label: 'Config' },
];

function AppShell() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-6 py-5 backdrop-blur-xl">
          <div>
            <p className="premium-kicker">Sales Workspace</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Panel Ejecutivo de Ventas</h2>
          </div>

          <button
            type="button"
            className="premium-button px-4 py-2 text-sm"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white/95 px-4 py-3 lg:hidden">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold ${
                  isActive
                    ? 'bg-[#173346] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppShell;
