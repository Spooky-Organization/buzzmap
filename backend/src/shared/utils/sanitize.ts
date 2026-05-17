function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function sanitizePlainText(value: string): string {
  return normalizeWhitespace(stripTags(value));
}

export function sanitizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const sanitized = sanitizePlainText(value);
  return sanitized.length > 0 ? sanitized : '';
}

export function sanitizeStringArray(values: string[] | undefined): string[] | undefined {
  if (!values) return undefined;

  return values
    .map((value) => sanitizePlainText(value))
    .filter((value) => value.length > 0);
}
