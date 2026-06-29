import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ─── Design tokens (matching planner palette) ───────────────────────────────
const C = {
  bg:      '#080D17',
  surface: '#111827',
  card:    '#1a2234',
  border:  '#2a3a54',
  orange:  '#F97316',
  orangeLo: 'rgba(249, 115, 22, 0.12)',
  orangeMid: 'rgba(249, 115, 22, 0.25)',
  text:    '#F4F6FA',
  muted:   '#6B7FA8',
  green:   '#22C55E',
  divider: '#1e2d44',
}

const font = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body:    "'Atkinson Hyperlegible', system-ui, sans-serif",
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
function Section({ children, style = {}, innerMaxWidth = '960px' }) {
  return (
    <section style={{
      width: '100%',
      padding: '72px 24px',
      boxSizing: 'border-box',
      ...style,
    }}>
      <div style={{ maxWidth: innerMaxWidth, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}

function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: '11px',
      fontWeight: 800,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: C.orange,
      marginBottom: '14px',
      fontFamily: font.body,
    }}>
      {children}
    </div>
  )
}

function SectionHeading({ children, style = {} }) {
  return (
    <h2 style={{
      fontFamily: font.display,
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
      color: C.text,
      margin: '0 0 20px 0',
      textWrap: 'balance',
      ...style,
    }}>
      {children}
    </h2>
  )
}

function PlannerCTA({ size = 'lg', style = {} }) {
  const isLg = size === 'lg'
  return (
    <Link
      to="/planner"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: C.orange,
        color: '#fff',
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: isLg ? '17px' : '15px',
        padding: isLg ? '16px 32px' : '13px 24px',
        borderRadius: '10px',
        textDecoration: 'none',
        letterSpacing: '-0.01em',
        boxShadow: '0 4px 20px rgba(249, 115, 22, 0.35)',
        transition: 'transform 0.12s ease-out, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(249, 115, 22, 0.45)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.35)'
      }}
    >
      Open the Planner
      <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
    </Link>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav aria-label="Site navigation" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: C.bg,
      borderBottom: `1px solid ${C.border}`,
      padding: '14px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{
        fontFamily: font.display,
        fontSize: '20px',
        fontWeight: 700,
        color: C.orange,
        letterSpacing: '-0.02em',
      }}>
        🏐 VolleyCoach
      </div>
      <Link
        to="/planner"
        style={{
          backgroundColor: C.orange,
          color: '#fff',
          fontFamily: font.display,
          fontWeight: 700,
          fontSize: '14px',
          padding: '9px 18px',
          borderRadius: '8px',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}
      >
        Open the Planner
      </Link>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{
      width: '100%',
      padding: '88px 24px 80px',
      boxSizing: 'border-box',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: C.orangeLo,
          border: `1px solid ${C.orangeMid}`,
          borderRadius: '999px',
          padding: '6px 14px',
          marginBottom: '28px',
          fontSize: '13px',
          color: C.orange,
          fontWeight: 600,
          fontFamily: font.body,
        }}>
          Free · No account · Works offline
        </div>

        <h1 style={{
          fontFamily: font.display,
          fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: C.text,
          margin: '0 0 24px 0',
          textWrap: 'balance',
        }}>
          You're a volunteer coach,<br />not a logistics manager.
        </h1>

        <p style={{
          fontFamily: font.body,
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          lineHeight: 1.65,
          color: C.muted,
          margin: '0 0 40px 0',
          maxWidth: '520px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          VolleyCoach handles attendance, lineups, subs, and rotation — all from your phone. Built for rec-league coaches, not competitive clubs.
        </p>

        <PlannerCTA />
      </div>
    </section>
  )
}

// ─── Problem ─────────────────────────────────────────────────────────────────
const problems = [
  {
    icon: '🧮',
    text: "You've got 9 players and 6 spots — you're doing the math in your head while someone asks you who's serving.",
  },
  {
    icon: '⏱️',
    text: "League rules say everyone has to play. But you're not sure who sat out last game, and someone's keeping track.",
  },
  {
    icon: '🤯',
    text: "You're watching the score, the rotation, and the bench — all at once — and someone on the sideline is asking if their kid can start.",
  },
]

