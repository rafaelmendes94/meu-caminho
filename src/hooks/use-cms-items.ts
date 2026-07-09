import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CmsItem = {
  id: string;
  type: "book" | "course" | "track" | "podcast" | "video" | "audio" | "material";
  title: string;
  slug: string;
  subtitle: string | null;
  short_description: string | null;
  long_description: string | null;
  cover_url: string | null;
  banner_url: string | null;
  category_id: string | null;
  language: string | null;
  level: string | null;
  duration_minutes: number | null;
  media_url: string | null;
  file_url: string | null;
  is_premium: boolean;
  is_featured: boolean;
  published_at: string | null;
};

export type CmsCategory = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  icon: string | null;
};

export function useCmsItems(type?: CmsItem["type"], opts?: { featured?: boolean; limit?: number; categorySlug?: string }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(null);
      let q = supabase.from("content_items").select("*").eq("status", "published").order("published_at", { ascending: false });
      if (type) q = q.eq("type", type);
      if (opts?.featured) q = q.eq("is_featured", true);
      if (opts?.limit) q = q.limit(opts.limit);
      if (opts?.categorySlug) {
        const { data: cat } = await supabase.from("content_categories").select("id").eq("slug", opts.categorySlug).maybeSingle();
        if (cat?.id) q = q.eq("category_id", cat.id);
      }
      const { data, error } = await q;
      if (!alive) return;
      if (error) setError(error.message); else setItems((data ?? []) as any);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [type, opts?.featured, opts?.limit, opts?.categorySlug]);

  return { items, loading, error };
}

export function useCmsCategories() {
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from("content_categories").select("id,slug,name,color,icon").order("sort_order");
      if (!alive) return;
      setCategories((data ?? []) as any);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  return { categories, loading };
}