'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient, hasSupabase } from '@/lib/supabase/server';

const back = (path: string, e: string): never => redirect(`${path}?e=${encodeURIComponent(e)}`);
const creds = z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(8, 'Password must be at least 8 characters') });

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;
}
function safeNext(n: FormDataEntryValue | null) { const s = String(n ?? ''); return s.startsWith('/') && !s.startsWith('//') ? s : '/dashboard'; }

export async function signIn(fd: FormData) {
  if (!hasSupabase()) back('/login', 'Supabase is not configured');
  const p = creds.safeParse({ email: fd.get('email'), password: fd.get('password') });
  if (!p.success) back('/login', p.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(p.data!);
  if (error) back('/login', error.message);
  redirect(safeNext(fd.get('next')));
}

export async function signUp(fd: FormData) {
  if (!hasSupabase()) back('/signup', 'Supabase is not configured');
  const p = creds.extend({ name: z.string().trim().min(2, 'Enter your name'), company: z.string().trim().min(2, 'Enter your company name') })
    .safeParse({ email: fd.get('email'), password: fd.get('password'), name: fd.get('name'), company: fd.get('company') });
  if (!p.success) back('/signup', p.error.issues[0].message);
  const d = p.data!;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: d.email, password: d.password,
    options: { data: { full_name: d.name, company: d.company }, emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) back('/signup', error.message);
  if (!data?.session) redirect('/login?ok=' + encodeURIComponent('Check your email to confirm your account, then sign in.'));
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function requestReset(fd: FormData) {
  const email = z.string().trim().email().safeParse(fd.get('email'));
  if (!email.success) back('/forgot-password', 'Enter a valid email');
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data!, { redirectTo: `${await origin()}/auth/callback?next=/reset-password` });
  // Same response whether or not the account exists.
  redirect('/forgot-password?ok=' + encodeURIComponent('If that email has an account, a reset link is on its way.'));
}

export async function updatePassword(fd: FormData) {
  const pw = z.string().min(8, 'Password must be at least 8 characters').safeParse(fd.get('password'));
  if (!pw.success) back('/reset-password', pw.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.data! });
  if (error) back('/reset-password', error.message);
  redirect('/dashboard');
}
