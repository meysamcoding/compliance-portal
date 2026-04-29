'use client';

import { supabase } from '../../lib/supabase';

type Props = {
  docId: string;
  filePath: string;
  onDeleted: () => void;
  setError: (msg: string) => void;
};

export default function DeleteDocumentButton({
  docId,
  filePath,
  onDeleted,
  setError,
}: Props) {
  async function handleDelete() {
    const confirmDelete = confirm('Delete this document?');
    if (!confirmDelete) return;

    setError('');

    const { error: storageError } = await supabase.storage
      .from('filing-documents')
      .remove([filePath]);

    if (storageError) {
      setError(storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from('filing_documents')
      .delete()
      .eq('id', docId);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    onDeleted();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}