import { createServerClient, type CookieOptions } from '@supabase/ssr';
const _c = null as unknown as { name: string; value: string; options: CookieOptions };
type CookieList = (typeof _c)[];
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/cards', '/transactions', '/bills', '/budgets', '/approvals', '/team', '/insights', '/billing', '/settings'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + '/'));
  if (!url || !key) {
    if (isProtected) return NextResponse.redirect(new URL('/login?e=The+service+is+temporarily+unavailable', request.url));
    return response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieList) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && isProtected) {
    const u = new URL('/login', request.url); u.searchParams.set('next', path);
    return NextResponse.redirect(u);
  }
  if (user && (path === '/login' || path === '/signup')) return NextResponse.redirect(new URL('/dashboard', request.url));
  return response;
}
