export default function LetterModal({ open, onClose, letter }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Warning Letter</h2>
          <button className="rounded border px-2 py-1 hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
        <textarea
          className="mt-3 h-96 w-full rounded border p-2 font-mono text-xs"
          value={letter || ''}
          readOnly
        />
        <div className="mt-3 flex gap-2">
          <button
            className="rounded bg-black px-3 py-2 text-sm text-white"
            onClick={() => {
              navigator.clipboard.writeText(letter || '');
            }}
          >
            Copy
          </button>
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => {
              const blob = new Blob([letter || ''], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'paytrack-letter.txt';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download .txt
          </button>
        </div>
      </div>
    </div>
  );
}
