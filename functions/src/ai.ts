import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {GoogleGenAI} from "@google/genai";

const geminiKey = defineSecret("GEMINI_API_KEY");

// gemini-2.0-flash was retired from the free tier; use the auto-updating
// alias first and fall back when the free tier returns 503 / 429.
const MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

const MAX_PROMPT_CHARS = 4000;
const MAX_CONTEXT_CHARS = 8000;

const SYSTEM_CONTEXT = `אתה עוזר AI של פלטפורמת TeenWork — פלטפורמה לחיבור בין נוער בישראל (גילאי 14-18) למעסיקים.
אתה מדבר בעברית, בגובה העיניים, בטון ידידותי ומקצועי.
אתה מכיר את חוקי העבודה לנוער בישראל.
אל תמציא מידע — אם אתה לא בטוח, אמור זאת.

כללי מענה — חובה:
- מקסימום 5 משפטים לתשובה.
- כל משפט קצר — עד 10 מילים.
- בלי משפטי פתיחה — ישר לעניין.
- סיים כל תשובה בשורה נפרדת: "יש עוד שאלות? 😊"`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Streams a Gemini answer to a logged-in user. The API key never leaves the server.
 * Chunks are text deltas; the final result carries the full text.
 */
export const aiGenerate = onCall(
  {secrets: [geminiKey], timeoutSeconds: 60, memory: "256MiB"},
  async (request, response) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required");

    const {prompt, context} = request.data || {};
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
      throw new HttpsError("invalid-argument", "Invalid prompt");
    }
    if (context !== undefined && (typeof context !== "string" || context.length > MAX_CONTEXT_CHARS)) {
      throw new HttpsError("invalid-argument", "Invalid context");
    }

    const apiKey = geminiKey.value();
    if (!apiKey) throw new HttpsError("failed-precondition", "AI is not configured");

    const genai = new GoogleGenAI({apiKey});
    const fullPrompt = context ?
      `${SYSTEM_CONTEXT}\n\n${context}\n\n${prompt}` :
      `${SYSTEM_CONTEXT}\n\n${prompt}`;

    for (let attempt = 0; attempt < 4; attempt++) {
      const model = MODELS[Math.min(attempt, MODELS.length - 1)];
      let text = "";
      try {
        const stream = await genai.models.generateContentStream({
          model,
          contents: fullPrompt,
          config: {
            thinkingConfig: {thinkingBudget: 0},
            maxOutputTokens: 800,
          },
        });
        for await (const chunk of stream) {
          const delta = chunk.text || "";
          if (!delta) continue;
          text += delta;
          if (request.acceptsStreaming && response) await response.sendChunk(delta);
        }
        return {text};
      } catch (err) {
        if (text) return {text};
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient = /"code":\s*(429|503)/.test(msg);
        if (!isTransient) {
          console.error("Gemini request failed:", msg);
          throw new HttpsError("internal", "AI request failed");
        }
        await sleep(800 * (attempt + 1));
      }
    }
    throw new HttpsError("resource-exhausted", "AI temporarily unavailable");
  }
);
