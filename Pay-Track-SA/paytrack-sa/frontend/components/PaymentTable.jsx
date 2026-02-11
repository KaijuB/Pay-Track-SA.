export default function PaymentTable({ rows, onGenerateLetter }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="px-3 py-2">Consumer</th>
            <th className="px-3 py-2">ID Number</th>
            <th className="px-3 py-2">Month</th>
            <th className="px-3 py-2">Amount Due</th>
            <th className="px-3 py-2">Amount Paid</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.consumer_id}-${r.month}`} className="border-t">
              <td className="px-3 py-2">{r.full_name}</td>
              <td className="px-3 py-2">{r.id_number}</td>
              <td className="px-3 py-2">{r.month}</td>
              <td className="px-3 py-2">R{Number(r.amount_due).toFixed(2)}</td>
              <td className="px-3 py-2">R{Number(r.amount_paid).toFixed(2)}</td>
              <td className="px-3 py-2 font-medium">{r.status}</td>
              <td className="px-3 py-2">
                <button
                  className="rounded border px-2 py-1 hover:bg-gray-50"
                  onClick={() => onGenerateLetter(r.consumer_id)}
                >
                  Generate Letter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
