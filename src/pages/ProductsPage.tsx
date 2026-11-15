import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Product } from '../types/crm';
import { formatCurrency } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const ProductsPage: React.FC = () => {
  const { dataset, addProduct, updateProduct, deleteProduct } = useCrm();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | Product['category']>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<Product['category']>('Platform');
  const [unitPrice, setUnitPrice] = useState('12000');
  const [billingCycle, setBillingCycle] = useState<Product['billingCycle']>('Annual');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  const currency = dataset.preferences.currency;

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (q && !`${p.name} ${p.sku} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [dataset.products, categoryFilter, search]);

  const openForm = (prod?: Product) => {
    if (prod) {
      setEditing(prod);
      setName(prod.name);
      setSku(prod.sku);
      setCategory(prod.category);
      setUnitPrice(String(prod.unitPrice));
      setBillingCycle(prod.billingCycle);
      setActive(prod.active);
      setDescription(prod.description);
    } else {
      setEditing(null);
      setName('');
      setSku('NX-NEW-001');
      setCategory('Platform');
      setUnitPrice('12000');
      setBillingCycle('Annual');
      setActive(true);
      setDescription('');
    }
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      sku: sku.trim() || 'NX-SKU',
      category,
      unitPrice: Math.max(0, Number(unitPrice) || 0),
      billingCycle,
      active,
      description: description.trim(),
    };
    if (editing) updateProduct(editing.id, payload);
    else addProduct(payload);
    setFormOpen(false);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredProducts.length} SKUs available for deal quotes and order forms
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['All', 'Platform', 'Analytics', 'Security', 'Services', 'Add-on'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or name..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((prod) => {
          const dealCount = dataset.dealProducts.filter((dp) => dp.productId === prod.id).length;
          return (
            <div
              key={prod.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] font-medium text-slate-400">
                      {prod.sku} · {prod.category}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {prod.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openForm(prod)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(prod)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-[#FF6155]/10 hover:text-[#FF6155]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {prod.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                <div>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(prod.unitPrice, currency)}
                  </span>
                  <span className="text-slate-400"> / {prod.billingCycle}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                  {dealCount} deals · {prod.active ? 'Active' : 'Archived'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium">Product Name *</label>
              <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">SKU</label>
              <input className={inputCls} value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as Product['category'])}>
                <option value="Platform">Platform</option>
                <option value="Analytics">Analytics</option>
                <option value="Security">Security</option>
                <option value="Services">Services</option>
                <option value="Add-on">Add-on</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Unit Price ($)</label>
              <input type="number" className={inputCls} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Billing Cycle</label>
              <select className={inputCls} value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as Product['billingCycle'])}>
                <option value="Annual">Annual</option>
                <option value="Monthly">Monthly</option>
                <option value="One-Time">One-Time</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Description</label>
            <textarea rows={2} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#0AA6AD]" />
            <span>Active in sales quotes</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              {editing ? 'Save Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteProduct(deleteTarget.id);
        }}
        title="Delete Product?"
        message={deleteTarget ? `Remove "${deleteTarget.name}" from the product catalog?` : ''}
        confirmLabel="Delete Product"
      />
    </div>
  );
};
