import React, { useState, useEffect } from 'react';
import { RocketStoreProduct, ProductType, ProductStatus } from '../types/registry';
import { fetchLatestStableRelease } from '../utils/githubSync';
import { X, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: RocketStoreProduct) => void;
  initialProduct?: RocketStoreProduct | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [formData, setFormData] = useState<RocketStoreProduct>({
    id: '',
    name: '',
    name_ar: '',
    name_en: '',
    type: 'app',
    description: '',
    repository: 'HyperSoft2026/',
    release_tag: 'v1.0.0',
    version: '1.0.0',
    apk_asset: 'app-release.apk',
    download_url: '',
    blogger_url: 'https://rocketstore5.blogspot.com/',
    release_date: new Date().toISOString(),
    changelog: 'إطلاق الإصدار الأولي',
    status: 'active',
  });

  const [isFetchingRelease, setIsFetchingRelease] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
    } else {
      setFormData({
        id: '',
        name: '',
        name_ar: '',
        name_en: '',
        type: 'app',
        description: '',
        repository: 'HyperSoft2026/',
        release_tag: 'v1.0.0',
        version: '1.0.0',
        apk_asset: 'app-release.apk',
        download_url: '',
        blogger_url: 'https://rocketstore5.blogspot.com/',
        release_date: new Date().toISOString(),
        changelog: 'إطلاق الإصدار الأولي',
        status: 'active',
      });
    }
    setFetchStatus(null);
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof RocketStoreProduct, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFetchGithubData = async () => {
    if (!formData.repository || !formData.repository.includes('/')) {
      setFetchStatus({ type: 'error', message: 'يرجى إدخال اسم مستودع صحيح بصيغة Owner/Repo' });
      return;
    }

    setIsFetchingRelease(true);
    setFetchStatus(null);

    const { release, error } = await fetchLatestStableRelease(formData.repository);

    setIsFetchingRelease(false);

    if (error || !release) {
      setFetchStatus({ type: 'error', message: error || 'لم يتم العثور على إصدارات منشورة' });
      return;
    }

    const newTag = release.tag_name || 'v1.0.0';
    const cleanVer = newTag.replace(/^v/i, '');
    let apkName = formData.apk_asset;

    // Check matching asset
    const apkAsset = release.assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
    if (apkAsset) {
      apkName = apkAsset.name;
    }

    const downloadUrl = apkAsset
      ? apkAsset.browser_download_url
      : `https://github.com/${formData.repository}/releases/download/${newTag}/${apkName}`;

    setFormData((prev) => ({
      ...prev,
      release_tag: newTag,
      version: cleanVer,
      apk_asset: apkName,
      download_url: downloadUrl,
      release_date: release.published_at || new Date().toISOString(),
      changelog: release.body || prev.changelog,
    }));

    setFetchStatus({
      type: 'success',
      message: `تم جلب الإصدار ${newTag} بنجاح! (${release.assets.length} ملفات مرفقة)`,
    });
  };

  const handleAiAutoFill = async () => {
    setIsAiAnalyzing(true);
    setAiStatusMessage(null);
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'full_analysis',
          input: {
            rawName: formData.name_en || formData.name || formData.id,
            repository: formData.repository,
            description: formData.description,
            rawFilename: formData.apk_asset,
            type: formData.type,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        setFormData((prev) => ({
          ...prev,
          name_ar: r.suggested_name_ar || prev.name_ar,
          name_en: r.suggested_name_en || prev.name_en,
          name: r.suggested_name_en || prev.name,
          type: r.category || prev.type,
          apk_asset: r.apk_asset_name || prev.apk_asset,
          description: r.description_ar || prev.description,
        }));
        setAiStatusMessage(data.message_ar || 'تم التحليل وتعبئة الحقول بنجاح.');
      } else {
        setAiStatusMessage(data.message_ar || 'فشل التحليل الذكي.');
      }
    } catch {
      setAiStatusMessage('تعذر الاتصال بخدمة الذكاء الاصطناعي.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim()) {
      alert('يرجى إدخال معرف فريد للمنتج (id)');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 relative text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">
              {initialProduct ? 'تعديل بيانات المنتج' : 'إضافة تطبيق / لعبة جديدة للسجل'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GitHub Quick Fetch Info */}
        <div className="mb-5 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-200">جلب بيانات الإصدار من GitHub Releases تلقائياً:</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                أدخل مسار المستودع ثم اضغط لجلب الإصدار والروابط وسجل التغييرات مباشرة.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={isAiAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all shadow-sm shadow-purple-900/30"
                title="تحليل وتعبئة ذكية بـ Google Gemini"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAiAnalyzing ? 'جاري التحليل...' : 'تعبئة ذكية بـ AI'}</span>
              </button>

              <button
                type="button"
                onClick={handleFetchGithubData}
                disabled={isFetchingRelease}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-all shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRelease ? 'animate-spin' : ''}`} />
                <span>جلب بيانات Release</span>
              </button>
            </div>
          </div>

          {aiStatusMessage && (
            <div className="mt-2.5 p-2 rounded-lg text-xs bg-purple-950/60 text-purple-200 border border-purple-800/60 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{aiStatusMessage}</span>
            </div>
          )}

          {fetchStatus && (
            <div
              className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                fetchStatus.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-red-950/60 text-red-300 border border-red-800/60'
              }`}
            >
              {fetchStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{fetchStatus.message}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                المعرف الفريد (ID) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="com.hypersoft.mygame"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                disabled={!!initialProduct}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نوع المنتج</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as ProductType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="app">تطبيق (App)</option>
                <option value="game">لعبة (Game)</option>
              </select>
            </div>

            {/* Name Arabic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم بالعربية</label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => {
                  handleChange('name_ar', e.target.value);
                  if (!formData.name) handleChange('name', e.target.value);
                }}
                placeholder="لعبتي الجديدة"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Name English */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => handleChange('name_en', e.target.value)}
                placeholder="My New Game"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Repository */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                مستودع GitHub الأصلي <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.repository}
                onChange={(e) => handleChange('repository', e.target.value)}
                placeholder="HyperSoft2026/my-repo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>

            {/* APK Asset name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسم ملف APK داخل Release</label>
              <input
                type="text"
                required
                value={formData.apk_asset}
                onChange={(e) => handleChange('apk_asset', e.target.value)}
                placeholder="app-release.apk"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>

            {/* Release Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">وسم الإصدار (Release Tag)</label>
              <input
                type="text"
                required
                value={formData.release_tag}
                onChange={(e) => {
                  handleChange('release_tag', e.target.value);
                  handleChange('version', e.target.value.replace(/^v/i, ''));
                }}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>

            {/* Version */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الإصدار (Version)</label>
              <input
                type="text"
                required
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>

            {/* Blogger URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">رابط مشاركة Blogger الثابت</label>
              <input
                type="url"
                required
                value={formData.blogger_url}
                onChange={(e) => handleChange('blogger_url', e.target.value)}
                placeholder="https://rocketstore5.blogspot.com/2026/11/my-app.html"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>

            {/* Download URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">رابط التحميل المباشر</label>
              <input
                type="url"
                value={formData.download_url}
                onChange={(e) => handleChange('download_url', e.target.value)}
                placeholder="https://github.com/HyperSoft2026/.../releases/download/v1.0.0/app-release.apk"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
              />
            </div>
          </div>

          {/* Status & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as ProductStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="active">نشط (Active)</option>
                <option value="inactive">غير نشط (Inactive)</option>
                <option value="archived">مؤرشف (Archived)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">الوصف المختصر</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="وصف ملخص للتطبيق أو اللعبة..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Changelog */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">سجل التغييرات (Changelog)</label>
            <textarea
              rows={3}
              value={formData.changelog}
              onChange={(e) => handleChange('changelog', e.target.value)}
              placeholder="تفاصيل التحديث والميزات الجديدة..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-lg shadow-orange-900/30"
            >
              {initialProduct ? 'حفظ التعديلات' : 'إضافة المنتج بالسجل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
