'use client';

import { useEffect, useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import DeleteDocumentButton from '../../../components/DeleteDocumentButton';
type Filing = {
  id: string;
  filing_name: string;
  state: string;
  due_date: string;
  status: string;
  notes: string | null;
  assigned_user_id: string | null;
};

type FilingDocument = {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
};

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params.id as string;

  const [filing, setFiling] = useState<Filing | null>(null);
  const [documents, setDocuments] = useState<FilingDocument[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    fetchFiling();
    fetchDocuments();
  }, []);

  async function fetchFiling() {
    const { data, error } = await supabase
      .from('filings')
      .select('*')
      .eq('id', filingId)
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setFiling(data);
  }

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from('filing_documents')
      .select('*')
      .eq('filing_id', filingId)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setDocuments(data || []);
  }

  async function handleUpload() {
  if (!file || uploading) return;

  setUploading(true);
  setErrorMessage('');

  const cleanFileName = file.name.replace(/\s+/g, '-');
  const filePath = `${filingId}/${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from('filing-documents')
    .upload(filePath, file);

  if (uploadError) {
    setErrorMessage(uploadError.message);
    setUploading(false);
    return;
  }

  const { error: dbError } = await supabase.from('filing_documents').insert({
    filing_id: filingId,
    file_name: file.name,
    file_path: filePath,
  });

  if (dbError) {
    setErrorMessage(dbError.message);
    setUploading(false);
    return;
  }

  setFile(null);

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }

  await fetchDocuments();

  setUploading(false);
}

  async function viewDocument(doc: FilingDocument) {
    const { data, error } = await supabase.storage
      .from('filing-documents')
      .createSignedUrl(doc.file_path, 60);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.open(data.signedUrl, '_blank');
  }

  if (!filing) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {filing.filing_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Filing detail and uploaded documents
            </p>
          </div>

          <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {filing.status}
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">State</p>
            <p className="font-medium">{filing.state}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium">{filing.due_date}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Assigned User ID</p>
            <p className="font-medium">
              {filing.assigned_user_id || 'Not assigned'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="font-medium">{filing.notes || 'No notes'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload PDF, image, or supporting filing documents.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded border border-gray-300 p-2 text-sm"
          />

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <div className="mt-6">
          {documents.length === 0 ? (
            <p className="rounded border border-dashed p-4 text-sm text-gray-500">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center border p-3">
                  <span>{doc.file_name}</span>

                  <div className="flex gap-2">
                    <button onClick={() => viewDocument(doc)}>View</button>

                    <DeleteDocumentButton
                      docId={doc.id}
                      filePath={doc.file_path}
                      setError={setErrorMessage}
                      onDeleted={() =>
                        setDocuments((prev) => prev.filter((item) => item.id !== doc.id))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}