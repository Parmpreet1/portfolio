import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import Icon from './Icon.tsx'
import {
  profile,
  stats,
  about,
  skills,
  projects,
  experience,
  education,
  publications,
  terminal,
  nowBuilding,
  type Project,
} from './data.ts'

// ── Helpers ────────────────────────────────────────────────

const isExternal = (link: string) => link.startsWith('http')

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Cursor-follow spotlight: writes the pointer position into CSS vars that
// `.spot` cards read for their radial highlight.
function spotlight(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

type Theme = 'light' | 'dark'

function readTheme(): Theme {
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* storage blocked; theme still applies for this visit */
    }
    setTheme(next)
  }
  return { theme, toggle }
}

function useLocalTime(timeZone: string) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15_000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return time
}

// Reveal-on-scroll. Content is visible by default; the hidden start state is
// only applied once JS confirms motion is OK (html.js-motion).
function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return
    document.documentElement.classList.add('js-motion')
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      ref.current?.style.setProperty('--p', String(p))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return ref
}

// ── Nav ────────────────────────────────────────────────────

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Stack' },
  { id: 'projects', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
]
const navIds = navLinks.map((l) => l.id)

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"
          />
        </svg>
      )}
    </button>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(navIds)
  const progress = useScrollProgress()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a className="nav__brand" href="#top" aria-label={`${profile.name}, home`}>
          <span className="nav__mark" aria-hidden="true">
            PS
          </span>
          <span className="nav__name">{profile.name}</span>
        </a>

        <nav
          id="site-menu"
          className={`nav__links ${open ? 'nav__links--open' : ''}`}
          aria-label="Primary"
        >
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? 'is-active' : ''}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a className="btn btn--sm" href="#contact" onClick={() => setOpen(false)}>
            Let's talk
          </a>
        </nav>

        <div className="nav__tools">
          <ThemeToggle />
          <button
            className="icon-btn nav__toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`burger ${open ? 'burger--open' : ''}`} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      <div className="progress" ref={progress} aria-hidden="true" />
    </header>
  )
}

// ── Hero ───────────────────────────────────────────────────

function Terminal() {
  // Full transcript as flat lines; typed out one character at a time.
  const lines = terminal
  const total = lines.reduce((n, l) => n + l.text.length, 0)
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? total : 0))

  useEffect(() => {
    if (typed >= total) return
    const id = window.setTimeout(() => setTyped((t) => t + 1), typed === 0 ? 500 : 18)
    return () => window.clearTimeout(id)
  }, [typed, total])

  let budget = typed
  return (
    <figure
      className="term spot"
      onPointerMove={spotlight}
      aria-label={`Terminal: ${lines.map((l) => l.text).join(' ')}`}
    >
      <div className="term__bar" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>~/parmpreet · zsh</em>
      </div>
      <pre className="term__body" aria-hidden="true">
        {lines.map((l, i) => {
          if (budget <= 0) return null
          const shown = l.text.slice(0, budget)
          const done = budget >= l.text.length
          budget -= l.text.length
          const typing = !done || (i === lines.length - 1 && typed >= total)
          return (
            <span key={i} className={`term__line term__line--${l.kind}`}>
              {l.kind === 'cmd' && <b>❯ </b>}
              {shown}
              {typing && <i className="term__caret" />}
              {'\n'}
            </span>
          )
        })}
        {typed === 0 && (
          <span className="term__line term__line--cmd">
            <b>❯ </b>
            <i className="term__caret" />
          </span>
        )}
      </pre>
    </figure>
  )
}

