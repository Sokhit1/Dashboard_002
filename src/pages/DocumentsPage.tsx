import React, { useMemo, useState } from 'react';
import { FileText, Search, Plus, Eye, Trash2, Upload } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { DocumentItem } from '../types/crm';
import { formatShortDate } from '../utils/formatters';
import { Modal } from '../components/common/Modal';

export const DocumentsPage: React.FC = () => {
  const { dataset, addDocument, deleteDocument, currentUser } = useCrm();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | DocumentItem['category']>('All');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('Proposal');
  const [fileType, setFileType] = useState<DocumentItem['fileType']>('PDF');
  const [accountId, setAccountId] = useState(dataset.accounts[0]?.id || '');
  const [summary, setSummary] = useState('');

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dataset.documents.filter((d) => {
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
      if (q && !`${d.name} ${d.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [dataset.documents, categoryFilter, search]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addDocument({
      name: name.trim(),
      category,
      fileType,
      sizeLabel: '1.8 MB',
      accountId,
      ownerId: currentUser.id,
      summary: summary.trim() || 'Uploaded commercial document.',
    });
    setName('');
    setSummary('');
    setUploadOpen(false);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proposals, MSAs, security matrices, and customer collateral ({filteredDocs.length} files)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Document</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['All', 'Proposal', 'Contract', 'Brochure', 'Case Study', 'Playbook'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-[#0AA6AD] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
                <th className="px-4 py-3 font-semibold">Document</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.map((doc) => {
                const acc = dataset.accounts.find((a) => a.id === doc.accountId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 shrink-0 text-[#0AA6AD]" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{doc.name}</p>
                          <p className="text-[11px] text-slate-400">{doc.fileType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{doc.category}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{acc?.name || 'Internal'}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">{doc.sizeLabel}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{formatShortDate(doc.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview document"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#0AA6AD] hover:bg-[#0AA6AD]/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDocument(doc.id)}
                          title="Remove document"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#FF6155] hover:bg-[#FF6155]/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name || 'Document Preview'}
        subtitle={previewDoc ? `${previewDoc.category} · ${previewDoc.fileType} · ${previewDoc.sizeLabel}` : undefined}
        maxWidth="lg"
      >
        {previewDoc && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="font-semibold text-slate-900 dark:text-white">Executive Document Summary</p>
              <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{previewDoc.summary}</p>
              <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-700">
                Owner: {dataset.users.find((u) => u.id === previewDoc.ownerId)?.name} · Last modified{' '}
                {formatShortDate(previewDoc.updatedAt)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Document Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Attach Document Metadata">
        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Document Filename *</label>
            <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 Enterprise Proposal.pdf" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as DocumentItem['category'])}>
                <option value="Proposal">Proposal</option>
                <option value="Contract">Contract</option>
                <option value="Brochure">Brochure</option>
                <option value="Case Study">Case Study</option>
                <option value="Playbook">Playbook</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Format</label>
              <select className={inputCls} value={fileType} onChange={(e) => setFileType(e.target.value as DocumentItem['fileType'])}>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="PPTX">PPTX</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Related Account</label>
            <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {dataset.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Summary</label>
            <textarea rows={2} className={inputCls} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              <Upload className="h-3.5 w-3.5" />
              <span>Save Document</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
