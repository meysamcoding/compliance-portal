'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

type Filing = {
  id: string;
  filing_name: string;
  state: string;
  due_date: string;
  status: string;
  notes: string | null;
};

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [filing, setFiling] = useState<Filing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiling = async () => {
      const { data, error } = await supabase
        .from('filings')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (!error && data) {
        setFiling(data);
      }

      setLoading(false);
    };

    loadFiling();
  }, [params.id]);

  if (loading) {
    return <main className="p-6">Loading...</main>;
  }

  if (!filing) {
    return (
      <main className="p-6">
        <p>Filing not found.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 border rounded"
        >
          Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Filing Details</h1>

        <div className="space-y-3">
          <p><strong>Name:</strong> {filing.filing_name}</p>
          <p><strong>State:</strong> {filing.state}</p>
          <p><strong>Status:</strong> {filing.status}</p>
          <p><strong>Due Date:</strong> {filing.due_date}</p>
          <p><strong>Notes:</strong> {filing.notes || 'No notes'}</p>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}