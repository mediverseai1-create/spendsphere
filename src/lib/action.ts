import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

/** Run a server action body; on error redirect back with ?e=message, on success redirect with ?ok=message. */
export async function run(path: string, ok: string, fn: () => Promise<void>) {
  try { await fn(); } catch (err) {
    if (isRedirectError(err)) throw err;
    const msg = err instanceof Error ? err.message : 'Something went wrong';
    redirect(`${path}${path.includes('?') ? '&' : '?'}e=${encodeURIComponent(msg)}`);
  }
  redirect(`${path}${path.includes('?') ? '&' : '?'}ok=${encodeURIComponent(ok)}`);
}
export const fail = (m: string): never => { throw new Error(m); };
