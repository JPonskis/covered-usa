interface Source {
  text: string;
  url: string;
}

interface SourcesProps {
  sources: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div
      className="mt-10 rounded-xl px-6 py-5"
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#64748b' }}
      >
        Sources &amp; References
      </h2>
      <ol className="space-y-2">
        {sources.map((source, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#475569' }}>
            <span
              className="flex-shrink-0 font-medium tabular-nums"
              style={{ color: '#94a3b8', minWidth: '1.25rem' }}
            >
              {i + 1}.
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: '#1d4ed8' }}
            >
              {source.text}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
