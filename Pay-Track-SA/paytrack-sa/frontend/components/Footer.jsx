export default function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-5xl px-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} PayTrack SA (MVP Beta). POPIA-aware processing: consent required for consumer data.</p>
      </div>
    </footer>
  );
}
