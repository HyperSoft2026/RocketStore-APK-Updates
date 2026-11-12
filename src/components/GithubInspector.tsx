import React, { useState } from 'react';
import { fetchLatestStableRelease } from '../utils/githubSync';
import { GitHubRelease } from '../types/registry';
import { PlayCircle, GitBranch, AlertCircle, CheckCircle2, FileArchive, ExternalLink, RefreshCw } from 'lucide-react';

export const GithubInspector: React.FC = () => {
  const [repoInput, setRepoInput] = useState('HyperSoft2026/RocketStore-APK-Updates');
  const [isLoading, setIsLoading] = useState(false);
  const [releaseData, setReleaseData] = useState<GitHubRelease | null>(null);
  const [allReleasesCount, setAllReleasesCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInspect = async () => {
    if (!repoInput.trim() || !repoInput.includes('/')) {
      setErrorMsg('يرجى كتابة اسم مستودع بصيغة Owner/Repository (مثل HyperSoft2026/my-repo)');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setReleaseData(null);
    setAllReleasesCount(null);

    const [owner, repo] = repoInput.trim().split('/');
    const fullUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;

    try {
      const allRes = await fetch(fullUrl, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      if (allRes.ok) {
        const json = await allRes.json();
        if (Array.isArray(json)) {
          setAllReleasesCount(json.length);
        }
      }
    } catch {
      // ignore
    }

    const { release, error } = await fetchLatestStableRelease(repoInput);
    setIsLoading(false);

    if (error || !release) {
      setErrorMsg(error || 'لم يتم العثور على إصدار مستقر لهذا المستودع');
    } else {
      setReleaseData(release);
    }
  };

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* Box Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">مختبر فحص GitHub Releases API</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              اختبار وحساب توافق المستودعات مع آلية استخراج الإصدارات المستقرة وملفات APK
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="HyperSoft2026/app-name"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:border-orange-500 focus:outline-none dir-ltr"
            />
          </div>

          <button
            onClick={handleInspect}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-900/30 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>فحص المستودع الآن</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {errorMsg && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">نتيجة الفحص:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {releaseData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>تم اكتشاف إصدار مستقر صالح للربط المباشر!</span>
            </div>
            {allReleasesCount !== null && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                إجمالي الإصدارات في GitHub: <strong>{allReleasesCount}</strong>
              </span>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">وسم الإصدار (Tag):</span>
              <span className="text-orange-400 font-mono font-bold text-base dir-ltr block">{releaseData.tag_name}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">تاريخ النشر:</span>
              <span className="text-slate-200 font-mono dir-ltr block">{new Date(releaseData.published_at).toLocaleString('ar-SA')}</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">حالة الإصدار:</span>
              <span className="text-emerald-400 font-semibold block">مستقر (Non-Draft & Non-Prerelease)</span>
            </div>
          </div>

          {/* Release Body */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">ملاحظات وسجل التغييرات (Release Body):</h4>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
              {releaseData.body || 'لا توجد ملاحظات مرفقة في هذا الإصدار.'}
            </div>
          </div>

          {/* Assets List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">الملفات المرفقة (Release Assets):</h4>
            {releaseData.assets.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
                ⚠️ لا توجد ملفات مرفقة (Assets) في هذا الإصدار. يجب توفر ملف APK للتحميل المباشر.
              </p>
            ) : (
              <div className="space-y-2">
                {releaseData.assets.map((asset, idx) => {
                  const isApk = asset.name.toLowerCase().endsWith('.apk');
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border text-xs gap-3 ${
                        isApk ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 dir-ltr">
                        <FileArchive className={`w-4 h-4 shrink-0 ${isApk ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <span className={`font-mono font-bold ${isApk ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {asset.name}
                          </span>
                          <span className="text-slate-500 text-[10px] block">
                            حجم الملف: {(asset.size / (1024 * 1024)).toFixed(2)} MB | مرات التحميل: {asset.download_count}
                          </span>
                        </div>
                      </div>

                      <a
                        href={asset.browser_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium dir-ltr transition-colors shrink-0"
                      >
                        <span>Download URL</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
