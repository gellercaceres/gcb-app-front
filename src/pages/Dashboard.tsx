function Dashboard() {
  const kpis = [
    { title: 'Ingresos mensuales', value: '$18,240', change: '+12.4%' },
    { title: 'Órdenes activas', value: '384', change: '+8.1%' },
    { title: 'Clientes nuevos', value: '129', change: '+4.7%' },
    { title: 'Conversión', value: '3.9%', change: '+0.6%' },
  ];

  const recentActivity = [
    'Nueva orden #A-1042 creada por Store 03',
    'Cliente premium actualizado: owner.20260329174053@gcb.com',
    'Inventario sincronizado en 4 productos',
    'Cobro exitoso por $420.90 en checkout web',
  ];

  return (
    <section className="space-y-6">
      <header className="premium-card p-6 md:p-7">
        <p className="premium-kicker">Vista comercial</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 md:text-base">
          Resumen operativo de tu negocio en tiempo real.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.title} className="premium-card p-5">
            <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{kpi.value}</p>
            <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-medium text-emerald-700">
              {kpi.change}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="premium-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Actividad reciente</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {recentActivity.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="premium-card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Acciones rápidas</h2>
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              Crear nueva orden
            </button>
            <button className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              Registrar cliente
            </button>
            <button className="w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
              Ver reportes financieros
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
