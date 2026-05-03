export function getInitials(name: string) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function formatDate(dateStr: string, locale: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getStageLabel(stage: number, t: any) {
  if (stage === 0) return t('initial_stage');
  if (stage === 1) return t('intermediate_stage');
  if (stage === 2) return t('final_stage');
  return 'N/A';
}
