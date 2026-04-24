'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
const [username, setUsername] = useState('');

useEffect(() => {
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, image_url')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setUsername(profile.username || '');
        setImageUrl(profile.image_url || '');
      }
    }
  };

  loadUser();
}, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    // 🔥 important: update UI when login/logout happens
    const { data: listener } = supabase.auth.onAuthStateChange(
  async (_event, session) => {
    setUser(session?.user ?? null);

    if (!session?.user) {
      setUsername('');
      setImageUrl('');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, image_url')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUsername(profile.username || '');
      setImageUrl(profile.image_url || '');
    }
  }
);

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

const handleLogout = async () => {
  await supabase.auth.signOut();

  setUser(null);
  setUsername('');
  setImageUrl('');

  router.push('/login');
};

  if (loading) return null;

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* LEFT */}
        <Link href="/" className="text-lg font-bold">
          Compliance Portal
        </Link>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-4">
  
  <button
    onClick={() => router.push('/dashboard')}
    className="text-sm hover:underline"
  >
    Dashboard
  </button>

  {/* PROFILE ICON */}
  <button onClick={() => router.push('/profile')}>
    {imageUrl ? (
      <img
        src={imageUrl}
        alt="profile"
        className="h-8 w-8 rounded-full object-cover border"
      />
    ) : (
      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
        {username ? username.charAt(0).toUpperCase() : 'U'}
      </div>
    )}
  </button>

  <button
    onClick={handleLogout}
    className="px-3 py-1 text-sm bg-black text-white rounded"
  >
    Logout
  </button>

</div>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="text-sm hover:underline"
              >
                Login
              </button>

              <button
                onClick={() => router.push('/signup')}
                className="px-3 py-1 text-sm bg-black text-white rounded hover:opacity-80"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}