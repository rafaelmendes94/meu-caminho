// Edge Function: process-book-pdf
// Baixa o PDF do bucket privado `content-books`, extrai texto, divide em capítulos
// e seções, chama Gemini para gerar títulos/resumos e persiste a estrutura de
// leitura estilo Kindle nas tabelas book_chapters/book_sections.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { extractText, getDocumentProxy } from "npm:unpdf@0.12.1";
import { generateJson, chatCompletion } from "../_shared/gemini.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type BookMeta = {
  original_file_bucket?: string;
  original_file_path?: string;
  original_file_name?: string;
  processing_status?: string;
  [k: string]: unknown;
};

const WORDS_PER_MINUTE = 220;
const MAX_WORDS_PER_CHAPTER = 3500;
const MAX_WORDS_PER_SECTION = 450;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/-\n(\w)/g, "$1") // junta hifenização de fim de linha
    .trim();
}

// Detecta capítulos por padrões comuns; se não achar, faz split por tamanho.
function splitChapters(text: string): { title: string; body: string }[] {
  const chapterRegex = /(^|\n)\s*(Cap[íi]tulo|Chapter|CAP[ÍI]TULO|CHAPTER|Parte|PARTE)\s+([0-9IVXLCDM]+|[A-Za-zÀ-ÿ]+)([^\n]{0,120})/g;
  const matches: { index: number; heading: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = chapterRegex.exec(text)) !== null) {
    matches.push({ index: m.index + (m[1]?.length ?? 0), heading: (m[2] + " " + m[3] + (m[4] ?? "")).trim() });
  }

  if (matches.length >= 2) {
    const out: { title: string; body: string }[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const body = text.slice(start, end).trim();
      // Remove a primeira linha (heading) do body
      const nl = body.indexOf("\n");
      const title = nl > 0 ? body.slice(0, nl).trim() : matches[i].heading;
      const rest = nl > 0 ? body.slice(nl + 1).trim() : body;
      if (rest.length > 40) out.push({ title, body: rest });
    }
    if (out.length >= 2) return out;
  }

  // Fallback: split por número aproximado de palavras
  const paragraphs = text.split(/\n{2,}/);
  const chapters: { title: string; body: string }[] = [];
  let buffer: string[] = [];
  let count = 0;
  let idx = 1;
  for (const p of paragraphs) {
    const wc = wordCount(p);
    if (count + wc > MAX_WORDS_PER_CHAPTER && buffer.length > 0) {
      chapters.push({ title: `Capítulo ${idx++}`, body: buffer.join("\n\n") });
      buffer = [];
      count = 0;
    }
    buffer.push(p);
    count += wc;
  }
  if (buffer.length) chapters.push({ title: `Capítulo ${idx}`, body: buffer.join("\n\n") });
  return chapters;
}

function splitSections(body: string): { title: string | null; content: string }[] {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const sections: { title: string | null; content: string }[] = [];
  let buffer: string[] = [];
  let count = 0;
  for (const p of paragraphs) {
    const wc = wordCount(p);
    if (count + wc > MAX_WORDS_PER_SECTION && buffer.length > 0) {
      sections.push({ title: null, content: buffer.join("\n\n") });
      buffer = [];
      count = 0;
    }
    buffer.push(p);
    count += wc;
  }
  if (buffer.length) sections.push({ title: null, content: buffer.join("\n\n") });
  return sections;
}

