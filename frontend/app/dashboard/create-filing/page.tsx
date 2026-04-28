'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function CreateFilingPage() {
    const router = useRouter();

    const [filingName, setFilingName] = useState('');
    const [state, setState] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('pending');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [assignedUserId, setAssignedUserId] = useState('');

    const handleCreateFiling = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const { error } = await supabase.from('filings').insert({
            filing_name: filingName,
            state,
            due_date: dueDate,
            status,
            notes,
            assigned_user_id: assignedUserId,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage('Filing created successfully!');
        setFilingName('');
        setState('');
        setDueDate('');
        setStatus('pending');
        setNotes('');

        router.push('/dashboard');
    };

    useEffect(() => {
        async function loadUsers() {
            const { data } = await supabase
                .from('profiles')
                .select('id, email');

            if (data) setUsers(data);
        }

        loadUsers();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Create Filing</h1>

                <form onSubmit={handleCreateFiling} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Filing Ful Name or Company</label>
                        <input
                            type="text"
                            value={filingName}
                            onChange={(e) => setFilingName(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            placeholder="Enter filing name"
                            required
                        />
                    </div>

                    <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded border px-3 py-2"
                        required
                    >
                        <option value="">Select State</option>

                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="WA">Washington</option>
                        <option value="IL">Illinois</option>
                        <option value="AZ">Arizona</option>
                        <option value="NV">Nevada</option>

                    </select>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Assign to user</label>

                        <select
                            value={assignedUserId}
                            onChange={(e) => setAssignedUserId(e.target.value)}
                            className="w-full border px-3 py-2 rounded mt-1"
                        >
                            <option value="">Select user</option>

                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded border px-3 py-2"
                            placeholder="Optional notes"
                            rows={4}
                        />
                    </div>

                    {message ? (
                        <p className="text-sm text-red-600">{message}</p>
                    ) : null}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-black text-white rounded hover:opacity-80"
                        >
                            {loading ? 'Creating...' : 'Create Filing'}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}