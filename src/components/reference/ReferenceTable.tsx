/**
 * ReferenceTable — programmatic data hub table.
 *
 * Matches the BenefitsUSA reference component pattern, with CoveredUSA brand
 * colors (teal). Supports optional status cells (yes/no badges) for state
 * matrices like Medicaid expansion status.
 */

export type ReferenceTableCell = string | { value: string; status?: 'yes' | 'no' };

interface ReferenceTableProps {
  caption: string;
  headers: string[];
  rows: ReferenceTableCell[][];
  footnote?: string;
  source?: string;
}

function renderCell(cell: ReferenceTableCell): React.ReactNode {
  if (typeof cell === 'string') return cell;
  if (cell.status === 'yes') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0f766e]">
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5 flex-shrink-0"
          aria-hidden="true"
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {cell.value}
      </span>
    );
  }
  if (cell.status === 'no') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#94a3b8]">
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5 flex-shrink-0"
          aria-hidden="true"
        >
          <path
            d="M5 5L11 11M11 5L5 11"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {cell.value}
      </span>
    );
  }
  return cell.value;
}

export function ReferenceTable({ caption, headers, rows, footnote, source }: ReferenceTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="px-4 py-3 text-left font-semibold text-[#0f172a] bg-[#f8fafc] border-b border-[#e2e8f0]">
            {caption}
          </caption>
          <thead>
            <tr className="bg-[#134e4a] border-b border-[#0f766e]">
              {headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 1 ? 'bg-[#f8fafc] border-b border-[#e2e8f0]' : 'bg-white border-b border-[#e2e8f0]'}
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-[#475569] whitespace-nowrap">
                    {renderCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(footnote || source) && (
        <div className="px-4 py-2 border-t border-[#e2e8f0] bg-[#f8fafc]">
          {footnote && <p className="text-xs text-[#64748b]">{footnote}</p>}
          {source && <p className="text-xs text-[#94a3b8] mt-1">Source: {source}</p>}
        </div>
      )}
    </div>
  );
}
