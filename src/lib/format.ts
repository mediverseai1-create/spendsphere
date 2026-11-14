export const money = (cents: number | string | null | undefined) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cents ?? 0) / 100);
export const toCents = (v: FormDataEntryValue | null) => Math.round(Number(String(v ?? '').replace(/[$,\s]/g, '')) * 100);
export const dateFmt = (d: string) => new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const CATEGORIES = ['Software', 'Travel', 'Meals', 'Advertising', 'Office', 'Equipment', 'Contractors', 'Utilities', 'Other'];
export const monthStart = (d = new Date()) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
