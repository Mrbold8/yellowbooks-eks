'use client'; //SessionProvider -> client component

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

/**
- Client-side provider component үүсгээд app/layout.tsx -д ашигласан.
- Client дээрх session уншихад (sign in / sign out button) 
- Ингэснээр app/ -ийн ямар ч client component useSession(), signIn(), signOut() -ийг дуудаж чадна.
 */
export default function Providers({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
