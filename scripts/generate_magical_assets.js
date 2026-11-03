/* global Buffer, process */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/textures/corridor/magical');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// 1. EMBLEM: MY BUILDS (Gear, Blueprint, Technical Invention)
const svgBuilds = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch-filter" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#sketch-filter)">
    <!-- Blueprint / parchment circular background plate -->
    <circle cx="256" cy="256" r="210" fill="#f6f2e8" stroke="#3a342c" stroke-width="5" stroke-dasharray="14,6" />
    <circle cx="256" cy="256" r="195" fill="none" stroke="#685c4c" stroke-width="2" opacity="0.6" />
    
    <!-- Blueprint grid lines -->
    <path d="M 120 256 L 392 256 M 256 120 L 256 392" stroke="#5d7b8a" stroke-width="2" stroke-dasharray="8,6" opacity="0.5" />
    <circle cx="256" cy="256" r="140" fill="none" stroke="#5d7b8a" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />
    
    <!-- Outer Gear -->
    <g fill="#e9e0ce" stroke="#25211c" stroke-width="4.5" stroke-linejoin="round">
      <path d="
        M 240 100 L 272 100 L 276 128 L 298 135 L 322 118 L 346 138 L 334 164 L 352 180 L 379 174 L 391 202 L 369 222 L 374 245 L 402 256 L 398 286 L 371 292 L 361 314 L 378 338 L 356 360 L 332 346 L 312 360 L 314 388 L 284 396 L 274 370 L 250 372 L 236 398 L 206 392 L 206 364 L 186 352 L 162 366 L 142 344 L 156 322 L 144 300 L 118 296 L 116 266 L 140 254 L 138 230 L 114 214 L 128 186 L 154 190 L 170 172 L 162 144 L 188 126 L 210 140 L 232 128 Z
      " />
      <!-- Gear inner hole -->
      <circle cx="256" cy="256" r="68" fill="#f6f2e8" stroke="#25211c" stroke-width="4" />
      <circle cx="256" cy="256" r="32" fill="#d9cbaf" stroke="#25211c" stroke-width="3.5" />
      <circle cx="256" cy="256" r="12" fill="#25211c" />
    </g>

    <!-- Draftsman Compass / Caliper sketch overlay -->
    <g stroke="#322a22" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M 256 160 L 210 330" />
      <path d="M 256 160 L 302 330" />
      <circle cx="256" cy="160" r="14" fill="#d49b43" stroke="#25211c" stroke-width="3" />
      <!-- Caliper arc -->
      <path d="M 226 270 Q 256 290 286 270" stroke="#705844" stroke-width="3" />
    </g>

    <!-- Hatching & sketch accents -->
    <g stroke="#3a3228" stroke-width="1.8" opacity="0.6">
      <line x1="245" y1="210" x2="265" y2="218" />
      <line x1="242" y1="220" x2="262" y2="228" />
      <line x1="248" y1="280" x2="268" y2="288" />
    </g>

    <!-- Small Sparkles / Invention Sparks -->
    <g fill="#d49b43" stroke="#25211c" stroke-width="1.5">
      <polygon points="170,110 174,124 188,128 174,132 170,146 166,132 152,128 166,124" />
      <polygon points="360,370 363,380 373,383 363,386 360,396 357,386 347,383 357,380" />
    </g>
  </g>
