import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { translations, type Lang } from './i18n/translations';

export interface SourceForPdf {
  source: string;
  sourceUrl: string;
  impactPct: number;
  phase: string;
  year: number;
}

export interface PdfSourcesData {
  pessimistic: SourceForPdf[];
  realistic: SourceForPdf[];
  optimistic: SourceForPdf[];
}

const SCENARIO_COLORS: Record<string, { r: number; g: number; b: number }> = {
  pessimistic: { r: 239, g: 68, b: 68 },
  realistic: { r: 245, g: 158, b: 11 },
  optimistic: { r: 16, g: 185, b: 129 },
};

export async function exportToPdf(
  element: HTMLElement,
  title: string,
  sources?: PdfSourcesData,
  lang: Lang = 'en'
): Promise<void> {
  const t = (key: keyof typeof translations.en) => translations[lang][key] ?? translations.en[key] ?? key;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#09090b', // matches dark bg
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 landscape dimensions in pt
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 30;
  const headerHeight = 40;

  const contentWidth = pageWidth - margin * 2;
  const scaledHeight = (imgHeight / imgWidth) * contentWidth;

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // First page header
  pdf.setFontSize(16);
  pdf.setTextColor(60, 60, 60);
  pdf.text(title, margin, margin + 12);
  pdf.setFontSize(9);
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    `${t('pdf.exported')} ${new Date().toLocaleDateString(lang === 'fi' ? 'fi-FI' : 'en-GB')} ${new Date().toLocaleTimeString(lang === 'fi' ? 'fi-FI' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    margin,
    margin + 26
  );

  const firstPageContent = pageHeight - margin - headerHeight;
  let yOffset = 0;
  let page = 0;

  while (yOffset < scaledHeight) {
    if (page > 0) {
      pdf.addPage();
    }

    const availableHeight = page === 0 ? firstPageContent : pageHeight - margin * 2;
    const startY = page === 0 ? margin + headerHeight : margin;

    // Calculate source region in the original image
    const srcY = (yOffset / scaledHeight) * imgHeight;
    const srcH = (availableHeight / scaledHeight) * imgHeight;

    // Crop to a temp canvas for this page slice
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = Math.min(srcH, imgHeight - srcY);
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        0,
        srcY,
        imgWidth,
        sliceCanvas.height,
        0,
        0,
        imgWidth,
        sliceCanvas.height
      );
    }

    const sliceData = sliceCanvas.toDataURL('image/png');
    const sliceScaledH = (sliceCanvas.height / imgWidth) * contentWidth;

    pdf.addImage(sliceData, 'PNG', margin, startY, contentWidth, sliceScaledH);

    yOffset += availableHeight;
    page++;
  }

  // Sources Appendix
  if (sources) {
    addSourcesAppendix(pdf, sources, margin, pageWidth, pageHeight, lang);
  }

  pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}

function addSourcesAppendix(
  pdf: jsPDF,
  sources: PdfSourcesData,
  margin: number,
  pageWidth: number,
  pageHeight: number,
  lang: Lang = 'en'
) {
  const t = (key: keyof typeof translations.en) => translations[lang][key] ?? translations.en[key] ?? key;
  const lineHeight = 14;
  const sectionGap = 20;
  const maxY = pageHeight - margin;
  let y = 0;

  function ensureSpace(needed: number) {
    if (y + needed > maxY) {
      pdf.addPage();
      y = margin;
    }
  }

  // Start new page for appendix
  pdf.addPage();
  y = margin;

  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text(t('pdf.sourcesAppendix'), margin, y + 12);
  y += 30;

  const scenarioKeys = ['pessimistic', 'realistic', 'optimistic'] as const;
  const scenarioLabels = {
    pessimistic: t('roi.pessimistic'),
    realistic: t('roi.realistic'),
    optimistic: t('roi.optimistic'),
  };

  for (const key of scenarioKeys) {
    const items = sources[key];
    if (items.length === 0) continue;

    ensureSpace(sectionGap + lineHeight * 2);

    // Scenario heading
    const color = SCENARIO_COLORS[key];
    pdf.setFontSize(11);
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(`${scenarioLabels[key]} (${items.length} sources)`, margin, y);
    y += lineHeight + 4;

    // Group by phase
    const byPhase = new Map<string, SourceForPdf[]>();
    for (const item of items) {
      if (!byPhase.has(item.phase)) byPhase.set(item.phase, []);
      byPhase.get(item.phase)!.push(item);
    }

    for (const [phase, phaseItems] of byPhase) {
      ensureSpace(lineHeight * 2);

      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`${phase}`, margin + 10, y);
      y += lineHeight;

      for (const item of phaseItems) {
        ensureSpace(lineHeight);

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);

        const label = `${item.source} — ${item.impactPct}% (${item.year})`;
        const truncated = label.length > 90 ? label.slice(0, 87) + '...' : label;

        if (item.sourceUrl) {
          pdf.textWithLink(truncated, margin + 20, y, { url: item.sourceUrl });
        } else {
          pdf.text(truncated, margin + 20, y);
        }
        y += lineHeight;
      }

      y += 4;
    }

    y += sectionGap;
  }
}
