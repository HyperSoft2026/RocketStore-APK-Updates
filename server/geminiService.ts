/**
 * RocketStore AI Backend Service
 * Integration with Google Gemini REST API
 * Securely uses GEMINI_API_KEY and GEMINI_MODEL on the server.
 * Never exposes secrets to browser or client logs.
 */

export interface GeminiStatus {
  provider: 'Google Gemini';
  model: string;
  isConfigured: boolean;
  status: 'ready' | 'missing_key';
  message_ar: string;
}

export interface GeminiTestResult {
  success: boolean;
  status: 'connected' | 'missing_key' | 'invalid_key' | 'model_not_found' | 'rate_limited' | 'network_error' | 'error';
  message_ar: string;
  model: string;
  latencyMs?: number;
}

export interface AIAnalysisResult {
  suggested_name_ar: string;
  suggested_name_en: string;
  cleaned_filename: string;
  apk_asset_name: string; // Must follow "Name_App-RocketStore.apk"
  category: 'app' | 'game';
  description_ar: string;
  description_en: string;
  keywords: string[];
  blogger_post_title: string;
  needs_review: boolean;
  review_reason_ar?: string;
  confidence: 'high' | 'medium' | 'low';
}

export class GeminiService {
  private static getApiKey(): string | null {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || null;
    return key && key.trim().length > 0 ? key.trim() : null;
  }

  public static getModel(): string {
    return process.env.GEMINI_MODEL?.trim() || 'gemini-flash-latest';
  }

  public static getStatus(): GeminiStatus {
    const key = this.getApiKey();
    const model = this.getModel();

    if (!key) {
      return {
        provider: 'Google Gemini',
        model,
        isConfigured: false,
        status: 'missing_key',
        message_ar: 'لم يتم العثور على متغير البيئة GEMINI_API_KEY على الخادم.',
      };
    }

    return {
      provider: 'Google Gemini',
      model,
      isConfigured: true,
      status: 'ready',
      message_ar: 'خدمة Gemini مهيأة ومستعدة لاستقبال الطلبات.',
    };
  }

