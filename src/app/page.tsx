import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();
  console.log({ user });

  return (
    <>
    {user ? (
      <h1>
        I'm a user!
      </h1>
    ) : (
      <Link href="/signup">
        Sign Up
      </Link>
    )}
    </>
  );
}
