/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface OasisLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showSlogan?: boolean;
  showContacts?: boolean;
  variant?: 'full' | 'compact' | 'icon-only' | 'horizontal';
}

export const OasisLogo: React.FC<OasisLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showSlogan = false,
  showContacts = false,
  variant = 'full',
}) => {
  // Responsive width presets using Tailwind classes
  const sizeClasses = {
    xs: 'w-24 max-w-[100px]',
    sm: 'w-36 max-w-[150px]',
    md: 'w-56 sm:w-64 max-w-[260px]',
    lg: 'w-72 sm:w-80 md:w-96 max-w-[360px]',
    xl: 'w-80 sm:w-96 md:w-[420px] max-w-[440px]',
  };

  // -------------------------------------------------------------
  // 1. ICON-ONLY VARIANT (Gear emblem with construction symbols)
  // -------------------------------------------------------------
  if (variant === 'icon-only') {
    const iconSizes = {
      xs: 'w-7 h-5',
      sm: 'w-10 h-7',
      md: 'w-14 h-10',
      lg: 'w-20 h-14',
      xl: 'w-28 h-20',
    };

    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 200 135"
          className={`${iconSizes[size]} drop-shadow-2xs transition-transform`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Gear Silhouette in Deep Coffee Brown (#3A1F0D) */}
          <path
            d="M 44 116
               C 44 116 48 84 64 64
               C 80 44 110 42 124 42
               C 138 42 168 44 184 64
               C 200 84 204 116 204 116
               H 228
               C 230 106 228 98 223 90
               L 212 86
               C 210 80 207 74 203 68
               L 209 56
               C 204 48 198 42 190 38
               L 179 44
               C 173 41 166 39 159 38
               V 26
               C 149 25 140 25 130 26
               V 38
               C 123 38 115 38 109 26
               C 99 25 90 25 80 26
               V 38
               C 73 39 66 41 60 44
               L 49 38
               C 41 42 35 48 30 56
               L 36 68
               C 32 74 29 80 27 86
               L 16 90
               C 11 98 9 106 11 116
               Z"
            fill="#3A1F0D"
            transform="translate(-20, -5)"
          />

          {/* Central Arch Cutout with Pure White Background */}
          <path
            d="M 46 112
               C 49 84 66 58 89 45
               C 103 37 121 37 135 45
               C 158 58 175 84 178 112
               Z"
            fill="#FFFFFF"
            transform="translate(-12, 0)"
          />

          {/* Curved baseline grounding bar */}
          <path
            d="M 8 116 Q 100 110 192 116 Q 100 120 8 116 Z"
            fill="#2B1810"
          />

          {/* INNER CONSTRUCTION ICONS IN VIBRANT ORANGE (#EA7600) */}
          <g transform="translate(-12, 2)">
            {/* 1. DUMP TRUCK with cargo (Top-Left) */}
            <g transform="translate(55, 48) scale(0.68)" fill="#EA7600">
              {/* Cargo mound */}
              <ellipse cx="9" cy="6" rx="7" ry="2.5" fill="#EA7600" />
              {/* Cab */}
              <path d="M 18 8 L 24 8 L 28 13 L 28 19 L 18 19 Z" />
              {/* Dump bed */}
              <polygon points="3,6 16,6 15,19 2,19" />
              <line x1="5" y1="8" x2="5" y2="17" stroke="#FFF" strokeWidth="1" />
              <line x1="9" y1="8" x2="9" y2="17" stroke="#FFF" strokeWidth="1" />
              <line x1="13" y1="8" x2="13" y2="17" stroke="#FFF" strokeWidth="1" />
              {/* Wheels */}
              <circle cx="8" cy="20" r="3.5" fill="#3A1F0D" />
              <circle cx="8" cy="20" r="1.5" fill="#FFF" />
              <circle cx="23" cy="20" r="3.5" fill="#3A1F0D" />
              <circle cx="23" cy="20" r="1.5" fill="#FFF" />
            </g>

            {/* 2. CROSSED HAMMER & WRENCH (Top-Right) */}
            <g transform="translate(122, 46) scale(0.68)">
              <path
                d="M 8 20 L 22 6 C 24 4 27 5 29 7 C 30 9 30 11 28 13 L 25 14 L 28 17 L 24 20 L 21 17 L 19 20 L 13 26 C 11 28 9 28 7 26 C 5 24 5 22 8 20 Z"
                fill="#EA7600"
              />
              <rect
                x="4"
                y="16"
                width="4.5"
                height="19"
                rx="1"
                transform="rotate(-45 6 25)"
                fill="#D86700"
              />
              <rect
                x="14"
                y="3"
                width="11"
                height="6.5"
                rx="1"
                transform="rotate(45 20 6)"
                fill="#3A1F0D"
              />
            </g>

            {/* 3. STRONG BICEP / ARM (Middle-Left) */}
            <g transform="translate(48, 76) scale(0.68)" fill="#EA7600">
              <path d="M 6 18 C 6 12 10 9 14 9 C 17 9 20 11 22 14 C 23 16 22 19 19 20 C 16 21 13 22 12 26 L 5 26 C 4 23 5 20 6 18 Z" />
              <circle cx="16" cy="11" r="3" fill="#D86700" />
            </g>

            {/* 4. WORKER WITH HARDHAT (Center-Bottom) */}
            <g transform="translate(98, 76) scale(0.74)">
              <path
                d="M 10 9 C 10 4 20 4 20 9 H 22 C 22.5 9 23 9.8 23 10.5 H 7 C 7 9.8 7.5 9 8 9 Z"
                fill="#EA7600"
              />
              <path d="M 11 11 C 11 14 19 14 19 11 Z" fill="#FFE3CC" />
              <path d="M 7 21 C 7 16 10 14 15 14 C 20 14 23 16 23 21 Z" fill="#EA7600" />
              <line x1="12" y1="14" x2="11" y2="21" stroke="#3A1F0D" strokeWidth="1.2" />
              <line x1="18" y1="14" x2="19" y2="21" stroke="#3A1F0D" strokeWidth="1.2" />
            </g>

            {/* 5. BRICK WALL & TROWEL (Middle-Right) */}
            <g transform="translate(136, 75) scale(0.7)">
              <rect x="2" y="14" width="8" height="3.5" fill="#EA7600" />
              <rect x="12" y="14" width="8" height="3.5" fill="#EA7600" />
              <rect x="22" y="14" width="8" height="3.5" fill="#EA7600" />
              <rect x="6" y="9.5" width="8" height="3.5" fill="#D86700" />
              <rect x="16" y="9.5" width="8" height="3.5" fill="#D86700" />
              <polygon points="24,6 30,1 27,7" fill="#3A1F0D" />
              <line x1="27" y1="7" x2="29" y2="10" stroke="#3A1F0D" strokeWidth="1.2" />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. HORIZONTAL COMPACT VARIANT (For TopBar or compact headers)
  // -------------------------------------------------------------
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
        <OasisLogo variant="icon-only" size="sm" />
        <div className="flex flex-col justify-center text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider uppercase text-[#EA7600]">
              EL OASIS
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#3A1F0D] text-white tracking-widest uppercase">
              FLOTA
            </span>
          </div>
          <span className="text-[9px] text-stone-500 font-semibold tracking-tight">
            Materiales para la Construcción
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. FULL OFFICIAL BRAND LOGO (Exact vector lockup from LOGO PNG.jpg)
  // -------------------------------------------------------------
  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${sizeClasses[size]} mx-auto ${className}`}
    >
      <svg
        viewBox="0 0 360 270"
        className="w-full h-auto drop-shadow-2xs overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ============================================================ */}
        {/* 1. GEAR SILHOUETTE & INNER SYMBOLS                           */}
        {/* ============================================================ */}
        <g id="gear-emblem">
          {/* Main Gear Body in Deep Coffee Brown (#3A1F0D) */}
          <path
            d="M 94 130
               C 94 130 98 94 116 70
               C 134 46 168 44 184 44
               C 200 44 234 46 252 70
               C 270 94 274 130 274 130
               H 300
               C 302 118 300 108 294 98
               L 282 94
               C 279 87 275 80 270 74
               L 277 60
               C 271 51 264 44 254 39
               L 242 46
               C 235 43 227 41 219 39
               V 26
               C 207 25 196 25 184 25
               C 172 25 161 25 149 26
               V 39
               C 141 41 133 43 126 46
               L 114 39
               C 104 44 97 51 91 60
               L 98 74
               C 93 80 89 87 86 94
               L 74 98
               C 68 108 66 118 68 130
               Z"
            fill="#3A1F0D"
          />

          {/* Central Dome Arch Cutout with Pure White Background */}
          <path
            d="M 112 128
               C 116 94 136 64 163 48
               C 179 39 199 39 215 48
               C 242 64 262 94 266 128
               Z"
            fill="#FFFFFF"
          />

          {/* 5 CONSTRUCTION SYMBOLS IN OFFICIAL ORANGE (#EA7600) */}
          <g id="symbols">
            {/* 1. Volqueta / Dump Truck with Cargo Mound */}
            <g transform="translate(126, 56) scale(0.95)" fill="#EA7600">
              {/* Cargo mound */}
              <ellipse cx="12" cy="7" rx="8" ry="3" fill="#EA7600" />
              {/* Cab */}
              <path d="M 23 10 L 30 10 L 34 16 L 34 23 L 23 23 Z" />
              {/* Dump bed */}
              <polygon points="5,7 21,7 19,23 3,23" />
              <line x1="8" y1="9" x2="7" y2="21" stroke="#FFF" strokeWidth="1.2" />
              <line x1="13" y1="9" x2="12" y2="21" stroke="#FFF" strokeWidth="1.2" />
              <line x1="17" y1="9" x2="16" y2="21" stroke="#FFF" strokeWidth="1.2" />
              {/* Tires */}
              <circle cx="10" cy="24" r="4.5" fill="#3A1F0D" />
              <circle cx="10" cy="24" r="2" fill="#FFF" />
              <circle cx="28" cy="24" r="4.5" fill="#3A1F0D" />
              <circle cx="28" cy="24" r="2" fill="#FFF" />
            </g>

            {/* 2. Crossed Hammer & Wrench */}
            <g transform="translate(202, 53) scale(0.9)">
              <path
                d="M 10 24 L 26 8 C 28 6 32 7 34 9 C 35 11 35 14 33 16 L 30 17 L 33 20 L 29 24 L 26 21 L 24 24 L 16 32 C 14 34 11 34 9 32 C 7 30 7 27 10 24 Z"
                fill="#EA7600"
              />
              <rect
                x="5"
                y="20"
                width="6"
                height="24"
                rx="1.5"
                transform="rotate(-45 8 32)"
                fill="#D86700"
              />
              <rect
                x="18"
                y="4"
                width="14"
                height="8"
                rx="1.5"
                transform="rotate(45 25 8)"
                fill="#3A1F0D"
              />
            </g>

            {/* 3. Strong Bicep / Arm */}
            <g transform="translate(118, 90) scale(0.88)" fill="#EA7600">
              <path d="M 8 22 C 8 14 13 10 18 10 C 22 10 26 13 28 17 C 30 20 28 24 24 25 C 20 26 17 28 15 32 L 6 32 C 5 28 6 25 8 22 Z" />
              <circle cx="21" cy="13" r="3.5" fill="#D86700" />
            </g>

            {/* 4. Worker with Safety Helmet */}
            <g transform="translate(168, 88) scale(0.96)">
              <path
                d="M 12 12 C 12 6 24 6 24 12 H 26 C 26.5 12 27 13 27 13.5 C 27 14 26.5 14.5 26 14.5 H 10 C 9.5 14.5 9 14 9 13.5 C 9 13 9.5 12 10 12 Z"
                fill="#EA7600"
              />
              <path d="M 13 14 C 13 18 23 18 23 14 Z" fill="#FFE3CC" />
              <path d="M 8 26 C 8 20 12 18 18 18 C 24 18 28 20 28 26 Z" fill="#EA7600" />
              <line x1="14" y1="18" x2="13" y2="26" stroke="#3A1F0D" strokeWidth="1.5" />
              <line x1="22" y1="18" x2="23" y2="26" stroke="#3A1F0D" strokeWidth="1.5" />
            </g>

            {/* 5. Brick Wall with Trowel */}
            <g transform="translate(216, 88) scale(0.88)">
              <rect x="4" y="16" width="11" height="4.5" fill="#EA7600" />
              <rect x="17" y="16" width="11" height="4.5" fill="#EA7600" />
              <rect x="30" y="16" width="11" height="4.5" fill="#EA7600" />
              <rect x="9" y="10.5" width="11" height="4.5" fill="#D86700" />
              <rect x="22" y="10.5" width="11" height="4.5" fill="#D86700" />
              <polygon points="32,7 40,0.5 36,8" fill="#3A1F0D" />
              <line x1="36" y1="8" x2="39" y2="12" stroke="#3A1F0D" strokeWidth="1.5" />
            </g>
          </g>
        </g>

        {/* ============================================================ */}
        {/* 2. UPPER TAPERED HORIZONTAL ACCENT LINE                      */}
        {/*    Thick in center, gently tapering to needle points        */}
        {/* ============================================================ */}
        <path
          d="M 16 142 Q 184 136 352 142 Q 184 148 16 142 Z"
          fill="#2B1810"
        />

        {/* ============================================================ */}
        {/* 3. LOGO WORDMARK: EL OASIS                                   */}
        {/* ============================================================ */}
        <text
          x="184"
          y="188"
          textAnchor="middle"
          fill="#EA7600"
          fontWeight="900"
          fontSize="48"
          letterSpacing="1.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ textTransform: 'uppercase' }}
        >
          EL OASIS
        </text>

        {/* ============================================================ */}
        {/* 4. SUBTITLE: MATERIALES PARA LA CONSTRUCCIÓN                 */}
        {/* ============================================================ */}
        {showSubtitle && (
          <text
            x="184"
            y="218"
            textAnchor="middle"
            fill="#2B1810"
            fontWeight="900"
            fontSize="18"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ textTransform: 'uppercase' }}
          >
            MATERIALES PARA LA CONSTRUCCIÓN
          </text>
        )}

        {/* ============================================================ */}
        {/* 5. LOWER TAPERED HORIZONTAL ACCENT LINE                      */}
        {/*    Thick in center, gently tapering to needle points        */}
        {/* ============================================================ */}
        <path
          d="M 16 236 Q 184 231 352 236 Q 184 241 16 236 Z"
          fill="#2B1810"
        />
      </svg>

      {/* Optional Slogan Pill Banner */}
      {showSlogan && (
        <div className="w-full mt-3 flex justify-center">
          <div className="bg-[#EA7600] text-white px-5 py-1.5 sm:py-2 rounded-full shadow-xs text-center">
            <span className="text-xs sm:text-sm font-extrabold italic tracking-wide">
              “Para la casa, para la obra, para ti”
            </span>
          </div>
        </div>
      )}

      {/* Optional Contact Phones / WhatsApp */}
      {showContacts && (
        <div className="w-full mt-3 pt-2 border-t border-stone-200/80 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-stone-800">
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
              Teléfonos
            </span>
            <span className="text-xs font-black tracking-tight">
              316 354 0072 · 315 473 1379
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-stone-300" />
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
              WhatsApp
            </span>
            <span className="text-xs font-black tracking-tight text-emerald-700">
              313 611 1893
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
