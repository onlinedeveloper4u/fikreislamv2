import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';

export default defineConfig({
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log("Authorizing user:", credentials.email);
          // Dynamic imports to prevent top-level loading issues in middleware
          const { default: clientPromise } = await import('./src/lib/mongodb');
          const { default: bcrypt } = await import('bcryptjs');

          const client = await clientPromise;
          const db = client.db('fikreislam');
          const collection = db.collection('users');

          // Find user by email
          const user = await collection.findOne({ email: credentials.email as string });

          if (!user) {
            console.log("Authorize: User not found in DB -", credentials.email);
            return null;
          }

          console.log("Authorize: User found, comparing passwords...");

          // Verify hashed password
          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            console.log("Authorize: Password mismatch for", credentials.email);
            return null;
          }

          console.log("Authorize: SUCCESS for", credentials.email, "Role:", user.role);

          // Return user object including role
          return {
            id: user._id.toString(),
            name: user.name || 'User',
            email: user.email,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error("Auth validation error:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
