'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';

export default function EditFilingPage() {
    const router = useRouter();
    const params = useParams();
    const filingId = params.id as string;

    const [filingName, setFilingName] = useState('');
    const [stateName, setStateName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [assignedUserId, setAssignedUserId] = useState('');

    useEffect(() => {
        const loadPage = async () => {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                router.push('/login');
                return;
            }

            // 🔥 check admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userData.user.id)
                .maybeSingle();

            if (profile?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }

            const { data: usersData } = await supabase
                .from('profiles')
                .select('id, username, email')
                .order('email', { ascending: true });

            if (usersData) {
                setUsers(usersData);
            }

            // 🔥 get filing
            const { data: filing } = await supabase
                .from('filings')
                .select('*')
                .eq('id', filingId)
                .single();

            if (filing) {
                setFilingName(filing.filing_name || '');
                setStateName(filing.state || '');
                setDueDate(filing.due_date || '');
                setStatus(filing.status || '');
                setNotes(filing.notes || '');

                // 🔥 ADD THIS LINE
                setAssignedUserId(filing.assigned_user_id || '');
            }

            setLoading(false);
        };

        loadPage();
    }, [filingId, router]);

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const { error } = await supabase
            .from('filings')
            .update({
                filing_name: filingName,
                state: stateName,
                due_date: dueDate,
                status,
                notes,
                assigned_user_id: assignedUserId || null,
            })
            .eq('id', filingId);

        if (error) {
            alert(error.message);
            return;
        }

        router.push('/dashboard');
    }

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h1 className="mb-6 text-2xl font-bold">Edit Filing</h1>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <input
                        value={filingName}
                        onChange={(e) => setFilingName(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="Filing name"
                        required
                    />

                    <input
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="State"
                        required
                    />

                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        required
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                    >
                        <option value="pending">Pending</option>
                        <option value="in review">In Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        placeholder="Notes"
                    />

                    <div>
                        <label className="mb-1 block text-sm font-medium">Assign To</label>

                        <select
                            value={assignedUserId}
                            onChange={(e) => setAssignedUserId(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="">Unassigned</option>

                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.username || user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="w-full rounded bg-black py-2 text-white">
                        Save Changes
                    </button>
                </form>
            </div>
        </main>
    );
}