</svg>
`;

// 2. EMBLEM: MY LAB (Magical Flask, Alchemical Instrument, Quill, Mystery)
const svgLab = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch-filter-lab" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#sketch-filter-lab)">
    <!-- Plate -->
    <circle cx="256" cy="256" r="210" fill="#f6f2e8" stroke="#3a342c" stroke-width="5" stroke-dasharray="14,6" />
    <circle cx="256" cy="256" r="195" fill="none" stroke="#685c4c" stroke-width="2" opacity="0.6" />

    <!-- Alchemical Circle Markings -->
    <circle cx="256" cy="256" r="170" fill="none" stroke="#705844" stroke-width="1.5" stroke-dasharray="4,8" opacity="0.5" />
    <polygon points="256,96 395,336 117,336" fill="none" stroke="#833c46" stroke-width="1.5" opacity="0.35" />
    <polygon points="256,376 117,136 395,136" fill="none" stroke="#3b5a45" stroke-width="1.5" opacity="0.35" />

    <!-- Laboratory Flask (Erlenmeyer Flask) -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Liquid fill -->
      <path d="M 174 340 L 338 340 L 315 285 Q 256 270 197 285 Z" fill="#e2c872" opacity="0.85" />
      <!-- Flask Body -->
      <path d="M 234 140 L 278 140 M 238 140 L 238 215 L 160 345 Q 155 365 178 375 L 334 375 Q 357 365 352 345 L 274 215 L 274 140" fill="none" />
      <ellipse cx="256" cy="140" rx="20" ry="6" fill="#f6f2e8" />
      <!-- Flask Base Rim -->
      <path d="M 178 375 Q 256 385 334 375" fill="none" stroke-width="3.5" />
    </g>

    <!-- Measurement tick lines on flask -->
    <g stroke="#221e1a" stroke-width="2.5" stroke-linecap="round">
      <line x1="220" y1="280" x2="238" y2="280" />
      <line x1="205" y1="310" x2="228" y2="310" />
      <line x1="190" y1="340" x2="218" y2="340" />
    </g>

    <!-- Magic Bubbles & Floating Vapor -->
    <g fill="#e8c872" stroke="#221e1a" stroke-width="2">
      <circle cx="240" cy="315" r="9" />
      <circle cx="275" cy="330" r="14" />
      <circle cx="260" cy="290" r="7" />
      <circle cx="235" cy="255" r="8" fill="#f6f2e8" />
      <circle cx="270" cy="235" r="11" fill="#f6f2e8" />
    </g>

    <!-- Mystical smoke swirling out -->
    <path d="M 256 134 Q 240 100 265 75 Q 290 50 260 30" fill="none" stroke="#705844" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4" />
    <path d="M 262 134 Q 275 110 255 90 Q 235 70 250 50" fill="none" stroke="#833c46" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />

    <!-- Feather Quill lying across -->
    <g stroke="#221e1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <!-- Quill spine -->
      <path d="M 370 170 Q 340 240 300 310" fill="none" stroke-width="3.5" />
      <!-- Feather vane -->
      <path d="M 370 170 Q 380 200 350 230 Q 330 250 325 270 Q 340 240 355 220 Z" fill="#ecd9c6" />
      <path d="M 370 170 Q 345 190 330 230 Q 315 260 315 285 Q 325 250 340 220 Z" fill="#d9cbaf" />
    </g>

    <!-- Magic Stars -->
    <g fill="#d49b43" stroke="#221e1a" stroke-width="1.5">
      <polygon points="145,210 148,220 158,223 148,226 145,236 142,226 132,223 142,220" />
      <polygon points="350,110 353,120 363,123 353,126 350,136 347,126 337,123 347,120" />
    </g>
  </g>
</svg>
`;

// 3. EMBLEM: MY STORY (Open Grimoire / Chronicle Book, Feather Quill)
const svgStory = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch-filter-story" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#sketch-filter-story)">
    <!-- Plate -->
    <circle cx="256" cy="256" r="210" fill="#f6f2e8" stroke="#3a342c" stroke-width="5" stroke-dasharray="14,6" />
    <circle cx="256" cy="256" r="195" fill="none" stroke="#685c4c" stroke-width="2" opacity="0.6" />

    <!-- Open Book Cover & Pages -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Hardcover back -->
      <path d="M 105 320 Q 180 345 256 325 Q 332 345 407 320 L 400 345 Q 330 370 256 348 Q 182 370 112 345 Z" fill="#705844" />
      
      <!-- Left pages stack -->
      <path d="M 112 195 Q 184 218 256 200 L 256 325 Q 184 345 110 320 Z" fill="#f9f7f1" />
      <path d="M 116 205 Q 186 226 256 208 L 256 330 Q 186 350 114 326 Z" fill="#f2ecde" opacity="0.7" />
      
      <!-- Right pages stack -->
      <path d="M 400 195 Q 328 218 256 200 L 256 325 Q 328 345 402 320 Z" fill="#f9f7f1" />
      <path d="M 396 205 Q 326 226 256 208 L 256 330 Q 326 350 398 326 Z" fill="#f2ecde" opacity="0.7" />

      <!-- Center Spine Binding -->
      <path d="M 256 195 L 256 335" stroke="#3a2e24" stroke-width="5" />
    </g>

    <!-- Bookmark Ribbon dropping down -->
    <path d="M 256 325 Q 260 360 250 385 L 262 380 L 274 385 Q 262 355 258 325" fill="#833c46" stroke="#221e1a" stroke-width="2.5" />

    <!-- Text Scribbles / Story lines on Pages -->
    <g stroke="#4a3e32" stroke-width="2" stroke-linecap="round" opacity="0.65">
      <!-- Left Page text -->
      <line x1="140" y1="230" x2="225" y2="224" />
      <line x1="138" y1="248" x2="230" y2="242" />
      <line x1="142" y1="266" x2="220" y2="260" />
      <line x1="140" y1="284" x2="215" y2="278" />
      
      <!-- Right Page text -->
      <line x1="282" y1="224" x2="370" y2="230" />
      <line x1="278" y1="242" x2="372" y2="248" />
      <line x1="282" y1="260" x2="365" y2="266" />
      <line x1="280" y1="278" x2="350" y2="284" />
    </g>

    <!-- Feather Quill poised over the book -->
    <g stroke="#221e1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 360 100 Q 330 160 295 235" fill="none" stroke-width="4" />
      <path d="M 360 100 Q 380 140 340 180 Q 320 200 315 215 Q 330 180 348 150 Z" fill="#e8c872" />
      <path d="M 360 100 Q 330 130 315 170 Q 300 200 298 225 Q 312 185 330 150 Z" fill="#d49b43" />
      <!-- Nib tip -->
      <polygon points="295,235 292,242 299,238" fill="#221e1a" />
    </g>

    <!-- Magic Stardust floating up from pages -->
    <g fill="#d49b43" stroke="#221e1a" stroke-width="1.5">
      <polygon points="256,140 260,154 274,158 260,162 256,176 252,162 238,158 252,154" />
      <polygon points="180,150 183,158 191,161 183,164 180,172 177,164 169,161 177,158" />
      <polygon points="330,130 333,138 341,141 333,144 330,152 327,144 319,141 327,138" />
    </g>
  </g>
