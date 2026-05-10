import path from "path";
import slugify from "slugify";
import crypto from "crypto";
import { Question } from "../models/question.model";
import { redis } from "../config/redis";

const IMAGE_SECRET = process.env.IMAGE_SIGN_SECRET || "image-secret";

export function normalizeImages(images: any[]): string[] {
    if (!Array.isArray(images)) return [];
    return images
        .map(img => {
            if (typeof img?.saved_path === "string") {
                return path.basename(img.saved_path);
            }
            return null;
        })
        .filter(Boolean) as string[];
}

export function applyLatexMapping(
  text: string,
  latexMap?: Record<string, string>
): string {
  if (!text || !latexMap) return text;

  let result = text;

  for (const [token, latex] of Object.entries(latexMap)) {
    if (!latex) continue;

    const normalized = normalizeLatex(latex);

    result = result.replace(
      new RegExp(escapeRegExp(token), "g"),
      `$${normalized}$`
    );
  }

  return result;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLatex(latex: string): string {
  let s = latex.trim();

  // Fix OCR phổ biến
  s = s.replace(/\\mathrm\{\\g\}/g, "\\mathrm{g}");

  // Fix thiếu }
  const open = (s.match(/{/g) || []).length;
  const close = (s.match(/}/g) || []).length;
  if (close < open) {
    s += "}".repeat(open - close);
  }

  return s;
}


export function sanitizeFilename(originalName: string) {
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);

    const safeBase = slugify(base, {
        lower: false,
        strict: true,   // ❗ remove all special chars
        locale: "vi",
    });

    return `${Date.now()}-${safeBase}${ext}`;
}

export function signImage(filename: string, exp: number) {
    const data = `${filename}:${exp}`;
    const sig = crypto
        .createHmac("sha256", IMAGE_SECRET)
        .update(data)
        .digest("hex");

    return sig;
}

export function verifyImage(filename: string, exp: number, sig: string) {
    if (Date.now() > exp * 1000) return false;
    const expected = signImage(filename, exp);
    return expected === sig;
}

export enum QuestionType {
    SINGLE = 1,
    MULTIPLE = 2,
    ESSAY = 3
}

function isQuestionType(value: number): value is QuestionType {
    return value === QuestionType.SINGLE
        || value === QuestionType.MULTIPLE
        || value === QuestionType.ESSAY;
}

export type QuestionGroup = Record<QuestionType, Question[]>;

export function groupQuestionsByTypeSafe(
    questions: Question[]
): QuestionGroup {
    const result: QuestionGroup = {
        [QuestionType.SINGLE]: [],
        [QuestionType.MULTIPLE]: [],
        [QuestionType.ESSAY]: []
    };

    questions.forEach(q => {
        if (q.type_question == null) return;
        if (!isQuestionType(q.type_question)) return;

        result[q.type_question].push(q);
    });

    return result;
}

export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[CACHE HIT] → ${key}`);
    }
    return JSON.parse(cached) as T;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[CACHE MISS] → ${key} (query DB)`);
  }

  const data = await fn();

  await redis.set(key, JSON.stringify(data), "EX", ttl);

  return data;
}

export async function invalidateExamCache(exam_id: number) {
  const pattern = `exam:${exam_id}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`[CACHE INVALIDATE] ${keys.length} keys for exam ${exam_id}`);
  }
}