function Problem() {
  return (
    <Section style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
      <Eyebrow>The Situation</Eyebrow>
      <SectionHeading>Sound familiar?</SectionHeading>
      <p style={{
        fontFamily: font.body,
        fontSize: '1.05rem',
        lineHeight: 1.7,
        color: C.muted,
        marginBottom: '40px',
        maxWidth: '65ch',
      }}>
        Rec volleyball is supposed to be fun. But game day logistics pile up fast — and everyone's watching to see if you got the subs right.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {problems.map((p, i) => (
          <div key={i} style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{p.icon}</div>
            <p style={{
              fontFamily: font.body,
              fontSize: '14px',
              lineHeight: 1.6,
              color: C.text,
              margin: 0,
            }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  {
    num: '01',
    title: 'Add your players once',
    body: 'Enter names, jersey numbers, and skill ratings — serve, pass, set, hit. The app remembers them across sessions.',
  },
  {
    num: '02',
    title: 'Mark who showed up',
    body: 'Tap each player as present. Add late arrivals mid-game without losing your lineup.',
  },
  {
    num: '03',
    title: 'Build your lineup',
    body: 'Auto-suggest fills the court with your strongest players in a balanced rotation. Tap to swap or adjust.',
  },
  {
    num: '04',
    title: 'Plan your subs',
    body: 'Assign each bench player to a position. At 13 points, the app alerts you who comes in for who — and keeps track of Game 2 required starters.',
  },
  {
    num: '05',
    title: 'Run the game',
    body: 'Score with one tap, rotate with another. Confirm subs from the alert or rearrange on the live court diagram.',
  },
]

function HowItWorks() {
  return (
    <Section innerMaxWidth="720px">
      <Eyebrow>How It Works</Eyebrow>
      <SectionHeading>Five steps, game day to final whistle.</SectionHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            padding: '24px 0',
            borderBottom: i < steps.length - 1 ? `1px solid ${C.divider}` : 'none',
          }}>
            <div style={{
              fontFamily: font.display,
              fontSize: '13px',
              fontWeight: 800,
              color: C.orange,
              letterSpacing: '1px',
              minWidth: '28px',
              paddingTop: '3px',
            }}>
              {step.num}
            </div>
            <div>
              <div style={{
                fontFamily: font.display,
                fontSize: '17px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '6px',
                letterSpacing: '-0.01em',
              }}>
                {step.title}
              </div>
              <p style={{
                fontFamily: font.body,
                fontSize: '14px',
                lineHeight: 1.65,
                color: C.muted,
                margin: 0,
              }}>
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: '🔄',
    title: 'Fair Sub Planning',
    body: 'Assign each bench player a rotation position before the game. At the 13-point mark, you get an alert with exactly who goes in for who — no scrambling.',
  },
  {
    icon: '⚡',
    title: 'Smart Lineup Builder',
    body: 'Auto-suggest spreads your strongest players across the rotation. Tap to move anyone, or drag bench players into open slots.',
  },
  {
    icon: '2️⃣',
    title: 'Game 2 Lineup',
    body: 'Players subbed into Game 1 are automatically required starters for Game 2 — a common rec league rule. The app tracks it so you don\'t have to.',
  },
  {
    icon: '📊',
    title: 'Score + Rotation',
    body: 'Track the score and rotate the court with a single tap. The serving position is always highlighted. Works as a live board during the game.',
  },
  {
    icon: '📴',
    title: 'Works Offline',
    body: 'Your roster and settings save to your phone. No Wi-Fi needed at the gym. Open the app, it\'s all there.',
  },
  {
    icon: '🔓',
    title: 'No Account Required',
    body: 'Open the link and start. Nothing to sign up for, nothing to install. Your data lives on your device.',
  },
]

