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
    assigned_user_id: string | null;
    profiles?: {
        username: string | null;
        email: string | null;
    } | null;
};

export default function DashboardPage() {
    const router = useRouter();
    const [filings, setFilings] = useState<Filing[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('');

    useEffect(() => {
        const loadPage = async () => {
            const { data: userData } = await supabase.auth.getUser();


            if (!userData.user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userData.user.id)
                .maybeSingle();

            if (profile) {
                setRole(profile.role);
            }

            let query = supabase
                .from('filings')
                .select(`
    *,
    profiles:assigned_user_id (
      username,
      email
    )
  `)
                .order('created_at', { ascending: false });

            if (profile?.role !== 'admin') {
                query = query.eq('assigned_user_id', userData.user.id);
            }

            const { data, error } = await query;

            if (!error) setFilings(data || []);
            setLoading(false);
        };

        loadPage();
    }, [router]);

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm('Are you sure you want to delete this filing?');
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('filings')
            .delete()
            .eq('id', id);

        if (error) {
            alert(error.message);
            return;
        }

        // remove from UI without refresh
        setFilings((prev) => prev.filter((f) => f.id !== id));
    };


    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Role: {role || 'Loading role...'}
                    </p>

                    {role === 'admin' && (
                        <button
                            onClick={() => router.push('/dashboard/create-filing')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            Create Filing
                        </button>
                    )}
                </div>

            </div>

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
                                    <th className="py-2">Assigned To</th>
                                    {role === 'admin' && <th className="py-2">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filings.map((filing) => (
                                    <tr key={filing.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/filings/${filing.id}`)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {filing.filing_name}

                                            </button>
                                        </td>
                                        <td className="py-2">{filing.state}</td>
                                        <td className="py-2">
                                            <span className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-700">
                                                {filing.status}
                                            </span>
                                        </td>
                                        <td className="py-2">{filing.due_date}</td>
                                        <td className="py-2">
                                            {filing.profiles?.username || filing.profiles?.email || 'Unassigned'}
                                        </td>
                                        {role === 'admin' && (
                                            <td className="py-2 flex gap-2">
                                                {/* EDIT */}
                                                <button
                                                    onClick={() => router.push(`/dashboard/filings/${filing.id}/edit`)}
                                                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() => handleDelete(filing.id)}
                                                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
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