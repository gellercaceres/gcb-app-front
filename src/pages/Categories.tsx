import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

type Category = {
  id: number;
  storeId: number;
  name: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
};

type CategoryForm = {
  storeId: string;
  name: string;
  status: CategoryStatus;
};

const emptyForm: CategoryForm = {
  storeId: '3',
  name: '',
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

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/categories');
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? payload
        : (payload as { value?: unknown[] }).value ?? [];

      setCategories(data as Category[]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar categorias'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setForm(emptyForm);
    setActionError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setForm({
      storeId: String(category.storeId ?? 3),
      name: category.name ?? '',
      status: category.status ?? 'ACTIVE',
    });
    setActionError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategoryId(null);
    setForm(emptyForm);
    setActionError('');
  };

  const handleChange = (field: keyof CategoryForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setActionError('El nombre de la categoria es obligatorio.');
      return;
    }

    try {
      setSubmitting(true);
      setActionError('');

      const nowIso = new Date().toISOString();
      const payload = {
        storeId: Number(form.storeId),
        name: form.name.trim(),
        status: form.status,
        updatedAt: nowIso,
        createdAt: nowIso,
      };

      if (editingCategoryId === null) {
        await api.post('/categories', payload);
      } else {
        await api.put(`/categories/${editingCategoryId}`, payload);
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo guardar la categoria'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(`Eliminar categoria ${category.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setActionError('');
      await api.delete(`/categories/${category.id}`);
      await fetchCategories();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo eliminar la categoria'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header className="premium-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="premium-kicker">Catalogo maestro</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Categorias</h1>
            <p className="mt-2 text-sm text-slate-500">Grilla conectada al backend con CRUD.</p>
          </div>

          <button
            type="button"
            className="premium-button px-4 py-2 text-sm"
            onClick={openCreateModal}
          >
            Nueva categoria
          </button>
        </div>
      </header>

      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-500">Cargando categorias...</div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
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
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Actualizado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t border-slate-100 text-slate-700 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">{category.id}</td>
                    <td className="px-4 py-3">{category.storeId}</td>
                    <td className="px-4 py-3">{category.name || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          category.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {category.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(category.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={() => openEditModal(category)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id}
                        >
                          {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 ? (
            <div className="border-t border-slate-100 p-6 text-sm text-slate-500">
              No hay categorias registradas.
            </div>
          ) : null}
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <form className="premium-card w-full max-w-xl p-6" onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingCategoryId === null ? 'Nueva categoria' : 'Editar categoria'}
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
                Store ID
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.storeId}
                  onChange={(e) => handleChange('storeId', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                Estado
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value as CategoryStatus)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </label>

              <label className="text-sm text-slate-700 md:col-span-2">
                Nombre *
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
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

export default Categories;
