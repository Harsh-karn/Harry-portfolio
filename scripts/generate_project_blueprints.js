/* global Buffer, process */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/textures/projects');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const escapeXml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Common SVG Card Frame Generator
function createCardSvg({
    title,
    num,
    category,
    isFeatured = false,
    diagramSvg,
    techBadges = [],
    hasLive = false,
    isPainted = false
}) {
    const bgColor = isPainted ? (isFeatured ? '#fdf8ea' : '#f8f4ec') : '#f5f0e6';
    const paperTint = isPainted ? (isFeatured ? 'rgba(212, 155, 67, 0.15)' : 'rgba(93, 123, 138, 0.12)') : 'rgba(0,0,0,0)';
    const inkColor = '#241e17';
    const faintLine = isPainted ? '#8c7b64' : '#a09484';
    const accentColor = isFeatured ? '#b87e28' : '#4d6f80';
    const sealColor = '#833c46';

    const techBadgesSvg = techBadges.map((badge, idx) => {
        const x = 50 + (idx % 3) * 170;
        const y = 690 + Math.floor(idx / 3) * 36;
        return `
            <g transform="translate(${x}, ${y})">
                <rect width="155" height="26" rx="4" fill="${isPainted ? '#eae0cc' : '#ece4d4'}" stroke="${inkColor}" stroke-width="1.2" stroke-dasharray="4,2"/>
                <text x="77" y="17" text-anchor="middle" font-family="'Cabin Sketch', cursive, sans-serif" font-size="12" font-weight="bold" fill="${inkColor}">${escapeXml(badge)}</text>
            </g>
        `;
    }).join('');

    return `
<svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="hand-drawn" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5"/>
    </filter>
    <pattern id="blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="${faintLine}" stroke-width="0.6" opacity="0.4" stroke-dasharray="2,3"/>
    </pattern>
  </defs>

  <!-- Parchment Base -->
  <rect width="600" height="800" fill="${bgColor}" />
  <rect width="600" height="800" fill="${paperTint}" />
  <rect width="600" height="800" fill="url(#blueprint-grid)" opacity="0.6" />

  <g filter="url(#hand-drawn)">
    <!-- Outer Torn Hand-Drawn Borders -->
    <rect x="25" y="25" width="550" height="750" rx="8" fill="none" stroke="${inkColor}" stroke-width="3" />
    <rect x="33" y="33" width="534" height="734" rx="4" fill="none" stroke="${inkColor}" stroke-width="1" stroke-dasharray="6,4" />

    <!-- Corner Technical Markers -->
    <path d="M 25 55 L 55 55 L 55 25" fill="none" stroke="${inkColor}" stroke-width="2" />
    <path d="M 575 55 L 545 55 L 545 25" fill="none" stroke="${inkColor}" stroke-width="2" />
    <path d="M 25 745 L 55 745 L 55 775" fill="none" stroke="${inkColor}" stroke-width="2" />
    <path d="M 575 745 L 545 745 L 545 775" fill="none" stroke="${inkColor}" stroke-width="2" />

    <!-- Card Header -->
    <g transform="translate(50, 48)">
      <!-- Number & Category Tag -->
      <rect x="0" y="0" width="80" height="28" rx="4" fill="${inkColor}" />
      <text x="40" y="19" text-anchor="middle" font-family="'Cabin Sketch', cursive, sans-serif" font-size="14" font-weight="bold" fill="#f5f0e6">PRJ ${num}</text>

      <text x="95" y="20" font-family="'Cabin Sketch', cursive, sans-serif" font-size="15" font-weight="bold" fill="${accentColor}" letter-spacing="1.5">${escapeXml(category.toUpperCase())}</text>

      <!-- Dimension Scale Line -->
      <line x1="0" y1="38" x2="500" y2="38" stroke="${inkColor}" stroke-width="1.5" />
      <line x1="0" y1="34" x2="0" y2="42" stroke="${inkColor}" stroke-width="1.5" />
      <line x1="250" y1="34" x2="250" y2="42" stroke="${inkColor}" stroke-width="1.5" />
      <line x1="500" y1="34" x2="500" y2="42" stroke="${inkColor}" stroke-width="1.5" />
      <text x="250" y="49" text-anchor="middle" font-family="'Cabin Sketch', cursive, sans-serif" font-size="10" fill="${faintLine}">ARCHITECTURAL ARCHIVE SCHEMATIC • SCALE 1:1</text>
    </g>

    <!-- Project Title -->
    <g transform="translate(50, 125)">
      <text x="0" y="0" font-family="'Rubik Scribble', 'Cabin Sketch', cursive, sans-serif" font-size="28" font-weight="bold" fill="${inkColor}" letter-spacing="1">${escapeXml(title)}</text>
    </g>

    <!-- Featured Wax Seal (Only on featured 5) -->
    ${isFeatured ? `
    <g transform="translate(510, 75)">
      <circle cx="0" cy="0" r="26" fill="${isPainted ? sealColor : '#ab525f'}" stroke="${inkColor}" stroke-width="2" />
      <circle cx="0" cy="0" r="21" fill="none" stroke="#f6f2e8" stroke-width="1.5" stroke-dasharray="3,2" />
      <polygon points="0,-12 3,-4 11,-4 5,2 7,10 0,5 -7,10 -5,2 -11,-4 -3,-4" fill="#fdf8ea" />
      <text x="0" y="16" text-anchor="middle" font-family="'Cabin Sketch', cursive" font-size="8" font-weight="bold" fill="#fdf8ea">CORE</text>
    </g>
    ` : ''}

    ${hasLive ? `
    <g transform="translate(490, 80)">
      <rect x="-35" y="-12" width="70" height="22" rx="4" fill="#2d6a4f" stroke="${inkColor}" stroke-width="1.5"/>
      <text x="0" y="3" text-anchor="middle" font-family="'Cabin Sketch', cursive" font-size="11" font-weight="bold" fill="#ffffff">⚡ LIVE</text>
    </g>
    ` : ''}

    <!-- Central Schematic Diagram Box -->
    <g transform="translate(50, 150)">
      <!-- Frame box for diagram -->
      <rect x="0" y="0" width="500" height="500" rx="6" fill="${isPainted ? '#fffdf7' : '#faf6ee'}" stroke="${inkColor}" stroke-width="2" />
      <rect x="6" y="6" width="488" height="488" fill="none" stroke="${faintLine}" stroke-width="1" stroke-dasharray="8,4" />

      <!-- Injected Project Diagram -->
      ${diagramSvg}
    </g>

    <!-- Bottom Tech Stack Section -->
    <g transform="translate(0, 0)">
      <line x1="50" y1="670" x2="550" y2="670" stroke="${inkColor}" stroke-width="1.2" stroke-dasharray="4,3" />
      <text x="50" y="662" font-family="'Cabin Sketch', cursive, sans-serif" font-size="12" font-weight="bold" fill="${inkColor}" letter-spacing="1">VERIFIED ARCHITECTURE STACK:</text>
      ${techBadgesSvg}
    </g>

    <!-- Decorative Stamp / Signature at Bottom -->
    <g transform="translate(50, 762)">
      <text x="0" y="0" font-family="'Cabin Sketch', cursive, sans-serif" font-size="10" fill="${faintLine}">ARCHIVE ID: HK-${num.padStart(2, '0')} • HARSH KARN WORKSHOP</text>
      <text x="500" y="0" text-anchor="end" font-family="'Cabin Sketch', cursive, sans-serif" font-size="10" fill="${accentColor}">[ CLICK TO INSPECT DOSSIER ]</text>
    </g>
  </g>
</svg>
`;
}

