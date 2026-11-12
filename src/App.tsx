/**
 * RocketStore Central APK Updates Manager
 * Phase 1 Implementation - HyperSoft2026
 */

import React, { useState, useEffect } from 'react';
import { RocketStoreProduct } from './types/registry';
import { validateRegistry } from './utils/validator';
import { syncSingleProduct } from './utils/githubSync';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { GithubInspector } from './components/GithubInspector';
import { ValidatorView } from './components/ValidatorView';
import { DocsView } from './components/DocsView';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Database,
  Smartphone,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileJson,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<RocketStoreProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'registry' | 'inspector' | 'validator' | 'docs'>('registry');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'app' | 'game'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RocketStoreProduct | null>(null);

  // Sync state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(
    null
  );

  // Load initial apps-registry.json
  useEffect(() => {
    fetch('/apps-registry.json')
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(() => {
        setProducts([]);
      });
  }, []);

  const validationReport = validateRegistry(products);

  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveProduct = (product: RocketStoreProduct) => {
    const existingIndex = products.findIndex((p) => p.id === product.id);
    let updated: RocketStoreProduct[];

    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = product;
      showToast('success', `تم تحديث بيانات المنتج (${product.name})`);
    } else {
      updated = [...products, product];
      showToast('success', `تمت إضافة المنتج (${product.name}) بنجاح للسجل`);
    }

    setProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف المنتج [${id}] من السجل المركزي؟`)) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      showToast('info', `تم حذف المنتج [${id}] من السجل`);
    }
  };

  const handleSyncSingle = async (product: RocketStoreProduct) => {
    setSyncingId(product.id);
    const { updatedProduct, report } = await syncSingleProduct(product);
    setSyncingId(null);

    if (report.status === 'updated') {
      const updatedList = products.map((p) => (p.id === product.id ? updatedProduct : p));
      setProducts(updatedList);
      showToast('success', `تم تحديث ${product.name} إلى الإصدار ${report.newTag}!`);
    } else if (report.status === 'unchanged') {
      showToast('info', `${product.name} محدث بالفعل على أحدث إصدار (${product.release_tag})`);
    } else {
      showToast('error', `تعذر مزامنة ${product.name}: ${report.message}`);
    }
  };

  const handleSyncAll = async () => {
    if (products.length === 0) {
      showToast('info', 'السجل فارغ، لا توجد منتجات للمزامنة');
      return;
    }

    setIsSyncingAll(true);
    let updatedCount = 0;
    const newList: RocketStoreProduct[] = [];

    for (const p of products) {
      const { updatedProduct, report } = await syncSingleProduct(p);
      if (report.status === 'updated') updatedCount++;
      newList.push(updatedProduct);
    }

    setProducts(newList);
    setIsSyncingAll(false);
    showToast(
      'success',
      `اكتملت المزامنة لجميع المنتجات! (تم تحديث ${updatedCount} منتج من أصل ${products.length})`
    );
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repository.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const appCount = products.filter((p) => p.type === 'app').length;
  const gameCount = products.filter((p) => p.type === 'game').length;
  const activeCount = products.filter((p) => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productCount={products.length}
        isValid={validationReport.valid}
      />

      {/* Main Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce" dir="rtl">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border ${
              notification.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-200 border-emerald-700'
                : notification.type === 'error'
                ? 'bg-red-900/90 text-red-200 border-red-700'
                : 'bg-blue-900/90 text-blue-200 border-blue-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'registry' && (
          <div className="space-y-6" dir="rtl">
            {/* Control Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">إجمالي المنتجات:</span>
                  <span className="text-2xl font-bold text-white block mt-0.5">{products.length}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">التطبيقات المسجلة:</span>
                  <span className="text-2xl font-bold text-blue-400 block mt-0.5">{appCount}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">الألعاب المسجلة:</span>
                  <span className="text-2xl font-bold text-purple-400 block mt-0.5">{gameCount}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">التحديثات النشطة:</span>
                  <span className="text-2xl font-bold text-emerald-400 block mt-0.5">{activeCount}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter & Action Controls */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث باسم التطبيق، اللعبة، ID، أو المستودع..."
                  className="w-full pr-10 pl-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>النوع:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'app' | 'game')}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">الكل</option>
                    <option value="app" className="bg-slate-900">تطبيق</option>
                    <option value="game" className="bg-slate-900">لعبة</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                  <span>الحالة:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">الكل</option>
                    <option value="active" className="bg-slate-900">نشط</option>
                    <option value="inactive" className="bg-slate-900">غير نشط</option>
                  </select>
                </div>

                {/* Sync All Button */}
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncingAll || products.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold border border-orange-500/30 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>مزامنة الكل</span>
                </button>

                {/* Add Product Button */}
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-900/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center my-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  <FileJson className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {products.length === 0 ? 'السجل المركزي فارغ حالياً (Clean Registry)' : 'لم يتم العثور على منتجات تظابق الفلتر'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                  {products.length === 0
                    ? 'السجل جاهز ومعد لاستقبال التطبيقات والألعاب الحقيقية لمتجر RocketStore دون أي بيانات وهمية.'
                    : 'جرب تغيير نص البحث أو خيارات الفلترة المحددة أعلاه.'}
                </p>

                {products.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-900/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل أول تطبيق / لعبة الآن</span>
                  </button>
                )}
              </div>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={(p) => {
                      setEditingProduct(p);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDeleteProduct}
                    onSync={handleSyncSingle}
                    isSyncing={syncingId === product.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: GitHub Inspector */}
        {activeTab === 'inspector' && <GithubInspector />}

        {/* Tab: Validator */}
        {activeTab === 'validator' && (
          <ValidatorView products={products} onUpdateProducts={setProducts} />
        )}

        {/* Tab: Documentation */}
        {activeTab === 'docs' && <DocsView />}
      </main>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </div>
  );
}
