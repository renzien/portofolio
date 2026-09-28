"use client";
import { useEffect, useId, useRef } from "react";
export default function LiquidImage({
  src,
  enabled = true,
  className = "",
  alt = "",
}: {
  src: string;
  enabled?: boolean;
  className?: string;
  alt?: string;
}) {
  const id = useId().replace(/:/g, "");
  const container = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const el = container.current;
    if (
      !el ||
      !enabled ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(pointer: coarse)").matches
    )
      return;
    let frame = 0,
      current = 0,
      target = 0;
    const animate = () => {
      current += (target - current) * 0.09;
      displacement.current?.setAttribute("scale", String(current));
      if (Math.abs(target - current) > 0.1)
        frame = requestAnimationFrame(animate);
      else {
        frame = 0;
        if (!target && image.current) image.current.style.filter = "none";
      }
    };
    const start = (n: number) => {
      target = n;
      if (!frame) frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      const bounds = el.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      if (image.current) {
        image.current.style.filter = `url(#liquid-${id})`;
        image.current.style.transform = `scale(1.045) translate(${x * 6}px,${y * 6}px)`;
      }
      start(17 + Math.abs(x) * 18);
    };
    const leave = () => {
      start(0);
      if (image.current) image.current.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [enabled, id]);
  return (
    <div ref={container} className={`liquid-image ${className}`}>
      <svg className="filter-defs" aria-hidden="true">
        <defs>
          <filter
            id={`liquid-${id}`}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              ref={displacement}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {/* User image URLs are rendered directly; the server never fetches arbitrary URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={image}
        src={src}
        alt={alt}
        decoding="async"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    </div>
  );
}
