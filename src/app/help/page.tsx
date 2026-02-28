'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BarChart3, PieChart, Calculator, BookOpen, Lightbulb, Plus, HelpCircle, Activity, FileText, Settings, Users, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface SectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ id, title, icon: Icon, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-hover transition-colors"
      >
        <Icon className="w-5 h-5 text-accent shrink-0" />
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 text-sm text-foreground leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

export default function HelpPage() {
  const { t } = useTranslation();

  const TOC = [
    { id: 'overview', label: t('help.toc.overview') },
    { id: 'welcome', label: t('help.toc.welcome') },
    { id: 'dashboard', label: t('help.toc.dashboard') },
    { id: 'analytics', label: t('help.toc.analytics') },
    { id: 'calculator', label: t('help.toc.calculator') },
    { id: 'report', label: t('help.toc.report') },
    { id: 'sources', label: t('help.toc.sources') },
    { id: 'scenarios', label: t('help.toc.scenarios') },
    { id: 'suggest-source', label: t('help.toc.suggestSource') },
    { id: 'suggest-feature', label: t('help.toc.suggestFeature') },
    { id: 'from-users', label: t('help.toc.fromUsers') },
    { id: 'filters', label: t('help.toc.filters') },
    { id: 'data', label: t('help.toc.data') },
    { id: 'language', label: t('help.toc.language') },
    { id: 'faq', label: t('help.toc.faq') },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('help.title')}</h1>
        <p className="text-sm text-muted mt-1">
          {t('help.subtitle')}
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-xs text-muted uppercase tracking-wider font-medium mb-3">{t('help.contents')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-accent hover:underline"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <Section id="overview" title={t('help.toc.overview')} icon={Activity} defaultOpen>
          <p dangerouslySetInnerHTML={{ __html: t('help.overview.p1') }} />
          <p dangerouslySetInnerHTML={{ __html: t('help.overview.p2') }} />
          <p dangerouslySetInnerHTML={{ __html: t('help.overview.p3') }} />
        </Section>

        <Section id="welcome" title={t('help.toc.welcome')} icon={Activity}>
          <p dangerouslySetInnerHTML={{ __html: t('help.welcome.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.welcome.features')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.welcome.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.welcome.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.welcome.f3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.welcome.f4') }} />
          </ul>
        </Section>

        <Section id="dashboard" title={t('help.toc.dashboard')} icon={BarChart3}>
          <p dangerouslySetInnerHTML={{ __html: t('help.dashboard.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.dashboard.components')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c5') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c6') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.dashboard.c7') }} />
          </ul>
          <h4 className="font-semibold mt-2">{t('help.dashboard.howToUse')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.dashboard.howToUseP') }} />
        </Section>

        <Section id="analytics" title={t('help.toc.analytics')} icon={PieChart}>
          <p dangerouslySetInnerHTML={{ __html: t('help.analytics.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.analytics.charts')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c5') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c6') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c7') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.analytics.c8') }} />
          </ul>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.analytics.p2') }} />
        </Section>

        <Section id="calculator" title={t('help.toc.calculator')} icon={Calculator}>
          <p dangerouslySetInnerHTML={{ __html: t('help.calculator.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.calculator.inputs')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.calculator.i1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.calculator.i2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.calculator.i3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.calculator.i4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.calculator.i5') }} />
          </ul>
          <h4 className="font-semibold mt-2">{t('help.calculator.costs')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.calculator.costsP') }} />
          <h4 className="font-semibold mt-2">{t('help.calculator.outputs')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.calculator.outputsP') }} />
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.calculator.reportP') }} />
        </Section>

        <Section id="report" title={t('help.toc.report')} icon={FileText}>
          <p dangerouslySetInnerHTML={{ __html: t('help.report.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.report.howTo')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.report.howToP') }} />
          <h4 className="font-semibold mt-2">{t('help.report.sections')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s5') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s6') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.report.s7') }} />
          </ul>
        </Section>

        <Section id="sources" title={t('help.toc.sources')} icon={BookOpen}>
          <p dangerouslySetInnerHTML={{ __html: t('help.sources.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.sources.features')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.sources.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.sources.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.sources.f3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.sources.f4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.sources.f5') }} />
          </ul>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.sources.p2') }} />
        </Section>

        <Section id="scenarios" title={t('help.toc.scenarios')} icon={Settings}>
          <p dangerouslySetInnerHTML={{ __html: t('help.scenarios.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.scenarios.features')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.scenarios.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.scenarios.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.scenarios.f3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.scenarios.f4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.scenarios.f5') }} />
          </ul>
        </Section>

        <Section id="suggest-source" title={t('help.toc.suggestSource')} icon={Plus}>
          <p dangerouslySetInnerHTML={{ __html: t('help.suggestSource.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.suggestSource.howTo')}</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestSource.s1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestSource.s2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestSource.s3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestSource.s4') }} />
          </ol>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.suggestSource.p2') }} />
        </Section>

        <Section id="suggest-feature" title={t('help.toc.suggestFeature')} icon={Lightbulb}>
          <p dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.suggestFeature.features')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.f3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.f4') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.suggestFeature.f5') }} />
          </ul>
        </Section>

        <Section id="from-users" title={t('help.toc.fromUsers')} icon={Users}>
          <p dangerouslySetInnerHTML={{ __html: t('help.fromUsers.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.fromUsers.features')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.fromUsers.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.fromUsers.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.fromUsers.f3') }} />
          </ul>
        </Section>

        <Section id="filters" title={t('help.toc.filters')} icon={HelpCircle}>
          <p dangerouslySetInnerHTML={{ __html: t('help.filters.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.filters.types')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.filters.f1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.filters.f2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.filters.f3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.filters.f4') }} />
          </ul>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.filters.p2') }} />
        </Section>

        <Section id="data" title={t('help.toc.data')} icon={Activity}>
          <p dangerouslySetInnerHTML={{ __html: t('help.data.p1') }} />
          <h4 className="font-semibold mt-2">{t('help.data.types')}</h4>
          <ul className="list-disc list-inside space-y-1.5 text-muted">
            <li dangerouslySetInnerHTML={{ __html: t('help.data.d1') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.data.d2') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.data.d3') }} />
            <li dangerouslySetInnerHTML={{ __html: t('help.data.d4') }} />
          </ul>
          <h4 className="font-semibold mt-2">{t('help.data.credibility')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.data.credP') }} />
          <h4 className="font-semibold mt-2">{t('help.data.stats')}</h4>
          <p className="text-muted" dangerouslySetInnerHTML={{ __html: t('help.data.statsP') }} />
        </Section>

        <Section id="language" title={t('help.toc.language')} icon={Globe}>
          <p dangerouslySetInnerHTML={{ __html: t('help.language.p1') }} />
        </Section>

        <Section id="faq" title={t('help.toc.faq')} icon={HelpCircle}>
          <div className="space-y-4">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
              <div key={n}>
                <h4 className="font-semibold">{t(`help.faq.q${n}` as Parameters<typeof t>[0])}</h4>
                <p className="text-muted mt-1" dangerouslySetInnerHTML={{ __html: t(`help.faq.a${n}` as Parameters<typeof t>[0]) }} />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
