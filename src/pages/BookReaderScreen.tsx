import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, List, Search, X, Type, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Chapter = { id: string; chapter_index: number; title: string; subtitle: string | null; summary: string | null; word_count: number; estimated_minutes: number };
type Section = { id: string; chapter_id: string; section_index: number; title: string | null; content: string; word_count: number };

export default function BookReaderScreen() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<{ id: string; title: string; subtitle: string | null; cover_url: string | null; metadata: any } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookId) return;
    (async () => {
      setLoading(true);
      const [b, ch] = await Promise.all([
        supabase.from("content_items").select("id,title,subtitle,cover_url,metadata,status").eq("id", bookId).maybeSingle(),
        supabase.from("book_chapters").select("*").eq("book_id", bookId).order("chapter_index"),
      ]);
      if (b.error) { setError(b.error.message); setLoading(false); return; }
      if (!b.data) { setError("Livro não encontrado."); setLoading(false); return; }
      setBook(b.data as any);
      setChapters((ch.data ?? []) as any);
      if ((ch.data ?? []).length === 0) {
        setError("Este livro ainda não foi processado.");
        setLoading(false);
        return;
      }
      // load all sections
      const { data: secs } = await supabase.from("book_sections")
        .select("*").in("chapter_id", (ch.data ?? []).map((c: any) => c.id)).order("section_index");
      const grouped: Record<string, Section[]> = {};
      for (const s of (secs ?? []) as Section[]) {
        (grouped[s.chapter_id] ||= []).push(s);
      }
      setSections(grouped);
      // load progress
      if (user) {
        const { data: prog } = await supabase.from("book_reading_progress")
          .select("chapter_id").eq("user_id", user.id).eq("book_id", bookId).maybeSingle();
        if (prog?.chapter_id) {
          const idx = (ch.data ?? []).findIndex((c: any) => c.id === prog.chapter_id);
          if (idx >= 0) setCurrentIdx(idx);
        }
      }
      setLoading(false);
    })();
  }, [bookId, user?.id]);

  const currentChapter = chapters[currentIdx];
  const currentSections = currentChapter ? sections[currentChapter.id] ?? [] : [];

  // save progress
  useEffect(() => {
    if (!user || !book || !currentChapter) return;
    const pct = chapters.length ? Math.round(((currentIdx + 1) / chapters.length) * 100) : 0;
    const t = setTimeout(() => {
      supabase.from("book_reading_progress").upsert({
        user_id: user.id,
        book_id: book.id,
        chapter_id: currentChapter.id,
        progress_percent: pct,
        last_read_at: new Date().toISOString(),
        completed_at: pct >= 100 ? new Date().toISOString() : null,
      }, { onConflict: "user_id,book_id" }).then(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [currentIdx, user?.id, book?.id, currentChapter?.id, chapters.length]);

  useEffect(() => { contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [currentIdx]);

  const searchResults = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (q.length < 3) return [];
    const results: { chapterIdx: number; chapterTitle: string; snippet: string }[] = [];
    chapters.forEach((c, idx) => {
      const secs = sections[c.id] ?? [];
      for (const s of secs) {
        const pos = s.content.toLowerCase().indexOf(q);
        if (pos >= 0) {
          const start = Math.max(0, pos - 40);
          const snippet = s.content.slice(start, pos + q.length + 60);
          results.push({ chapterIdx: idx, chapterTitle: c.title, snippet: "…" + snippet + "…" });
          break;
        }
      }
    });
    return results.slice(0, 30);
  }, [searchQ, chapters, sections]);

  if (loading) return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-[#64748B]">Carregando livro…</div>;
  if (error) return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-[#0F172A] font-semibold">{error}</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm">Voltar</button>
    </div>
  );
  if (!book || !currentChapter) return null;

  const progressPct = chapters.length ? Math.round(((currentIdx + 1) / chapters.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F1B16] flex flex-col">
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur border-b border-[#E7E1D6]">
        <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 rounded-lg" aria-label="Voltar">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#7A6E5A] truncate">{book.title}</p>
            <p className="text-sm font-semibold truncate">{currentChapter.title}</p>
          </div>
          <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-black/5 rounded-lg" aria-label="Buscar"><Search className="w-5 h-5" /></button>
          <button onClick={() => setTocOpen(true)} className="p-2 hover:bg-black/5 rounded-lg" aria-label="Sumário"><List className="w-5 h-5" /></button>
        </div>
        <div className="h-1 bg-[#E7E1D6]"><div className="h-full bg-[#F88A2B]" style={{ width: `${progressPct}%` }} /></div>
      </header>

      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <article className="max-w-2xl mx-auto px-6 py-10">
          <p className="text-xs uppercase tracking-widest text-[#7A6E5A] mb-2">Capítulo {currentChapter.chapter_index} de {chapters.length}</p>
          <h1 className="text-3xl font-black mb-2">{currentChapter.title}</h1>
          {currentChapter.subtitle && <p className="text-lg text-[#5C523F] mb-4">{currentChapter.subtitle}</p>}
          {currentChapter.summary && (
            <div className="mb-6 p-4 rounded-lg bg-[#F1EADB] text-sm text-[#5C523F] italic">{currentChapter.summary}</div>
          )}
          <div className="space-y-5 leading-relaxed" style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}>
            {currentSections.length === 0 && <p className="text-[#7A6E5A]">Este capítulo não tem seções.</p>}
            {currentSections.map((s) => (
              <div key={s.id}>
                {s.title && <h2 className="text-xl font-bold mt-6 mb-2">{s.title}</h2>}
                {s.content.split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="mb-4 whitespace-pre-wrap">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </article>

        <nav className="max-w-2xl mx-auto px-6 pb-16 flex justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white border border-[#E7E1D6] text-sm font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button
            onClick={() => setCurrentIdx((i) => Math.min(chapters.length - 1, i + 1))}
            disabled={currentIdx >= chapters.length - 1}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold disabled:opacity-40"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* controles de fonte (flutuante) */}
      <div className="fixed bottom-4 right-4 z-20 flex items-center gap-1 bg-white border border-[#E7E1D6] rounded-full shadow px-2 py-1">
        <button onClick={() => setFontSize((s) => Math.max(14, s - 1))} className="p-1.5 hover:bg-black/5 rounded-full" aria-label="Diminuir fonte"><Minus className="w-4 h-4" /></button>
        <Type className="w-4 h-4 text-[#7A6E5A]" />
        <button onClick={() => setFontSize((s) => Math.min(26, s + 1))} className="p-1.5 hover:bg-black/5 rounded-full" aria-label="Aumentar fonte"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Sumário */}
      {tocOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex justify-end" onClick={() => setTocOpen(false)}>
          <aside className="w-full max-w-md h-full bg-[#FAF7F2] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#FAF7F2] border-b border-[#E7E1D6] p-4 flex items-center justify-between">
              <h2 className="font-black">Sumário</h2>
              <button onClick={() => setTocOpen(false)} className="p-2 hover:bg-black/5 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ul className="p-2">
              {chapters.map((c, idx) => (
                <li key={c.id}>
                  <button
                    onClick={() => { setCurrentIdx(idx); setTocOpen(false); }}
                    className={`w-full text-left p-3 rounded-lg hover:bg-black/5 ${idx === currentIdx ? "bg-[#F1EADB]" : ""}`}
                  >
                    <p className="text-xs text-[#7A6E5A]">Capítulo {c.chapter_index} · {c.estimated_minutes} min</p>
                    <p className="font-semibold">{c.title}</p>
                    {c.summary && <p className="text-xs text-[#5C523F] mt-1 line-clamp-2">{c.summary}</p>}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      {/* Busca */}
      {searchOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center p-4" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b border-[#E7E1D6] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#7A6E5A]" />
              <input autoFocus value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Buscar no livro (mín. 3 letras)…" className="flex-1 outline-none text-sm" />
              <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-black/5 rounded"><X className="w-4 h-4" /></button>
            </div>
            <ul className="max-h-96 overflow-y-auto">
              {searchQ.trim().length >= 3 && searchResults.length === 0 && (
                <li className="p-4 text-sm text-[#7A6E5A]">Nenhum resultado.</li>
              )}
              {searchResults.map((r, i) => (
                <li key={i}>
                  <button
                    onClick={() => { setCurrentIdx(r.chapterIdx); setSearchOpen(false); setSearchQ(""); }}
                    className="w-full text-left p-3 border-b border-[#F1EADB] hover:bg-[#FAF7F2]"
                  >
                    <p className="text-xs font-semibold text-[#0F172A]">{r.chapterTitle}</p>
                    <p className="text-xs text-[#5C523F] mt-0.5">{r.snippet}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}