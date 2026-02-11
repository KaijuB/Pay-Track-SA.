import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiFetch } from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/api/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('paytrack_token', data.token);
      router.push('/dashboard');
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
          <h1 className="text-2xl font-semibold">Login</h1>
          {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <span className="text-sm">Email</span>
              <input className="rounded border p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Password</span>
              <input className="rounded border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
