

export type IconName =
  | "arrow"
  | "book"
  | "rows"
  | "pin"
  | "exchange"
  | "heart"
  | "leaf"
  | "shield"
  | "menu"
  | "close"
  | "plus"
  | "check";

const paths: Record<IconName, string> = {
  arrow: "M4 12h16M14 6l6 6-6 6",
  book: "M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2ZM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8Z",
  rows: "M4 5h16v5H4ZM4 14h16v5H4Z",
  pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  exchange: "M4 7h16l-4-4M20 17H4l4 4M20 7l-4 4M4 17l4-4",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  leaf: "M20 3C8 2 3 7 4 13s8 9 12 3c3-4 4-9 4-13ZM3 22 15 9",
  shield: "M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7ZM8 12l3 3 5-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
};

export interface IconProps {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 24 }: IconProps) {
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
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default Icon;
