import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { CourseForm } from "@/components/admin/CourseForm";
import type { ContentItem } from "@/components/admin/ContentItemForm";

// Curso agora tem 1 vídeo único. Esta rota (/admin/content/courses/:id) carrega o curso
// e abre o mesmo CourseForm usado na listagem.
export default function PlatformContentCourseBuilderScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase.from("content_items").select("*").eq("id", id).eq("type", "course").maybeSingle();
      if (!data) setNotFound(true); else setItem(data as any);
    })();
  }, [id]);

  const goBack = () => navigate("/admin/content/courses");

  return (
    <PlatformAdminLayout>
      <div className="mb-4"><Link to="/admin/content/courses" className="text-white/50 text-xs hover:text-white">← Voltar para Cursos</Link></div>
      {notFound && <p className="text-white/60 text-sm">Curso não encontrado.</p>}
      {!item && !notFound && <p className="text-white/60 text-sm">Carregando…</p>}
      {item && <CourseForm item={item} onSaved={goBack} onClose={goBack} />}
    </PlatformAdminLayout>
  );
}