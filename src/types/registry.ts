/**
 * RocketStore APK Updates - Central Registry Types
 * System Architecture Phase 1
 */

export type ProductType = 'app' | 'game';

export type ProductStatus = 'active' | 'inactive' | 'archived';

export interface RocketStoreProduct {
  /** Unique product ID (e.g., "com.hypersoft.rocketstore") */
  id: string;
  /** Primary product display name */
  name: string;
  /** Arabic product name */
  name_ar: string;
  /** English product name */
  name_en: string;
  /** Product classification: application or game */
  type: ProductType;
  /** Product description summary */
  description: string;
  /** GitHub Repository path (e.g. "HyperSoft2026/my-app") */
  repository: string;
  /** Current GitHub release version tag (e.g. "v1.0.0") */
  release_tag: string;
  /** Current release version number (e.g. "1.0.0") */
  version: string;
  /** Expected APK filename inside GitHub Release assets (e.g. "app-release.apk") */
  apk_asset: string;
  /** Direct or stable download URL */
  download_url: string;
  /** Permanent Blogger post URL on https://rocketstore5.blogspot.com/ */
  blogger_url: string;
  /** Date of the last verified release (ISO string) */
  release_date: string;
  /** Release changelog notes */
  changelog: string;
  /** Product status in registry */
  status: ProductStatus;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  totalProducts: number;
  errors: Array<{ index: number; productId?: string; issues: ValidationIssue[] }>;
  warnings: Array<{ index: number; productId?: string; issues: ValidationIssue[] }>;
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  body: string;
  assets: GitHubReleaseAsset[];
  html_url: string;
}

export interface SyncReportItem {
  productId: string;
  productName: string;
  repository: string;
  previousVersion: string;
  newVersion?: string;
  previousTag: string;
  newTag?: string;
  status: 'updated' | 'unchanged' | 'error' | 'skipped';
  message: string;
  timestamp: string;
}
