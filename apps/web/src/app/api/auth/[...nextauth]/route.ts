// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';

import { authOptions } from '../../../../lib/auth-options';

const handler = NextAuth(authOptions); //request handler үүсгэнэ

export { handler as GET, handler as POST }; //handler -ийг expose хийх
