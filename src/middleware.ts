import { getSession } from 'auth-astro/server';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;
  const session = await getSession(context.request);

  // Populate locals for use in .astro files
  context.locals.user = session?.user as any;
  context.locals.role = (session?.user as any)?.role || null;

  // Protect Admin Routes
  if (url.pathname.startsWith('/admin')) {
    if (!session || context.locals.role !== 'admin') {
      return context.redirect('/login');
    }
  }

  // Prevent logged-in admins from seeing login page (skip for API auth)
  if (url.pathname === '/login' && session && context.locals.role === 'admin' && !url.pathname.startsWith('/api/auth')) {
    return context.redirect('/admin');
  }

  return next();
});
