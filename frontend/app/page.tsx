import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-2xl bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600">
          Compliance Portal MVP
        </p>

        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Manage filings, documents, and approvals in one place
        </h1>

        <p className="mb-8 max-w-2xl text-gray-600">
          A simple portal for admins to create and track filings, and for clients
          to review documents and approve work.
        </p>

       <div className="flex gap-4">
  <p className="text-gray-500">
    Please login to access your dashboard.
  </p>
</div>
      </div>
    </section>
  );
}