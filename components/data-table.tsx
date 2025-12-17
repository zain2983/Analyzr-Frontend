interface DataTableProps {
  headers: string[]
  rows: string[][]
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-zinc-800">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-zinc-800/50">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 text-sm text-zinc-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
