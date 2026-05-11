'use client';

import { useState, useEffect } from 'react';
import { findNearestClinics, NearbyClinic } from '@/lib/clinic-finder';

interface NearbyClinicsProps {
  zipCode: string;
  submissionId?: string;
  locale: string;
}

const SATELLITE_PATTERN =
  /\b(school|elementary|middle school|high school|academy|university|college|church|library|temple|synagogue|mosque)\b/i;

function trackClick(
  submissionId: string | undefined,
  clinic: NearbyClinic,
  zipCode: string,
  action: 'call' | 'directions' | 'website'
) {
  fetch('/api/clinic-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      submissionId: submissionId || null,
      clinicId: clinic.id,
      clinicName: clinic.orgName || clinic.name,
      action,
      zipCode,
    }),
  }).catch(() => {});
}

function formatOrgName(name: string): string {
  if (name === name.toUpperCase() && name.length > 3) {
    return name
      .replace(/\b\w+/g, (w) =>
        w.length <= 2 ? w.toLowerCase() : w[0] + w.slice(1).toLowerCase()
      )
      .replace(
        /\b(Inc|Llc|Of|The|And|For|In|At|Or)\b/g,
        (m) => m.toLowerCase()
      )
      .replace(/^./, (c) => c.toUpperCase());
  }
  return name;
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

function DirectionsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"
      />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

export default function NearbyClinics({
  zipCode,
  submissionId,
  locale,
}: NearbyClinicsProps) {
  const es = locale === 'es';
  const [clinics, setClinics] = useState<NearbyClinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const results = findNearestClinics(zipCode, 3).filter(
        (c) => c.distance <= 30
      );
      setClinics(results);
    } catch (err) {
      console.error('Failed to load clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [zipCode]);

  if (loading) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-2">
        {es ? 'Buscando clínicas cerca...' : 'Finding clinics near you...'}
      </p>
    );
  }

  if (clinics.length === 0) {
    return (
      <div>
        <p className="text-sm text-[var(--text-secondary)]">
          {es
            ? 'No se encontraron clínicas cercanas. '
            : 'No clinics found nearby. '}
          <a
            href="https://findahealthcenter.hrsa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] underline"
          >
            {es
              ? 'Busca una en findahealthcenter.hrsa.gov'
              : 'Find one at findahealthcenter.hrsa.gov'}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <LocationIcon className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-[15px] leading-tight">
            {es ? 'Clínicas Cerca de Ti' : 'Clinics Near You'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {es
              ? 'Centros de salud comunitarios que aceptan pacientes de Medicaid'
              : 'Community health centers that accept Medicaid patients'}
          </p>
        </div>
      </div>

      {/* Clinic cards */}
      <div className="space-y-3">
        {clinics.map((clinic) => {
          const fullAddress = `${clinic.addr}, ${clinic.city}, ${clinic.state} ${clinic.zip}`;
          const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
          const isSatellite = SATELLITE_PATTERN.test(clinic.name);
          const primaryName = clinic.orgName
            ? formatOrgName(clinic.orgName)
            : clinic.name;
          const subtitle =
            !isSatellite &&
            clinic.orgName &&
            clinic.name !== clinic.orgName
              ? clinic.name
              : null;

          return (
            <div
              key={clinic.id}
              className="bg-white border border-[var(--border)] rounded-xl px-5 py-4 hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] text-[15px] leading-snug">
                    {primaryName}
                  </p>
                  {subtitle && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {subtitle}
                    </p>
                  )}
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                    {fullAddress}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-medium whitespace-nowrap flex-shrink-0 mt-0.5">
                  {clinic.distance.toFixed(1)}{' '}
                  {es ? 'millas de distancia' : 'miles away'}
                </span>
              </div>

              {/* Action links */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-light)]">
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    onClick={() => trackClick(submissionId, clinic, zipCode, 'call')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {es ? 'Llamar' : 'Call'}
                  </a>
                )}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(submissionId, clinic, zipCode, 'directions')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                >
                  <DirectionsIcon className="w-4 h-4" />
                  {es ? 'Cómo Llegar' : 'Directions'}
                </a>
                {clinic.orgWeb && (
                  <a
                    href={clinic.orgWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(submissionId, clinic, zipCode, 'website')}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                  >
                    <GlobeIcon className="w-4 h-4" />
                    {es ? 'Sitio Web' : 'Website'}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution */}
      <p className="text-xs text-[var(--text-muted)] mt-4">
        {es
          ? 'Datos de clínicas de HRSA. La distancia es aproximada.'
          : 'Clinic data from HRSA. Distance is approximate.'}
      </p>
    </div>
  );
}
