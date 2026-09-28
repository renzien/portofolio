import type { SVGProps } from "react";
type Props = SVGProps<SVGSVGElement> & { size?: number };
export function Github({ size = 24, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.9a3.4 3.4 0 0 0-1-2.7c3.3-.4 6.7-1.6 6.7-7.3A5.7 5.7 0 0 0 19.2 4a5.3 5.3 0 0 0-.1-4s-1.3-.4-4.2 1.5a14.4 14.4 0 0 0-7.6 0C4.4-.4 3.1 0 3.1 0A5.3 5.3 0 0 0 3 4a5.7 5.7 0 0 0-1.5 4.1c0 5.7 3.4 6.9 6.7 7.3a3.4 3.4 0 0 0-1 2.7V22"
        transform="translate(1.5 2) scale(.85)"
      />
    </svg>
  );
}
export function Linkedin({ size = 24, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-7M11 13a3 3 0 0 1 6 0v4" />
    </svg>
  );
}
