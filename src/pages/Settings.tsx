function Settings() {
  return (
    <section className="premium-card p-6">
      <p className="premium-kicker">Preferencias</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Configuracion</h1>
      <p className="mt-2 text-sm text-slate-500">Parametros principales de la cuenta y del workspace.</p>

      <form className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Nombre del negocio
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            defaultValue="GCB Store"
          />
        </label>

        <label className="text-sm text-slate-700">
          Zona horaria
          <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2" defaultValue="America/Lima">
            <option value="America/Lima">America/Lima</option>
            <option value="America/Bogota">America/Bogota</option>
            <option value="America/Santiago">America/Santiago</option>
          </select>
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          Email de notificaciones
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            defaultValue="owner.20260329174053@gcb.com"
          />
        </label>

        <button
          type="button"
          className="premium-button md:col-span-2 inline-flex w-fit px-4 py-2 text-sm"
        >
          Guardar cambios
        </button>
      </form>
    </section>
  );
}

export default Settings;
