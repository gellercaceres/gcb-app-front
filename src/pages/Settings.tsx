import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

type StoreStatus = 'ACTIVE' | 'INACTIVE';
type StorePlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

type Store = {
  id: number;
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  plan: StorePlan;
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
};

type StoreForm = {
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  plan: StorePlan;
  status: StoreStatus;
};

const emptyForm: StoreForm = {
  name: '',
  ruc: '',
  email: '',
  phone: '',
  address: '',
  plan: 'BASIC',
  status: 'ACTIVE',
};

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) {
    return fallback;
  }

  const status = err.response?.status;
  const data = err.response?.data as { message?: string; error?: string } | undefined;
  const message = data?.message ?? data?.error ?? err.message;
  return `${fallback}${status ? ` (${status})` : ''}: ${message}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsDiff < 60) return 'hace unos segundos';
  if (secondsDiff < 3600) return `hace ${Math.floor(secondsDiff / 60)} minutos`;
  if (secondsDiff < 86400) return `hace ${Math.floor(secondsDiff / 3600)} horas`;
  if (secondsDiff < 2592000) return `hace ${Math.floor(secondsDiff / 86400)} dias`;
  
  return date.toLocaleString();
}

function getLimaLocalTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${byType.year}-${byType.month}-${byType.day}T${byType.hour}:${byType.minute}:${byType.second}.${milliseconds}`;
}

function Settings() {
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState<StoreForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [, setRefresh] = useState(0);

  const fetchStore = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const response = await api.get('/stores');
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? (payload[0] as Store | undefined)
        : (payload as Store);

      if (!data) {
        throw new Error('No se encontro la tienda asociada.');
      }

      setStore(data);
      setForm({
        name: data.name ?? '',
        ruc: data.ruc ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        plan: data.plan ?? 'BASIC',
        status: data.status ?? 'ACTIVE',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar la configuracion de tienda'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStore();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (field: keyof StoreForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!store) {
      setError('No hay tienda cargada para actualizar.');
      return;
    }

    if (!form.name.trim() || !form.ruc.trim()) {
      setError('El nombre y RUC son obligatorios.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload: Store = {
        ...store,
        ...form,
        updatedAt: getLimaLocalTimestamp(new Date()),
      };

      const response = await api.put(`/stores/${store.id}`, payload);
      const updatedStore = response.data as Store | undefined;

      if (updatedStore?.id) {
        setStore(updatedStore);
        setForm({
          name: updatedStore.name ?? '',
          ruc: updatedStore.ruc ?? '',
          email: updatedStore.email ?? '',
          phone: updatedStore.phone ?? '',
          address: updatedStore.address ?? '',
          plan: updatedStore.plan ?? 'BASIC',
          status: updatedStore.status ?? 'ACTIVE',
        });
      } else {
        await fetchStore();
      }
      setSuccessMessage('¡Tienda actualizada exitosamente!');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo actualizar la tienda'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="premium-card p-6">
        <p className="premium-kicker">Configuracion comercial</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Datos de la tienda</h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra datos generales y parametros operativos de tu negocio.
        </p>
      </header>

      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-500">Cargando datos de tienda...</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}



      {!loading && store ? (
        <form className="premium-card grid gap-4 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm text-slate-700">
            Nombre de tienda *
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-700">
            RUC *
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.ruc}
              onChange={(e) => handleChange('ruc', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-700">
            Telefono
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            Direccion
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-700">
            Plan
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.plan}
              onChange={(e) => handleChange('plan', e.target.value as StorePlan)}
            >
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </label>

          <label className="text-sm text-slate-700">
            Estado
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as StoreStatus)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 md:col-span-2">
            <p>ID tienda: {store.id}</p>
            <p>Creado: {new Date(store.createdAt).toLocaleString()}</p>
            <p className="font-semibold text-slate-700 mt-2">
              Última actualización: {formatRelativeTime(store.updatedAt)} <span className="text-slate-500 font-normal">({new Date(store.updatedAt).toLocaleString()})</span>
            </p>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || loading}
              className="premium-button px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => void fetchStore()}
            >
              Recargar datos
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default Settings;
