import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentTable from '../components/PaymentTable';
import LetterModal from '../components/LetterModal';
import { RiskLineChart, StatusBarChart } from '../components/Chart';
import { apiFetch, getToken } from '../lib/api';

function downloadCsv(filename, rows) {
  const header = ['full_name','id_number','month','amount_due','amount_paid','status','date_paid'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(header.map((k) => {
      const v = r[k] ?? '';
      const s = String(v).replace(/"/g, '""');
      return s.includes(',') ? `"${s}"` : s;
    }).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedConsumerId, setSelectedConsumerId] = useState(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterText, setLetterText] = useState('');

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const out = await apiFetch('/api/dashboard');
      setData(out);
      if (!selectedConsumerId && out.consumers?.[0]?.id) setSelectedConsumerId(out.consumers[0].id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPayments = useMemo(() => {
    if (!data?.payments) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.payments;
    return data.payments.filter((p) =>
      String(p.full_name).toLowerCase().includes(q) || String(p.id_number).toLowerCase().includes(q)
    );
  }, [data, search]);

  const selectedRisk = useMemo(() => {
    if (!data?.riskHistory || !selectedConsumerId) return [];
    return data.riskHistory
      .filter((r) => Number(r.consumer_id) === Number(selectedConsumerId))
      .map((r) => ({ month: r.month, score: r.score }));
  }, [data, selectedConsumerId]);

  async function generateLetter(consumer_id) {
    setError(null);
    try {
      const out = await apiFetch('/api/generate_letter', { method: 'POST', body: { consumer_id } });
      setLetterText(out.letter);
      setLetterOpen(true);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar authed />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex gap-2">
            <button className="rounded border px-3 py-2 text-sm" onClick={() => router.push('/upload')}>Upload CSV</button>
            <button className="rounded border px-3 py-2 text-sm" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
            <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={() => downloadCsv('paytrack-export.csv', filteredPayments)}>Export CSV</button>
          </div>
        </div>

        {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!data && !error && (
          <div className="mt-6 rounded bg-white p-6">Loading…</div>
        )}

        {data && (
          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 rounded bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Risk overview</h2>
                  <p className="text-sm text-gray-600">Select a consumer to view risk score history (0–1000).</p>
                </div>
                <select className="rounded border p-2 text-sm" value={selectedConsumerId || ''} onChange={(e) => setSelectedConsumerId(e.target.value)}>
                  {data.consumers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} — {c.id_number} (score {c.latest_score ?? 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <RiskLineChart data={selectedRisk} />
            </div>

            <div className="grid gap-4 rounded bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold">Payment status distribution</h2>
                <p className="text-sm text-gray-600">Paid vs Late vs Missed from uploaded payment records.</p>
              </div>
              <StatusBarChart payments={data.payments} />
            </div>

            <div className="rounded bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Payments & Risk</h2>
                <input
                  className="w-full rounded border p-2 text-sm sm:w-72"
                  placeholder="Search by consumer name or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <PaymentTable rows={filteredPayments} onGenerateLetter={generateLetter} />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Letters are blocked if the consumer's POPIA consent_flag is false.
              </p>
            </div>
          </div>
        )}
      </main>

      <LetterModal open={letterOpen} onClose={() => setLetterOpen(false)} letter={letterText} />
      <Footer />
    </div>
  );
}
