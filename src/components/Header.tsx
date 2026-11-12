import React from 'react';
import { Rocket, ExternalLink, CheckCircle2, ShieldCheck, Database, FileCode, PlayCircle, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'registry' | 'inspector' | 'validator' | 'docs';
  setActiveTab: (tab: 'registry' | 'inspector' | 'validator' | 'docs') => void;
  productCount: number;
  isValid: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, productCount, isValid }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-orange-400/30">
              <Rocket className="w-6 h-6 text-white transform -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  RocketStore Central Updates
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  المرحلة الأولى
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                النظام المركزي الموحد لإدارة تحديثات المتجر | HyperSoft2026
              </p>
            </div>
          </div>

          {/* Quick Info & Store Link */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
              isValid ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-red-950/60 text-red-400 border-red-800/60'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{isValid ? 'السجل مطبق للشروط' : 'يوجد أخطاء في السجل'}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 text-xs">
              <Database className="w-4 h-4 text-orange-400" />
              <span>العدد: <strong className="text-white">{productCount}</strong> منتج</span>
            </div>

            <a
              href="https://rocketstore5.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold transition-all shadow-md shadow-orange-900/30"
            >
              <span>رابط المتجر</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'registry'
                ? 'border-orange-500 text-orange-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>سجل المنتجات (apps-registry.json)</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'inspector'
                ? 'border-orange-500 text-orange-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>فحص GitHub Release API</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'validator'
                ? 'border-orange-500 text-orange-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>مصحح ومدقق JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'docs'
                ? 'border-orange-500 text-orange-400 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل النظام ودورة التحديث</span>
          </button>
        </div>
      </div>
    </header>
  );
};
