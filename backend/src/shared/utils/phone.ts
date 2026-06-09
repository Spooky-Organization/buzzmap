function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizePhoneNumber(
  value: string | null | undefined
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  let normalized = digitsOnly(value);
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  }

  if (normalized.length === 9 && /^(1|7)/.test(normalized)) {
    return `254${normalized}`;
  }

  if (normalized.length === 10 && normalized.startsWith('0') && /^(1|7)/.test(normalized[1] ?? '')) {
    return `254${normalized.slice(1)}`;
  }

  return normalized;
}

export function getPhoneLookupVariants(value: string): string[] {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) {
    return [];
  }

  const variants = new Set<string>([normalized]);

  if (normalized.startsWith('254') && normalized.length === 12) {
    variants.add(normalized.slice(3));
    variants.add(`0${normalized.slice(3)}`);
  }

  if (normalized.length === 10 && normalized.startsWith('0')) {
    variants.add(normalized.slice(1));
  }

  if (normalized.length === 9 && /^(1|7)/.test(normalized)) {
    variants.add(`0${normalized}`);
    variants.add(`254${normalized}`);
  }

  return Array.from(variants);
}
