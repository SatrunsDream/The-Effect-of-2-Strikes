import { useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import * as d3 from 'd3';

type RenderFn = (container: d3.Selection<HTMLDivElement, unknown, null, undefined>) => void;

export function useD3(renderFn: RenderFn, dependencies: unknown[]): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && dependencies.every(d => d != null)) {
      renderFn(d3.select(ref.current));
    }
    return () => {
      if (ref.current) {
        d3.select(ref.current).selectAll('*').remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}