</svg>
`;

// 4. EMBLEM: SAY HI (Hand-Drawn Envelope, Wax Seal, Wing Flourishes)
const svgSayHi = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch-filter-sayhi" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#sketch-filter-sayhi)">
    <!-- Plate -->
    <circle cx="256" cy="256" r="210" fill="#f6f2e8" stroke="#3a342c" stroke-width="5" stroke-dasharray="14,6" />
    <circle cx="256" cy="256" r="195" fill="none" stroke="#685c4c" stroke-width="2" opacity="0.6" />

    <!-- Small parchment note behind envelope -->
    <rect x="140" y="140" width="232" height="170" rx="8" transform="rotate(-6 256 256)" fill="#eeddc7" stroke="#3a342c" stroke-width="3" stroke-dasharray="8,4" />

    <!-- Envelope Body -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
      <rect x="136" y="176" width="240" height="160" rx="8" fill="#fcf9f2" />
      <!-- Envelope fold lines -->
      <path d="M 136 176 L 256 270 L 376 176" fill="none" />
      <path d="M 136 336 L 220 252" fill="none" stroke-width="3.5" />
      <path d="M 376 336 L 292 252" fill="none" stroke-width="3.5" />
    </g>

    <!-- Heraldic / Magical Wings flanking envelope -->
    <g fill="#ecdcc6" stroke="#221e1a" stroke-width="3.5" stroke-linejoin="round">
      <!-- Left wing -->
      <path d="M 140 240 C 90 220 70 160 85 130 C 95 160 110 180 140 200 Z" />
      <path d="M 135 255 C 80 250 65 200 80 170 C 95 195 110 215 135 230 Z" />
      <!-- Right wing -->
      <path d="M 372 240 C 422 220 442 160 427 130 C 417 160 402 180 372 200 Z" />
      <path d="M 377 255 C 432 250 447 200 432 170 C 417 195 402 215 377 230 Z" />
    </g>

    <!-- Wax Seal (Crimson / Burgundy with Golden Crest) -->
    <g stroke="#221e1a" stroke-width="3.5" stroke-linejoin="round">
      <!-- Irregular melted wax blob -->
      <path d="
        M 256 232 
        C 275 230 292 240 295 258 
        C 298 275 285 292 270 298 
        C 255 304 235 300 225 288 
        C 215 275 218 252 232 240 
        C 240 234 248 233 256 232 Z" 
        fill="#833c46" />
      <circle cx="256" cy="265" r="22" fill="#6c2e36" stroke="#221e1a" stroke-width="2.5" />
      <!-- Seal Emblem Stamp (Letter 'H' or Heart / Star) -->
      <path d="M 248 254 L 248 276 M 264 254 L 264 276 M 248 265 L 264 265" stroke="#f6e8c8" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Sparkles -->
    <g fill="#d49b43" stroke="#221e1a" stroke-width="1.5">
      <polygon points="256,105 260,118 273,122 260,126 256,139 252,126 239,122 252,118" />
      <polygon points="120,320 123,328 131,331 123,334 120,342 117,334 109,331 117,328" />
      <polygon points="380,315 383,323 391,326 383,329 380,337 377,329 369,326 377,323" />
    </g>
  </g>
</svg>
`;

