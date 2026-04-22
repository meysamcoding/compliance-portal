'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type Filing = {
  id: string;
  filing_name: string;
  state: string;
  due_date: string;
  status: string;
  notes: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [filings, setFilings] = useState<Filing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('filings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setFilings(data || []);
      setLoading(false);
    };

    loadPage();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-black text-white rounded hover:opacity-80"
        >
          Logout
        </button>
      </div>

      {/* Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Filings</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filings.length === 0 ? (
          <p className="text-gray-500">No filings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">State</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filings.map((filing) => (
                  <tr key={filing.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{filing.filing_name}</td>
                    <td className="py-2">{filing.state}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-700">
                        {filing.status}
                      </span>
                    </td>
                    <td className="py-2">{filing.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}