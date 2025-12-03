import { randomUUID } from 'node:crypto';

import type { DefaultSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GitHubProvider from 'next-auth/providers/github';

import { prisma } from './prisma';

const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ??
  (() => {
    console.warn('NEXTAUTH_SECRET is not set. Using a random secret for this build.');
    return randomUUID();
  })();

type SessionUser = DefaultSession['user'] & {
  id: string;
  role: string;
};

type TokenWithUserMetadata = JWT & {
  userId?: string;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  secret: nextAuthSecret,
  callbacks: {
    async jwt({ token, user }) {
      const enrichedToken = token as TokenWithUserMetadata;
      if (user && user.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name ?? null,
            role: 'user',
          },
        });

        enrichedToken.userId = dbUser.id;
        enrichedToken.role = dbUser.role;
      }

      return enrichedToken;
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as SessionUser;
        const enrichedToken = token as TokenWithUserMetadata;
        sessionUser.id = enrichedToken.userId ?? sessionUser.id;
        sessionUser.role = enrichedToken.role ?? sessionUser.role ?? 'user';
      }

      return session;
    },
  },
};
