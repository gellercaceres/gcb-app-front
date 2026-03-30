function Orders() {
  const orders = [
    { id: 'A-1042', customer: 'Store 03', total: '$420.90', status: 'Pagada' },
    { id: 'A-1043', customer: 'Store 11', total: '$89.00', status: 'Pendiente' },
    { id: 'A-1044', customer: 'Store 09', total: '$250.30', status: 'En proceso' },
  ];

  return (
    <section className="premium-card p-6">
      <p className="premium-kicker">Pipeline comercial</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Ordenes</h1>
      <p className="mt-2 text-sm text-slate-500">Gestion de pedidos y estado operacional.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-3 font-medium">ID</th>
              <th className="px-3 py-3 font-medium">Cliente</th>
              <th className="px-3 py-3 font-medium">Total</th>
              <th className="px-3 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/80">
                <td className="px-3 py-3 font-medium text-slate-900">{order.id}</td>
                <td className="px-3 py-3">{order.customer}</td>
                <td className="px-3 py-3">{order.total}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Orders;