function Hero() {
  const time = useLocalTime(profile.timeZone)
  return (
    <section id="top" className="hero">
      <div className="hero__grid-bg" aria-hidden="true" />
      <div className="hero__orb" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="pill hero__pill enter" style={{ ['--d' as string]: '0ms' }}>
            <span className="pulse" aria-hidden="true" />
            Available for new projects
            <span className="pill__sep" aria-hidden="true" />
            <span className="mono">
              {profile.location.split(',')[0]} · {time} IST
            </span>
          </p>

          <h1 className="hero__title enter" style={{ ['--d' as string]: '80ms' }}>
            <span className="hero__name">{profile.name}</span>
            <span className="hero__headline">
              {profile.headlineLead}{' '}
              <em className="serif">{profile.headlineEmphasis}</em>
            </span>
          </h1>

          <p className="hero__tagline enter" style={{ ['--d' as string]: '160ms' }}>
            {profile.tagline}
          </p>

          <div className="hero__actions enter" style={{ ['--d' as string]: '240ms' }}>
            <a className="btn" href="#projects">
              View my work <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn--ghost" href={`mailto:${profile.email}`}>
              <Icon name="mail" size={16} /> Get in touch
            </a>
          </div>

          <ul className="hero__socials enter" style={{ ['--d' as string]: '320ms' }}>
            {profile.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url}
                  target={isExternal(s.url) ? '_blank' : undefined}
                  rel={isExternal(s.url) ? 'noreferrer' : undefined}
                  aria-label={s.label}
                  title={s.label}
                >
                  <Icon name={s.icon} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__side enter" style={{ ['--d' as string]: '200ms' }}>
          <Terminal />
        </div>
      </div>

      <div className="container">
        <dl className="hero__stats enter" style={{ ['--d' as string]: '400ms' }}>
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Marquee() {
  const items = skills.flatMap((s) => s.items)
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it}>
          <span className="marquee__star" aria-hidden="true">
            ✦
          </span>
          {it}
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee" aria-label="Technologies I use">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

// ── Sections ───────────────────────────────────────────────

interface SectionProps {
  id: string
  index: string
  eyebrow: string
  title: ReactNode
  children: ReactNode
  className?: string
}

function Section({ id, index, eyebrow, title, children, className = '' }: SectionProps) {
  return (
    <section id={id} className={`section ${className}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <header className="section__head reveal">
          <span className="eyebrow">
            <span className="eyebrow__num">{index}</span>
            {eyebrow}
          </span>
          <h2 id={`${id}-title`} className="section__title">
            {title}
          </h2>
        </header>
        {children}
      </div>
    </section>
  )
}

function About() {
  const time = useLocalTime(profile.timeZone)
  return (
    <Section
      id="about"
      index="01"
      eyebrow="About"
      title={
        <>
          Engineer first, <em className="serif">builder</em> always.
        </>
      }
    >
      <div className="bento bento--about">
        <article className="tile tile--about spot reveal" onPointerMove={spotlight}>
          <span className="tile__label">Who I am</span>
          {about.map((p, i) => (
            <p key={i} className={i === 0 ? 'lead' : ''}>
              {p}
            </p>
          ))}
        </article>

        <a
          className="tile tile--now spot reveal"
          href={nowBuilding.url}
          target="_blank"
          rel="noreferrer"
          onPointerMove={spotlight}
        >
          <span className="tile__label">
            <span className="pulse" aria-hidden="true" /> Now building
          </span>
          <h3 className="tile__big">{nowBuilding.name}</h3>
          <p>{nowBuilding.blurb}</p>
          <span className="tile__link">
            {nowBuilding.url.replace(/^https?:\/\//, '')} <span aria-hidden="true">↗</span>
          </span>
        </a>

        <article className="tile tile--place spot reveal" onPointerMove={spotlight}>
          <span className="tile__label">Based in</span>
          <h3 className="tile__big">{profile.location}</h3>
          <p className="mono tile__time">
            {time} <span>IST · UTC+5:30</span>
          </p>
          <p className="tile__note">Remote-friendly across time zones.</p>
        </article>

        <article className="tile tile--ai spot reveal" onPointerMove={spotlight}>
          <span className="tile__label">Lately</span>
          <p className="tile__quote">
            Shipping <em className="serif">AI agents</em>, RAG pipelines and automated dev
            workflows, with Claude Code &amp; Cursor in the loop.
          </p>
        </article>
      </div>
    </Section>
  )
}

function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      eyebrow="Stack"
      title={
        <>
          The tools I <em className="serif">reach for</em>.
        </>
      }
    >
      <div className="bento bento--skills">
        {skills.map((s, i) => (
          <article
            key={s.group}
            className={`tile tile--skill tile--skill-${i} spot reveal`}
            onPointerMove={spotlight}
          >
            <div className="tile__row">
              <h3 className="tile__title">{s.group}</h3>
              <span className="mono tile__count">
                {String(s.items.length).padStart(2, '0')}
              </span>
            </div>
            <ul className="chips">
              {s.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  )
}

function ProjectCard({ p, n }: { p: Project; n: number }) {
  const linked = isExternal(p.link)
  const body = (
    <>
      <div className="project__top">
        <span className="mono project__num">{String(n).padStart(2, '0')}</span>
        {linked && (
          <span className="project__arrow" aria-hidden="true">
            ↗
          </span>
        )}
      </div>
      <h3 className="project__title">{p.title}</h3>
      <span className="project__context mono">{p.context}</span>
      <p className="project__blurb">{p.blurb}</p>
      <ul className="project__points">
        {p.points.map((pt) => (
          <li key={pt}>{pt}</li>
        ))}
      </ul>
      <ul className="project__tags" aria-label="Technologies">
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </>
  )
  const cls = `project tile spot reveal ${p.featured ? 'project--featured' : ''} ${
    linked ? 'project--linked' : ''
  }`
  return linked ? (
    <a
      className={cls}
      href={p.link}
      target="_blank"
      rel="noreferrer"
      onPointerMove={spotlight}
    >
      {body}
    </a>
  ) : (
    <article className={cls} onPointerMove={spotlight}>
      {body}
    </article>
  )
}

function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      eyebrow="Selected work"
      title={
        <>
          Things I've <em className="serif">shipped</em>.
        </>
      }
    >
      <div className="bento bento--projects">
        {projects.map((p, i) => (
          <ProjectCard key={p.title} p={p} n={i + 1} />
        ))}
      </div>
    </Section>
  )
}

function Experience() {
  return (
    <Section
      id="experience"
      index="04"
      eyebrow="Experience"
      title={
        <>
          Where I've <em className="serif">grown</em>.
        </>
      }
    >
      <ol className="xp">
        {experience.map((e) => (
          <li key={`${e.org}-${e.period}`} className="xp__item reveal">
            <div className="xp__meta">
              <span className="mono xp__period">{e.period}</span>
              <span className="xp__loc">{e.location}</span>
            </div>
            <div className="xp__body tile spot" onPointerMove={spotlight}>
              <h3 className="xp__role">
                {e.role}
                <span className="xp__org">@ {e.org}</span>
              </h3>
              <ul className="xp__points">
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Education() {
  return (
    <Section
      id="education"
      index="05"
      eyebrow="Learning"
      title={
        <>
          Education &amp; <em className="serif">research</em>.
        </>
      }
    >
      <div className="bento bento--edu">
        {education.map((e) => (
          <article key={e.degree} className="tile tile--edu spot reveal" onPointerMove={spotlight}>
            <span className="mono tile__label">{e.period}</span>
            <h3 className="tile__title">{e.degree}</h3>
            <p>{e.school}</p>
          </article>
        ))}
        {publications.map((p) => {
          const linked = isExternal(p.url)
          const inner = (
            <>
              <span className="tile__label">
                Publication · <span className="mono">{p.date}</span>
              </span>
              <h3 className="tile__title">{p.title}</h3>
              <p>{p.venue}</p>
            </>
          )
          return linked ? (
            <a
              key={p.title}
              className="tile tile--pub spot reveal"
              href={p.url}
              target="_blank"
              rel="noreferrer"
              onPointerMove={spotlight}
            >
              {inner}
            </a>
          ) : (
            <article key={p.title} className="tile tile--pub spot reveal" onPointerMove={spotlight}>
              {inner}
            </article>
          )
        })}
      </div>
    </Section>
  )
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  return (
    <button className="btn btn--ghost" onClick={copy}>
      {copied ? 'Copied ✓' : 'Copy email'}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  )
}

function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <div className="contact__card reveal">
          <div className="contact__glow" aria-hidden="true" />
          <span className="eyebrow">
            <span className="eyebrow__num">06</span>
            Contact
          </span>
          <h2 id="contact-title" className="contact__title">
            Let's build something <em className="serif">worth shipping</em>.
          </h2>
          <p className="contact__text">
            Have a project, a role, or an idea? I'm always up for a good problem, and I reply
            within a day.
          </p>
          <div className="contact__actions">
            <a className="btn btn--lg" href={`mailto:${profile.email}`}>
              {profile.email} <span aria-hidden="true">→</span>
            </a>
            <CopyEmail />
          </div>
          <ul className="contact__socials">
            {profile.socials
              .filter((s) => s.icon !== 'mail')
              .map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target={isExternal(s.url) ? '_blank' : undefined}
                    rel={isExternal(s.url) ? 'noreferrer' : undefined}
                  >
                    <Icon name={s.icon} size={16} /> {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="mono footer__built">React · TypeScript · Vite · AWS CloudFront</span>
        <a href="#top" className="footer__top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  useReveal()
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