async function refineChapterWithAI(rawTitle: string, body: string): Promise<{ title: string; summary: string }> {
  const excerpt = body.slice(0, 6000);
  try {
    const out = await generateJson<{ title?: string; summary?: string }>({
      messages: [
        {
          role: "system",
          content:
            "Você organiza livros para leitura no app. Responda apenas com JSON válido no formato {\"title\": string, \"summary\": string}. Use português do Brasil. Título curto (até 80 caracteres). Resumo de 2-3 frases.",
        },
        {
          role: "user",
          content: `Título bruto detectado: "${rawTitle}"\n\nTrecho inicial do capítulo:\n${excerpt}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });
    return {
      title: (out.title || rawTitle).slice(0, 200),
      summary: (out.summary || "").slice(0, 800),
    };
  } catch {
    return { title: rawTitle, summary: "" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data: isAdmin } = await admin.rpc("is_platform_admin");
    // Alguns projetos definem is_platform_admin() sem args, verificação por role fallback:
    if (!isAdmin) {
      const { data: role } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "platform_admin")
        .maybeSingle();
      if (!role) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { book_id } = await req.json();
    if (!book_id) throw new Error("book_id obrigatório");

    const { data: book, error: bookErr } = await admin
      .from("content_items")
      .select("id,title,metadata,type")
      .eq("id", book_id)
      .maybeSingle();
    if (bookErr || !book) throw new Error("livro não encontrado");
    if (book.type !== "book") throw new Error("item não é do tipo book");

    const meta = (book.metadata ?? {}) as BookMeta;
    const bucket = meta.original_file_bucket ?? "content-books";
    const path = meta.original_file_path;
    if (!path) throw new Error("PDF não enviado ainda");

    // Marca como "processing"
    await admin
      .from("content_items")
      .update({ metadata: { ...meta, processing_status: "processing", processing_error: null } })
      .eq("id", book_id);

    // Baixa o PDF
    const { data: fileData, error: dlErr } = await admin.storage.from(bucket).download(path);
    if (dlErr || !fileData) throw new Error(`download falhou: ${dlErr?.message}`);
    const buf = new Uint8Array(await fileData.arrayBuffer());

    // Extrai texto
    const pdf = await getDocumentProxy(buf);
    const { text: pages } = await extractText(pdf, { mergePages: false });
    const fullTextRaw = Array.isArray(pages) ? pages.join("\n\n") : String(pages ?? "");
    const fullText = normalizeText(fullTextRaw);
    if (fullText.length < 200) throw new Error("texto extraído vazio ou muito curto");

    // Limpa capítulos/seções antigas
    await admin.from("book_chapters").delete().eq("book_id", book_id);

    // Divide em capítulos
    const chapters = splitChapters(fullText);
    const totalWords = wordCount(fullText);

    let processedChapters = 0;
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const refined = await refineChapterWithAI(ch.title, ch.body);
      const wc = wordCount(ch.body);
      const { data: chapRow, error: chErr } = await admin
        .from("book_chapters")
        .insert({
          book_id,
          chapter_index: i + 1,
          title: refined.title,
          subtitle: null,
          summary: refined.summary || null,
          word_count: wc,
          estimated_minutes: Math.max(1, Math.round(wc / WORDS_PER_MINUTE)),
        })
        .select("id")
        .single();
      if (chErr || !chapRow) throw new Error(`falha capítulo ${i + 1}: ${chErr?.message}`);

      const sections = splitSections(ch.body);
      if (sections.length) {
        const rows = sections.map((s, idx) => ({
          chapter_id: chapRow.id,
          section_index: idx + 1,
          title: s.title,
          content: s.content,
          content_json: null,
          word_count: wordCount(s.content),
        }));
        const { error: secErr } = await admin.from("book_sections").insert(rows);
        if (secErr) throw new Error(`falha seções cap ${i + 1}: ${secErr.message}`);
      }
      processedChapters++;
    }

    const newMeta = {
      ...meta,
      processing_status: "processed",
      processing_error: null,
      processed_at: new Date().toISOString(),
      chapters_count: processedChapters,
      words_count: totalWords,
      estimated_reading_minutes: Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE)),
      source_type: "pdf",
      reading_mode: "kindle",
    };
    await admin.from("content_items").update({ metadata: newMeta }).eq("id", book_id);

    return new Response(
      JSON.stringify({
        ok: true,
        chapters: processedChapters,
        words: totalWords,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = (e as Error).message || String(e);
    console.error("process-book-pdf:", msg);
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.book_id) {
        const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
        const { data: b } = await admin.from("content_items").select("metadata").eq("id", body.book_id).maybeSingle();
        const meta = (b?.metadata ?? {}) as BookMeta;
        await admin
          .from("content_items")
          .update({ metadata: { ...meta, processing_status: "failed", processing_error: msg } })
          .eq("id", body.book_id);
      }
    } catch {}
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});