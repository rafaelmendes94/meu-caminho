import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";

type Module = { id: string; course_id: string; title: string; description: string | null; sort_order: number };
type Lesson = { id: string; module_id: string; title: string; lesson_type: "video"|"text"|"pdf"|"audio"|"exercise"; duration_minutes: number | null; sort_order: number; media_url: string | null; content: string | null; is_published: boolean };

export default function PlatformContentCourseBuilderScreen() {
  const { id } = useParams();
  const [course, setCourse] = useState<{ id: string; title: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: c } = await supabase.from("content_items").select("id,title").eq("id", id).maybeSingle();
    setCourse(c as any);
    const { data: mods } = await supabase.from("course_modules").select("*").eq("course_id", id).order("sort_order");
    setModules((mods ?? []) as Module[]);
    const ids = (mods ?? []).map((m: any) => m.id);
    if (ids.length) {
      const { data: lessons } = await supabase.from("course_lessons").select("*").in("module_id", ids).order("sort_order");
      const grouped: Record<string, Lesson[]> = {};
      (lessons ?? []).forEach((l: any) => { (grouped[l.module_id] ||= []).push(l); });
      setLessonsByModule(grouped);
    } else setLessonsByModule({});
    setLoading(false);
  };
  useEffect(() => { void load(); }, [id]);

  const addModule = async () => {
    const title = prompt("Nome do módulo:"); if (!title) return;
    const { error } = await supabase.from("course_modules").insert({ course_id: id!, title, sort_order: modules.length });
    if (error) return toast.error(error.message);
    void load();
  };
  const editModule = async (m: Module) => {
    const title = prompt("Novo nome:", m.title); if (!title) return;
    const { error } = await supabase.from("course_modules").update({ title }).eq("id", m.id);
    if (error) return toast.error(error.message);
    void load();
  };
  const moveModule = async (m: Module, dir: -1 | 1) => {
    const other = modules[modules.indexOf(m) + dir]; if (!other) return;
    await supabase.from("course_modules").update({ sort_order: other.sort_order }).eq("id", m.id);
    await supabase.from("course_modules").update({ sort_order: m.sort_order }).eq("id", other.id);
    void load();
  };
  const removeModule = async (m: Module) => {
    if (!confirm(`Excluir módulo "${m.title}" e todas as aulas?`)) return;
    await supabase.from("course_modules").delete().eq("id", m.id);
    void load();
  };

  const addLesson = async (m: Module) => {
    const title = prompt("Título da aula:"); if (!title) return;
    const count = (lessonsByModule[m.id] ?? []).length;
    const { error } = await supabase.from("course_lessons").insert({ module_id: m.id, title, lesson_type: "video", sort_order: count });
    if (error) return toast.error(error.message);
    void load();
  };
  const editLesson = async (l: Lesson) => {
    const title = prompt("Título:", l.title); if (title === null) return;
    const media_url = prompt(
      "URL da mídia\n\n• Vídeo VTurb: cole a URL completa do script (https://scripts.converteai.net/<conta>/players/<id>/player.js)\n• Áudio/PDF: URL direta do arquivo",
      l.media_url ?? ""
    );
    const lesson_type = (prompt("Tipo (video/text/pdf/audio/exercise):", l.lesson_type) ?? l.lesson_type) as Lesson["lesson_type"];
    const duration = prompt("Duração (min):", l.duration_minutes?.toString() ?? "");
    const { error } = await supabase.from("course_lessons").update({ title, media_url, lesson_type, duration_minutes: duration ? Number(duration) : null }).eq("id", l.id);
    if (error) return toast.error(error.message);
    void load();
  };
  const moveLesson = async (l: Lesson, dir: -1 | 1) => {
    const arr = lessonsByModule[l.module_id] ?? [];
    const other = arr[arr.indexOf(l) + dir]; if (!other) return;
    await supabase.from("course_lessons").update({ sort_order: other.sort_order }).eq("id", l.id);
    await supabase.from("course_lessons").update({ sort_order: l.sort_order }).eq("id", other.id);
    void load();
  };
  const togglePublish = async (l: Lesson) => {
    await supabase.from("course_lessons").update({ is_published: !l.is_published }).eq("id", l.id);
    void load();
  };
  const removeLesson = async (l: Lesson) => {
    if (!confirm("Excluir aula?")) return;
    await supabase.from("course_lessons").delete().eq("id", l.id);
    void load();
  };

  return (
    <PlatformAdminLayout>
      <div className="mb-4"><Link to="/admin/content/courses" className="text-white/50 text-xs hover:text-white">← Voltar para Cursos</Link></div>
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Curso</p>
          <h1 className="text-3xl font-black text-white mt-1">{course?.title ?? "…"}</h1>
        </div>
        <button onClick={addModule} className="px-4 py-2.5 bg-[#F88A2B] text-black rounded-lg text-sm font-bold">Novo módulo</button>
      </header>

      {loading && <p className="text-white/60 text-sm">Carregando…</p>}
      {!loading && modules.length === 0 && <p className="text-white/40 text-sm">Nenhum módulo. Comece criando um.</p>}

      <div className="space-y-4">
        {modules.map((m, i) => (
          <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/40 text-xs w-8">#{i + 1}</span>
              <h3 className="text-white font-bold flex-1">{m.title}</h3>
              <button onClick={() => moveModule(m, -1)} disabled={i === 0} className="text-white/50 hover:text-white disabled:opacity-30">↑</button>
              <button onClick={() => moveModule(m, 1)} disabled={i === modules.length - 1} className="text-white/50 hover:text-white disabled:opacity-30">↓</button>
              <button onClick={() => editModule(m)} className="text-[#F88A2B] text-xs font-bold hover:underline">Renomear</button>
              <button onClick={() => addLesson(m)} className="text-blue-400 text-xs font-bold hover:underline">+ Aula</button>
              <button onClick={() => removeModule(m)} className="text-red-400 text-xs font-bold hover:underline">Excluir</button>
            </div>
            <div className="ml-8 space-y-1">
              {(lessonsByModule[m.id] ?? []).map((l, j, arr) => (
                <div key={l.id} className="flex items-center gap-2 py-2 border-b border-white/5 text-sm">
                  <span className="text-white/30 w-6">{j + 1}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-white/60">{l.lesson_type}</span>
                  <span className="text-white flex-1 truncate">{l.title}</span>
                  {l.duration_minutes && <span className="text-white/40 text-xs">{l.duration_minutes}min</span>}
                  <button onClick={() => moveLesson(l, -1)} disabled={j === 0} className="text-white/40 hover:text-white disabled:opacity-30">↑</button>
                  <button onClick={() => moveLesson(l, 1)} disabled={j === arr.length - 1} className="text-white/40 hover:text-white disabled:opacity-30">↓</button>
                  <button onClick={() => togglePublish(l)} className={`text-xs font-bold hover:underline ${l.is_published ? "text-green-400" : "text-yellow-400"}`}>{l.is_published ? "PUB" : "OFF"}</button>
                  <button onClick={() => editLesson(l)} className="text-[#F88A2B] text-xs font-bold hover:underline">Editar</button>
                  <button onClick={() => removeLesson(l)} className="text-red-400 text-xs font-bold hover:underline">×</button>
                </div>
              ))}
              {(lessonsByModule[m.id] ?? []).length === 0 && <p className="text-white/30 text-xs italic py-2">Sem aulas.</p>}
            </div>
          </div>
        ))}
      </div>
    </PlatformAdminLayout>
  );
}