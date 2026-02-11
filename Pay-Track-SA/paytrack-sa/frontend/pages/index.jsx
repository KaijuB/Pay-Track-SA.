import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar authed={false} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Stop losing money</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            PayTrack SA helps small organizations track customer/tenant payments, calculate risk scores, visualize trends, and generate POPIA-aware payment reminder letters.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/register?type=Rental" className="rounded border bg-white px-4 py-3 hover:bg-gray-50">Rental Agencies</Link>
            <Link href="/register?type=School" className="rounded border bg-white px-4 py-3 hover:bg-gray-50">Schools</Link>
            <Link href="/register?type=Gym" className="rounded border bg-white px-4 py-3 hover:bg-gray-50">Gyms</Link>
            <Link href="/register?type=SME" className="rounded border bg-white px-4 py-3 hover:bg-gray-50">SMEs</Link>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/register" className="rounded bg-black px-4 py-2 text-white">Get Started</Link>
            <Link href="/login" className="rounded border px-4 py-2">Login</Link>
          </div>
          <div className="mt-6 rounded border bg-amber-50 p-3 text-sm">
            <strong>POPIA compliance:</strong> You must record consumer consent before uploading or generating letters. The app will block processing where consent is missing.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
