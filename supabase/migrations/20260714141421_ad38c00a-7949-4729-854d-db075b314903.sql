REVOKE ALL ON FUNCTION public.invalidate_rec_cache_user(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.invalidate_rec_cache_all(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_invalidate_rec_cache_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_invalidate_rec_cache_all() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invalidate_rec_cache_user(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.invalidate_rec_cache_all(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_invalidate_rec_cache_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_invalidate_rec_cache_all() TO service_role;