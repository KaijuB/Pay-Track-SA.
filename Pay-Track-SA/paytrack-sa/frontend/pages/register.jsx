import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiFetch } from '../lib/api';

const TYPES = ['Rental', 'School', 'Gym', 'SME'];

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', type: 'Rental', email: '', password: '', consent_flag: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = router.query.type;
    if (t && TYPES.includes(t)) setForm((f) => ({ ...f, type: t }));
  }, [router.query.type]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/api/register_org', { method: 'POST', body: form });
      localStorage.setItem('paytrack_token', data.token);
      router.push('/upload');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar authed={false} />
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="rounded bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Register your organization</h1>
          <p className="mt-1 text-sm text-gray-600">Create an account to upload payments and view dashboards.</p>

          {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <span className="text-sm">Organization name</span>
              <input className="rounded border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Type</span>
              <select className="rounded border p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Email</span>
              <input className="rounded border p-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Password</span>
              <input className="rounded border p-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              <span className="text-xs text-gray-500">Minimum 8 characters.</span>
            </label>

            <label className="flex gap-2 rounded border bg-gray-50 p-3 text-sm">
              <input type="checkbox" checked={form.consent_flag} onChange={(e) => setForm({ ...form, consent_flag: e.target.checked })} />
              <span>
                I confirm I understand POPIA obligations and will only process consumer personal information where lawful and with appropriate consent.
              </span>
            </label>

            <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
