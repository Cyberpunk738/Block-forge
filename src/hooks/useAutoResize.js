import { useEffect } from 'react';

/** Reflow multiline fields when text or available width changes (including split view). */
export default function useAutoResize(ref, value, minimumHeight = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () => {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, minimumHeight)}px`;
    };
    resize();
    if (typeof ResizeObserver === 'undefined') return;
    let width = el.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const nextWidth = el.getBoundingClientRect().width;
      if (nextWidth !== width) { width = nextWidth; resize(); }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, value, minimumHeight]);
}
