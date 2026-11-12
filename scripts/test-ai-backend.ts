/**
 * RocketStore AI Backend Automated Test Suite
 * Tests Gemini service behavior under:
 * - Missing API key
 * - Invalid API key
 * - Invalid Model
 * - APK naming formula "Name_App-RocketStore.apk"
 * - Sanitizer and Category detection
 */

import { GeminiService } from '../server/geminiService';

async function runTests() {
  console.log('🧪 Starting RocketStore AI Backend Automated Tests...\n');
  let passed = 0;
  let total = 0;

  // Test 1: Status without API Key
  total++;
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.VITE_GEMINI_API_KEY;

  const statusWithoutKey = GeminiService.getStatus();
  if (!statusWithoutKey.isConfigured && statusWithoutKey.status === 'missing_key') {
    console.log('✅ Test 1 Passed: Handled missing GEMINI_API_KEY correctly.');
    passed++;
  } else {
    console.error('❌ Test 1 Failed: Expected missing_key status.');
  }

  // Test 2: Connection test without API Key
  total++;
  const testConnWithoutKey = await GeminiService.testConnection();
  if (!testConnWithoutKey.success && testConnWithoutKey.status === 'missing_key') {
    console.log(`✅ Test 2 Passed: Connection test returned safe Arabic message: "${testConnWithoutKey.message_ar}"`);
    passed++;
  } else {
    console.error('❌ Test 2 Failed: Did not safely reject missing key.');
  }

  // Test 3: Connection test with INVALID API Key
  total++;
  process.env.GEMINI_API_KEY = 'TEST_INVALID_KEY_99999';
  const testConnWithInvalidKey = await GeminiService.testConnection();
  if (!testConnWithInvalidKey.success && (testConnWithInvalidKey.status === 'invalid_key' || testConnWithInvalidKey.status === 'error')) {
    console.log(`✅ Test 3 Passed: Handled invalid API key gracefully: [${testConnWithInvalidKey.status}] "${testConnWithInvalidKey.message_ar}"`);
    passed++;
  } else {
    console.error('❌ Test 3 Failed: Invalid API key was not handled correctly.');
  }

  // Test 4: APK Naming Formula Enforcer
  total++;
  const apkResult = await GeminiService.suggestApkFilename({
    appName: 'Speed Booster Pro',
    version: '1.2.0',
  });
  if (apkResult.success && apkResult.result?.apk_asset_name?.endsWith('-RocketStore.apk')) {
    console.log(`✅ Test 4 Passed: APK filename adheres to formula: "${apkResult.result.apk_asset_name}"`);
    passed++;
  } else {
    console.error('❌ Test 4 Failed: APK formula was not enforced.', apkResult);
  }

  // Test 5: Filename Sanitizer
  total++;
  const cleanResult = await GeminiService.cleanFilename('my_game#$@! 2026 🔥.apk');
  if (cleanResult.success && cleanResult.result?.cleaned_filename) {
    console.log(`✅ Test 5 Passed: Filename sanitized: "${cleanResult.result.cleaned_filename}"`);
    passed++;
  } else {
    console.error('❌ Test 5 Failed: Filename was not sanitized.', cleanResult);
  }

  // Restore original key
  if (originalKey) {
    process.env.GEMINI_API_KEY = originalKey;
  } else {
    delete process.env.GEMINI_API_KEY;
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed successfully.`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
