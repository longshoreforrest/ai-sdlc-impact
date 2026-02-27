'use client';

import { RefObject, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToPdf, PdfSourcesData } from '@/lib/export-pdf';
import { useTranslation } from '@/lib/i18n';

interface ExportButtonProps {
  targetRef: RefObject<HTMLDivElement | null>;
  title: string;
  pdfSources?: PdfSourcesData;
}

export default function ExportButton({ targetRef, title, pdfSources }: ExportButtonProps) {
  const { t, lang } = useTranslation();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!targetRef.current || exporting) return;
    setExporting(true);
    try {
      await exportToPdf(targetRef.current, title, pdfSources, lang);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface text-muted hover:text-foreground hover:bg-surface-hover transition-colors disabled:opacity-50"
    >
      {exporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {exporting ? t('common.exporting') : t('common.exportPdf')}
    </button>
  );
}
