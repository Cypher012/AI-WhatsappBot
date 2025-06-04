'use client';

import { useRouter } from 'next/navigation';
import BirthdayForm from '@/components/birthday-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authClient, Session } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [session, getSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await authClient.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      getSession(session);
      console.log('Session: ', session);
    };
    checkAuth();
  }, [router]);

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login'); // redirect to login page
        },
        onError: (error) => {
          console.log('error signing out', error);
        },
      },
    });
  };

  return (
    <main className="container mx-auto py-5 sm:py-10  px-4 md:px-6">
      <div className={'block sm:hidden'}>
        <ButttonContainer session={session} signOut={signOut} />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="mt-5 sm:mt-0 text-3xl font-bold">Birthday Registry</h1>
        <div className={'hidden sm:block'}>
          <ButttonContainer session={session} signOut={signOut} />
        </div>
      </div>
      <BirthdayForm />
    </main>
  );
}

const ButttonContainer = ({
  session,
  signOut,
}: {
  session: Session | null;
  signOut: () => Promise<void>;
}) => {
  return (
    <div className={'flex justify-end items-center gap-3'}>
      {session && session.user.name === 'Admin' && (
        <Link href="/admin">
          <Button variant="outline">Admin Panel</Button>
        </Link>
      )}
      <Button onClick={signOut}>Log Out</Button>
    </div>
  );
};
