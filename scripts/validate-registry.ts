import fs from 'fs';
import path from 'path';
import { validateRegistry } from '../src/utils/validator';

const registryPath = path.resolve(process.cwd(), 'apps-registry.json');

console.log('🔍 RocketStore Central Registry Validator');
console.log(`Checking file: ${registryPath}`);

try {
  if (!fs.existsSync(registryPath)) {
    console.error(`❌ File not found: ${registryPath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(registryPath, 'utf-8');
  let data: unknown;

  try {
    data = JSON.parse(rawContent);
  } catch (err) {
    console.error('❌ Failed to parse JSON file:', (err as Error).message);
    process.exit(1);
  }

  const report = validateRegistry(data);

  if (report.valid) {
    console.log(`✅ Validation Passed! Total products: ${report.totalProducts}`);
    if (report.warnings.length > 0) {
      console.log(`⚠️  ${report.warnings.length} warning(s) detected:`);
      report.warnings.forEach((item) => {
        console.log(`   Product [${item.productId || `Index ${item.index}`}]:`);
        item.issues.forEach((issue) => console.log(`     - [${issue.field}] ${issue.message}`));
      });
    }
    process.exit(0);
  } else {
    console.error(`❌ Validation Failed with ${report.errors.length} error(s):`);
    report.errors.forEach((item) => {
      console.error(`   Product [${item.productId || `Index ${item.index}`}]:`);
      item.issues.forEach((issue) => console.error(`     - [${issue.field}] ${issue.message}`));
    });
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Unexpected error during validation:', err);
  process.exit(1);
}
