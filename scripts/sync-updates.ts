import fs from 'fs';
import path from 'path';
import { RocketStoreProduct } from '../src/types/registry';
import { validateRegistry } from '../src/utils/validator';
import { syncSingleProduct } from '../src/utils/githubSync';

const registryPath = path.resolve(process.cwd(), 'apps-registry.json');
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function runSync() {
  console.log('🚀 RocketStore Central Release Sync Engine');
  console.log(`Target registry: ${registryPath}`);

  if (!fs.existsSync(registryPath)) {
    console.error(`❌ Registry file not found: ${registryPath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(registryPath, 'utf-8');
  let products: RocketStoreProduct[];

  try {
    products = JSON.parse(rawContent);
  } catch (err) {
    console.error('❌ Failed to parse apps-registry.json:', (err as Error).message);
    process.exit(1);
  }

  const initialValidation = validateRegistry(products);
  if (!initialValidation.valid) {
    console.error('❌ Aborting sync: Existing apps-registry.json fails schema validation!');
    process.exit(1);
  }

  if (products.length === 0) {
    console.log('ℹ️  Registry is empty. No products to sync.');
    process.exit(0);
  }

  console.log(`📦 Found ${products.length} product(s) in central registry. Starting update checks...`);

  const updatedProducts: RocketStoreProduct[] = [];
  let updatedCount = 0;
  let errorCount = 0;
  let unchangedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const { updatedProduct, report } = await syncSingleProduct(product, { githubToken });

    if (report.status === 'updated') {
      updatedCount++;
      console.log(`✅ [UPDATED] ${product.name} (${product.id}): ${report.previousTag} -> ${report.newTag}`);
    } else if (report.status === 'unchanged') {
      unchangedCount++;
      console.log(`ℹ️  [UNCHANGED] ${product.name} (${product.id}): Current version ${product.release_tag}`);
    } else if (report.status === 'skipped') {
      skippedCount++;
      console.log(`⏩ [SKIPPED] ${product.name} (${product.id}): Status is ${product.status}`);
    } else {
      errorCount++;
      console.warn(`⚠️  [ERROR] ${product.name} (${product.id}): ${report.message}`);
    }

    updatedProducts.push(updatedProduct);
  }

  // Validate resulting dataset
  const finalValidation = validateRegistry(updatedProducts);
  if (!finalValidation.valid) {
    console.error('❌ CRITICAL ERROR: Sync result failed schema validation. Changes NOT saved.');
    process.exit(1);
  }

  // Write changes
  fs.writeFileSync(registryPath, JSON.stringify(updatedProducts, null, 2) + '\n', 'utf-8');

  console.log('\n📊 Sync Execution Summary:');
  console.log(`   - Total Processed: ${products.length}`);
  console.log(`   - Updated: ${updatedCount}`);
  console.log(`   - Unchanged: ${unchangedCount}`);
  console.log(`   - Skipped: ${skippedCount}`);
  console.log(`   - Errors/Failed: ${errorCount}`);
  console.log('💾 Successfully saved updated apps-registry.json!');
}

runSync().catch((err) => {
  console.error('❌ Fatal error during sync:', err);
  process.exit(1);
});