// 10 Detailed Project Blueprint Diagram SVGs
const DIAGRAMS = {
    // 01. TETHER
    tether: `
    <g transform="translate(250, 250)">
      <!-- Checkpoint Nodes Pipeline -->
      <g stroke="#241e17" stroke-width="2.5" fill="none">
        <!-- Main Line -->
        <line x1="-190" y1="-50" x2="190" y2="-50" stroke-dasharray="6,4" />
        <path d="M 180 -55 L 195 -50 L 180 -45" fill="#241e17" />
        
        <!-- Nodes -->
        <circle cx="-160" cy="-50" r="26" fill="#e8dbc3" />
        <text x="-160" y="-45" text-anchor="middle" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#241e17">STEP 1</text>
        
        <circle cx="-60" cy="-50" r="26" fill="#e8dbc3" />
        <text x="-60" y="-45" text-anchor="middle" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#241e17">STEP 2</text>
        
        <!-- Human Review Gate Node (Hexagon / Lock) -->
        <polygon points="60,-82 90,-65 90,-35 60,-18 30,-35 30,-65" fill="#fdf0cd" stroke="#833c46" stroke-width="3" />
        <circle cx="60" cy="-56" r="8" fill="none" stroke="#833c46" stroke-width="2.5" />
        <rect x="52" y="-53" width="16" height="12" rx="2" fill="#833c46" />
        <text x="60" y="-2" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#833c46">REVIEW GATE</text>
        
        <!-- Atomic Commit Node -->
        <circle cx="160" cy="-50" r="26" fill="#d9e6dc" />
        <text x="160" y="-45" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">COMMIT</text>
      </g>

      <!-- Compensating Action Atomic Rollback Loop -->
      <g stroke="#833c46" stroke-width="2.5" fill="none">
        <path d="M 160 -20 C 160 80, -160 80, -160 -20" stroke-dasharray="7,4" />
        <path d="M -165 -15 L -160 -25 L -155 -15" fill="#833c46" />
        <rect x="-85" y="60" width="170" height="26" rx="4" fill="#fae8e8" stroke="#833c46" stroke-width="1.5" />
        <text x="0" y="78" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#833c46">↺ ATOMIC ROLLBACK PATH</text>
      </g>

      <!-- Queue State Spec -->
      <g transform="translate(0, 140)">
        <rect x="-190" y="-15" width="380" height="60" rx="5" fill="#f4ece1" stroke="#241e17" stroke-width="1.8" stroke-dasharray="5,3" />
        <text x="-175" y="10" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">STATE: [CHECKPOINT_DURABLE] • pgmq side-effects held</text>
        <text x="-175" y="32" font-family="'Cabin Sketch'" font-size="11" fill="#6d5d4d">FastAPI + Supabase + LiteLLM + Deno Edge + Cloud Run</text>
      </g>
    </g>
    `,

    // 02. GAUNTLET
    gauntlet: `
    <g transform="translate(250, 250)">
      <!-- Golden Test Suite Evaluation Grid -->
      <rect x="-190" y="-170" width="380" height="180" rx="6" fill="#f7f2e7" stroke="#241e17" stroke-width="2" />
      <text x="-170" y="-145" font-family="'Cabin Sketch'" font-size="14" font-weight="bold" fill="#241e17">GOLDEN TEST SUITE HARNESS</text>
      
      <!-- Table rows -->
      <g transform="translate(-170, -125)" font-family="'Cabin Sketch'" font-size="11">
        <text x="0" y="0" fill="#605244">SUITE 01: Prompt Injection Guard</text> <text x="310" y="0" fill="#2d6a4f" font-weight="bold">PASS [100%]</text>
        <line x1="0" y1="8" x2="340" y2="8" stroke="#d5c8b5" stroke-width="1" />
        
        <text x="0" y="26" fill="#605244">SUITE 02: Schema Integrity Drift</text> <text x="310" y="26" fill="#2d6a4f" font-weight="bold">PASS [98.4%]</text>
        <line x1="0" y1="34" x2="340" y2="34" stroke="#d5c8b5" stroke-width="1" />
        
        <text x="0" y="52" fill="#605244">SUITE 03: Toxicity &amp; Bias Judge</text> <text x="310" y="52" fill="#2d6a4f" font-weight="bold">PASS [99.1%]</text>
        <line x1="0" y1="60" x2="340" y2="60" stroke="#d5c8b5" stroke-width="1" />

        <text x="0" y="78" fill="#605244">SUITE 04: Quality Regression Threshold</text> <text x="310" y="78" fill="#833c46" font-weight="bold">CI GATE ACTIVE</text>
      </g>

      <!-- CI PR Gate Barrier Diagram -->
      <g transform="translate(0, 80)">
        <path d="M -160 0 L -40 0" stroke="#241e17" stroke-width="2.5" stroke-dasharray="5,3" />
        <rect x="-195" y="-18" width="50" height="36" rx="4" fill="#e2d8c3" stroke="#241e17" stroke-width="2" />
        <text x="-170" y="4" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">PR</text>

        <!-- The Gate -->
        <rect x="-40" y="-35" width="80" height="70" rx="5" fill="#fdf0cd" stroke="#833c46" stroke-width="3" />
        <text x="0" y="-8" text-anchor="middle" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#833c46">GAUNTLET</text>
        <text x="0" y="10" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" font-weight="bold" fill="#833c46">CI GATE</text>

        <!-- Merge decision branches -->
        <path d="M 40 -15 L 140 -40" stroke="#2d6a4f" stroke-width="2.5" />
        <text x="160" y="-36" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#2d6a4f">MERGE</text>
        
        <path d="M 40 15 L 140 40" stroke="#833c46" stroke-width="2.5" />
        <text x="160" y="44" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#833c46">BLOCK PR</text>
      </g>
    </g>
    `,

    // 03. BOUNCER
    bouncer: `
    <g transform="translate(250, 250)">
      <!-- Concentric Security Boundaries -->
      <g stroke="#241e17" fill="none">
        <circle cx="0" cy="-30" r="140" stroke-width="2" stroke-dasharray="6,4" />
        <text x="0" y="-155" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#756450">ZONE 3: NO TOOL / FORBIDDEN WRITES</text>

        <circle cx="0" cy="-30" r="95" stroke-width="2.5" fill="#f4ebd9" opacity="0.6" />
        <text x="0" y="-110" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#833c46" font-weight="bold">ZONE 2: HUMAN CONSENT TOKEN REQD</text>

        <circle cx="0" cy="-30" r="50" stroke-width="3" fill="#e3d6be" />
        <text x="0" y="-38" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">ZONE 1</text>
        <text x="0" y="-22" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#241e17">READ-ONLY</text>
      </g>

      <!-- Key & Signed Token Symbol -->
      <g transform="translate(130, -30)">
        <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#fdf2d0" stroke="#b87e28" stroke-width="2" />
        <text x="0" y="-2" text-anchor="middle" font-family="'Cabin Sketch'" font-size="9" font-weight="bold" fill="#b87e28">SIGNED</text>
        <text x="0" y="12" text-anchor="middle" font-family="'Cabin Sketch'" font-size="8" fill="#241e17">TOKEN</text>
      </g>

      <!-- Hash-Chained Audit Log Ledger at bottom -->
      <g transform="translate(-180, 120)">
        <rect x="0" y="0" width="100" height="45" rx="3" fill="#eae1cf" stroke="#241e17" stroke-width="1.8" />
        <text x="50" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold">BLOCK #104</text>
        
        <path d="M 100 22 L 125 22" stroke="#241e17" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="112" cy="22" r="3" fill="#241e17" />
        
        <rect x="125" y="0" width="100" height="45" rx="3" fill="#eae1cf" stroke="#241e17" stroke-width="1.8" />
        <text x="175" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold">BLOCK #105</text>
        
        <path d="M 225 22 L 250 22" stroke="#241e17" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="237" cy="22" r="3" fill="#241e17" />

        <rect x="250" y="0" width="110" height="45" rx="3" fill="#faeed7" stroke="#b87e28" stroke-width="2" />
        <text x="305" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold" fill="#833c46">SHA-256 CHAIN</text>
      </g>
    </g>
    `,

    // 04. AGENT PLATFORM PRODUCTION RELIABILITY
    reliability: `
    <g transform="translate(250, 250)">
      <!-- 10 Primitives Grid Matrix -->
      <g transform="translate(-180, -170)">
        <!-- Primitive 1 -->
        <rect x="0" y="0" width="170" height="52" rx="4" fill="#ede3d1" stroke="#241e17" stroke-width="1.8" />
        <text x="12" y="22" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">1. Schema-Enforced Output</text>
        <text x="12" y="40" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Strict Pydantic JSON Guard</text>

        <!-- Primitive 2 -->
        <rect x="190" y="0" width="170" height="52" rx="4" fill="#ede3d1" stroke="#241e17" stroke-width="1.8" />
        <text x="202" y="22" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">2. ReAct Loop Caps</text>
        <text x="202" y="40" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Deterministic Break Loop</text>

        <!-- Primitive 3 -->
        <rect x="0" y="62" width="170" height="52" rx="4" fill="#ede3d1" stroke="#241e17" stroke-width="1.8" />
        <text x="12" y="84" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">3. Human Approval Gate</text>
        <text x="12" y="102" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Out-of-band Interruption</text>

        <!-- Primitive 4 -->
        <rect x="190" y="62" width="170" height="52" rx="4" fill="#ede3d1" stroke="#241e17" stroke-width="1.8" />
        <text x="202" y="84" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">4. Cost-Based Routing</text>
        <text x="202" y="102" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Tiered LLM Escalation</text>

        <!-- Primitive 5 -->
        <rect x="0" y="124" width="170" height="52" rx="4" fill="#faeed7" stroke="#833c46" stroke-width="2" />
        <text x="12" y="146" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#833c46">5. Dead-Letter Queues</text>
        <text x="12" y="164" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Isolated Failure Triage</text>

        <!-- Primitive 6 -->
        <rect x="190" y="124" width="170" height="52" rx="4" fill="#ede3d1" stroke="#241e17" stroke-width="1.8" />
        <text x="202" y="146" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">6. Tracing &amp; Replay</text>
        <text x="202" y="164" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Deterministic Event DAG</text>
      </g>

      <!-- 64 Tests Verified Badge -->
      <g transform="translate(0, 140)">
        <rect x="-160" y="-12" width="320" height="36" rx="5" fill="#e2edd8" stroke="#2d6a4f" stroke-width="2" />
        <text x="0" y="11" text-anchor="middle" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#2d6a4f">✓ 64 UNIT &amp; INTEGRATION TESTS PASSING</text>
      </g>
    </g>
    `,

    // 05. TALLY
    tally: `
    <g transform="translate(250, 250)">
      <!-- Operations Analytics Chart Graph -->
      <g transform="translate(-180, -160)">
        <!-- Axes -->
        <line x1="30" y1="140" x2="340" y2="140" stroke="#241e17" stroke-width="2" />
        <line x1="30" y1="20" x2="30" y2="140" stroke="#241e17" stroke-width="2" />
        <text x="180" y="156" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#6d5c48">AGENT EXECUTION RUNS</text>
        <text x="15" y="80" text-anchor="middle" transform="rotate(-90 15 80)" font-family="'Cabin Sketch'" font-size="11" fill="#6d5c48">NET MINUTES SAVED</text>

        <!-- Curve line -->
        <path d="M 30 130 Q 110 110, 180 70 T 330 30" fill="none" stroke="#b87e28" stroke-width="3.5" />
        <circle cx="180" cy="70" r="5" fill="#833c46" />
        <circle cx="330" cy="30" r="5" fill="#2d6a4f" />
        
        <!-- Cost Bar Histogram -->
        <rect x="70" y="100" width="18" height="40" fill="#ded3c0" stroke="#241e17" stroke-width="1.2" />
        <rect x="120" y="85" width="18" height="55" fill="#ded3c0" stroke="#241e17" stroke-width="1.2" />
        <rect x="170" y="65" width="18" height="75" fill="#ded3c0" stroke="#241e17" stroke-width="1.2" />
        <rect x="220" y="50" width="18" height="90" fill="#ded3c0" stroke="#241e17" stroke-width="1.2" />
        <rect x="270" y="35" width="18" height="105" fill="#ded3c0" stroke="#241e17" stroke-width="1.2" />
      </g>

      <!-- Show-the-Query & Interruption Budget -->
      <g transform="translate(0, 80)">
        <rect x="-180" y="0" width="170" height="70" rx="4" fill="#ede2ce" stroke="#241e17" stroke-width="1.8" />
        <text x="-95" y="24" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">BUDGET ENFORCEMENT</text>
        <text x="-95" y="44" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#833c46">Max Interrupt / Person</text>

        <rect x="10" y="0" width="170" height="70" rx="4" fill="#ede2ce" stroke="#241e17" stroke-width="1.8" />
        <text x="95" y="24" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">SHOW-THE-QUERY</text>
        <text x="95" y="44" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#584838">Audit SQL for Every Grade</text>
      </g>
    </g>
    `,

    // 06. FYNLO
    fynlo: `
    <g transform="translate(250, 250)">
      <!-- UPI Parser Flow Diagram -->
      <!-- SMS / Statement Ingestion -->
      <g transform="translate(-140, -110)">
        <rect x="-45" y="-35" width="90" height="70" rx="5" fill="#ede2cf" stroke="#241e17" stroke-width="2" />
        <text x="0" y="-8" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold">BANK SMS</text>
        <text x="0" y="12" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11">&amp; STATEMENT</text>
      </g>

      <!-- Arrow -->
      <path d="M -90 -110 L -30 -110" stroke="#241e17" stroke-width="2.5" />
      <polygon points="-30,-115 -20,-110 -30,-105" fill="#241e17" />

      <!-- LLM Categorizer Node -->
      <g transform="translate(30, -110)">
        <circle cx="0" cy="0" r="42" fill="#fdf0cd" stroke="#b87e28" stroke-width="2.5" />
        <text x="0" y="-6" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">GEMINI</text>
        <text x="0" y="12" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold" fill="#b87e28">CLASSIFIER</text>
      </g>

      <!-- Arrow down to Dashboard & Android app -->
      <path d="M 30 -65 L 30 10" stroke="#241e17" stroke-width="2.5" />
      <polygon points="25,10 30,20 35,10" fill="#241e17" />

      <!-- Categorized Dashboard Display -->
      <g transform="translate(-170, 30)">
        <rect x="0" y="0" width="340" height="120" rx="6" fill="#fbf8f0" stroke="#241e17" stroke-width="2" />
        <text x="20" y="26" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#2d6a4f">UPI EXPENSE SUMMARY</text>
        
        <!-- Category progress bars -->
        <g transform="translate(20, 45)" font-family="'Cabin Sketch'" font-size="11">
          <text x="0" y="0" fill="#241e17">Groceries &amp; Dining (42%)</text>
          <rect x="150" y="-10" width="150" height="12" rx="2" fill="#e5dbca" />
          <rect x="150" y="-10" width="63" height="12" rx="2" fill="#2d6a4f" />

          <text x="0" y="24" fill="#241e17">Utilities &amp; Bills (28%)</text>
          <rect x="150" y="14" width="150" height="12" rx="2" fill="#e5dbca" />
          <rect x="150" y="14" width="42" height="12" rx="2" fill="#b87e28" />

          <text x="0" y="48" fill="#241e17">Transport &amp; Fuel (15%)</text>
          <rect x="150" y="38" width="150" height="12" rx="2" fill="#e5dbca" />
          <rect x="150" y="38" width="22" height="12" rx="2" fill="#833c46" />
        </g>
      </g>
    </g>
    `,

    // 07. TWITTER SUPPORT AGENT
    twitter_support: `
    <g transform="translate(250, 250)">
      <!-- Tweet Parsing to FAISS Vector Space Diagram -->
      <g transform="translate(-170, -150)">
        <rect x="0" y="0" width="140" height="60" rx="5" fill="#e9e0ce" stroke="#241e17" stroke-width="1.8" />
        <text x="70" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold">INCOMING TWEET</text>
        <text x="70" y="44" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6a5948">@AppleSupport</text>
      </g>

      <path d="M -30 -120 L 30 -120" stroke="#241e17" stroke-width="2" />
      <polygon points="30,-124 38,-120 30,-116" fill="#241e17" />

      <!-- Intent Classification Node -->
      <g transform="translate(100, -120)">
        <polygon points="0,-35 45,0 0,35 -45,0" fill="#fdf0cd" stroke="#241e17" stroke-width="2" />
        <text x="0" y="-3" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" font-weight="bold">INTENT</text>
        <text x="0" y="12" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10">ROUTER</text>
      </g>

      <!-- FAISS Dense Retrieval Space -->
      <g transform="translate(-170, -30)">
        <rect x="0" y="0" width="340" height="85" rx="5" fill="#f7f2e5" stroke="#241e17" stroke-width="2" />
        <text x="15" y="24" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">FAISS VECTOR EMBEDDINGS (Sentence Transformers)</text>
        <!-- Cluster dots -->
        <circle cx="50" cy="52" r="6" fill="#833c46" />
        <circle cx="70" cy="58" r="4" fill="#833c46" />
        <circle cx="160" cy="48" r="7" fill="#b87e28" />
        <circle cx="180" cy="55" r="5" fill="#b87e28" />
        <circle cx="280" cy="50" r="6" fill="#2d6a4f" />
        <text x="170" y="74" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#756453">Context Similarity Neighborhood</text>
      </g>

      <!-- Escalation Gate -->
      <g transform="translate(0, 110)">
        <rect x="-140" y="0" width="280" height="45" rx="4" fill="#fae8e8" stroke="#833c46" stroke-width="2" />
        <text x="0" y="20" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" font-weight="bold" fill="#833c46">SEVERITY THRESHOLD CHECK</text>
        <text x="0" y="36" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">RAG Automated Reply vs Human Escalation</text>
      </g>
    </g>
    `,

    // 08. BULK CERTIFICATE GENERATOR
    certificate: `
    <g transform="translate(250, 250)">
      <!-- Async Queue Batch Generator Diagram -->
      <g transform="translate(-160, -150)">
        <rect x="0" y="0" width="120" height="70" rx="4" fill="#e7ded0" stroke="#241e17" stroke-width="2" />
        <text x="60" y="28" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold">RECIPIENTS</text>
        <text x="60" y="48" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#6a5846">CSV / JSON</text>
      </g>

      <path d="M -40 -115 L 20 -115" stroke="#241e17" stroke-width="2.5" />
      <polygon points="20,-120 30,-115 20,-110" fill="#241e17" />

      <!-- Async Celery / Worker Queue -->
      <g transform="translate(90, -115)">
        <rect x="-60" y="-35" width="120" height="70" rx="5" fill="#fdf0cd" stroke="#b87e28" stroke-width="2" />
        <text x="0" y="-8" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold">ASYNC QUEUE</text>
        <text x="0" y="12" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6a5846">Background Task</text>
      </g>

      <!-- ReportLab Engine -->
      <g transform="translate(0, 10)">
        <rect x="-140" y="-20" width="280" height="50" rx="5" fill="#f4ede1" stroke="#241e17" stroke-width="2" />
        <text x="0" y="2" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">REPORTLAB VECTOR PDF ENGINE</text>
        <text x="0" y="20" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6a5846">Dynamic typography, badge stamping &amp; signatures</text>
      </g>

      <!-- Per-Certificate Status Ledger -->
      <g transform="translate(-160, 95)" font-family="'Cabin Sketch'" font-size="11">
        <rect x="0" y="0" width="320" height="60" rx="4" fill="#ffffff" stroke="#241e17" stroke-width="1.5" />
        <text x="15" y="22" fill="#2d6a4f">CERT_001_A9F2 • GENERATED &amp; VERIFIED</text>
        <text x="15" y="42" fill="#2d6a4f">CERT_002_C4E1 • GENERATED &amp; VERIFIED</text>
      </g>
    </g>
    `,

    // 09. PULSE-RAG
    pulse_rag: `
    <g transform="translate(250, 250)">
      <!-- 2-Tier Caching & Hybrid Dense/Sparse Fusion -->
      <g transform="translate(-170, -160)">
        <!-- Two-Layer Caching -->
        <rect x="0" y="0" width="150" height="65" rx="4" fill="#fdf0cd" stroke="#b87e28" stroke-width="2" />
        <text x="75" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#b87e28">L1 HOT CACHE</text>
        <text x="75" y="46" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#241e17">In-Memory Volatile</text>

        <rect x="180" y="0" width="160" height="65" rx="4" fill="#e8ded0" stroke="#241e17" stroke-width="1.8" />
        <text x="260" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold">L2 COLD STORE</text>
        <text x="260" y="46" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6a5846">Persistent Partitioned</text>
      </g>

      <!-- Hybrid Fusion Engine (Dense + BM25) -->
      <g transform="translate(-170, -60)">
        <rect x="0" y="0" width="340" height="80" rx="5" fill="#f8f4ec" stroke="#241e17" stroke-width="2" />
        <text x="170" y="26" text-anchor="middle" font-family="'Cabin Sketch'" font-size="13" font-weight="bold" fill="#241e17">HYBRID DENSE + BM25 RETRIEVAL</text>
        <text x="60" y="55" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#833c46">Dense FAISS</text>
        <text x="170" y="55" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#b87e28">⊕</text>
        <text x="270" y="55" text-anchor="middle" font-family="'Cabin Sketch'" font-size="11" fill="#2d6a4f">Sparse BM25</text>
      </g>

      <!-- Freshness Decay Curve -->
      <g transform="translate(-170, 50)">
        <rect x="0" y="0" width="340" height="100" rx="5" fill="#f8f4ec" stroke="#241e17" stroke-width="1.8" />
        <text x="15" y="24" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">MARKET SIGNAL FRESHNESS DECAY</text>
        
        <!-- Decay exponential curve -->
        <path d="M 40 85 Q 120 40, 310 35" fill="none" stroke="#833c46" stroke-width="2.5" />
        <line x1="40" y1="90" x2="310" y2="90" stroke="#a09484" stroke-width="1" />
        <text x="175" y="82" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#6d5c48">Half-Life Decay for Real-Time Financial Alerts</text>
      </g>
    </g>
    `,

    // 10. LINKEDIN AGENT ANALYTICS
    linkedin_analytics: `
    <g transform="translate(250, 250)">
      <!-- Star Schema Diagram & Anomaly Detector -->
      <!-- Center Fact Table -->
      <g transform="translate(0, -60)">
        <rect x="-65" y="-30" width="130" height="60" rx="5" fill="#fdf0cd" stroke="#b87e28" stroke-width="2.5" />
        <text x="0" y="-8" text-anchor="middle" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#241e17">FACT_OUTREACH</text>
        <text x="0" y="10" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" fill="#756453">Event Stream Data</text>
      </g>

      <!-- Dimension Tables (Star Schema) -->
      <!-- Top Left: DimAgent -->
      <line x1="-65" y1="-50" x2="-130" y2="-90" stroke="#241e17" stroke-width="1.5" />
      <rect x="-175" y="-120" width="90" height="38" rx="3" fill="#eae0ce" stroke="#241e17" stroke-width="1.5" />
      <text x="-130" y="-96" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold">DIM_AGENT</text>

      <!-- Top Right: DimCampaign -->
      <line x1="65" y1="-50" x2="130" y2="-90" stroke="#241e17" stroke-width="1.5" />
      <rect x="85" y="-120" width="95" height="38" rx="3" fill="#eae0ce" stroke="#241e17" stroke-width="1.5" />
      <text x="132" y="-96" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold">DIM_CAMPAIGN</text>

      <!-- Bottom Left: DimLead -->
      <line x1="-65" y1="-20" x2="-130" y2="10" stroke="#241e17" stroke-width="1.5" />
      <rect x="-175" y="0" width="90" height="38" rx="3" fill="#eae0ce" stroke="#241e17" stroke-width="1.5" />
      <text x="-130" y="24" text-anchor="middle" font-family="'Cabin Sketch'" font-size="10" font-weight="bold">DIM_LEAD</text>

      <!-- Anomaly Detection: Acceptance Rate Collapse -->
      <g transform="translate(-170, 60)">
        <rect x="0" y="0" width="340" height="95" rx="5" fill="#fbf8f0" stroke="#241e17" stroke-width="2" />
        <text x="15" y="24" font-family="'Cabin Sketch'" font-size="12" font-weight="bold" fill="#833c46">⚠ ACCEPTANCE-RATE COLLAPSE DETECTOR</text>
        
        <!-- Anomaly dip line -->
        <path d="M 30 50 L 120 50 L 160 85 L 220 85 L 300 48" fill="none" stroke="#833c46" stroke-width="2.5" />
        <circle cx="160" cy="85" r="4" fill="#833c46" />
        <text x="160" y="75" text-anchor="middle" font-family="'Cabin Sketch'" font-size="9" fill="#833c46" font-weight="bold">COLLAPSE FLAGGED</text>
      </g>
    </g>
    `
};