// 5. EMBLEM: WISPR FLOW (Antique Vintage Studio Microphone, Radiating Soundwaves, Magical Sparkles)
const svgWispr = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="sketch-filter-wispr" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#sketch-filter-wispr)">
    <!-- Plate with distinctive enchanted academy ring -->
    <circle cx="256" cy="256" r="210" fill="#fbf7ee" stroke="#3a342c" stroke-width="5" stroke-dasharray="14,6" />
    <circle cx="256" cy="256" r="195" fill="none" stroke="#833c46" stroke-width="2.5" opacity="0.7" />
    <circle cx="256" cy="256" r="182" fill="none" stroke="#d49b43" stroke-width="1.5" stroke-dasharray="6,8" opacity="0.6" />

    <!-- Radiating Acoustic Sound Waves (Concentric Hand-Drawn Arcs) -->
    <g fill="none" stroke="#d49b43" stroke-width="3.5" stroke-linecap="round">
      <!-- Left side sound waves -->
      <path d="M 170 170 A 110 110 0 0 0 170 290" opacity="0.85" />
      <path d="M 140 145 A 145 145 0 0 0 140 315" stroke-dasharray="10,8" opacity="0.7" />
      <path d="M 110 120 A 180 180 0 0 0 110 340" stroke-width="2.5" stroke-dasharray="6,10" opacity="0.5" />

      <!-- Right side sound waves -->
      <path d="M 342 170 A 110 110 0 0 1 342 290" opacity="0.85" />
      <path d="M 372 145 A 145 145 0 0 1 372 315" stroke-dasharray="10,8" opacity="0.7" />
      <path d="M 402 120 A 180 180 0 0 1 402 340" stroke-width="2.5" stroke-dasharray="6,10" opacity="0.5" />
    </g>

    <!-- Antique Spring-Suspension Outer Ring -->
    <circle cx="256" cy="225" r="76" fill="#f4ede0" stroke="#221e1a" stroke-width="5" />
    <circle cx="256" cy="225" r="66" fill="none" stroke="#705844" stroke-width="2" stroke-dasharray="4,6" />

    <!-- Suspension Springs holding the capsule -->
    <g stroke="#221e1a" stroke-width="3" stroke-linecap="round">
      <path d="M 215 175 L 232 188" />
      <path d="M 297 175 L 280 188" />
      <path d="M 215 275 L 232 262" />
      <path d="M 297 275 L 280 262" />
    </g>

    <!-- 1940s Microphone Capsule (Pill-shaped with grille) -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linejoin="round">
      <!-- Capsule body -->
      <rect x="232" y="172" width="48" height="106" rx="24" fill="#eeddc7" />
      <!-- Horizontal Metal Band -->
      <rect x="230" y="220" width="52" height="12" rx="2" fill="#833c46" />
      
      <!-- Grille rib lines (top dome) -->
      <g stroke="#221e1a" stroke-width="2.5" stroke-linecap="round">
        <line x1="240" y1="184" x2="272" y2="184" />
        <line x1="237" y1="194" x2="275" y2="194" />
        <line x1="236" y1="204" x2="276" y2="204" />
        <line x1="236" y1="214" x2="276" y2="214" />
        
        <!-- Bottom grille lines -->
        <line x1="236" y1="240" x2="276" y2="240" />
        <line x1="237" y1="250" x2="275" y2="250" />
        <line x1="240" y1="260" x2="272" y2="260" />
      </g>
    </g>

    <!-- Ornate Desk Stand Base -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="#e2d4c0">
      <!-- U-bracket mount -->
      <path d="M 200 230 C 196 305 240 315 256 315 C 272 315 316 305 312 230" fill="none" stroke-width="5" />
      <!-- Vertical Stem -->
      <rect x="251" y="315" width="10" height="42" fill="#3a3026" />
      <!-- Turned brass pedestal rings -->
      <ellipse cx="256" cy="358" rx="22" ry="8" fill="#d49b43" />
      <!-- Heavy Cast Iron Base -->
      <path d="M 200 382 C 220 372 292 372 312 382 L 320 395 C 290 405 222 405 192 395 Z" fill="#2d261e" />
    </g>

    <!-- Magical Audio Sparkles / Stardust (Golden Aura) -->
    <g fill="#d49b43" stroke="#221e1a" stroke-width="1.8">
      <polygon points="256,80 261,96 277,101 261,106 256,122 251,106 235,101 251,96" />
      <polygon points="175,115 178,125 188,128 178,131 175,141 172,131 162,128 172,125" />
      <polygon points="337,115 340,125 350,128 340,131 337,141 334,131 324,128 334,125" />
      <polygon points="205,335 208,343 216,346 208,349 205,357 202,349 194,346 202,343" />
      <polygon points="307,335 310,343 318,346 310,349 307,357 304,349 296,346 304,343" />
    </g>
  </g>
