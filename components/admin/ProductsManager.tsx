"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { formatINR } from "@/lib/format";

type Draft = {
  name: string;
  category: string;
  price: string;
  stock_qty: string;
  weight_variant: string;
  image_url: string;
  active: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  category: CATEGORIES[0].name,
  price: "",
  stock_qty: "",
  weight_variant: "",
  image_url: "",
  active: true,
});

export default function ProductsManager({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const visible =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const upsertLocal = (p: Product) =>
    setProducts((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      return exists
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [...prev, p];
    });

  const toggleActive = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) {
      const { product } = await res.json();
      upsertLocal(product);
    }
  };

  const updateStock = async (p: Product, stock_qty: number) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock_qty }),
    });
    if (res.ok) {
      const { product } = await res.json();
      upsertLocal(product);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-bold">Products</h1>
        <span className="text-sm text-muted">({products.length})</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCreating(true)}
          className="ml-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white"
        >
          + Add product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Stock</th>
              <th className="px-3 py-2 font-medium">Active</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} className="border-t border-line align-middle">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-surface">
                      {p.image_url && (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{p.name}</p>
                      <p className="text-[11px] text-muted">{p.weight_variant}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">{p.category}</td>
                <td className="px-3 py-2 font-medium">{formatINR(p.price)}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    defaultValue={p.stock_qty}
                    min={0}
                    onBlur={(e) => {
                      const v = Math.max(0, Math.floor(Number(e.target.value)));
                      if (v !== p.stock_qty) updateStock(p, v);
                    }}
                    className={`w-16 rounded border px-2 py-1 text-sm ${
                      p.stock_qty <= 5
                        ? "border-amber-300 bg-amber-50"
                        : "border-line"
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`relative h-5 w-9 rounded-full transition ${
                      p.active ? "bg-brand-600" : "bg-slate-300"
                    }`}
                    aria-label="Toggle active"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                        p.active ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductModal
          product={editing}
          busy={busy}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={async (draft) => {
            setBusy(true);
            const url = editing
              ? `/api/admin/products/${editing.id}`
              : "/api/admin/products";
            const res = await fetch(url, {
              method: editing ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...draft,
                price: Number(draft.price),
                stock_qty: Number(draft.stock_qty),
              }),
            });
            setBusy(false);
            if (res.ok) {
              const { product } = await res.json();
              upsertLocal(product);
              setCreating(false);
              setEditing(null);
            } else {
              const { error } = await res.json();
              alert(error || "Save failed");
            }
          }}
        />
      )}
    </>
  );
}

function ProductModal({
  product,
  busy,
  onClose,
  onSave,
}: {
  product: Product | null;
  busy: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          stock_qty: String(product.stock_qty),
          weight_variant: product.weight_variant,
          image_url: product.image_url,
          active: product.active,
        }
      : emptyDraft()
  );

  const set = (k: keyof Draft, v: string | boolean) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const valid = draft.name.trim() && Number(draft.price) >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-2xl">
        <h2 className="mb-3 text-base font-bold">
          {product ? "Edit product" : "Add product"}
        </h2>
        <div className="space-y-3">
          <Input label="Name" value={draft.name} onChange={(v) => set("name", v)} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Category</span>
            <select
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              className={fieldCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              value={draft.price}
              onChange={(v) => set("price", v)}
            />
            <Input
              label="Stock qty"
              type="number"
              value={draft.stock_qty}
              onChange={(v) => set("stock_qty", v)}
            />
          </div>
          <Input
            label="Weight / variant"
            value={draft.weight_variant}
            onChange={(v) => set("weight_variant", v)}
          />
          <Input
            label="Image URL"
            value={draft.image_url}
            onChange={(v) => set("image_url", v)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Active (visible on storefront)
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            disabled={!valid || busy}
            onClick={() => onSave(draft)}
            className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300";

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldCls}
      />
    </label>
  );
}
