import type { SVGProps } from 'react';

export function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 17.25H19L20 7.75L15.6 11.05L12 5.75L8.4 11.05L4 7.75L5 17.25Z"
        fill="currentColor"
      />
      <path
        d="M5.5 20H18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="5.75" r="1.25" fill="currentColor" />
      <circle cx="4" cy="7.75" r="1.15" fill="currentColor" />
      <circle cx="20" cy="7.75" r="1.15" fill="currentColor" />
    </svg>
  );
}