</svg>
`;

// 6. FLOATING CANDLE (Pencil sketch candle with wax drips, flame and soft amber halo)
const svgCandle = `
<svg width="256" height="512" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="candle-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
    </filter>
    <radialGradient id="flame-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fdf2cf" stop-opacity="0.9" />
      <stop offset="40%" stop-color="#f1b542" stop-opacity="0.5" />
      <stop offset="80%" stop-color="#d47c2a" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#b85b1a" stop-opacity="0" />
    </radialGradient>
  </defs>
  
  <!-- Outer glowing halo -->
  <circle cx="128" cy="140" r="110" fill="url(#flame-glow)" />

  <g filter="url(#candle-filter)">
    <!-- Candle Cylinder -->
    <g stroke="#221e1a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <!-- Dripping melted wax on sides -->
      <path d="
        M 86 230 
        C 86 245 92 255 92 270 
        C 92 280 86 285 86 390 
        C 86 405 170 405 170 390 
        L 170 260 
        C 170 250 164 245 164 230 
        Z" 
        fill="#f6f1e3" />

      <!-- Wax drip trails -->
      <path d="M 98 230 C 98 260 106 270 106 285 C 106 295 98 300 98 310" fill="none" stroke-width="2.5" />
      <path d="M 148 230 C 148 250 156 260 156 275 C 156 285 150 290 150 300" fill="none" stroke-width="2.5" />

      <!-- Top concave bowl of candle -->
      <ellipse cx="128" cy="230" rx="42" ry="14" fill="#eeddc3" />
      <!-- Pool of melted wax inside bowl -->
      <ellipse cx="128" cy="232" rx="26" ry="8" fill="#e2caa3" />

      <!-- Blackened Wick -->
      <path d="M 128 230 Q 134 205 126 182" fill="none" stroke="#221e1a" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Flame Shape (Hand-Drawn Teardrop) -->
    <g stroke="#221e1a" stroke-width="2.5" stroke-linejoin="round">
      <path d="
        M 128 105 
        C 112 145 106 165 116 180 
        C 124 192 136 192 142 180 
        C 148 165 142 145 128 105 Z" 
        fill="#f8d568" />
      <!-- Inner hot core -->
      <path d="
        M 128 135 
        C 120 155 118 168 123 176 
        C 127 182 131 182 134 176 
        C 137 168 134 155 128 135 Z" 
        fill="#fffcf0" stroke="#d49b43" stroke-width="1.5" />
    </g>

    <!-- Tiny pencil shading hatching -->
    <g stroke="#3a3228" stroke-width="1.5" opacity="0.4">
      <line x1="94" y1="350" x2="114" y2="350" />
      <line x1="94" y1="360" x2="118" y2="360" />
      <line x1="94" y1="370" x2="114" y2="370" />
    </g>
  </g>