// The 10 Projects Configuration for Asset Generation
const PROJECTS_CONFIG = [
    {
        id: 'tether',
        num: '01',
        title: 'TETHER',
        category: 'AI & Agents',
        isFeatured: true,
        diagramSvg: DIAGRAMS.tether,
        techBadges: ['Python 3.12', 'FastAPI', 'Supabase pgmq', 'Deno Edge', 'LiteLLM', 'Cloud Run']
    },
    {
        id: 'gauntlet',
        num: '02',
        title: 'GAUNTLET',
        category: 'Developer Infra',
        isFeatured: true,
        diagramSvg: DIAGRAMS.gauntlet,
        techBadges: ['Python 3.11', 'Pydantic', 'pytest', 'YAML Suites', 'LiteLLM Judge', 'GitHub Actions']
    },
    {
        id: 'bouncer',
        num: '03',
        title: 'BOUNCER',
        category: 'Backend Infra',
        isFeatured: true,
        diagramSvg: DIAGRAMS.bouncer,
        techBadges: ['Python 3.11+', 'MCP Protocol', 'SQLite WAL', 'ASGI Middleware', 'Notion & GitHub', 'pytest']
    },
    {
        id: 'reliability',
        num: '04',
        title: 'AGENT RELIABILITY',
        category: 'AI & Agents',
        isFeatured: true,
        diagramSvg: DIAGRAMS.reliability,
        techBadges: ['Python 3.13', 'Pydantic', 'ThreadPoolExec', '64 Test Suite', 'Dead-Letter Q', 'Tracing DAG']
    },
    {
        id: 'tally',
        num: '05',
        title: 'TALLY',
        category: 'Data & Analytics',
        isFeatured: true,
        diagramSvg: DIAGRAMS.tally,
        techBadges: ['Python', 'BigQuery SQL', 'FastAPI', 'Streamlit', 'Terraform', 'Faker']
    },
    {
        id: 'fynlo',
        num: '06',
        title: 'FYNLO',
        category: 'Full-Stack App',
        isFeatured: false,
        hasLive: true,
        diagramSvg: DIAGRAMS.fynlo,
        techBadges: ['FastAPI & Celery', 'Redis & Postgres', 'Next.js 15', 'Gemini LLM', 'Android Kotlin', 'Docker']
    },
    {
        id: 'twitter_support',
        num: '07',
        title: 'TWITTER SUPPORT',
        category: 'AI & Agents',
        isFeatured: false,
        diagramSvg: DIAGRAMS.twitter_support,
        techBadges: ['Python', 'Groq (gpt-oss-20b)', 'Transformers', 'FAISS Vector', 'LLM-as-Judge']
    },
    {
        id: 'certificate',
        num: '08',
        title: 'CERTIFICATE GEN',
        category: 'Backend Infra',
        isFeatured: false,
        diagramSvg: DIAGRAMS.certificate,
        techBadges: ['FastAPI', 'SQLAlchemy', 'SQLite', 'ReportLab PDF', 'pytest']
    },
    {
        id: 'pulse_rag',
        num: '09',
        title: 'PULSE-RAG',
        category: 'AI & Analytics',
        isFeatured: false,
        diagramSvg: DIAGRAMS.pulse_rag,
        techBadges: ['FastAPI', 'FAISS Dense', 'rank-bm25', 'Transformers', 'React & Vite']
    },
    {
        id: 'linkedin_analytics',
        num: '10',
        title: 'LINKEDIN ANALYTICS',
        category: 'Data & Analytics',
        isFeatured: false,
        diagramSvg: DIAGRAMS.linkedin_analytics,
        techBadges: ['Python & Pandas', 'Postgres Star', 'Docker', 'structlog', 'Power BI']
    }
];

async function generateAll() {
    console.log(`Generating 10 project blueprint card assets...`);
    for (const prj of PROJECTS_CONFIG) {
        // 1. Regular Sketch Blueprint
        const frontSvg = createCardSvg({ ...prj, isPainted: false });
        const frontPath = path.join(outDir, `${prj.id}_front.webp`);
        await sharp(Buffer.from(frontSvg)).webp({ quality: 90 }).toFile(frontPath);

        // 2. Painted (Hover Reveal) Blueprint
        const paintedSvg = createCardSvg({ ...prj, isPainted: true });
        const paintedPath = path.join(outDir, `${prj.id}_painted.webp`);
        await sharp(Buffer.from(paintedSvg)).webp({ quality: 90 }).toFile(paintedPath);

        console.log(`✓ Generated ${prj.id}_front.webp & ${prj.id}_painted.webp`);
    }
    console.log(`All project blueprint card assets successfully generated!`);
}

generateAll().catch(err => {
    console.error(err);
    process.exit(1);
});
