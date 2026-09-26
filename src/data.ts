// ─────────────────────────────────────────────────────────────
// Edit this file to update your portfolio content. Nothing else
// needs to change; every section reads from here.
// ─────────────────────────────────────────────────────────────

export type IconName = 'github' | 'linkedin' | 'mail'

export interface Social {
  label: string
  url: string
  icon: IconName
}

export interface Profile {
  name: string
  role: string
  /** Hero headline: plain lead-in, then the italic emphasis phrase. */
  headlineLead: string
  headlineEmphasis: string
  tagline: string
  location: string
  /** IANA zone for the live local-time readout. */
  timeZone: string
  email: string
  resumeUrl: string
  socials: Social[]
}

export interface Stat {
  value: string
  label: string
}

export interface SkillGroup {
  group: string
  items: string[]
}

export interface Project {
  title: string
  context: string
  blurb: string
  points: string[]
  tags: string[]
  link: string
  featured: boolean
}

export interface ExperienceItem {
  role: string
  org: string
  period: string
  location: string
  points: string[]
}

export interface EducationItem {
  degree: string
  school: string
  period: string
}

export interface Publication {
  title: string
  venue: string
  date: string
  url: string
}

export const profile: Profile = {
  name: 'Parmpreet Singh',
  role: 'Fullstack Software Developer · Team Lead',
  headlineLead: 'I build scalable web apps &',
  headlineEmphasis: 'AI‑powered products.',
  tagline:
    'Full-stack developer with 3+ years building scalable web applications and AI-powered features with React.js, TypeScript, Next.js, Node.js, and AWS. I lead feature delivery end-to-end, from system design to deployment.',
  location: 'Mohali, India',
  timeZone: 'Asia/Kolkata',
  email: 'hello@parmpreet.dev',
  resumeUrl: '#', // drop a link to your resume PDF
  socials: [
    { label: 'GitHub', url: 'https://github.com/Parmpreet1', icon: 'github' },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/parmpreet-singh-dev/',
      icon: 'linkedin',
    },
    { label: 'Email', url: 'mailto:hello@parmpreet.dev', icon: 'mail' },
  ],
}

export interface TerminalLine {
  kind: 'cmd' | 'out' | 'ok'
  text: string
}

// Typed out line by line in the hero terminal.
export const terminal: TerminalLine[] = [
  { kind: 'cmd', text: 'whoami' },
  { kind: 'out', text: 'parmpreet: full-stack dev · team lead @ Sofster' },
  { kind: 'cmd', text: 'cat stack.txt' },
  { kind: 'out', text: 'react  typescript  next.js  node  aws  postgres' },
  { kind: 'cmd', text: 'ls ./shipping' },
  { kind: 'out', text: 'definiteseo/   ai-seo-writer/   skimora/' },
  { kind: 'cmd', text: 'deploy --prod' },
  { kind: 'ok', text: '✓ live in 51s, ready for the next problem' },
]

export const nowBuilding = {
  name: 'Skimora',
  blurb: 'An AI video summarizer: key insights, jump-to timestamps and chat for any video. Designed and shipped end to end.',
  url: 'https://zeqlabs.ai/skimora',
}

export const stats: Stat[] = [
  { value: '3+', label: 'Years experience' },
  { value: 'Team Lead', label: 'Role at Sofster' },
  { value: '6+', label: 'Products shipped' },
]

export const about: string[] = [
  `I'm a full-stack developer and team lead at Sofster with 3+ years of experience designing and building scalable web applications and AI-powered features using React.js, TypeScript, Next.js, Node.js, and AWS.`,
  `I lead feature delivery end-to-end (from system design and backend architecture to database design and deployment) with a strong focus on performance, security, and clean architecture. I also build WordPress plugins and custom AI tooling.`,
  `Lately I've been deep in generative AI: building custom AI agents and skills, RAG pipelines, and automated dev workflows, and using tools like Claude Code and Cursor to move faster. I also build my own AI products; the current one is Skimora.`,
]

export const skills: SkillGroup[] = [
  {
    group: 'Frontend',
    items: [
      'React.js',
      'TypeScript',
      'Next.js',
      'Redux / RTK Query',
      'MUI',
      'HTML5 / CSS3',
      'JavaScript (ES6)',
    ],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'Python', 'Prisma', 'RESTful APIs', 'PHP'],
  },
  {
    group: 'Cloud & Infra',
    items: [
      'AWS Lambda',
      'AWS SQS',
      'AWS EventBridge',
      'AWS SNS',
      'Docker',
      'Git',
      'White-Labeling / CNAME',
    ],
  },
  {
    group: 'Data',
    items: ['PostgreSQL', 'MySQL', 'Firebase', 'Typesense'],
  },
  {
    group: 'AI & Generative',
    items: [
      'AI Agent Development',
      'RAG Pipelines',
      'Prompt Engineering',
      'Custom AI Skills / Tooling',
      'Claude Code',
      'Cursor',
    ],
  },
]

