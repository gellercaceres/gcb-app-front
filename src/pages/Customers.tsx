import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

type Customer = {
  id: number;
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
  storeId: number;
};

type CustomerForm = {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: string;
};

const emptyForm: CustomerForm = {
  name: '',
  email: '',
  document: '',
  phone: '',
  address: '',
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

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/customers');
      const payload = response.data as unknown;

      // Supports both array payload and wrapped payloads like { value: [...] }.
      const data = Array.isArray(payload)
        ? payload
        : (payload as { value?: unknown[] }).value ?? [];

      setCustomers(data as Customer[]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar clientes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
  }, []);

  const openCreateModal = () => {
    setEditingCustomerId(null);
    setForm(emptyForm);
    setActionError('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setForm({
      name: customer.name ?? '',
      email: customer.email ?? '',
      document: customer.document ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
    });
    setActionError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCustomerId(null);
    setForm(emptyForm);
    setActionError('');
  };

  const handleChange = (field: keyof CustomerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.document.trim()) {
      setActionError('Nombre y documento son obligatorios.');
      return;
    }

    try {
      setSubmitting(true);
      setActionError('');

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        document: form.document.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (editingCustomerId === null) {
        await api.post('/customers', payload);
      } else {
        await api.put(`/customers/${editingCustomerId}`, payload);
      }

      await fetchCustomers();
      closeModal();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo guardar el cliente'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(`Eliminar cliente ${customer.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(customer.id);
      setActionError('');
      await api.delete(`/customers/${customer.id}`);
      await fetchCustomers();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo eliminar el cliente'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header className="premium-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="premium-kicker">Base comercial</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Clientes</h1>
            <p className="mt-2 text-sm text-slate-500">Grilla conectada al backend con CRUD.</p>
          </div>

          <button
            type="button"
            className="premium-button px-4 py-2 text-sm"
            onClick={openCreateModal}
          >
            Nuevo cliente
          </button>
        </div>
      </header>

      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-500">
          Cargando clientes...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {actionError}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Documento</th>
                  <th className="px-4 py-3 font-medium">Telefono</th>
                  <th className="px-4 py-3 font-medium">Direccion</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-100 text-slate-700 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">{customer.id}</td>
                    <td className="px-4 py-3">{customer.name || 'N/A'}</td>
                    <td className="px-4 py-3">{customer.email || 'N/A'}</td>
                    <td className="px-4 py-3">{customer.document || 'N/A'}</td>
                    <td className="px-4 py-3">{customer.phone || 'N/A'}</td>
                    <td className="px-4 py-3">{customer.address || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={() => openEditModal(customer)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer.id}
                        >
                          {deletingId === customer.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 ? (
            <div className="border-t border-slate-100 p-6 text-sm text-slate-500">
              No hay clientes registrados.
            </div>
          ) : null}
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <form
            className="premium-card w-full max-w-xl p-6"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCustomerId === null ? 'Nuevo cliente' : 'Editar cliente'}
              </h2>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-700">
                Nombre *
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                Documento *
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.document}
                  onChange={(e) => handleChange('document', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700 md:col-span-2">
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

              <label className="text-sm text-slate-700">
                Direccion
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </label>
            </div>

            {actionError ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="premium-button px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

export default Customers;
