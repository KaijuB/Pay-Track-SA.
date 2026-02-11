import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiFetch, getToken } from '../lib/api';

const requiredKeys = [
  { key: 'id_number', label: 'ID Number' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'month', label: 'Month (YYYY-MM)' },
  { key: 'amount_due', label: 'Amount Due' },
  { key: 'amount_paid', label: 'Amount Paid' },
];

const optionalKeys = [
  { key: 'date_paid', label: 'Date Paid' },
  { key: 'contact_email', label: 'Contact Email' },
  { key: 'contact_phone', label: 'Contact Phone' },
];

function parseHeaders(text) {
  const firstLine = text.split(/\r?\n/)[0] || '';
  // naive CSV header parsing (good enough for MVP)
  return firstLine.split(',').map((h) => h.replace(/^"|"$/g, '').trim()).filter(Boolean);
}

export default function Upload() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [consent, setConsent] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  const allKeys = useMemo(() => [...requiredKeys, ...optionalKeys], []);

  async function onFileSelected(f) {
    setMsg(null);
    setError(null);
    setFile(f);
    const text = await f.text();
    const hdrs = parseHeaders(text);
    setHeaders(hdrs);
    const initial = {};
    for (const k of allKeys) {
      // best-effort auto-map
      const guess = hdrs.find((h) => h.toLowerCase().includes(k.key.replace('_', ' ')) || h.toLowerCase() === k.key);
      if (guess) initial[k.key] = guess;
    }
    setMapping(initial);
  }

  async function submit() {
    setError(null);
    setMsg(null);
    if (!file) return setError('Please choose a CSV file.');
    for (const rk of requiredKeys) {
      if (!mapping[rk.key]) return setError(`Please map required column: ${rk.label}`);
    }
    if (!consent) return setError('You must confirm POPIA consent before uploading.');

    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('mapping', JSON.stringify(mapping));
      form.append('consent_confirmed', 'true');

      const data = await apiFetch('/api/upload_csv', { method: 'POST', body: form, isForm: true });
      setMsg(`Uploaded ${data.rows} rows. Updated risk scores for ${data.recomputed.length} consumers.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar authed />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">CSV Upload</h1>
          <p className="mt-1 text-sm text-gray-600">Upload CSV and map columns to: ID, Name, Month, Amount Due, Amount Paid (and optional fields).</p>

          {msg && <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{msg}</div>}
          {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="mt-6 grid gap-4">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
            />

            {headers.length > 0 && (
              <div className="grid gap-4">
                <div className="grid gap-3 rounded border p-4">
                  <h2 className="font-semibold">Map columns</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {allKeys.map((k) => (
                      <label key={k.key} className="grid gap-1">
                        <span className="text-sm">{k.label}{requiredKeys.find(r => r.key === k.key) ? ' *' : ''}</span>
                        <select
                          className="rounded border p-2"
                          value={mapping[k.key] || ''}
                          onChange={(e) => setMapping((m) => ({ ...m, [k.key]: e.target.value }))}
                        >
                          <option value="">(not mapped)</option>
                          {headers.map((h) => <option key={`${k.key}-${h}`} value={h}>{h}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex gap-2 rounded border bg-amber-50 p-4 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>
                    I confirm <strong>POPIA consent</strong> has been obtained for all consumers included in this upload.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-60" onClick={submit}>
                    {loading ? 'Uploading…' : 'Upload & Calculate Risk'}
                  </button>
                  <button className="rounded border px-4 py-2" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
                </div>

                <div className="rounded border bg-gray-50 p-4 text-sm">
                  <p className="font-semibold">Expected CSV columns</p>
                  <p className="mt-1 text-gray-600">At minimum: ID Number, Full Name, Month, Amount Due, Amount Paid, Date Paid (optional).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
