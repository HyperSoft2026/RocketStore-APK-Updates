import React from 'react';
import { BookOpen, CheckCircle2, Shield, GitBranch, RefreshCw, Terminal, Clock, ExternalLink } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-100 max-w-4xl mx-auto" dir="rtl">
      {/* Intro Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">دليل تشغيل النظام المركزي - المرحلة الأولى</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              آلية العمل، شروط الأمان، وهيكلية المزامنة التلقائية لمتجر RocketStore
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
              <GitBranch className="w-4 h-4" />
              <span>المستودع المركزي:</span>
            </div>
            <p className="text-slate-300 font-mono dir-ltr">HyperSoft2026/RocketStore-APK-Updates</p>
            <p className="text-slate-400 mt-1">الفرع الرئيسي: <code className="text-emerald-400">main</code></p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <ExternalLink className="w-4 h-4" />
              <span>رابط متجر Blogger:</span>
            </div>
            <a
              href="https://rocketstore5.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono dir-ltr block"
            >
              https://rocketstore5.blogspot.com/
            </a>
            <p className="text-slate-400 mt-1">الروابط الكلاسيكية للمشاركات ثابتة كلياً.</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-orange-400" />
          <span>آلية تحديث ومزامنة المنتجات (Flow):</span>
        </h3>

        <ol className="space-y-3 relative border-r border-slate-800 pr-5">
          <li className="relative">
            <span className="absolute -right-7 top-0.5 w-4 h-4 rounded-full bg-orange-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <strong className="text-slate-200 block text-xs">إضافة التطبيق إلى السجل المركزي:</strong>
            <p className="text-slate-400 mt-0.5">
              يُسجّل التطبيق أو اللعبة مرة واحدة فقط في <code className="text-orange-400">apps-registry.json</code> برابط Blogger الثابت واسم المستودع على GitHub.
            </p>
          </li>

          <li className="relative">
            <span className="absolute -right-7 top-0.5 w-4 h-4 rounded-full bg-orange-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <strong className="text-slate-200 block text-xs">نشر إصدار جديد في المستودع الأصلي:</strong>
            <p className="text-slate-400 mt-0.5">
              يقوم المطور برفع وتأكيد release جديد في مستودعه الخاص باستخدام GitHub Releases وإرفاق ملف الـ APK.
            </p>
          </li>

          <li className="relative">
            <span className="absolute -right-7 top-0.5 w-4 h-4 rounded-full bg-orange-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              3
            </span>
            <strong className="text-slate-200 block text-xs">مزامنة البيانات تلقائياً:</strong>
            <p className="text-slate-400 mt-0.5">
              يقوم سير عمل GitHub Actions بتشغيل أمر <code className="text-orange-400">npm run sync:updates</code> لاستعلام API وتحديث وسوم الإصدار وروابط التحميل وسجل التغييرات.
            </p>
          </li>

          <li className="relative">
            <span className="absolute -right-7 top-0.5 w-4 h-4 rounded-full bg-orange-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              4
            </span>
            <strong className="text-slate-200 block text-xs">ثبات رابط مشاركة Blogger:</strong>
            <p className="text-slate-400 mt-0.5">
              لا تُنشأ أي مشاركة جديدة في Blogger، بل يظل رابط المشاركة القديم يعمل دون أي تغيير.
            </p>
          </li>
        </ol>
      </div>

      {/* CLI commands */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>أوامر السطر البرمجي (Terminal / NPM Scripts):</span>
        </h3>

        <div className="space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 dir-ltr">
            <span className="text-slate-400 font-mono text-[11px]"># فحص وتدقيق بنية apps-registry.json:</span>
            <code className="text-emerald-400 font-mono block mt-1">npm run validate:registry</code>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 dir-ltr">
            <span className="text-slate-400 font-mono text-[11px]"># تشغيل عملية مزامنة التحديثات مع GitHub Releases:</span>
            <code className="text-emerald-400 font-mono block mt-1">npm run sync:updates</code>
          </div>
        </div>
      </div>

      {/* Security Principles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-400" />
          <span>قواعد الأمان والموثوقية المتبعة:</span>
        </h3>

        <ul className="space-y-2 text-slate-300 list-disc list-inside">
          <li>عدم كتابة أو تضمين أي GitHub Token داخل الكود المفتوح أو Blogger.</li>
          <li>استثناء مسودات الإصدارات (Draft Releases) والنسخ التجريبية (Pre-releases) تلقائياً.</li>
          <li>عدم استبدال البيانات الصحيحة بأخرى فارغة في حال فشل استعلام شبكي لأحد المستودعات.</li>
          <li>التحقق الصارم من JSON Schema قبل كتابة أو حفظ أي تعديل في الملف المركزي.</li>
        </ul>
      </div>
    </div>
  );
};
