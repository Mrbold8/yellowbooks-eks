'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <button className="rounded-md border px-3 py-1 text-sm" disabled>
        Checking session...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Signed in as {session.user?.email ?? session.user?.name}
        </span>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button className="rounded-md border px-3 py-1 text-sm" onClick={() => signIn('github')}>
      Sign in with GitHub
    </button>
  );
}