</svg>
`;

// 7. CORRIDOR QUOTE PLAQUE (Hand-Lettered Parchment Plaque)
// "Somewhere between imagination and invention, magic happens."
const svgQuotePlaque = `
<svg width="1024" height="420" viewBox="0 0 1024 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="quote-filter" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
    </filter>
  </defs>
  <g filter="url(#quote-filter)">
    <!-- Parchment Scroll Plaque -->
    <path d="
      M 70 50 
      Q 512 35 954 50 
      Q 965 210 954 370 
      Q 512 385 70 370 
      Q 60 210 70 50 Z" 
      fill="#f7f2e6" stroke="#2a231b" stroke-width="5" stroke-linejoin="round" />
    
    <!-- Inner double sketch border -->
    <path d="
      M 86 66 
      Q 512 52 938 66 
      Q 948 210 938 354 
      Q 512 368 86 354 
      Q 76 210 86 66 Z" 
      fill="none" stroke="#705844" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.75" />

    <!-- Corner ornate flourishes -->
    <g stroke="#833c46" stroke-width="2.5" fill="none">
      <path d="M 100 80 Q 125 80 125 105" />
      <path d="M 924 80 Q 899 80 899 105" />
      <path d="M 100 340 Q 125 340 125 315" />
      <path d="M 924 340 Q 899 340 899 315" />
    </g>

    <!-- Star flourishes -->
    <g fill="#d49b43" stroke="#2a231b" stroke-width="1.5">
      <polygon points="512,65 515,75 525,78 515,81 512,91 509,81 499,78 509,75" />
      <polygon points="200,80 202,87 209,89 202,91 200,98 198,91 191,89 198,87" />
      <polygon points="824,80 826,87 833,89 826,91 824,98 822,91 815,89 822,87" />
    </g>

    <!-- Hand-lettered quote typography -->
    <!-- Line 1 -->
    <text x="512" y="150" font-family="'Cabin Sketch', cursive, serif" font-weight="bold" font-size="36" fill="#30271f" text-anchor="middle" letter-spacing="2">
      "Somewhere between imagination
    </text>

    <!-- Line 2 -->
    <text x="512" y="215" font-family="'Cabin Sketch', cursive, serif" font-weight="bold" font-size="36" fill="#30271f" text-anchor="middle" letter-spacing="2">
      and invention,
    </text>

    <!-- Line 3 - Calligraphic emphasis in warm burgundy/amber -->
    <text x="512" y="295" font-family="'Cabin Sketch', cursive, serif" font-weight="bold" font-size="48" fill="#833c46" text-anchor="middle" letter-spacing="3">
      MAGIC HAPPENS."
    </text>

    <!-- Bottom decorative feather quill underline -->
    <g stroke="#705844" stroke-width="2.5" stroke-linecap="round" fill="none">
      <path d="M 330 330 Q 512 345 694 330" />
      <circle cx="512" cy="338" r="4" fill="#d49b43" stroke="#2a231b" stroke-width="1.5" />
    </g>
  </g>
</svg>
`;

// 8. OLD-FASHIONED WALL LANTERN (Wrought Iron Sconce & Candle Flame)
const svgLantern = `
<svg width="300" height="600" viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="lantern-filter" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
    <radialGradient id="lantern-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff5d0" stop-opacity="0.95" />
      <stop offset="35%" stop-color="#f5ba48" stop-opacity="0.6" />
      <stop offset="70%" stop-color="#cf7a27" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#804010" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Candle ambient glow in lantern body -->
  <circle cx="150" cy="340" r="140" fill="url(#lantern-glow)" />

  <g filter="url(#lantern-filter)">
    <!-- Wrought Iron Wall Sconce Bracket (Left wall mount) -->
    <g stroke="#221e1a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Wall plate -->
      <path d="M 30 180 L 30 380" stroke-width="8" stroke="#221e1a" />
      <!-- Scrollwork arm -->
      <path d="M 30 320 Q 90 340 150 250" />
      <path d="M 30 220 Q 110 200 150 250" />
      <!-- Support curl -->
      <path d="M 30 260 C 70 290 85 240 60 230" stroke-width="4" />
      <!-- Top hanger hook -->
      <path d="M 150 230 L 150 250" stroke-width="6" />
    </g>

    <!-- Hexagonal Lantern Housing -->
    <!-- Top Pyramid Cap -->
    <g stroke="#221e1a" stroke-width="4" stroke-linejoin="round" fill="#322921">
      <polygon points="150,220 85,265 215,265" />
      <circle cx="150" cy="216" r="10" fill="#d49b43" />
      <!-- Spire pin -->
      <line x1="150" y1="206" x2="150" y2="190" stroke-width="4" />
    </g>

    <!-- Glass Pane chamber -->
    <g stroke="#221e1a" stroke-width="4" stroke-linejoin="round">
      <!-- Glass background -->
      <polygon points="85,265 215,265 195,410 105,410" fill="#fdfaf0" fill-opacity="0.75" />
      <!-- Vertical iron frame ribs -->
      <line x1="150" y1="265" x2="150" y2="410" stroke="#221e1a" stroke-width="4" />
      <line x1="85" y1="265" x2="105" y2="410" stroke="#221e1a" stroke-width="4" />
      <line x1="215" y1="265" x2="195" y2="410" stroke="#221e1a" stroke-width="4" />
    </g>

    <!-- Interior Candle & Flame -->
    <g stroke="#221e1a" stroke-width="2.5">
      <!-- Candle pillar -->
      <rect x="140" y="350" width="20" height="48" rx="3" fill="#f6f0dd" />
      <!-- Wick -->
      <line x1="150" y1="350" x2="150" y2="340" stroke-width="2.5" />
      <!-- Flame -->
      <path d="M 150 310 C 142 328 140 335 146 342 C 150 346 154 346 156 342 C 160 335 158 328 150 310 Z" fill="#ffd966" stroke="#d49b43" />
      <circle cx="150" cy="336" r="4" fill="#ffffff" />
    </g>

    <!-- Bottom Iron Base & Finial -->
    <g stroke="#221e1a" stroke-width="4" stroke-linejoin="round" fill="#322921">
      <polygon points="105,410 195,410 165,435 135,435" />
      <path d="M 150 435 L 150 455 C 150 462 145 465 150 470" stroke-width="4" fill="none" />
    </g>
  </g>
