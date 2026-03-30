import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/orders', label: 'Ordenes' },
  { to: '/app/customers', label: 'Clientes' },
  { to: '/app/settings', label: 'Configuracion' },
];

function Sidebar() {
  return (
    <aside className="h-full w-full border-r border-slate-200/90 bg-gradient-to-b from-[#112739] to-[#173346] px-5 py-7 text-white">
      <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd891]">GCB Commerce</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Sales Control Hub</h1>
        <p className="mt-2 text-xs text-slate-200">Gestion integral para equipos de alto rendimiento.</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white text-[#16384d]'
                  : 'text-slate-200 hover:bg-white/15 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-[#d6a84f]/40 bg-[#d6a84f]/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#ffe3af]">Meta del mes</p>
        <p className="mt-2 text-lg font-semibold text-white">$120,000</p>
        <p className="mt-1 text-xs text-slate-200">Ya cumpliste 74% del objetivo.</p>
      </div>
    </aside>
  );
}

export default Sidebar;