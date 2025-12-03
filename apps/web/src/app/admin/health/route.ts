// apps/web/app/api/admin/health/route.ts
import type { DefaultSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../api/auth/[...nextauth]/route';

type AdminSessionUser = DefaultSession['user'] & {
  id?: string;
  role?: string;
};

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1) Нэвтрээгүй үед -> 401 Unauthorized
  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = (session.user ?? {}) as AdminSessionUser;
  const role = user.role ?? 'user';

  // 2) Админ биш бол -> 403 Forbidden
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: зөвхөн админ хандах эрхтэй' }, { status: 403 });
  }

  // 3) Admin бол -> protected data буцаах
  return NextResponse.json(
    {
      ok: true,
      message: 'Admin-only endpoint',
      user: {
        id: user.id,
        email: user.email,
        role,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
