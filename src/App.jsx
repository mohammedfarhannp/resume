import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useAnimate, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowLeft,
  Bookmark,
  Check,
  Menu,
  Search,
  X,
} from 'lucide-react'
import { awards, brands } from './data.js'

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
}

function AwardMark({ kind }) {
  if (kind === 'laurel') {
    return <span className="award-symbol award-laurel" aria-hidden="true"><i>‹</i><b>✳</b><i>›</i></span>
  }
  if (kind === 'spark') {
    return <span className="award-symbol award-spark" aria-hidden="true">✳</span>
  }
  return <span className="award-symbol award-frame" aria-hidden="true"><i /></span>
}

function BrandStrip() {
  const reduceMotion = useReducedMotion()
  const brandReveal = {
    hidden: { opacity: 0, y: 9, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] },
    },
  }
  return (
    <motion.div
      className="brand-strip grid grid-cols-3 items-center gap-y-7 md:grid-cols-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.65 }}
      variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
      aria-label="Selected collaborators"
    >
      {brands.map((brand) => (
        <motion.div
          className={`brand-logo ${brand.style}`}
          key={brand.name}
          variants={brandReveal}
        >
          {brand.name}
        </motion.div>
      ))}
    </motion.div>
  )
}

function AwardRow({ award, index }) {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope, { once: true, amount: 0.35 })

  useEffect(() => {
    if (!isInView) return undefined
    let cancelled = false

    async function buildRow() {
      await animate(scope.current, { opacity: 1, y: 0 }, {
        duration: 0.5,
        delay: index * 0.22,
        ease: [0.22, 1, 0.36, 1],
      })
      if (cancelled) return

      await Promise.all([
        animate('.row-node', { opacity: [0, 1], scale: [0, 1.45, 1] }, { duration: 0.34, ease: 'easeOut' }),
        animate('.award-symbol', { opacity: [0, 1], scale: [0.5, 1], rotate: [-24, 0] }, { duration: 0.36, delay: 0.12 }),
        animate('.row-category', { opacity: [0, 1], x: [-7, 0] }, { duration: 0.3, delay: 0.26 }),
        animate('.row-index', { opacity: [0, 1] }, { duration: 0.24, delay: 0.34 }),
        animate('.row-copy h3', { opacity: [0, 1], y: [9, 0] }, { duration: 0.36, delay: 0.46 }),
        animate('.row-copy p', { opacity: [0, 1], y: [6, 0] }, { duration: 0.32, delay: 0.64 }),
        animate('.award-year', { opacity: [0, 1], x: [8, 0] }, { duration: 0.34, delay: 0.7 }),
        animate('.assembly-agent', { opacity: [0, 1, 1, 0], left: ['0%', 'calc(100% - 11px)'] }, {
          duration: 1.25,
          delay: 0.05,
          ease: 'linear',
        }),
      ])
      if (!cancelled) await animate('.row-rule', { scaleX: [0, 1] }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] })
    }

    buildRow()
    return () => { cancelled = true }
  }, [animate, index, isInView, scope])

  return (
    <motion.article
      ref={scope}
      className="award-row group"
      initial={{ opacity: 0, y: 20 }}
      whileHover={{ x: 5, transition: { duration: 0.24 } }}
      tabIndex={0}
    >
      <span className="row-node" aria-hidden="true" />
      <div className="row-inner">
        <div className="row-topline">
          <AwardMark kind={award.icon} />
          <span className="row-category">{award.category}</span>
          <span className="row-index">{award.placement}</span>
        </div>
        <div className="row-main">
          <div className="row-copy">
            <h3>{award.title}</h3>
            <p>{award.subtitle}</p>
          </div>
          <span className="award-year">{award.year}</span>
        </div>
        <span className="row-rule" aria-hidden="true" />
        <span className="assembly-agent" aria-hidden="true"><i /></span>
      </div>
    </motion.article>
  )
}

