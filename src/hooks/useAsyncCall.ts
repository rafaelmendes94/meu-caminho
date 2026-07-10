import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * useAsyncCall — padroniza chamadas assíncronas com loading + toast de erro.
 * Retorna [run, { loading, error }] onde run(...) executa o fn com try/catch.
 */
export function useAsyncCall<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  opts: { onError?: (e: unknown) => void; silent?: boolean } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(
    async (...args: Args): Promise<R | undefined> => {
      setLoading(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        if (opts.onError) opts.onError(err);
        else if (!opts.silent) toast.error(err.message);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn]
  );

  return [run, { loading, error }] as const;
}