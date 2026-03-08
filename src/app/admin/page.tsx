"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Bike {
  id: string;
  show: boolean;
  sold: boolean;
  pending: boolean;
  ownerName: string;
  ownerPhone: string;
  ranking: number;
  statusChangedAt: string;
  title: string;
  description: string;
  specs: { label: string; value: string }[];
  originalPrice: string;
  price: string;
  year: string;
  mainImage: string;
  gallery: string[];
  slug: string;
  background: string;
  foreground: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Bike | null>(null);
  const [adding, setAdding] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const fetchBikes = useCallback(async () => {
    const res = await fetch("/api/bikes");
    const data = await res.json();
    setBikes(data);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) fetchBikes();
  }, [token, fetchBikes]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem("admin_token", t);
    } else {
      setError("Wrong password");
    }
  }

  async function toggleField(bike: Bike, field: "sold" | "show") {
    const res = await fetch("/api/bikes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: bike.id, [field]: !bike[field] }),
    });
    if (res.ok) fetchBikes();
  }

  async function deleteBike(id: string) {
    if (!confirm("Are you sure you want to delete this bike?")) return;
    const res = await fetch(`/api/bikes?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchBikes();
  }

  async function approveBike(bike: Bike) {
    const res = await fetch("/api/bikes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: bike.id, pending: false, show: true }),
    });
    if (res.ok) fetchBikes();
  }

  async function saveBike(bike: Partial<Bike>) {
    const method = bike.id ? "PUT" : "POST";
    const res = await fetch("/api/bikes", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bike),
    });
    if (res.ok) {
      setEditing(null);
      setAdding(false);
      fetchBikes();
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords don't match");
      return;
    }
    const res = await fetch("/api/auth", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) {
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem("admin_token", t);
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setPasswordMsg("Password updated!");
      setTimeout(() => setPasswordMsg(""), 3000);
    } else {
      const data = await res.json();
      setPasswordMsg(data.error || "Failed to update password");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-8 w-full max-w-sm"
        >
          <h1 className="text-xl font-bold mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-black border border-[var(--card-border)] rounded px-4 py-2 mb-4 focus:outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[var(--accent)] text-black font-semibold py-2 rounded hover:brightness-110 transition"
          >
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[var(--muted)] hover:text-white transition-colors"
            >
              View Site
            </Link>
            <h1 className="text-lg font-bold">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-sm text-[var(--muted)] hover:text-white transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin_token");
                setToken(null);
              }}
              className="text-sm text-[var(--muted)] hover:text-white transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {passwordMsg && !showPasswordChange && (
          <div className="mb-4 text-sm text-green-400">{passwordMsg}</div>
        )}

        {showPasswordChange && (
          <form
            onSubmit={handlePasswordChange}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 mb-6 max-w-sm space-y-3"
          >
            <h3 className="font-bold">Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            {passwordMsg && (
              <p className="text-red-400 text-sm">{passwordMsg}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[var(--accent)] text-black font-semibold px-4 py-2 rounded text-sm hover:brightness-110 transition"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordMsg("");
                }}
                className="text-[var(--muted)] hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            Bikes ({bikes.length})
          </h2>
          <button
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            className="bg-[var(--accent)] text-black font-semibold px-4 py-2 rounded text-sm hover:brightness-110 transition"
          >
            + Add Bike
          </button>
        </div>

        {(editing || adding) && (
          <BikeForm
            bike={editing}
            onSave={saveBike}
            onCancel={() => {
              setEditing(null);
              setAdding(false);
            }}
          />
        )}

        {/* Pending Submissions */}
        {bikes.some((b) => b.pending) && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500" />
              Pending Review ({bikes.filter((b) => b.pending).length})
            </h3>
            <div className="space-y-2">
              {bikes
                .filter((b) => b.pending)
                .map((bike) => (
                  <div
                    key={bike.id}
                    className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {bike.title}
                          <span className="ml-2 text-xs text-yellow-400">
                            submitted by {bike.ownerName}
                            {bike.ownerPhone && ` (${bike.ownerPhone})`}
                          </span>
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-1">
                          {bike.price} &middot; {bike.year || "No year"}
                        </p>
                        {bike.description && (
                          <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">
                            {bike.description}
                          </p>
                        )}
                        {bike.specs.length > 0 && (
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {bike.specs.length} specs provided
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approveBike(bike)}
                          className="text-xs px-3 py-1.5 rounded-full font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setEditing(bike);
                            setAdding(false);
                          }}
                          className="text-xs text-[var(--muted)] hover:text-white px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBike(bike.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Active Bikes */}
        <div className="space-y-2">
          {bikes
            .filter((b) => !b.pending)
            .map((bike) => (
              <div
                key={bike.id}
                className={`flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 ${
                  !bike.show ? "opacity-40" : ""
                }`}
              >
                <div className="relative w-16 h-12 shrink-0 rounded overflow-hidden bg-black">
                  {bike.mainImage && (
                    <Image
                      src={bike.mainImage}
                      alt={bike.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {bike.title}
                    {bike.ownerName && (
                      <span className="ml-2 text-xs text-purple-400">
                        ({bike.ownerName})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {bike.price || "No price"} &middot;{" "}
                    {bike.year || "No year"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleField(bike, "sold")}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      bike.sold
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {bike.sold ? "Sold" : "Available"}
                  </button>
                  <button
                    onClick={() => toggleField(bike, "show")}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      bike.show
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {bike.show ? "Visible" : "Hidden"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(bike);
                      setAdding(false);
                    }}
                    className="text-xs text-[var(--muted)] hover:text-white px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBike(bike.id)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function BikeForm({
  bike,
  onSave,
  onCancel,
}: {
  bike: Bike | null;
  onSave: (bike: Partial<Bike>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: bike?.id || "",
    title: bike?.title || "",
    description: bike?.description || "",
    price: bike?.price || "",
    originalPrice: bike?.originalPrice || "",
    year: bike?.year || "",
    ranking: bike?.ranking || 0,
    mainImage: bike?.mainImage || "",
    slug: bike?.slug || "",
    specs: JSON.stringify(bike?.specs || [], null, 2),
    gallery: JSON.stringify(bike?.gallery || [], null, 2),
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let specs: { label: string; value: string }[] = [];
    let gallery: string[] = [];
    try {
      specs = JSON.parse(form.specs);
    } catch {
      /* keep empty */
    }
    try {
      gallery = JSON.parse(form.gallery);
    } catch {
      /* keep empty */
    }
    onSave({
      ...(form.id ? { id: form.id } : {}),
      title: form.title,
      description: form.description,
      price: form.price,
      originalPrice: form.originalPrice,
      year: form.year,
      ranking: Number(form.ranking),
      mainImage: form.mainImage,
      slug: form.slug,
      specs,
      gallery,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-6 mb-6 space-y-4"
    >
      <h3 className="font-bold text-lg">
        {bike ? "Edit Bike" : "Add New Bike"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
        />
        <Field
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="auto-generated from title if empty"
        />
        <Field
          label="Price"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="$1,250"
        />
        <Field
          label="Original Price"
          name="originalPrice"
          value={form.originalPrice}
          onChange={handleChange}
          placeholder="$4,800"
        />
        <Field
          label="Year"
          name="year"
          value={form.year}
          onChange={handleChange}
        />
        <Field
          label="Ranking"
          name="ranking"
          value={String(form.ranking)}
          onChange={handleChange}
          type="number"
        />
        <Field
          label="Main Image Path"
          name="mainImage"
          value={form.mainImage}
          onChange={handleChange}
          placeholder="/images/bikes/..."
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--muted)] mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--muted)] mb-1">
          Specs (JSON)
        </label>
        <textarea
          name="specs"
          value={form.specs}
          onChange={handleChange}
          rows={4}
          className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--muted)] mb-1">
          Gallery (JSON array of paths)
        </label>
        <textarea
          name="gallery"
          value={form.gallery}
          onChange={handleChange}
          rows={3}
          className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-[var(--accent)] text-black font-semibold px-4 py-2 rounded text-sm hover:brightness-110 transition"
        >
          {bike ? "Save Changes" : "Add Bike"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[var(--muted)] hover:text-white px-4 py-2 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-[var(--muted)] mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-black border border-[var(--card-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}