function App() {
  const [saved, setSaved] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  const closePanels = () => {
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <MotionConfig reducedMotion="user">
    <main className="portfolio-shell min-h-screen bg-[#090909] text-white">
      <div className="ambient-glow" aria-hidden="true" />
      <header className="topbar">
        <a className="back-link" href="#top" aria-label="Back to top" onClick={closePanels}>
          <ArrowLeft size={17} strokeWidth={1.5} />
        </a>
        <a href="#top" className="wordmark" aria-label="Reposted home">REPOSTED<span>®</span></a>
        <div className="nav-actions">
          <button
            className={`icon-button ${saved ? 'is-saved' : ''}`}
            onClick={() => setSaved(!saved)}
            aria-label={saved ? 'Remove bookmark' : 'Save portfolio'}
            aria-pressed={saved}
          >
            {saved ? <Check size={16} strokeWidth={1.5} /> : <Bookmark size={16} strokeWidth={1.5} />}
          </button>
          <button
            className={`icon-button ${searchOpen ? 'is-active' : ''}`}
            onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }}
            aria-label={searchOpen ? 'Close search' : 'Search this page'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={17} strokeWidth={1.5} /> : <Search size={17} strokeWidth={1.5} />}
          </button>
          <button
            className={`icon-button ${menuOpen ? 'is-active' : ''}`}
            onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              className="nav-popover search-popover"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              onSubmit={(event) => {
                event.preventDefault()
                const query = new FormData(event.currentTarget).get('q')?.toString().trim()
                if (query) window.find(query)
              }}
              role="search"
            >
              <Search size={15} />
              <input name="q" autoFocus placeholder="Find something on this page" aria-label="Search page content" />
              <kbd>↵</kbd>
            </motion.form>
          )}
          {menuOpen && (
            <motion.nav
              className="nav-popover menu-popover"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              aria-label="Page navigation"
            >
              <a href="#recognition" onClick={closePanels}><span>01</span> Recognition</a>
              <a href="#credits" onClick={closePanels}><span>02</span> Credits</a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <div id="top" className="page-content mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-[7.2vw]">
        <section className="masthead" aria-label="Portfolio introduction">
          <div className="masthead-line">
            <span>INDEPENDENT CREATIVE PORTFOLIO</span>
            <span>SELECTED WORK&nbsp; / &nbsp;2022—25</span>
          </div>
          <BrandStrip />
        </section>

        <section id="recognition" className="recognition-section" aria-labelledby="page-title">
          <div className="section-meta">
            <span><i className="live-dot" /> CHAPTER 01</span>
            <span>RECOGNITION &amp; AWARDS</span>
          </div>

          <div className="recognition-grid">
            <div className="hero-pane">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.28 }}
                variants={{ visible: { transition: { staggerChildren: 0.19 } } }}
              >
                <motion.p variants={reveal} className="eyebrow"><span className="eyebrow-dash" /> A RECORD OF MAKING</motion.p>
                <motion.h1 id="page-title" variants={reveal} className="display-title">
                  THE WORK.<br /><span>THE RECOGNITION.</span>
                </motion.h1>

                <motion.div variants={reveal} className="stat-wrap">
                  <div className="stat-number">10<span className="stat-star">✳</span></div>
                  <div className="stat-side-note">
                    <span className="note-rule" />
                    <span>NOTES FROM<br />THE OUTSIDE</span>
                  </div>
                </motion.div>

                <motion.div variants={reveal} className="caption-card">
                  <span className="caption-cross" aria-hidden="true">✳</span>
                  <div>
                    <span className="caption-kicker">A SMALL COLLECTION</span>
                    <p>Good work leaves a trace.<br />These are a few of mine.</p>
                  </div>
                  <span className="caption-edition">VOL. 01<br />MMXXV</span>
                </motion.div>
              </motion.div>
              <div className="hero-footnote"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={15} strokeWidth={1.3} /></div>
            </div>

            <div className="timeline-pane">
              <div className="timeline-heading">
                <div>
                  <span className="micro-label">A FEW HIGHLIGHTS</span>
                  <h2>Proof of work<span className="red-period">.</span></h2>
                </div>
                <span className="item-count">0{awards.length} ENTRIES</span>
              </div>

              <div className="award-list">
                {awards.map((award, index) => <AwardRow key={award.placement} award={award} index={index} />)}
              </div>

              <motion.div
                className="timeline-note"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: reduceMotion ? 0 : 0.56, duration: 0.55 }}
              >
                <span className="note-index">↳</span>
                <span>A little recognition for work made with intention.</span>
              </motion.div>
            </div>
          </div>
        </section>

        <footer id="credits" className="page-footer">
          <span>END OF TRANSMISSION</span>
          <span>MADE WITH INTENTION <i>✳</i></span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </div>
    </main>
    </MotionConfig>
  )
}

export default App
