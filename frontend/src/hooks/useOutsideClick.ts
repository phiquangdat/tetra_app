import { useEffect } from 'react';

type AnyElement = HTMLElement | null;

export interface UseOutsideClickParams {
  getElement: () => AnyElement;
  onOutside: (ev: Event) => void;
  options?: {
    eventType?: 'pointerdown' | 'mousedown' | 'click';
    ignore?: (target: EventTarget | null) => boolean;
    enabled?: boolean;
  };
}

export function useOutsideClick({
  getElement,
  onOutside,
  options,
}: UseOutsideClickParams) {
  const { eventType = 'pointerdown', ignore, enabled = true } = options ?? {};

  useEffect(() => {
    if (!enabled) return;

    const handler = (ev: Event) => {
      const el = getElement();
      const target = ev.target as Node | null;

      if (!el) return;
      if (ignore?.(target ?? null)) return;

      const clickedInside = !!target && (el === target || el.contains(target));
      if (!clickedInside) onOutside(ev);
    };

    document.addEventListener(eventType, handler, true);
    return () => document.removeEventListener(eventType, handler, true);
  }, [getElement, onOutside, eventType, enabled, ignore]);
}
