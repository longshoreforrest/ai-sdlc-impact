'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Calculator, Activity, BookOpen, PieChart, Home, HelpCircle, MessageSquare, Globe, FileText, Menu, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const navItems: { href: string; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { href: '/welcome', labelKey: 'sidebar.welcome', icon: Home },
  { href: '/analytics', labelKey: 'sidebar.dataSourceAnalytics', icon: PieChart },
  { href: '/dashboard', labelKey: 'sidebar.sdlcAnalytics', icon: BarChart3 },
  { href: '/calculator', labelKey: 'sidebar.roiCalculator', icon: Calculator },
  { href: '/report', labelKey: 'sidebar.report', icon: FileText },
  { href: '/sources', labelKey: 'sidebar.dataSources', icon: BookOpen },
  { href: '/from-users', labelKey: 'sidebar.fromUsers', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [mobileOpen, handleKeyDown]);

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-accent" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">{t('sidebar.title')}</h1>
            <p className="text-xs text-muted">{t('sidebar.subtitle')}</p>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-dim text-accent font-medium'
                  : 'text-muted hover:text-foreground hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <Link
          href="/help"
          className={`flex items-center gap-2 text-xs transition-colors ${
            pathname === '/help'
              ? 'text-accent font-medium'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {t('sidebar.help')}
        </Link>
        <p className="text-xs text-muted">
          {t('sidebar.dataCount')}
        </p>

        {/* Language switcher */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-muted" />
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              lang === 'en'
                ? 'bg-accent-dim text-accent font-medium'
                : 'text-muted hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('fi')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              lang === 'fi'
                ? 'bg-accent-dim text-accent font-medium'
                : 'text-muted hover:text-foreground'
            }`}
          >
            FI
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border shadow-md text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, always visible on md+ */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-50 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