</svg>
`;

// 9. MAGICAL WALL SYMBOLS (Astrolabe, Alchemy Runes, Celestial Circles)
const svgSymbols = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="symbols-filter" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
    </filter>
  </defs>
  <g filter="url(#symbols-filter)" stroke="#3e362d" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Outer Celestial Orbit Rings -->
    <circle cx="256" cy="256" r="220" stroke-width="3" stroke-dasharray="16,8" opacity="0.6" />
    <circle cx="256" cy="256" r="200" stroke-width="2" opacity="0.5" />
    <circle cx="256" cy="256" r="160" stroke-width="3.5" opacity="0.8" />
    <circle cx="256" cy="256" r="120" stroke-width="2" stroke-dasharray="4,8" opacity="0.6" />
    <circle cx="256" cy="256" r="60" stroke-width="3" opacity="0.75" />

    <!-- Hexagram / Astrological Geometry -->
    <polygon points="256,96 395,336 117,336" stroke-width="2.5" opacity="0.65" />
    <polygon points="256,416 117,176 395,176" stroke-width="2.5" opacity="0.65" />

    <!-- Quadrant axis lines -->
    <line x1="36" y1="256" x2="476" y2="256" stroke-width="2" stroke-dasharray="10,6" opacity="0.5" />
    <line x1="256" y1="36" x2="256" y2="476" stroke-width="2" stroke-dasharray="10,6" opacity="0.5" />
    <line x1="100" y1="100" x2="412" y2="412" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />
    <line x1="100" y1="412" x2="412" y2="100" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.4" />

    <!-- Planetary & Alchemical Glyphs -->
    <!-- Sun / Gold at center -->
    <circle cx="256" cy="256" r="18" stroke-width="3" />
    <circle cx="256" cy="256" r="4" fill="#3e362d" />

    <!-- Moon / Silver (Top) -->
    <path d="M 256 60 A 18 18 0 0 0 256 90 A 12 12 0 0 1 256 60" fill="#3e362d" stroke-width="2" />

    <!-- Mercury (Right) -->
    <circle cx="430" cy="256" r="10" stroke-width="2.5" />
    <line x1="430" y1="266" x2="430" y2="282" stroke-width="2.5" />
    <line x1="422" y1="274" x2="438" y2="274" stroke-width="2.5" />
    <path d="M 422 248 Q 430 242 438 248" stroke-width="2.5" />

    <!-- Mars (Bottom) -->
    <circle cx="256" cy="440" r="12" stroke-width="2.5" />
    <line x1="265" y1="431" x2="277" y2="419" stroke-width="2.5" />
    <polyline points="268,419 277,419 277,428" stroke-width="2.5" />

    <!-- Venus (Left) -->
    <circle cx="82" cy="256" r="12" stroke-width="2.5" />
    <line x1="82" y1="268" x2="82" y2="284" stroke-width="2.5" />
    <line x1="74" y1="276" x2="90" y2="276" stroke-width="2.5" />

    <!-- Constellation Stars -->
    <g fill="#d49b43" stroke="#25211c" stroke-width="1.2">
      <polygon points="180,130 182,136 188,138 182,140 180,146 178,140 172,138 178,136" />
      <polygon points="340,140 342,146 348,148 342,150 340,156 338,150 332,148 338,146" />
      <polygon points="360,360 362,366 368,368 362,370 360,376 358,370 352,368 358,366" />
      <polygon points="160,350 162,356 168,358 162,360 160,366 158,360 152,358 158,356" />
    </g>
  </g>
</svg>
`;

