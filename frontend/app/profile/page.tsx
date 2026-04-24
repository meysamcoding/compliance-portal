'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push('/login');
        return;
      }

      setUserId(userData.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, address, image_url')
        .eq('id', userData.user.id)
        .single();

      if (profile) {
        setUsername(profile.username || '');
        setAddress(profile.address || '');
        setImageUrl(profile.image_url || '');
      }
    }

    loadProfile();
  }, [router]);

  // 🔥 upload image
async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!userId) {
    alert('User not loaded yet');
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  const publicUrl = publicUrlData.publicUrl;

  setImageUrl(publicUrl);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      image_url: publicUrl,
    })
    .eq('id', userId);

  if (updateError) {
    alert(updateError.message);
    return;
  }

  setMessage('Profile image updated');
}



  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        address,
        image_url: imageUrl,
      })
      .eq('id', userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Profile updated');
  }

  return (
    <section className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow border overflow-hidden">

        {/* 🔥 TOP IMAGE SECTION */}
        <div className="relative h-40 bg-gray-200 flex items-center justify-center">
          
          {imageUrl ? (
            <img
              src={imageUrl}
              className="absolute inset-0 w-full h-full object-cover"
              alt="profile"
            />
          ) : (
            <div className="text-gray-500 text-sm">
              No Image
            </div>
          )}

          {/* Upload Button */}
          <label className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 text-xs rounded cursor-pointer">
            Upload
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* FORM */}
        <form onSubmit={handleUpdate} className="p-6 space-y-4">

          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          <button className="w-full bg-black text-white py-2 rounded">
            Save Changes
          </button>

          {message && (
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}