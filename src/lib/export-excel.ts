import * as XLSX from 'xlsx';
import type { Fact } from './types';

interface SourceRow {
  name: string;
  url: string;
  category: string;
  description: string;
  dataTypes: string;
  phases: string;
  years: string;
  earliestDate: string;
  latestDate: string;
  factCount: number;
}

interface FactRow {
  id: string;
  source: string;
  sourceUrl: string;
  phase: string;
  impactPct: number;
  year: number;
  publishDate: string;
  dataType: string;
  description: string;
  sampleSize: string;
  credibility: number;
}

interface ExportSource {
  name: string;
  url?: string;
  description: string;
  dataTypes: string[];
  phases: string[];
  years: number[];
  factCount: number;
  facts: Fact[];
  category: string | null;
  earliestDate: string;
  latestDate: string;
}

export function exportSourcesToExcel(sources: ExportSource[], filename: string) {
  const sourceRows: SourceRow[] = sources.map((s) => ({
    name: s.name,
    url: s.url || '',
    category: s.category || 'Other',
    description: s.description,
    dataTypes: s.dataTypes.join(', '),
    phases: s.phases.join(', '),
    years: s.years.sort().join(', '),
    earliestDate: s.earliestDate,
    latestDate: s.latestDate,
    factCount: s.factCount,
  }));

  const factRows: FactRow[] = sources.flatMap((s) =>
    s.facts.map((f) => ({
      id: f.id,
      source: f.source,
      sourceUrl: f.sourceUrl || '',
      phase: f.phase,
      impactPct: f.impactPct,
      year: f.year,
      publishDate: f.publishDate,
      dataType: f.dataType,
      description: f.description,
      sampleSize: f.sampleSize || '',
      credibility: f.credibility,
    }))
  );

  const wb = XLSX.utils.book_new();

  // Sources sheet
  const sourceHeaders = [
    'Source', 'URL', 'Category', 'Description', 'Data Types',
    'Phases', 'Years', 'Earliest Date', 'Latest Date', 'Fact Count',
  ];
  const sourceData = sourceRows.map((r) => [
    r.name, r.url, r.category, r.description, r.dataTypes,
    r.phases, r.years, r.earliestDate, r.latestDate, r.factCount,
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([sourceHeaders, ...sourceData]);

  // Column widths
  ws1['!cols'] = [
    { wch: 40 }, { wch: 50 }, { wch: 16 }, { wch: 60 }, { wch: 25 },
    { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Sources');

  // Facts sheet
  const factHeaders = [
    'ID', 'Source', 'Source URL', 'Phase', 'Impact %',
    'Year', 'Publish Date', 'Data Type', 'Description', 'Sample Size', 'Credibility',
  ];
  const factData = factRows.map((r) => [
    r.id, r.source, r.sourceUrl, r.phase, r.impactPct,
    r.year, r.publishDate, r.dataType, r.description, r.sampleSize, r.credibility,
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([factHeaders, ...factData]);

  ws2['!cols'] = [
    { wch: 12 }, { wch: 40 }, { wch: 50 }, { wch: 10 }, { wch: 10 },
    { wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 60 }, { wch: 12 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Facts');

  XLSX.writeFile(wb, filename);
}
