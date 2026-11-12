import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  Tag,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AIStatusData {
  provider: string;
  model: string;
  isConfigured: boolean;
  status: string;
  message_ar: string;
}

interface TestResultData {
  success: boolean;
  status: string;
  message_ar: string;
  model: string;
  latencyMs?: number;
}

export const RocketStoreAI: React.FC = () => {
  // AI Status
  const [statusData, setStatusData] = useState<AIStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Connection Test
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);

  // Tool Mode & Inputs
  const [selectedTool, setSelectedTool] = useState<
    | 'full_analysis'
    | 'suggest_name'
    | 'clean_filename'
    | 'suggest_apk'
    | 'generate_description'
    | 'detect_category'
    | 'extract_keywords'
    | 'suggest_blogger_title'
  >('full_analysis');

  const [inputName, setInputName] = useState<string>('RocketStore Speed Booster');
  const [inputRepo, setInputRepo] = useState<string>('HyperSoft2026/speed-booster');
  const [inputDesc, setInputDesc] = useState<string>('A lightweight utility tool for Android to optimize cache and boost gaming performance.');
  const [inputRawFilename, setInputRawFilename] = useState<string>('app release v2.0 #final.apk');
  const [inputType, setInputType] = useState<string>('app');
  const [inputVersion, setInputVersion] = useState<string>('v2.0.0');

  // Execution State & Output
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<any | null>(null);
  const [executionError, setExecutionError] = useState<{ message_ar: string; status?: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch initial status from server
  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch {
      setStatusData({
        provider: 'Google Gemini',
        model: 'gemini-flash-latest',
        isConfigured: false,
        status: 'network_error',
        message_ar: 'تعذر الاتصال بخادم RocketStore Backend.',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Run Connection Test
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({
        success: false,
        status: 'connection_error',
        model: statusData?.model || 'gemini-flash-latest',
        message_ar: 'تعذر الاتصال بخدمة الذكاء الاصطناعي (خطأ اتصال شبكي).',
      });
    } finally {
      setIsTesting(false);
      fetchStatus();
    }
  };

  // Run selected AI action
  const handleExecuteAction = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionOutput(null);

    const payload: any = {
      action: selectedTool,
      input: {
        rawName: inputName,
        name: inputName,
        repository: inputRepo,
        description: inputDesc,
        rawFilename: inputRawFilename,
        filename: inputRawFilename,
        type: inputType,
        version: inputVersion,
      },
    };

    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setExecutionOutput(data.result || data.data);
      } else {
        setExecutionError({
          message_ar: data.message_ar || 'فشل تنفيذ الإجراء المطلوب.',
          status: data.status,
        });
      }
    } catch {
      setExecutionError({
        message_ar: 'تعذر إرسال الطلب إلى الخادم، تأكد من اتصال الشبكة.',
        status: 'network_error',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 dir-ltr text-slate-100">
      {/* 1. Header & AI Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">RocketStore AI</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Google Gemini Integration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Centralized AI intelligence layer for smart APK naming, automated descriptions, categorization, and store SEO.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Test Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-900/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing API...' : 'Test Gemini Connection'}</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          {/* Provider */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Provider:</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Google Gemini
            </span>
          </div>

          {/* Current Model */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Current Model:</span>
            <span className="font-mono font-bold text-purple-300">
              {statusData?.model || 'gemini-flash-latest'}
            </span>
          </div>

          {/* AI Status */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 font-medium">AI Status:</span>
            {isLoadingStatus ? (
              <span className="text-slate-400">Checking...</span>
            ) : statusData?.isConfigured ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready / Configured
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Key Not Set on Server
              </span>
            )}
          </div>
        </div>

        {/* Arabic Technical Diagnostics Report (Requirement 7) */}
        {testResult && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-xs transition-all ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/40 border-red-800/60 text-red-300'
            }`}
            dir="rtl"
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">
                  {testResult.success ? 'تقرير الاتصال بخدمة Gemini:' : 'فشل فحص اتصال Gemini:'}
                </span>
                {testResult.latencyMs !== undefined && (
                  <span className="text-[11px] font-mono dir-ltr text-slate-300">
                    Latency: {testResult.latencyMs}ms
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed">{testResult.message_ar}</p>
              <div className="mt-2 text-[11px] text-slate-400 dir-ltr text-left font-mono">
                Model: {testResult.model} | Status Code: {testResult.status}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. AI Tools Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tool Selector & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tool Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select AI Tool
            </h3>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                onClick={() => setSelectedTool('full_analysis')}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedTool === 'full_analysis'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-md shadow-purple-950/50'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-bold block">Full App Analysis</span>
                    <span className="text-[11px] text-slate-400">All 8 tools bundled into structured JSON</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => setSelectedTool('suggest_name')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'suggest_name'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Generate App Name (AR & EN)</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('clean_filename')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'clean_filename'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Sanitize File Name</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('suggest_apk')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'suggest_apk'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Standardize APK ("Name_App-RocketStore.apk")</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('generate_description')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'generate_description'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Generate Description</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('detect_category')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'detect_category'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Detect Category (App or Game)</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('extract_keywords')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'extract_keywords'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Extract SEO Keywords</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedTool('suggest_blogger_title')}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  selectedTool === 'suggest_blogger_title'
                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Suggest Blogger Post Title</span>
                </div>
              </button>
            </div>
          </div>

          {/* Input Parameters Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold text-slate-300 flex items-center justify-between">
              <span>Input Parameters</span>
              <span className="text-[11px] text-slate-500 font-normal">Real-time prompt context</span>
            </h3>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-medium mb-1">GitHub Repo</label>
                <input
                  type="text"
                  value={inputRepo}
                  onChange={(e) => setInputRepo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Type</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                >
                  <option value="app">Application (App)</option>
                  <option value="game">Game</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Raw Filename (e.g. build artifact)</label>
              <input
                type="text"
                value={inputRawFilename}
                onChange={(e) => setInputRawFilename(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Description / Notes</label>
              <textarea
                rows={3}
                value={inputDesc}
                onChange={(e) => setInputDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleExecuteAction}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all disabled:opacity-50 mt-2"
            >
              <Send className={`w-4 h-4 ${isExecuting ? 'animate-bounce' : ''}`} />
              <span>{isExecuting ? 'Running Gemini AI...' : 'Execute AI Tool'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & Technical Feedback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
            <div>
              {/* Output Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">
                    AI Output & Structured Result
                  </h3>
                </div>

                {executionOutput && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(executionOutput, null, 2))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {/* Execution Error Notice */}
              {executionError && (
                <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-xs text-red-300 mb-4 flex items-start gap-3" dir="rtl">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">خطأ في استدعاء الذكاء الاصطناعي:</span>
                    <span>{executionError.message_ar}</span>
                    {executionError.status && (
                      <span className="block text-[11px] font-mono text-red-400 mt-1 dir-ltr text-right">
                        Status: {executionError.status}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Output Display */}
              {isExecuting ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-xs">Processing request with Google Gemini API...</p>
                </div>
              ) : executionOutput ? (
                <div className="space-y-4">
                  {/* If Full Analysis, show structured visual cards */}
                  {selectedTool === 'full_analysis' && typeof executionOutput === 'object' && (
                    <div className="space-y-3 text-xs">
                      {/* Name Suggestion */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 block mb-1">Suggested Names:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Arabic:</span>
                            <span className="font-bold text-white text-sm" dir="rtl">
                              {executionOutput.suggested_name_ar}
                            </span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-[10px] text-slate-500 block">English:</span>
                            <span className="font-bold text-white text-sm">
                              {executionOutput.suggested_name_en}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Standardized APK formula */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 block mb-1">Standardized RocketStore APK Asset:</span>
                        <code className="text-amber-300 font-mono font-bold block bg-slate-900 px-3 py-2 rounded border border-slate-800">
                          {executionOutput.apk_asset_name}
                        </code>
                      </div>

                      {/* Category & Confidence */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block mb-1">Category:</span>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {executionOutput.category}
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 block mb-1">Confidence:</span>
                          <span className="font-semibold text-emerald-400 capitalize">
                            {executionOutput.confidence || 'high'}
                          </span>
                        </div>
                      </div>

                      {/* Descriptions */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-slate-400 block">Generated Descriptions:</span>
                        <p className="text-slate-300 bg-slate-900 p-2.5 rounded text-xs" dir="rtl">
                          {executionOutput.description_ar}
                        </p>
                        <p className="text-slate-300 bg-slate-900 p-2.5 rounded text-xs">
                          {executionOutput.description_en}
                        </p>
                      </div>

                      {/* Blogger Title & Keywords */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                        <span className="text-slate-400 block">Blogger Post Permalink Title:</span>
                        <p className="font-medium text-blue-300 bg-slate-900 p-2 rounded" dir="rtl">
                          {executionOutput.blogger_post_title}
                        </p>
                        {Array.isArray(executionOutput.keywords) && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {executionOutput.keywords.map((kw: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Review Status Warning if needed */}
                      {executionOutput.needs_review && (
                        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-300" dir="rtl">
                          <span className="font-bold block mb-0.5">ملاحظة الذكاء الاصطناعي (تحتاج لمراجعة):</span>
                          <span>{executionOutput.review_reason_ar || 'المعلومات الأولية محدودة وتحتاج لتأكيد بشري.'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw JSON viewer */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Raw JSON Response
                    </h4>
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 scrollbar-thin">
                      {JSON.stringify(executionOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-500 text-xs">
                  <Cpu className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Select a tool from the left and click "Execute AI Tool" to see real Gemini output.</p>
                </div>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Backend proxy active: API key is isolated on the server.
              </span>
              <span>Model: {statusData?.model || 'gemini-flash-latest'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