export const projects: Project[] = [
  {
    title: 'Definiteseo Analyzer App',
    context: 'Sofster in-house product · definiteseo.com/ai-seo-tool',
    blurb:
      'A real-time SEO analysis web app built on React.js and AWS, engineered for high-traffic multi-tenant usage.',
    points: [
      'Built real-time analysis with React.js and AWS (Lambda, SQS, WebSockets).',
      'Scheduled SEO scans via AWS EventBridge + cron triggers, with SNS for event-driven notifications.',
      'Added CNAME-based white labeling for custom client domains.',
      'Built workspace and seat-based access management for multi-user teams.',
    ],
    tags: ['React.js', 'AWS', 'WebSockets', 'Multi-tenant'],
    link: 'https://definiteseo.com/ai-seo-tool/',
    featured: true,
  },
  {
    title: 'Definiteseo: WordPress SEO Plugin',
    context: 'Sofster in-house product · wordpress.org',
    blurb:
      'An SEO plugin for WordPress with a React.js frontend and PHP backend, with an AI writer built in.',
    points: [
      'React.js frontend + PHP backend to help site owners improve search rankings.',
      'Integrated with Gutenberg, Elementor, and Classic Editor for cross-platform compatibility.',
      'Built an AI SEO writer that generates optimized content directly inside WordPress.',
    ],
    tags: ['React.js', 'PHP', 'WordPress', 'Generative AI'],
    link: 'https://wordpress.org/plugins/seo-with-definite-seo',
    featured: true,
  },
  {
    title: 'Skimora',
    context: 'Independent product',
    blurb:
      'An AI video summarizer (YouTube, Vimeo, TikTok, uploads) I design, build and ship end to end, from frontend to AWS infrastructure.',
    points: [
      'Chrome extension and Next.js web app that turn videos from YouTube, Vimeo, TikTok, Instagram or an upload into key insights with jump-to timestamps and chat.',
      'AWS backend defined with CDK, deployed and run in production.',
    ],
    tags: ['AI', 'Next.js', 'AWS', 'Chrome extension'],
    link: 'https://zeqlabs.ai/skimora',
    featured: false,
  },
  {
    title: 'Moosan Club: Ecommerce Platform',
    context: 'Client project · May 2024 – Aug 2024',
    blurb:
      'A robust eCommerce backend modeled on large-scale platform architecture.',
    points: [
      'Designed and built the backend with Prisma and PostgreSQL.',
      'Implemented user authentication, order management, and secure payment integration.',
    ],
    tags: ['Prisma', 'PostgreSQL', 'Payments'],
    link: '#',
    featured: false,
  },
  {
    title: 'Experience School: Web Application',
    context: 'Client project · Feb 2023 – Apr 2023',
    blurb:
      'A school management system for tracking student performance and activity data.',
    points: [
      'Built with Editor.js and Typesense to track student performance and activity.',
      'Developed custom editor plugins for specialized data management needs.',
    ],
    tags: ['Editor.js', 'Typesense', 'React.js'],
    link: '#',
    featured: false,
  },
]

export const experience: ExperienceItem[] = [
  {
    role: 'Fullstack Software Developer (Team Lead)',
    org: 'Sofster',
    period: 'Jan 2023 – Present',
    location: 'Mohali, India',
    points: [
      'Lead full-stack development of multiple web applications, guiding a small team through design, development, and delivery.',
      'Architect and build scalable frontend and backend systems using React.js, TypeScript, Node.js, and AWS.',
      'Drive AI-integrated feature development and WordPress plugin engineering for client products.',
      'Build custom AI agents and skills, including RAG pipelines and automated dev workflows.',
    ],
  },
]

export const education: EducationItem[] = [
  {
    degree: 'M.Sc. in Data Science and Software Development',
    school: 'Chandigarh University, Mohali',
    period: '2020 – 2022',
  },
  {
    degree: 'B.C.A. in Computer Applications',
    school: 'Chandigarh University, Mohali',
    period: '2017 – 2020',
  },
]

export const publications: Publication[] = [
  {
    title: 'Data Analysis of Air Quality in India',
    venue: 'NeuroQuantology Journal',
    date: 'Apr 2022',
    url: 'https://www.neuroquantology.com/open-access/DATA+ANALYSIS+OF+AIR+QUALITY+IN+INDIA_5550/',
  },
]
