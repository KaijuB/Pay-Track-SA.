import Link from 'next/link';

export default function Navbar({ authed }) {
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">PayTrack SA</Link>
        <nav className="flex gap-4 text-sm">
          {authed ? (
            <>
              <Link href="/upload" className="hover:underline">Upload CSV</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <button
                className="rounded border px-2 py-1 hover:bg-gray-50"
                onClick={() => {
                  localStorage.removeItem('paytrack_token');
                  window.location.href = '/login';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="hover:underline">Register</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
