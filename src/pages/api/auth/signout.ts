import type { APIRoute } from "astro";

const clearCookies = (cookies: any) => {
  cookies.delete("authjs.session-token", { path: "/" });
  cookies.delete("__Secure-authjs.session-token", { path: "/" });
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
};

export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearCookies(cookies);
  return redirect("/login");
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  clearCookies(cookies);
  return redirect("/login");
};
