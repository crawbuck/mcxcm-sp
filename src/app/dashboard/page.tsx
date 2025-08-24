import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { signOutAction } from '@/app/actions/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.firstName}!
          </h1>
          <form action={signOutAction}>
            <button type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}