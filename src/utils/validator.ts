import { RocketStoreProduct, ValidationResult, ValidationIssue } from '../types/registry';

export function validateRegistry(data: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    totalProducts: 0,
    errors: [],
    warnings: [],
  };

  if (!Array.isArray(data)) {
    result.valid = false;
    result.errors.push({
      index: -1,
      issues: [{ field: 'root', message: 'apps-registry.json must be a JSON array []', severity: 'error' }],
    });
    return result;
  }

  result.totalProducts = data.length;
  const seenIds = new Set<string>();

  data.forEach((item, index) => {
    const issues: ValidationIssue[] = [];
    const warningIssues: ValidationIssue[] = [];
    const product = item as Partial<RocketStoreProduct>;

    // 1. Check ID
    if (!product.id || typeof product.id !== 'string' || !product.id.trim()) {
      issues.push({ field: 'id', message: 'Missing or empty string for id', severity: 'error' });
    } else {
      if (seenIds.has(product.id.trim())) {
        issues.push({ field: 'id', message: `Duplicate product ID "${product.id}" found`, severity: 'error' });
      }
      seenIds.add(product.id.trim());
    }

    // 2. Check Name fields
    if (!product.name || typeof product.name !== 'string') {
      issues.push({ field: 'name', message: 'Missing or invalid string for name', severity: 'error' });
    }
    if (!product.name_ar || typeof product.name_ar !== 'string') {
      issues.push({ field: 'name_ar', message: 'Missing or invalid string for name_ar', severity: 'error' });
    }
    if (!product.name_en || typeof product.name_en !== 'string') {
      issues.push({ field: 'name_en', message: 'Missing or invalid string for name_en', severity: 'error' });
    }

    // 3. Check Type
    if (product.type !== 'app' && product.type !== 'game') {
      issues.push({ field: 'type', message: 'type must be either "app" or "game"', severity: 'error' });
    }

    // 4. Check Repository
    if (!product.repository || typeof product.repository !== 'string') {
      issues.push({ field: 'repository', message: 'Missing repository field', severity: 'error' });
    } else if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(product.repository.trim())) {
      issues.push({
        field: 'repository',
        message: 'repository format must be "owner/repo" (e.g. HyperSoft2026/my-app)',
        severity: 'error',
      });
    }

    // 5. Check APK asset
    if (!product.apk_asset || typeof product.apk_asset !== 'string') {
      issues.push({ field: 'apk_asset', message: 'Missing apk_asset filename (e.g. app-release.apk)', severity: 'error' });
    } else if (!product.apk_asset.toLowerCase().endsWith('.apk')) {
      warningIssues.push({
        field: 'apk_asset',
        message: 'apk_asset does not end with .apk extension',
        severity: 'warning',
      });
    }

    // 6. Check Version & Release Tag
    if (product.version === undefined || typeof product.version !== 'string') {
      issues.push({ field: 'version', message: 'Missing or invalid version string', severity: 'error' });
    }
    if (product.release_tag === undefined || typeof product.release_tag !== 'string') {
      issues.push({ field: 'release_tag', message: 'Missing or invalid release_tag string', severity: 'error' });
    }

    // 7. Check Blogger URL
    if (product.blogger_url === undefined || typeof product.blogger_url !== 'string') {
      issues.push({ field: 'blogger_url', message: 'Missing blogger_url field', severity: 'error' });
    } else if (product.blogger_url && !product.blogger_url.startsWith('https://')) {
      warningIssues.push({
        field: 'blogger_url',
        message: 'blogger_url should be a secure HTTPS link (e.g. https://rocketstore5.blogspot.com/...)',
        severity: 'warning',
      });
    }

    // 8. Check Status
    if (product.status !== 'active' && product.status !== 'inactive' && product.status !== 'archived') {
      issues.push({ field: 'status', message: 'status must be "active", "inactive", or "archived"', severity: 'error' });
    }

    if (issues.length > 0) {
      result.valid = false;
      result.errors.push({ index, productId: product.id, issues });
    }
    if (warningIssues.length > 0) {
      result.warnings.push({ index, productId: product.id, issues: warningIssues });
    }
  });

  return result;
}
