import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border p-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Compliance Portal
        </h1>

        <p className="text-gray-600 mb-8">
          A simple portal to manage compliance filings, deadlines, documents,
          and approvals.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-black text-white hover:opacity-80"
          >
            Go to Login
          </Link>

        </div>
      </div>
    </main>
  );
}