"use client";

import { GlossaryRole } from "../types";
import {
  Headset,
  PaintBrush,
  ChatCircle,
  Wrench,
  Gear,
  Warning
} from "@phosphor-icons/react";

const BADGE_ICONS = {
  "NFT": PaintBrush,
  "COMMUNITY": ChatCircle,
  "SERVICE": Wrench,
  "SYSTEM": Gear,
  "TEAM": Headset,
  "UNCLEAR": Warning,
} as const;

const BADGE_COLORS = {
  "NFT": "text-fuchsia-400",
  "COMMUNITY": "text-sky-400",
  "SERVICE": "text-amber-400",
  "SYSTEM": "text-emerald-400",
  "TEAM": "text-rose-400",
  "UNCLEAR": "text-gray-500",
} as const;

interface BadgeMarkerProps {
  type: GlossaryRole["badge"];
}

export function BadgeMarker({ type }: BadgeMarkerProps) {
  const Icon = BADGE_ICONS[type];
  const colorClass = BADGE_COLORS[type];
  
  return (
    <div className="flex  items-center  justify-center w-[28px] h-[28px]">
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute"
      >
        <path 
          d="M24 12C24 13.1186 23.1954 13.9575 22.485 14.6979C22.0811 15.12 21.6632 15.555 21.5057 15.9375C21.36 16.2879 21.3514 16.8686 21.3429 17.4311C21.3268 18.4768 21.3096 19.6618 20.4857 20.4857C19.6618 21.3096 18.4768 21.3268 17.4311 21.3429C16.8686 21.3514 16.2879 21.36 15.9375 21.5057C15.555 21.6632 15.12 22.0811 14.6979 22.485C13.9575 23.1954 13.1186 24 12 24C10.8814 24 10.0425 23.1954 9.30214 22.485C8.88 22.0811 8.445 21.6632 8.0625 21.5057C7.71214 21.36 7.13143 21.3514 6.56893 21.3429C5.52321 21.3268 4.33821 21.3096 3.51429 20.4857C2.69036 19.6618 2.67321 18.4768 2.65714 17.4311C2.64857 16.8686 2.64 16.2879 2.49429 15.9375C2.33679 15.555 1.91893 15.12 1.515 14.6979C0.804643 13.9575 0 13.1186 0 12C0 10.8814 0.804643 10.0425 1.515 9.30214C1.91893 8.88 2.33679 8.445 2.49429 8.0625C2.64 7.71214 2.64857 7.13143 2.65714 6.56893C2.67321 5.52321 2.69036 4.33821 3.51429 3.51429C4.33821 2.69036 5.52321 2.67321 6.56893 2.65714C7.13143 2.64857 7.71214 2.64 8.0625 2.49429C8.445 2.33679 8.88 1.91893 9.30214 1.515C10.0425 0.804643 10.8814 0 12 0C13.1186 0 13.9575 0.804643 14.6979 1.515C15.12 1.91893 15.555 2.33679 15.9375 2.49429C16.2879 2.64 16.8686 2.64857 17.4311 2.65714C18.4768 2.67321 19.6618 2.69036 20.4857 3.51429C21.3096 4.33821 21.3268 5.52321 21.3429 6.56893C21.3514 7.13143 21.36 7.71214 21.5057 8.0625C21.6632 8.445 22.0811 8.88 22.485 9.30214C23.1954 10.0425 24 10.8814 24 12Z" 
          fill="currentColor"
          fillOpacity="0.1"
          className={colorClass}
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
      </svg>
      <Icon weight="fill" className={`w-3 h-3 relative z-10 ${colorClass}`} />
    </div>
  );
} 