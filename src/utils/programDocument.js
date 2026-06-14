import { clientMasterApi } from '../services/endpoints';

export const PROGRAM_PDF_MAX_BYTES = 5 * 1024 * 1024;

export function validateProgramPdfFile(file) {
  if (!file) return '';
  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are allowed';
  }
  if (file.size > PROGRAM_PDF_MAX_BYTES) {
    return 'PDF must be 5 MB or smaller';
  }
  return '';
}

export function getProgramDocumentMeta(record) {
  const doc = record?.programDocument;
  if (!doc?.storedName) return null;
  return {
    fileName: doc.fileName || 'program-document.pdf',
    fileSize: doc.fileSize || 0,
    uploadedAt: doc.uploadedAt || null,
  };
}

export async function openProgramDocument(programId) {
  const { data } = await clientMasterApi.downloadDocument(programId);
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}
