import React, { useState } from 'react';
import { validateRegistry } from '../utils/validator';
import { RocketStoreProduct } from '../types/registry';
import { FileCode, CheckCircle2, AlertTriangle, XCircle, Copy, Download, RefreshCw } from 'lucide-react';

interface ValidatorViewProps {
  products: RocketStoreProduct[];
  onUpdateProducts: (newProducts: RocketStoreProduct[]) => void;
}

export const ValidatorView: React.FC<ValidatorViewProps> = ({ products, onUpdateProducts }) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(products, null, 2));
  const [copied, setCopied] = useState(false);

  const report = validateRegistry(products);

  const handleTextChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        onUpdateProducts(parsed);
      }
    } catch {
      // Syntax error in text editor until valid JSON
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apps-registry.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* Overview Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مصحح ومدقق بنية apps-registry.json</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                التحقق البرمجي التلقائي من الحقول والقيم المعتمدة وحماية البيانات قبل الحفظ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'تم النسخ!' : 'نسخ JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-900/30"
            >
              <Download className="w-4 h-4" />
              <span>تحميل apps-registry.json</span>
            </button>
          </div>
        </div>

        {/* Validation Result Box */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            report.valid
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-red-950/40 border-red-800/60 text-red-300'
          }`}
        >
          {report.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold text-sm block mb-1">
              {report.valid
                ? '✅ السجل مطابق لجميع القواعد والشروط المعتمدة (Validation Passed)'
                : `❌ توجد أخطاء في بنية السجل (${report.errors.length} خطأ)`}
            </span>
            <p className="text-slate-300">
              إجمالي المنتجات المفحوصة: <strong>{report.totalProducts}</strong> | التحذيرات:{' '}
              <strong>{report.warnings.length}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Errors / Warnings List if any */}
      {report.errors.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span>قائمة الأخطاء المكتشفة:</span>
          </h3>
          <div className="space-y-2">
            {report.errors.map((err, idx) => (
              <div key={idx} className="bg-red-950/30 border border-red-800/40 p-3 rounded-xl text-xs">
                <span className="font-semibold text-red-300 block mb-1">
                  المنتج {err.productId ? `[${err.productId}]` : `الترتيب ${err.index}`}:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {err.issues.map((iss, iidx) => (
                    <li key={iidx}>
                      <code className="text-orange-400 font-mono bg-slate-950 px-1 py-0.5 rounded mr-1">
                        {iss.field}
                      </code>
                      : {iss.message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor & Raw JSON View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">محرر وبصمة السجل الخام (apps-registry.json):</h3>
          <button
            onClick={() => setJsonText(JSON.stringify(products, null, 2))}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة التنسيق</span>
          </button>
        </div>

        <textarea
          rows={16}
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:border-orange-500 focus:outline-none leading-relaxed dir-ltr"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
