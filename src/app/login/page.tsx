"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        setMessage(data.error || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI App Generator</p>
        <h1 className="mt-2 text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Access your generated apps and runtime data.</p>

        <div className="mt-6 grid gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-900"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-900"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Login
        </button>

        {message ? <p className="mt-4 text-sm text-rose-600">{message}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-slate-950 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