  /**
   * Tests the connection with Gemini API using a lightweight ping prompt.
   */
  public static async testConnection(): Promise<GeminiTestResult> {
    const key = this.getApiKey();
    const model = this.getModel();

    if (!key) {
      return {
        success: false,
        status: 'missing_key',
        model,
        message_ar: 'مفتاح API غير متوفر في متغيرات البيئة (GEMINI_API_KEY).',
      };
    }

    const startTime = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-goog-api-key': key,
          'Content-Type': 'application/json',
          'User-Agent': 'RocketStore-AI/1.0',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Respond with the single word: OK' }],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          return {
            success: true,
            status: 'connected',
            model,
            latencyMs,
            message_ar: 'تم الاتصال بخدمة Gemini بنجاح والاستجابة مطابقة للمواصفات.',
          };
        }
      }

      // Handle specific HTTP error status codes safely without printing keys
      const errorJson = await response.json().catch(() => ({}));
      const errReason = errorJson?.error?.details?.[0]?.reason || errorJson?.error?.status || '';

      if (response.status === 400 && errReason === 'API_KEY_INVALID') {
        return {
          success: false,
          status: 'invalid_key',
          model,
          message_ar: 'مفتاح API غير صالح أو غير معتمد من Google.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          status: 'model_not_found',
          model,
          message_ar: `النموذج المحدد (${model}) غير متاح أو اسم النموذج غير صحيح.`,
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          status: 'rate_limited',
          model,
          message_ar: 'تجاوزت حدود الاستخدام (Rate limit) المسموح بها في Gemini.',
        };
      }

      return {
        success: false,
        status: 'error',
        model,
        message_ar: `تعذر الاتصال بخدمة الذكاء الاصطناعي (رمز الاستجابة: ${response.status}).`,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return {
          success: false,
          status: 'network_error',
          model,
          message_ar: 'انتهت المهلة الزمنية للاتصال بخدمة Gemini (Timeout).',
        };
      }

      return {
        success: false,
        status: 'network_error',
        model,
        message_ar: 'تعذر الاتصال بخدمة الذكاء الاصطناعي بسبب خطأ في الشبكة أو انقطاع الاتصال.',
      };
    }
  }

  /**
   * Sends prompt to Gemini REST API with strict JSON formatting and response validation
   */
  public static async executeGenerate(
    prompt: string,
    systemInstruction?: string,
    forceJson = false
  ): Promise<{ success: boolean; data?: string; message_ar: string; status: string }> {
    const key = this.getApiKey();
    const model = this.getModel();

    if (!key) {
      return {
        success: false,
        status: 'missing_key',
        message_ar: 'مفتاح API غير متوفر في متغيرات البيئة.',
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const bodyPayload: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (forceJson) {
      bodyPayload.generationConfig = {
        responseMimeType: 'application/json',
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-goog-api-key': key,
          'Content-Type': 'application/json',
          'User-Agent': 'RocketStore-AI/1.0',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 400) {
          return { success: false, status: 'invalid_key', message_ar: 'مفتاح API غير صالح.' };
        }
        if (response.status === 404) {
          return { success: false, status: 'model_not_found', message_ar: 'النموذج غير متاح.' };
        }
        if (response.status === 429) {
          return { success: false, status: 'rate_limited', message_ar: 'تجاوزت حدود الاستخدام المتاحة.' };
        }
        return {
          success: false,
          status: 'api_error',
          message_ar: `فشل استدعاء Gemini (HTTP ${response.status}).`,
        };
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText || typeof rawText !== 'string') {
        return {
          success: false,
          status: 'empty_response',
          message_ar: 'تم استلام استجابة فارغة من نموذج الذكاء الاصطناعي.',
        };
      }

      return {
        success: true,
        status: 'success',
        data: rawText,
        message_ar: 'تم تنفيذ العملية بنجاح.',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return {
          success: false,
          status: 'timeout',
          message_ar: 'انتهت المهلة الزمنية لمعالجة الطلب (25 ثانية).',
        };
      }
      return {
        success: false,
        status: 'network_error',
        message_ar: 'تعذر الاتصال بخدمة الذكاء الاصطناعي.',
      };
    }
  }

  /**
   * Action: Suggest Professional Name
   */
  public static async suggestName(input: {
    rawName?: string;
    description?: string;
    repository?: string;
    type?: string;
  }) {
    const prompt = `Suggest clean, professional Arabic and English titles for this ${input.type || 'app'}:
Raw Name: ${input.rawName || 'N/A'}
Repository: ${input.repository || 'N/A'}
Description: ${input.description || 'N/A'}

Rules:
- Never hallucinate details.
- Provide JSON output with keys: "name_ar" (Arabic name) and "name_en" (English name).`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore AI assistant. Return ONLY valid JSON.',
      true
    );

    if (!res.success || !res.data) return res;

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم اقتراح اسم التطبيق بنجاح.' };
    } catch {
      return { success: false, message_ar: 'فشل تحليل الاستجابة من الذكاء الاصطناعي.', status: 'parse_error' };
    }
  }

  /**
   * Action: Clean Filename
   */
  public static async cleanFilename(rawFilename: string) {
    const prompt = `Clean this filename by removing invalid characters, emojis, weird symbols, and multiple consecutive hyphens or spaces:
Filename: "${rawFilename}"
Rules:
- Output JSON with keys: "cleaned_filename" and "changes_applied".`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore AI filename sanitizer. Return valid JSON.',
      true
    );

    if (!res.success || !res.data) {
      // Deterministic fallback if API is unreachable
      const fallbackClean = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
      return {
        success: true,
        result: { cleaned_filename: fallbackClean, changes_applied: 'Sanitized invalid symbols (local fallback)' },
        message_ar: 'تم تنظيف اسم الملف.',
      };
    }

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم تنظيف اسم الملف بنجاح.' };
    } catch {
      // Deterministic fallback if parse fails
      const fallbackClean = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
      return {
        success: true,
        result: { cleaned_filename: fallbackClean, changes_applied: 'Sanitized invalid symbols' },
        message_ar: 'تم تنظيف اسم الملف.',
      };
    }
  }

  /**
   * Action: Suggest APK Filename
   * Formula requirement: "Name_App-RocketStore.apk"
   */
  public static async suggestApkFilename(input: { appName: string; version?: string }) {
    const prompt = `Generate a standard APK filename according to the RocketStore formula:
"Name_App-RocketStore.apk"
Input Name: "${input.appName}"
Version: "${input.version || ''}"
Rules:
- Replace spaces with underscores or hyphens.
- Remove illegal characters.
- MUST end with "-RocketStore.apk".
- Return JSON: {"apk_asset_name": "CalculatedName_App-RocketStore.apk"}`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore APK naming engine. Strictly enforce "Name_App-RocketStore.apk" format in JSON.',
      true
    );

    if (!res.success || !res.data) {
      // Local deterministic fallback
      const cleanName = input.appName.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      const fallbackName = `${cleanName || 'App'}-RocketStore.apk`;
      return {
        success: true,
        result: { apk_asset_name: fallbackName },
        message_ar: 'تم توليد اسم APK بالصيغة القياسية.',
      };
    }

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم اقتراح اسم ملف APK بنجاح.' };
    } catch {
      const cleanName = input.appName.trim().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      return {
        success: true,
        result: { apk_asset_name: `${cleanName || 'App'}-RocketStore.apk` },
        message_ar: 'تم توليد اسم APK بالصيغة القياسية.',
      };
    }
  }

  /**
   * Action: Generate Description
   */
  public static async generateDescription(input: {
    name: string;
    type?: string;
    currentDesc?: string;
    repository?: string;
  }) {
    const prompt = `Write a professional store description for this ${input.type || 'app'}:
Name: ${input.name}
Repo: ${input.repository || 'N/A'}
Current Notes: ${input.currentDesc || 'N/A'}

Rules:
- Write both Arabic and English concise, attractive store descriptions.
- Do NOT invent features or make claims not supported by the provided info.
- If information is insufficient, state in "needs_review": true.
- Return JSON with:
  "description_ar": "...",
  "description_en": "...",
  "needs_review": boolean,
  "review_reason_ar": "..."`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore copywriter. Return truthful, professional descriptions in JSON.',
      true
    );

    if (!res.success || !res.data) return res;

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم توليد الوصف الاحترافي بنجاح.' };
    } catch {
      return { success: false, message_ar: 'فشل تحليل الاستجابة من الذكاء الاصطناعي.', status: 'parse_error' };
    }
  }

  /**
   * Action: Detect Category (app or game)
   */
  public static async detectCategory(input: { name: string; description?: string; repo?: string }) {
    const prompt = `Classify this product into either "app" or "game":
Name: ${input.name}
Description: ${input.description || 'N/A'}
Repo: ${input.repo || 'N/A'}

Rules:
- category MUST be either "app" or "game".
- Return JSON with:
  "category": "app" | "game",
  "confidence": "high" | "medium" | "low",
  "reason_ar": "..."`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore classifier. Output JSON.',
      true
    );

    if (!res.success || !res.data) return res;

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم تصنيف المنتج بنجاح.' };
    } catch {
      return { success: false, message_ar: 'فشل استخراج التصنيف.', status: 'parse_error' };
    }
  }

  /**
   * Action: Extract Keywords
   */
  public static async extractKeywords(input: { name: string; description?: string; type?: string }) {
    const prompt = `Extract 6 to 10 relevant search keywords for RocketStore & Blogger:
Name: ${input.name}
Type: ${input.type || 'app'}
Description: ${input.description || 'N/A'}

Return JSON:
{
  "keywords": ["tag1", "tag2", ...]
}`;

    const res = await this.executeGenerate(
      prompt,
      'You are RocketStore SEO specialist. Return JSON with keywords array.',
      true
    );

    if (!res.success || !res.data) return res;

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم استخراج الكلمات المفتاحية بنجاح.' };
    } catch {
      return { success: false, message_ar: 'فشل استخراج الكلمات المفتاحية.', status: 'parse_error' };
    }
  }

  /**
   * Action: Suggest Blogger Title
   */
  public static async suggestBloggerTitle(input: {
    name: string;
    name_ar?: string;
    version?: string;
    type?: string;
  }) {
    const prompt = `Suggest an attractive Blogger post title for rocketstore5.blogspot.com:
Product: ${input.name} (${input.name_ar || ''})
Type: ${input.type || 'app'}
Version: ${input.version || 'Latest'}

Rules:
- Suitable for Blogger post permalinks.
- Formats: "تحميل [اسم التطبيق] للاندرويد أحدث إصدار APK"
- Return JSON:
  {
    "blogger_title_ar": "...",
    "blogger_title_en": "..."
  }`;

    const res = await this.executeGenerate(
      prompt,
      'You are Blogger post title generator for RocketStore. Return JSON.',
      true
    );

    if (!res.success || !res.data) return res;

    try {
      const parsed = JSON.parse(cleanJsonString(res.data));
      return { success: true, result: parsed, message_ar: 'تم اقتراح عنوان مشاركة Blogger بنجاح.' };
    } catch {
      return { success: false, message_ar: 'فشل استخراج العنوان.', status: 'parse_error' };
    }
  }

  /**
   * Action: Full App Analysis (All 8 requirements in structured JSON)
   */
  public static async fullAnalysis(input: {
    rawName?: string;
    repository?: string;
    description?: string;
    rawFilename?: string;
    version?: string;
    type?: string;
  }): Promise<{ success: boolean; result?: AIAnalysisResult; message_ar: string; status?: string }> {
    const prompt = `Perform a complete analysis for this RocketStore item:
Raw Name: ${input.rawName || 'N/A'}
Repository: ${input.repository || 'N/A'}
Description: ${input.description || 'N/A'}
Raw Filename: ${input.rawFilename || 'N/A'}
Version: ${input.version || 'v1.0.0'}
User Selected Type: ${input.type || 'auto'}

STRICT RULES:
1. Do NOT invent fake features or claims not evident from the input.
2. If information is too vague or insufficient, set "needs_review": true and explain in "review_reason_ar".
3. "category" MUST be strictly "app" or "game".
4. "apk_asset_name" MUST follow the format "Name_App-RocketStore.apk" (e.g., CleanName-RocketStore.apk).
5. Clean the raw filename from invalid characters.
6. Provide concise Arabic and English descriptions.
7. Return a JSON matching this exact structure:
{
  "suggested_name_ar": string,
  "suggested_name_en": string,
  "cleaned_filename": string,
  "apk_asset_name": string,
  "category": "app" | "game",
  "description_ar": string,
  "description_en": string,
  "keywords": string[],
  "blogger_post_title": string,
  "needs_review": boolean,
  "review_reason_ar": string,
  "confidence": "high" | "medium" | "low"
}`;

    const res = await this.executeGenerate(
      prompt,
      'You are the chief RocketStore AI analysis engine. Output ONLY structured JSON following the exact schema.',
      true
    );

    if (!res.success || !res.data) {
      return {
        success: false,
        status: res.status,
        message_ar: res.message_ar || 'تعذر إجراء التحليل عبر الذكاء الاصطناعي.',
      };
    }

    try {
      const parsed = JSON.parse(cleanJsonString(res.data)) as AIAnalysisResult;

      // Enforce APK name format validation
      if (!parsed.apk_asset_name || !parsed.apk_asset_name.endsWith('.apk')) {
        const base = (parsed.suggested_name_en || input.rawName || 'App').replace(/[^a-zA-Z0-9]/g, '_');
        parsed.apk_asset_name = `${base}-RocketStore.apk`;
      }

      if (parsed.category !== 'app' && parsed.category !== 'game') {
        parsed.category = 'app';
      }

      return {
        success: true,
        result: parsed,
        message_ar: 'تم إجراء التحليل الشامل بنجاح بصيغة JSON منظمة.',
      };
    } catch (e: any) {
      return {
        success: false,
        status: 'parse_error',
        message_ar: 'فشل تحليل مخرجات JSON من النموذج.',
      };
    }
  }
}

/**
 * Removes markdown code blocks if the model outputs ```json ... ```
 */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}