// 10. MAGICAL STACK OF BOOKS & INKPOT FOR THE ARCHIVE TABLE
const svgBooks = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="books-filter" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
    </filter>
  </defs>
  <g filter="url(#books-filter)">
    <!-- Bottom Book (Large Leather Folio) -->
    <g stroke="#221e1a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 80 430 L 400 430 L 420 370 L 100 370 Z" fill="#705844" />
      <!-- Book Spine -->
      <path d="M 80 430 Q 70 400 100 370 L 100 350 Q 70 380 80 410 Z" fill="#5a4533" />
      <!-- Pages thickness -->
      <path d="M 400 430 L 420 370 L 415 355 L 395 415 Z" fill="#ede5d2" />
      <line x1="120" y1="400" x2="380" y2="400" stroke="#d49b43" stroke-width="3" stroke-dasharray="12,6" />
    </g>

    <!-- Middle Book (Antique Burgundy Grimoire with Brass Corners) -->
    <g stroke="#221e1a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 110 370 L 390 370 L 405 320 L 125 320 Z" fill="#833c46" />
      <!-- Pages -->
      <path d="M 390 370 L 405 320 L 400 308 L 385 358 Z" fill="#f4eedf" />
      <!-- Brass Corner Accents -->
      <polygon points="110,370 140,370 120,350" fill="#d49b43" />
      <polygon points="390,370 360,370 380,350" fill="#d49b43" />
    </g>

    <!-- Top Book (Slightly tilted Tome with Ribbon) -->
    <g stroke="#221e1a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" transform="rotate(-4 240 280)">
      <path d="M 130 315 L 360 315 L 375 270 L 145 270 Z" fill="#3b5a45" />
      <!-- Gold Embossed Crest on cover -->
      <circle cx="250" cy="292" r="14" fill="none" stroke="#d49b43" stroke-width="2.5" />
      <!-- Ribbon Bookmark extending out -->
      <path d="M 350 290 Q 380 320 370 360 L 382 355 L 392 362 Q 385 315 355 285" fill="#d49b43" stroke="#221e1a" stroke-width="2" />
    </g>

    <!-- Glass Inkpot on top of stack -->
    <g stroke="#221e1a" stroke-width="3.5" stroke-linejoin="round">
      <rect x="280" y="210" width="50" height="42" rx="6" fill="#f8f4ea" fill-opacity="0.8" />
      <rect x="288" y="198" width="34" height="12" rx="3" fill="#3a3026" />
      <!-- Dark ink inside pot -->
      <rect x="284" y="224" width="42" height="24" rx="3" fill="#201a18" />
    </g>

    <!-- Feathery Quill standing in inkpot -->
    <g stroke="#221e1a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 305 210 Q 340 130 380 60" fill="none" stroke-width="4" />
      <!-- Feather Plume -->
      <path d="M 380 60 Q 395 100 360 140 Q 340 160 330 180 Q 348 140 370 100 Z" fill="#eeddc7" />
      <path d="M 380 60 Q 350 90 335 130 Q 320 160 315 185 Q 330 145 350 110 Z" fill="#d49b43" />
    </g>

    <!-- Rolled Parchment Scroll beside books -->
    <g stroke="#221e1a" stroke-width="3.5" stroke-linejoin="round" fill="#eeddc7">
      <path d="M 120 440 C 105 440 95 425 95 410 C 95 395 105 385 120 385 L 200 385 C 215 385 225 395 225 410 C 225 425 215 440 200 440 Z" />
      <ellipse cx="120" cy="412" rx="14" ry="24" fill="#deb887" />
      <!-- Tied string ribbon -->
      <line x1="160" y1="385" x2="160" y2="440" stroke="#833c46" stroke-width="4" />
    </g>

    <!-- Sparkles -->
    <g fill="#d49b43" stroke="#221e1a" stroke-width="1.5">
      <polygon points="210,230 213,238 221,241 213,244 210,252 207,244 199,241 207,238" />
      <polygon points="380,180 383,188 391,191 383,194 380,202 377,194 369,191 377,188" />
    </g>
  </g>
</svg>
`;

const items = [
    { svg: svgBuilds, name: 'emblem_builds' },
    { svg: svgLab, name: 'emblem_lab' },
    { svg: svgStory, name: 'emblem_story' },
    { svg: svgSayHi, name: 'emblem_sayhi' },
    { svg: svgWispr, name: 'emblem_wispr' },
    { svg: svgCandle, name: 'candle_sketch' },
    { svg: svgQuotePlaque, name: 'quote_plaque' },
    { svg: svgLantern, name: 'lantern_sketch' },
    { svg: svgSymbols, name: 'magical_symbols' },
    { svg: svgBooks, name: 'magic_books' }
];

async function run() {
    console.log('Generating magical sketch assets...');
    for (const item of items) {
        const svgBuf = Buffer.from(item.svg);
        const webpPath = path.join(outDir, `${item.name}.webp`);
        await sharp(svgBuf)
            .webp({ quality: 90, alphaQuality: 95, lossless: false })
            .toFile(webpPath);
        console.log(`Saved: ${webpPath}`);
    }
    console.log('All magical assets successfully generated!');
}

run().catch(err => {
    console.error('Error generating assets:', err);
    process.exit(1);
});
