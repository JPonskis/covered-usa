const BASE_URL = 'https://coveredusa.org';

export function getAlternates(locale: string, path: string) {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      en: `${BASE_URL}/en${path}`,
      es: `${BASE_URL}/es${path}`,
    },
  };
}
