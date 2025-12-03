// apps/web/app/admin/page.tsx
import type { DefaultSession } from 'next-auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '../api/auth/[...nextauth]/route';

type AdminSessionUser = DefaultSession['user'] & {
  id?: string;
  role?: string;
  login?: string;
  username?: string;
};

//Admin dashboard page.
//session -г server дээр шалгах
export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 1) Нэвтрээгүй үед -> Github sign-in
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }

  // 2) Админ биш user -р нэвтэрсэн үед -> 403 page
  const user = session.user as AdminSessionUser | undefined;
  const role = user?.role ?? 'user';
  if (role !== 'admin') {
    redirect('/403');
  }

  // 3) Админ бол -> dashboard харуулах
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Админ dashboard</h1>
      <p className="text-sm text-gray-700">
        Та админ эрхтэй <span className="font-mono">{session.user?.email}</span> хаягаар нэвтэрсэн
        байна.
      </p>

      <section className="rounded-md border p-4 space-y-2">
        <h2 className="text-lg font-medium">Зөвхөн админд зориулсан хэсэг</h2>
        <p className="text-sm text-gray-700">
          Энэ page -ийг зөвхөн session болон role -ийг шалгасны дараа харуулж байгаа.
        </p>

        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Админы мэдээлэл</caption>
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-2">
                  Нэр
                </th>
                <th scope="col" className="px-4 py-2">
                  Имэйл
                </th>
                <th scope="col" className="px-4 py-2">
                  Role
                </th>
                <th scope="col" className="px-4 py-2">
                  Github username
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 font-medium text-gray-900">{user?.name ?? '—'}</td>
                <td className="px-4 py-2 text-gray-700">{user?.email ?? '—'}</td>
                <td className="px-4 py-2 text-gray-700">{role}</td>
                <td className="px-4 py-2 text-gray-700">{user?.login ?? user?.username ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
