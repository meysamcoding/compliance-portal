'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser(data.user);

        // 🔥 get username from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUsername(profile.username);
        }
      }

      setLoading(false);
    };

    loadUser();

    // 🔥 listen to login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      
      <h1 className="text-3xl font-bold mb-4">
        Compliance Portal MVP
      </h1>

      {user ? (
        <>
          <p className="text-lg text-gray-700 mb-4">
            Welcome, <span className="font-semibold">{username || 'User'}</span> 👋
          </p>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-black text-white rounded hover:opacity-80"
          >
            Go to Dashboard
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Manage filings, documents, and approvals in one place
          </p>

          <p className="text-gray-500 mb-6">
            Please login to access your dashboard.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-black text-white rounded hover:opacity-80 "
          >
            Login
          </button>
        </>
      )}
    </main>
  );
}