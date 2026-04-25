import { useEffect } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
  ease?: string;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options: ScrollRevealOptions = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: options.start ?? 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    tl.fromTo(
      el,
      { opacity: 0, y: options.y ?? 60 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration ?? 0.9,
        delay: options.delay ?? 0,
        ease: options.ease ?? 'power2.out',
      }
    );

    return () => { tl.kill(); };
  }, []);
}
