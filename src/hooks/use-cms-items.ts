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

export function useCmsItemBySlug(slug: string | null | undefined) {
  const [item, setItem] = useState<CmsItem | null>(null);
  const [related, setRelated] = useState<CmsItem[]>([]);
  const [author, setAuthor] = useState<{ name: string; avatar_url: string | null; role: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!slug) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("content_items").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!alive) return;
      setItem((data ?? null) as any);
      if (data) {
        // related same category/type
        const { data: rel } = await supabase
          .from("content_items")
          .select("*")
          .eq("status", "published")
          .neq("id", data.id)
          .or(`category_id.eq.${data.category_id ?? "00000000-0000-0000-0000-000000000000"},type.eq.${data.type}`)
          .limit(6);
        if (alive) setRelated((rel ?? []) as any);
        // author
        const { data: link } = await supabase.from("content_item_authors").select("author_id").eq("content_item_id", data.id).limit(1).maybeSingle();
        if (link?.author_id) {
          const { data: a } = await supabase.from("content_authors").select("name,avatar_url,role").eq("id", link.author_id).maybeSingle();
          if (alive) setAuthor((a ?? null) as any);
        }
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  return { item, related, author, loading };
}