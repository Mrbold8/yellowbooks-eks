// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GitHubProvider from 'next-auth/providers/github';

import { prisma } from '../../../../lib/prisma';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

type SessionUser = DefaultSession['user'] & {
  id: string;
  role: string;
};

type TokenWithUserMetadata = JWT & {
  userId?: string;
  role?: string;
};

export const authOptions: NextAuthOptions = {
  // NextAuth -ийн global config
  providers: [
    GitHubProvider({
      // .env -ийн creds -ээр GithubOAuth ашиглахыг NextAuth -д зааж өгнө.
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
    }),
  ],
  secret: nextAuthSecret,

  callbacks: {
    async jwt({ token, user }) {
      // Эхний удаа нэвтрэхэд callback дуудагдана
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

        // token -д DB data attach хийх
        enrichedToken.userId = dbUser.id;
        enrichedToken.role = dbUser.role;
      }

      return enrichedToken;
    },

    /*
    useSession() эсвэл /api/auth/session дуудагдах бүрд ажиллана.
    token -оос session.user -руу role болон userID -г хуулна.
     */
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

const handler = NextAuth(authOptions); //request handler үүсгэнэ

export { handler as GET, handler as POST }; //handler -ийг expose хийх
