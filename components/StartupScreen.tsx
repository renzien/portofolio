"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import StartupScene from "./StartupScene";

export default function StartupScreen({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [enhanced, setEnhanced] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const page = content.current;
    if (!page) return;
    let disposed = false,
      finishing = false,
      completed = false,
      started = false;
    let target = 8,
      frame = 0,
      observer: MutationObserver | undefined;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const minimumDuration = reduced.matches ? 0 : 2100;
    const startedAt = performance.now();
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    page.inert = true;
    setEnhanced(true);
    overlay.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });

    function schedule(callback: () => void, delay: number) {
      const timer = setTimeout(() => {
        timeouts.delete(timer);
        if (!disposed) callback();
      }, delay);
      timeouts.add(timer);
      return timer;
    }
    function unlock() {
      page!.inert = false;
      document.body.style.overflow = previousOverflow;
    }
    function reveal(waitForIntro: boolean) {
      if (disposed || completed || (finishing && waitForIntro)) return;
      finishing = true;
      observer?.disconnect();
      for (const timer of timeouts) clearTimeout(timer);
      timeouts.clear();
      const remaining = waitForIntro
        ? Math.max(0, minimumDuration - (performance.now() - startedAt))
        : 0;
      schedule(() => {
        completed = true;
        setProgress(100);
        setReady(true);
        schedule(
          () => {
            setLeaving(true);
            schedule(
              () => {
                cancelAnimationFrame(frame);
                setVisible(false);
                unlock();
                // Preserve an explicit deep link, otherwise start keyboard navigation at the content.
                const destination =
                  document.getElementById(window.location.hash.slice(1)) ||
                  page!.querySelector<HTMLElement>("main");
                destination?.focus({ preventScroll: true });
              },
              reduced.matches ? 0 : 420,
            );
          },
          reduced.matches || !waitForIntro ? 0 : 180,
        );
      }, remaining);
    }
    skip.current = () => reveal(false);

    function tick() {
      if (disposed) return;
      const elapsed = performance.now() - startedAt;
      // The intro is one readiness step; the others are the hero images and fonts.
      const introProgress = minimumDuration
        ? (elapsed / minimumDuration) * 96
        : 96;
      setProgress(
        completed ? 100 : Math.floor(Math.min(target, introProgress)),
      );
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    function prepare() {
      if (started || finishing || disposed) return;
      const hero = page!.querySelector(".hero");
      if (!hero) return;
      started = true;
      observer?.disconnect();
      const images = [...hero.querySelectorAll("img")];
      const tasks = [
        document.fonts.ready,
        ...images.map((image) => image.decode().catch(() => {})),
      ];
      let settled = 0;
      tasks.forEach((task) =>
        Promise.resolve(task)
          .finally(() => {
            if (disposed || finishing) return;
            settled += 1;
            target = 8 + (settled / tasks.length) * 88;
            if (settled === tasks.length) reveal(true);
          })
          .catch(() => {}),
      );
    }
    // Streaming content can arrive after this wrapper has hydrated.
    observer = new MutationObserver(prepare);
    observer.observe(page, { childList: true, subtree: true });
    prepare();
    // A failed external image or slow font must never trap the visitor.
    if (!finishing) schedule(() => reveal(false), 5000);
    const motionChanged = () => {
      if (reduced.matches) reveal(false);
    };
    reduced.addEventListener("change", motionChanged);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      for (const timer of timeouts) clearTimeout(timer);
      observer?.disconnect();
      reduced.removeEventListener("change", motionChanged);
      unlock();
      if (overlay.current?.contains(document.activeElement))
        previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <>
      <noscript>
        <style>{`.startup-screen { display: none !important; }`}</style>
      </noscript>
      {visible && (
        <div ref={overlay}>
          <StartupScene
            progress={progress}
            ready={ready}
            leaving={leaving}
            enhanced={enhanced}
            onSkip={() => skip.current()}
          />
        </div>
      )}
      <div ref={content}>{children}</div>
    </>
  );
}
