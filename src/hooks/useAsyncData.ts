import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from '../data/db';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads data from the service layer, tracks loading/error state, and refetches
 * whenever the underlying store changes so mutations are reflected everywhere.
 */
export function useAsyncData<T>(
loader: () => Promise<T>,
deps: unknown[] = [])
: AsyncState<T> & {reload: () => void;} {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const mounted = useRef(true);

  const run = useCallback((showSpinner: boolean) => {
    if (showSpinner) setState((prev) => ({ ...prev, loading: true, error: null }));
    loaderRef.
    current().
    then((data) => {
      if (mounted.current) setState({ data, loading: false, error: null });
    }).
    catch((err: unknown) => {
      if (mounted.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Unable to load data.'
        });
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    run(true);
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => subscribe(() => run(false)), [run]);

  return { ...state, reload: () => run(true) };
}