function Features() {
  return (
    <Section style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.divider}`, borderBottom: `1px solid ${C.divider}` }}>
      <Eyebrow>What It Does</Eyebrow>
      <SectionHeading style={{ maxWidth: '65ch' }}>Everything for game day. Nothing else.</SectionHeading>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '8px',
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '22px',
          }}>
            <div style={{ fontSize: '26px', marginBottom: '12px' }}>{f.icon}</div>
            <div style={{
              fontFamily: font.display,
              fontSize: '16px',
              fontWeight: 700,
              color: C.text,
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}>
              {f.title}
            </div>
            <p style={{
              fontFamily: font.body,
              fontSize: '14px',
              lineHeight: 1.6,
              color: C.muted,
              margin: 0,
            }}>
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <Section style={{ textAlign: 'center' }}>
      <div style={{
        backgroundColor: C.orangeLo,
        border: `1px solid ${C.orangeMid}`,
        borderRadius: '16px',
        padding: '56px 32px',
      }}>
        <SectionHeading style={{ marginBottom: '12px' }}>
          Your next game day starts here.
        </SectionHeading>
        <p style={{
          fontFamily: font.body,
          fontSize: '1.05rem',
          color: C.muted,
          lineHeight: 1.6,
          margin: '0 0 36px 0',
          maxWidth: '440px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Free. No account. Runs in your browser. Pick up your phone at the sideline and it's ready.
        </p>
        <PlannerCTA />
      </div>
    </Section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is it free?',
    a: 'Yes. No paid plan, no trial, no credit card.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Open the link and start using it. Your roster saves in your browser — nothing to sign up for.',
  },
  {
    q: 'Where does my data go?',
    a: 'Everything saves on your device. Nothing is sent to a server or shared anywhere.',
  },
  {
    q: 'Does it work on iPhone and Android?',
    a: 'Yes. It\'s a web app that runs in any modern browser — Safari, Chrome, Firefox. No app store required.',
  },
  {
    q: 'Can I use it for more than one team?',
    a: 'It stores one roster at a time. To switch teams, tap "Reset season record" on the Roster tab and start fresh for the next team.',
  },
]

function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <Section style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.divider}` }} innerMaxWidth="720px">
      <Eyebrow>FAQ</Eyebrow>
      <SectionHeading>Common Questions</SectionHeading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {faqs.map((item, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.divider}` }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '20px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <span style={{
                fontFamily: font.display,
                fontSize: '16px',
                fontWeight: 600,
                color: C.text,
                letterSpacing: '-0.01em',
              }}>
                {item.q}
              </span>
              <span style={{
                color: C.orange,
                fontSize: '18px',
                fontWeight: 300,
                flexShrink: 0,
                lineHeight: 1,
                transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                transition: 'transform 0.15s ease',
                display: 'inline-block',
              }}>
                +
              </span>
            </button>
            <div id={`faq-answer-${i}`} hidden={open !== i}>
              <p style={{
                fontFamily: font.body,
                fontSize: '14px',
                lineHeight: 1.65,
                color: C.muted,
                margin: '0 0 20px 0',
              }}>
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      backgroundColor: C.bg,
      borderTop: `1px solid ${C.divider}`,
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: font.display,
        fontSize: '16px',
        fontWeight: 700,
        color: C.orange,
        marginBottom: '8px',
        letterSpacing: '-0.01em',
      }}>
        🏐 VolleyCoach
      </div>
      <p style={{
        fontFamily: font.body,
        fontSize: '13px',
        color: C.muted,
        margin: '0 0 16px 0',
      }}>
        Built for rec and youth volleyball coaches.
      </p>
      <Link
        to="/planner"
        style={{
          fontFamily: font.body,
          fontSize: '13px',
          color: C.orange,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Open the Planner →
      </Link>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => {
    document.title = 'Volleyball Game Day Planner for Coaches | Lineups, Subs & Rotations'
  }, [])

  return (
    <div style={{
      backgroundColor: C.bg,
      color: C.text,
      minHeight: '100vh',
      fontFamily: font.body,
    }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={e => { e.currentTarget.style.cssText = 'position:fixed;top:8px;left:8px;width:auto;height:auto;overflow:visible;background:#F97316;color:#fff;padding:8px 16px;border-radius:6px;font-weight:700;z-index:9999;text-decoration:none;' }}
        onBlur={e => { e.currentTarget.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;' }}
      >
        Skip to main content
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
