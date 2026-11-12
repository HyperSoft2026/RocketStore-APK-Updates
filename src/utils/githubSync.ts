import { RocketStoreProduct, GitHubRelease, SyncReportItem } from '../types/registry';

export interface SyncOptions {
  githubToken?: string;
}

/**
 * Fetches the latest published stable release from GitHub for a repository
 */
export async function fetchLatestStableRelease(
  repository: string,
  options?: SyncOptions
): Promise<{ release: GitHubRelease | null; error?: string }> {
  const [owner, repo] = repository.trim().split('/');
  if (!owner || !repo) {
    return { release: null, error: `Invalid repository format: ${repository}` };
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RocketStore-Central-Updater/1.0',
  };

  if (options?.githubToken) {
    headers['Authorization'] = `token ${options.githubToken}`;
  }

  try {
    const res = await fetch(url, { headers });

    if (res.status === 404) {
      return { release: null, error: `Repository "${repository}" or releases not found (404)` };
    }
    if (res.status === 403) {
      return { release: null, error: `GitHub API rate limit exceeded or forbidden (403)` };
    }
    if (!res.ok) {
      return { release: null, error: `GitHub API returned HTTP ${res.status}: ${res.statusText}` };
    }

    const releases = (await res.json()) as GitHubRelease[];
    if (!Array.isArray(releases) || releases.length === 0) {
      return { release: null, error: `No releases published for "${repository}"` };
    }

    // Filter out drafts and pre-releases
    const stableRelease = releases.find((r) => !r.draft && !r.prerelease);
    if (!stableRelease) {
      return { release: null, error: `No stable (non-draft, non-prerelease) release found for "${repository}"` };
    }

    return { release: stableRelease };
  } catch (err) {
    return { release: null, error: `Network/API connection error: ${(err as Error).message}` };
  }
}

/**
 * Synchronizes a single product with its latest GitHub Release
 */
export async function syncSingleProduct(
  product: RocketStoreProduct,
  options?: SyncOptions
): Promise<{ updatedProduct: RocketStoreProduct; report: SyncReportItem }> {
  const timestamp = new Date().toISOString();

  if (product.status !== 'active') {
    return {
      updatedProduct: { ...product },
      report: {
        productId: product.id,
        productName: product.name,
        repository: product.repository,
        previousVersion: product.version,
        previousTag: product.release_tag,
        status: 'skipped',
        message: `Product is ${product.status}, skipping sync`,
        timestamp,
      },
    };
  }

  const { release, error } = await fetchLatestStableRelease(product.repository, options);

  if (error || !release) {
    return {
      updatedProduct: { ...product },
      report: {
        productId: product.id,
        productName: product.name,
        repository: product.repository,
        previousVersion: product.version,
        previousTag: product.release_tag,
        status: 'error',
        message: error || 'Failed to fetch release',
        timestamp,
      },
    };
  }

  const newTag = release.tag_name || '';
  const cleanVersion = newTag.replace(/^v/i, '');

  // Look for matching asset
  let matchingAsset = release.assets.find(
    (a) => a.name.toLowerCase() === product.apk_asset.toLowerCase()
  );

  // Fallback: look for any .apk asset if exact match not found
  if (!matchingAsset && release.assets.length > 0) {
    matchingAsset = release.assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
  }

  const downloadUrl = matchingAsset
    ? matchingAsset.browser_download_url
    : `https://github.com/${product.repository}/releases/download/${newTag}/${product.apk_asset}`;

  const hasTagChanged = product.release_tag !== newTag;
  const hasVersionChanged = product.version !== cleanVersion;

  if (!hasTagChanged && !hasVersionChanged && product.download_url === downloadUrl) {
    return {
      updatedProduct: { ...product },
      report: {
        productId: product.id,
        productName: product.name,
        repository: product.repository,
        previousVersion: product.version,
        newVersion: cleanVersion,
        previousTag: product.release_tag,
        newTag,
        status: 'unchanged',
        message: `Product is already up to date (${newTag})`,
        timestamp,
      },
    };
  }

  const updatedProduct: RocketStoreProduct = {
    ...product,
    release_tag: newTag,
    version: cleanVersion,
    download_url: downloadUrl,
    release_date: release.published_at || new Date().toISOString(),
    changelog: release.body || product.changelog,
  };

  return {
    updatedProduct,
    report: {
      productId: product.id,
      productName: product.name,
      repository: product.repository,
      previousVersion: product.version,
      newVersion: cleanVersion,
      previousTag: product.release_tag,
      newTag,
      status: 'updated',
      message: `Updated to ${newTag} (${release.assets.length} assets found)`,
      timestamp,
    },
  };
}
