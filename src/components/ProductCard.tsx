import React from 'react';
import { RocketStoreProduct } from '../types/registry';
import { Smartphone, Gamepad2, GitCommit, Download, ExternalLink, Calendar, Edit3, Trash2, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: RocketStoreProduct;
  onEdit: (product: RocketStoreProduct) => void;
  onDelete: (id: string) => void;
  onSync: (product: RocketStoreProduct) => void;
  isSyncing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onSync,
  isSyncing = false,
}) => {
  const isApp = product.type === 'app';
  const isActive = product.status === 'active';

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 shadow-lg transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isApp ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}
            >
              {isApp ? <Smartphone className="w-5 h-5" /> : <Gamepad2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                  {product.name_ar || product.name}
                </h3>
                {product.name_en && (
                  <span className="text-xs text-slate-400 dir-ltr font-mono">({product.name_en})</span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 dir-ltr text-right">
                ID: {product.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                isActive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : product.status === 'inactive'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {isActive ? 'نشط' : product.status === 'inactive' ? 'غير نشط' : 'مؤرشف'}
            </span>

            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${
                isApp
                  ? 'bg-blue-950/40 text-blue-300 border-blue-800/40'
                  : 'bg-purple-950/40 text-purple-300 border-purple-800/40'
              }`}
            >
              {isApp ? 'تطبيق' : 'لعبة'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
          {product.description || 'لا يوجد وصف محدد لهذا المنتج.'}
        </p>

        {/* Grid Meta Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/40 dir-ltr">
            <GitCommit className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-slate-400 shrink-0">Repo:</span>
            <a
              href={`https://github.com/${product.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 hover:text-orange-400 font-mono truncate underline"
            >
              {product.repository}
            </a>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/40">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400 shrink-0">الإصدار:</span>
            <span className="text-emerald-400 font-bold font-mono dir-ltr">{product.release_tag || product.version || 'v1.0.0'}</span>
          </div>
        </div>

        {/* APK & Links */}
        <div className="space-y-1.5 text-xs font-mono mb-4">
          <div className="flex items-center justify-between text-slate-400 bg-slate-950/30 px-2.5 py-1.5 rounded dir-ltr">
            <span className="text-slate-500">APK File:</span>
            <span className="text-amber-300 truncate max-w-[200px]">{product.apk_asset}</span>
          </div>

          {product.blogger_url && (
            <div className="flex items-center justify-between bg-slate-950/30 px-2.5 py-1.5 rounded dir-ltr">
              <span className="text-slate-500 shrink-0">Blogger:</span>
              <a
                href={product.blogger_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline truncate max-w-[220px] flex items-center gap-1"
              >
                <span className="truncate">{product.blogger_url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Changelog excerpt if present */}
        {product.changelog && (
          <div className="mb-4 text-xs">
            <span className="text-slate-400 font-medium block mb-1">سجل التغييرات (Changelog):</span>
            <p className="text-slate-300 bg-slate-950/60 p-2 rounded text-[11px] max-h-16 overflow-y-auto whitespace-pre-wrap border border-slate-800/80">
              {product.changelog}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
        <button
          onClick={() => onSync(product)}
          disabled={isSyncing || !isActive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isActive
              ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30'
              : 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed'
          }`}
          title="فحص واكتشاف أحدث release من GitHub"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>مزامنة Release</span>
        </button>

        <div className="flex items-center gap-1.5">
          {product.download_url && (
            <a
              href={product.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="رابط التحميل المباشر"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={() => onEdit(product)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
            title="تعديل بيانات المنتج"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/50 text-red-400 hover:text-red-300 border border-transparent hover:border-red-800/50 transition-colors"
            title="حذف من السجل"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
