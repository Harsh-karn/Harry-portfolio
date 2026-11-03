/**
 * HARSH KARN - ARCHIVAL INVENTORY OF INVENTIONS & BUILDS
 * Source of truth for all 10 real engineering projects.
 * Strict adherence: No fabricated metrics, no fake UI screenshots, no omitted builds.
 */

export const PROJECT_CATEGORIES = [
    { id: 'all', label: 'ALL BUILDS' },
    { id: 'ai-agents', label: 'AI & AGENTS' },
    { id: 'backend', label: 'BACKEND ENGINEERING' },
    { id: 'data-analytics', label: 'DATA & ANALYTICS' },
    { id: 'fullstack', label: 'FULL-STACK APPLICATIONS' },
    { id: 'dev-infra', label: 'DEVELOPER INFRASTRUCTURE' }
];

export const PROJECTS_DATA = [
    {
        id: 'tether',
        num: '01',
        title: 'TETHER',
        cardTitle: 'TETHER',
        fullTitle: 'Event-Driven Agent Runtime with Human Review Gate and Atomic Rollback',
        subtitle: 'Durable agent checkpointing with human approval gate & atomic compensation',
        whatItDoes: 'A durable agent runtime that checkpoints every step, holds side effects for human approval, and rolls back with compensating actions if a commit fails midway.',
        techStack: [
            'Python 3.12',
            'FastAPI',
            'Supabase (Postgres + pgmq)',
            'Deno Edge Function',
            'LiteLLM',
            'BigQuery',
            'Next.js review UI',
            'GCP Cloud Run',
            'Terraform'
        ],
        techPillars: [
            'Python 3.12\nFastAPI',
            'Supabase\npgmq & Deno',
            'LiteLLM\nBigQuery',
            'Cloud Run\nTerraform'
        ],
        github: 'https://github.com/Harsh-karn/Event-Driven-Agent-Runtime-with-Human-Review-Gate-and-Atomic-Rollback',
        liveDemo: null,
        categories: ['ai-agents', 'backend'],
        categoryDisplay: 'AI & Agents',
        isFeatured: true,
        textureFront: '/textures/projects/tether_front.webp',
        texturePainted: '/textures/projects/tether_painted.webp',
        highlights: [
            'Durable state checkpointing after every single agent step',
            'Atomic compensation rollback if partial step execution fails midway',
            'Cryptographic human review gate holding side-effects until approved',
            'Dual-queue architecture powered by Supabase Postgres & pgmq'
        ]
    },
    {
        id: 'gauntlet',
        num: '02',
        title: 'GAUNTLET',
        cardTitle: 'GAUNTLET',
        fullTitle: 'Evaluation Harness with CI Gate',
        subtitle: 'Automated agent regression harness blocking unsafe PR merges',
        whatItDoes: 'Runs golden test suites against an agent and blocks a PR from merging when safety or quality regresses.',
        techStack: [
            'Python 3.11',
            'Pydantic',
            'pytest',
            'YAML suites',
            'LiteLLM judge',
            'GitHub Actions'
        ],
        techPillars: [
            'Python 3.11',
            'Pydantic\npytest',
            'LiteLLM\nJudge',
            'GitHub Actions\nYAML Suites'
        ],
        github: 'https://github.com/Harsh-karn/Gauntlet-evaluation-harness-with-CI-gate-',
        liveDemo: null,
        categories: ['dev-infra', 'ai-agents'],
        categoryDisplay: 'Developer Infrastructure',
        isFeatured: true,
        textureFront: '/textures/projects/gauntlet_front.webp',
        texturePainted: '/textures/projects/gauntlet_painted.webp',
        highlights: [
            'CI pull-request barrier blocking regressions before merging',
            'Golden evaluation suites declared in clean declarative YAML',
            'LiteLLM judge framework evaluating toxicity, drift, and accuracy',
            'Automated pass/fail scoring thresholds with diff reporting'
        ]
    },
    {
        id: 'bouncer',
        num: '03',
        title: 'BOUNCER',
        cardTitle: 'BOUNCER',
        fullTitle: 'Permission-Bounded MCP Server and Agent Registry',
        subtitle: 'Zero-credential unauthorized writes with signed human consent tokens',
        whatItDoes: 'An MCP server where forbidden writes have no tool and no credential, with risk-tiered agent grants, signed single-use human consent tokens, and a hash-chained audit log.',
        techStack: [
            'Python 3.11+',
            'MCP',
            'SQLite (WAL)',
            'ASGI middleware',
            'Notion API',
            'GitHub API',
            'pytest'
        ],
        techPillars: [
            'Python 3.11+\nASGI',
            'MCP Server',
            'SQLite (WAL)\npytest',
            'Notion & GitHub\nAPIs'
        ],
        github: 'https://github.com/Harsh-karn/Bouncer-permission-bounded-MCP-server-and-agent-registry-',
        liveDemo: null,
        categories: ['ai-agents', 'dev-infra', 'backend'],
        categoryDisplay: 'AI & Agents',
        isFeatured: true,
        textureFront: '/textures/projects/bouncer_front.webp',
        texturePainted: '/textures/projects/bouncer_painted.webp',
        highlights: [
            'Forbidden writes have strictly zero tool and credential access',
            'Signed single-use human consent cryptographic tokens',
            'Hash-chained tamper-evident SQLite WAL audit ledger',
            'Risk-tiered agent grants for Notion and GitHub API tools'
        ]
    },
    {
        id: 'reliability',
        num: '04',
        title: 'AGENT PLATFORM PRODUCTION RELIABILITY',
        cardTitle: 'AGENT RELIABILITY',
        fullTitle: 'Agent Platform Production Reliability',
        subtitle: 'Ten core production reliability primitives for LLM agent fleets',
        whatItDoes: 'Ten reliability primitives for LLM agents, including schema-enforced output, ReAct loop caps, human approval, cost routing, dead-letter queues, and tracing.',
        techStack: [
            'Python 3.13',
            'Pydantic',
            'ThreadPoolExecutor',
            'pytest (64 tests)'
        ],
        techPillars: [
            'Python 3.13',
            'Pydantic',
            'Thread Pool',
            'pytest\n(64 tests)'
        ],
        github: 'https://github.com/Harsh-karn/Agent-Platform-Production-Reliability',
        liveDemo: null,
        categories: ['ai-agents', 'dev-infra', 'backend'],
        categoryDisplay: 'AI & Agents',
        isFeatured: true,
        textureFront: '/textures/projects/reliability_front.webp',
        texturePainted: '/textures/projects/reliability_painted.webp',
        highlights: [
            '64 unit and integration tests verifying all failure modes',
            'Schema-enforced JSON outputs via strict Pydantic models',
            'Deterministic ReAct loop caps and runaway execution guards',
            'Dead-letter triage queues and cost-aware model tier escalation'
        ]
    },
    {
        id: 'tally',
        num: '05',
        title: 'TALLY',
        cardTitle: 'TALLY',
        fullTitle: 'Agent Operations Analytics Pipeline',
        subtitle: 'Measures agent value through net minutes saved & cost per run',
        whatItDoes: 'Measures agent value through net minutes saved, cost per run, and team maturity grades. Enforces per-person interruption budgets and provides a show-the-query endpoint for every grade.',
        techStack: [
            'Python',
            'BigQuery SQL views',
            'FastAPI',
            'Streamlit',
            'Terraform',
            'Faker'
        ],
        techPillars: [
            'Python\nFastAPI',
            'BigQuery\nSQL Views',
            'Streamlit',
            'Terraform &\nFaker'
        ],
        github: 'https://github.com/Harsh-karn/Agent-Operations-Analytics-Pipeline',
        liveDemo: null,
        categories: ['data-analytics', 'ai-agents'],
        categoryDisplay: 'Data & Analytics',
        isFeatured: true,
        textureFront: '/textures/projects/tally_front.webp',
        texturePainted: '/textures/projects/tally_painted.webp',
        highlights: [
            'Measures agent value through net minutes saved & cost per run',
            'Enforces per-person interruption budgets with team maturity grading',
            'Show-the-query transparency endpoint for every calculated grade',
            'Scalable telemetry views with BigQuery SQL and FastAPI'
        ]
    },
    {
        id: 'fynlo',
        num: '06',
        title: 'FYNLO',
        cardTitle: 'FYNLO',
        fullTitle: 'Fynlo - Smart UPI Expense Tracker',
        subtitle: 'UPI expense tracker parsing statements & SMS with LLM categorization',
        whatItDoes: 'A UPI expense tracker that parses bank statements and bank SMS, then uses an LLM to categorize transactions on a dashboard.',
        techStack: [
            'FastAPI',
            'Celery',
            'Redis',
            'PostgreSQL',
            'Next.js 15',
            'Gemini',
            'Kotlin Android app',
            'Docker'
        ],
        techPillars: [
            'FastAPI\nNext.js 15',
            'PostgreSQL\nRedis',
            'Celery &\nGemini',
            'Kotlin App\n& Docker'
        ],
        github: 'https://github.com/Harsh-karn/Fynlo',
        liveDemo: null,
        categories: ['fullstack'],
        categoryDisplay: 'Full-Stack Applications',
        isFeatured: false,
        textureFront: '/textures/projects/fynlo_front.webp',
        texturePainted: '/textures/projects/fynlo_painted.webp',
        highlights: [
            'Parses bank statements and incoming bank SMS notifications',
            'Intelligent transaction categorization powered by Gemini LLM',
            'Interactive transaction dashboard built with Next.js 15',
            'Full backend processing with FastAPI, Celery, Redis & PostgreSQL'
        ]
    },
    {
        id: 'twitter_support',
        num: '07',
        title: 'TWITTER SUPPORT AGENT',
        cardTitle: 'TWITTER AGENT',
        fullTitle: 'Twitter Support Agent',
        subtitle: 'Support agent classifying intent & drafting RAG-grounded replies',
        whatItDoes: 'A support agent for AppleSupport tweets that classifies intent, drafts RAG-grounded replies, and escalates severe cases to a human.',
        techStack: [
            'Python',
            'Groq (gpt-oss-20b)',
            'Sentence Transformers',
            'FAISS',
            'LLM-as-judge harness'
        ],
        techPillars: [
            'Python',
            'Groq\n(gpt-oss-20b)',
            'Sentence\nTransformers',
            'FAISS &\nLLM Judge'
        ],
        github: 'https://github.com/Harsh-karn/twitter-support-agent',
        liveDemo: null,
        categories: ['ai-agents', 'backend'],
        categoryDisplay: 'AI & Agents',
        isFeatured: false,
        textureFront: '/textures/projects/twitter_support_front.webp',
        texturePainted: '/textures/projects/twitter_support_painted.webp',
        highlights: [
            'Tailored support agent for AppleSupport customer tweet streams',
            'Automated intent classification with severity escalation gates',
            'RAG-grounded contextual replies with FAISS vector search',
            'Continuous evaluation with an automated LLM-as-judge harness'
        ]
    },
    {
        id: 'certificate',
        num: '08',
        title: 'BULK CERTIFICATE GENERATOR',
        cardTitle: 'CERTIFICATES',
        fullTitle: 'Bulk Certificate Generator',
        subtitle: 'Backend API generating PDF certificates in background with status reporting',
        whatItDoes: 'A backend API that takes a list of recipients, generates PDF certificates in the background, and reports per-certificate status.',
        techStack: [
            'FastAPI',
            'SQLAlchemy',
            'SQLite',
            'ReportLab',
            'pytest'
        ],
        techPillars: [
            'FastAPI',
            'SQLAlchemy',
            'SQLite\npytest',
            'ReportLab'
        ],
        github: 'https://github.com/Harsh-karn/Bulk-Certificate-Generator',
        liveDemo: null,
        categories: ['dev-infra', 'fullstack'],
        categoryDisplay: 'Developer Infrastructure',
        isFeatured: false,
        textureFront: '/textures/projects/certificate_front.webp',
        texturePainted: '/textures/projects/certificate_painted.webp',
        highlights: [
            'Asynchronous background generation of high-res vector PDF certificates',
            'Per-certificate generation lifecycle and delivery status tracking',
            'Robust data layer with FastAPI, SQLAlchemy, and SQLite',
            'Thorough unit and API integration testing with pytest'
        ]
    },
    {
        id: 'pulse_rag',
        num: '09',
        title: 'PULSE-RAG',
        cardTitle: 'PULSE-RAG',
        fullTitle: 'Pulse-RAG / QuantGPT Engine',
        subtitle: 'Financial RAG engine with hot/cold separation & hybrid retrieval',
        whatItDoes: 'A financial RAG engine with hot/cold data separation, two-layer caching, hybrid dense and BM25 retrieval, and freshness decay for market alerts.',
        techStack: [
            'FastAPI',
            'FAISS',
            'Sentence Transformers',
            'rank-bm25',
            'React',
            'Vite'
        ],
        techPillars: [
            'FastAPI',
            'FAISS &\nSentence Tx',
            'rank-bm25',
            'React &\nVite'
        ],
        github: 'https://github.com/Harsh-karn/Pulse-RAG---QuantGPT-Engine',
        liveDemo: null,
        categories: ['ai-agents', 'data-analytics'],
        categoryDisplay: 'AI & Analytics',
        isFeatured: false,
        textureFront: '/textures/projects/pulse_rag_front.webp',
        texturePainted: '/textures/projects/pulse_rag_painted.webp',
        highlights: [
            'Hot/cold data separation architecture for high-velocity financial streams',
            'Two-layer caching layer minimizing model inference latency',
            'Hybrid retrieval fusing FAISS dense vectors and rank-bm25 keyword search',
            'Freshness decay algorithms ensuring real-time market alert relevance'
        ]
    },
    {
        id: 'linkedin_analytics',
        num: '10',
        title: 'LINKEDIN AGENT ANALYTICS',
        cardTitle: 'LINKEDIN ANALYTICS',
        fullTitle: 'End-to-End LinkedIn Agent Analytics Platform',
        subtitle: 'Outreach event ingestion, quality scoring & anomaly detection',
        whatItDoes: 'Ingests outreach-agent events, scores data quality, and flags risky behavior like acceptance-rate collapse through anomaly detection and a Power BI dashboard.',
        techStack: [
            'Python',
            'Pandas',
            'PostgreSQL (star schema)',
            'Docker',
            'structlog',
            'Power BI'
        ],
        techPillars: [
            'Python\nPandas',
            'PostgreSQL\n(Star Schema)',
            'Docker &\nstructlog',
            'Power BI'
        ],
        github: 'https://github.com/Harsh-karn/End-to-End-LinkedIn-Agent-Analytics-Platform',
        liveDemo: null,
        categories: ['data-analytics', 'backend'],
        categoryDisplay: 'Data & Analytics',
        isFeatured: false,
        textureFront: '/textures/projects/linkedin_analytics_front.webp',
        texturePainted: '/textures/projects/linkedin_analytics_painted.webp',
        highlights: [
            'Ingests outreach-agent event streams with data quality scoring',
            'Anomaly detection flagging behavioral risks and acceptance collapse',
            'Star-schema dimensional modeling in PostgreSQL for rapid queries',
            'Interactive executive monitoring dashboards via Power BI'
        ]
    }
];

