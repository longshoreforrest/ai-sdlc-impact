'use client';

import { useMemo } from 'react';
import { Activity, Play, Podcast, Presentation, ArrowRight, BarChart3, Calculator, BookOpen, PieChart } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import SDLCFlowchart from '@/components/SDLCFlowchart';

export default function WelcomePage() {
  const { t } = useTranslation();

  const mediaLinks = useMemo(() => [
    {
      title: t('welcome.videoTitle'),
      description: t('welcome.videoDesc'),
      url: 'https://youtu.be/yuJbcadA06U',
      icon: Play,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
    },
    {
      title: t('welcome.podcastTitle'),
      description: t('welcome.podcastDesc'),
      url: 'https://youtu.be/IES2Mba25kM',
      icon: Podcast,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: t('welcome.slidesTitle'),
      description: t('welcome.slidesDesc'),
      url: 'https://drive.google.com/file/d/1JHm40yjAUSIQrtIZscsnUQ8M5-4OIHqL/view?usp=sharing',
      icon: Presentation,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
  ], [t]);

  const appSections = useMemo(() => [
    {
      href: '/',
      label: t('welcome.sdlcDashLabel'),
      description: t('welcome.sdlcDashDesc'),
      icon: BarChart3,
    },
    {
      href: '/analytics',
      label: t('welcome.analyticsLabel'),
      description: t('welcome.analyticsDesc'),
      icon: PieChart,
    },
    {
      href: '/calculator',
      label: t('welcome.calcLabel'),
      description: t('welcome.calcDesc'),
      icon: Calculator,
    },
    {
      href: '/sources',
      label: t('welcome.sourcesLabel'),
      description: t('welcome.sourcesDesc'),
      icon: BookOpen,
    },
  ], [t]);

  return (
    <div className="max-w-4xl space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent-dim">
            <Activity className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('welcome.title')}</h1>
            <p className="text-sm text-muted">{t('welcome.subtitle')}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-3">
          <p
            className="text-sm text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t('welcome.intro1') }}
          />
          <p className="text-sm text-foreground leading-relaxed">
            {t('welcome.intro2')}
          </p>
          <p className="text-sm text-muted">
            {t('welcome.intro3')}
          </p>
        </div>
      </div>

      {/* SDLC Flowchart */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{t('sdlcFlow.title')}</h2>
        <SDLCFlowchart />
      </div>

      {/* Media Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{t('welcome.learnMore')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mediaLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col gap-3 p-5 rounded-xl border transition-colors hover:bg-surface-hover ${link.bgColor}`}
            >
              <link.icon className={`w-8 h-8 ${link.color}`} />
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* App Sections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">{t('welcome.exploreApp')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 p-5 rounded-xl bg-surface border border-border hover:border-accent/30 hover:bg-surface-hover transition-colors"
            >
              <div className="p-2 rounded-lg bg-accent-dim shrink-0">
                <section.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                    {section.label}
                  </h3>
                  <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('welcome.dataPoints'), value: '210+' },
          { label: t('welcome.sourcesCount'), value: '190+' },
          { label: t('welcome.sdlcPhases'), value: '6' },
          { label: t('welcome.yearsCovered'), value: '2023–2026' },
        ].map((stat) => (
          <div key={stat.value} className="p-4 rounded-xl bg-surface border border-border text-center">
            <p className="text-2xl font-bold tabular-nums text-accent">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
