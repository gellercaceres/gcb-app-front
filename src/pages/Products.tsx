import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

type ProductStatus = 'ACTIVE' | 'INACTIVE';

type Product = {
  id: number;
  name: string;
  barcode: string;
  categoryId: number | null;
  description: string | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  storeId: number;
};

type Category = {
  id: number;
  name: string;
};

type ProductForm = {
  name: string;
  barcode: string;
  categoryId: string;
  description: string;
  purchasePrice: string;
  salePrice: string;
  stock: string;
  minStock: string;
  status: ProductStatus;
};

const emptyForm: ProductForm = {
  name: '',
  barcode: '',
  categoryId: '',
  description: '',
  purchasePrice: '0',
  salePrice: '0',
  stock: '0',
  minStock: '0',
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

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/products');
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? payload
        : (payload as { value?: unknown[] }).value ?? [];

      setProducts(data as Product[]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar productos'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const payload = response.data as unknown;
      const data = Array.isArray(payload)
        ? payload
        : (payload as { value?: unknown[] }).value ?? [];

      setCategories(data as Category[]);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudieron cargar categorias'));
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingProductId(null);
    setForm(emptyForm);
    setActionError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name ?? '',
      barcode: product.barcode ?? '',
      categoryId: product.categoryId === null ? '' : String(product.categoryId),
      description: product.description ?? '',
      purchasePrice: String(product.purchasePrice ?? 0),
      salePrice: String(product.salePrice ?? 0),
      stock: String(product.stock ?? 0),
      minStock: String(product.minStock ?? 0),
      status: product.status ?? 'ACTIVE',
    });
    setActionError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingProductId(null);
    setForm(emptyForm);
    setActionError('');
  };

  const handleChange = (field: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.barcode.trim()) {
      setActionError('Nombre y codigo de barras son obligatorios.');
      return;
    }

    try {
      setSubmitting(true);
      setActionError('');

      const payload = {
        name: form.name.trim(),
        barcode: form.barcode.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        description: form.description.trim() || null,
        purchasePrice: Number(form.purchasePrice),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        status: form.status,
      };

      if (editingProductId === null) {
        await api.post('/products', payload);
      } else {
        await api.put(`/products/${editingProductId}`, payload);
      }

      await fetchProducts();
      closeModal();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo guardar el producto'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Eliminar producto ${product.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setActionError('');
      await api.delete(`/products/${product.id}`);
      await fetchProducts();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo eliminar el producto'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header className="premium-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="premium-kicker">Catalogo comercial</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Productos</h1>
            <p className="mt-2 text-sm text-slate-500">Grilla conectada al backend con CRUD.</p>
          </div>

          <button
            type="button"
            className="premium-button px-4 py-2 text-sm"
            onClick={openCreateModal}
          >
            Nuevo producto
          </button>
        </div>
      </header>

      {loading ? (
        <div className="premium-card p-6 text-sm text-slate-500">Cargando productos...</div>
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
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Codigo</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Precio compra</th>
                  <th className="px-4 py-3 font-medium">Precio venta</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 text-slate-700 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-900">{product.id}</td>
                    <td className="px-4 py-3">{product.name || 'N/A'}</td>
                    <td className="px-4 py-3">{product.barcode || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {categories.find((category) => category.id === product.categoryId)?.name ?? 'Sin categoria'}
                    </td>
                    <td className="px-4 py-3">S/ {Number(product.purchasePrice).toFixed(2)}</td>
                    <td className="px-4 py-3">S/ {Number(product.salePrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          product.stock <= product.minStock
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          product.status === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={() => openEditModal(product)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 ? (
            <div className="border-t border-slate-100 p-6 text-sm text-slate-500">
              No hay productos registrados.
            </div>
          ) : null}
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
          <form className="premium-card w-full max-w-2xl p-6" onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingProductId === null ? 'Nuevo producto' : 'Editar producto'}
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
                Codigo de barras *
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700 md:col-span-2">
                Descripcion
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700 md:col-span-2">
                Categoria
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                >
                  <option value="">Sin categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-700">
                Precio de compra
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                Precio de venta
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                Stock
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700">
                Stock minimo
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.minStock}
                  onChange={(e) => handleChange('minStock', e.target.value)}
                />
              </label>

              <label className="text-sm text-slate-700 md:col-span-2">
                Estado
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value as ProductStatus)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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

export default Products;
