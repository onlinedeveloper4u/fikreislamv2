/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { id: string; name: string; email: string; role: string } | null;
    role: string | null;
  }
}
