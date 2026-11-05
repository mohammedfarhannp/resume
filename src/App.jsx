import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Code2, Download, ExternalLink, Github, GraduationCap, Mail, MapPin, Menu, Minus, Pause, Phone, Play, Plus, Search, ShieldCheck, X } from 'lucide-react';
import projects from './data/projects.json';
import SwarmIntro from './SwarmIntro.jsx';
import './styles.css';

const MotionContext = createContext(true);
const EASE = [0.22, 1, 0.36, 1];
const resumeUrl = './Resume-Mohammed-Farhan-NP.pdf';
const profile = {
  name: 'Mohammed Farhan N P',
  email: 'm.farhan.np@gmail.com',
  phone: '+91 81293 22898',
  location: 'Thalassery, Kerala, India',
  github: 'https://github.com/mohammedfarhannp',
  linkedin: 'https://shorturl.at/UenvP',
};

const skillGroups = [
  { title: 'Programming', note: 'Strong in Python; working knowledge across web and application languages.', tags: ['Python · Strong', 'JavaScript', 'Java', 'C', 'C++', 'Kotlin', 'PHP · Basic'] },
  { title: 'Cybersecurity', note: 'Penetration-testing fundamentals and hands-on practice through TryHackMe.', tags: ['Nmap', 'Wireshark', 'Metasploit', 'Burp Suite', 'Linux'] },
  { title: 'Developer tools', note: 'Command-line and version-control tools used across projects.', tags: ['Git', 'GitHub', 'Linux CLI', 'Bash · Basic'] },
  { title: 'Data & productivity', note: 'Database query writing, data retrieval, and everyday office tools.', tags: ['MySQL', 'Excel', 'PowerPoint', 'Word'] },
];

const education = [
  { date: '2024 — 2026', title: 'Master of Computer Applications', place: 'Kannur University', text: 'MCA, 2024–2026.' },
  { date: '2021 — 2024', title: 'B.Com with Computer Application', place: 'Calicut University', text: 'Bachelor of Commerce with Computer Application (B.Com CA), 2021–2024.' },
  { date: '2019 — 2021', title: 'Higher Secondary · Computer Science', place: 'CBSE', text: 'Higher Secondary (+1 and +2), Computer Science, 2019–2021.' },
];

function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const enabled = useContext(MotionContext);
  const Component = motion[as];
  return <Component className={className} initial={enabled ? { opacity: 0, y: 28 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: enabled ? 0.7 : 0, delay, ease: EASE }}>{children}</Component>;
}

function Magnetic({ children, className = '', ...props }) {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 20 });
  const y = useSpring(0, { stiffness: 220, damping: 20 });
  return <motion.a ref={ref} className={className} style={{ x, y }} onPointerMove={e => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.1);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.16);
  }} onPointerLeave={() => { x.set(0); y.set(0); }} {...props}>{children}</motion.a>;
}

function Header({ enabled, onToggle }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const links = [['portfolio', 'Projects'], ['skills', 'Skills'], ['about', 'About'], ['education', 'Education'], ['contact', 'Contact']];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <header className="site-header">
    <a className="wordmark" href="#home" aria-label="Mohammed Farhan, home">FARHAN<span>®</span></a>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>)}</nav>
    <div className="header-actions"><button className="motion-toggle" onClick={onToggle} aria-label={enabled ? 'Pause animations' : 'Enable animations'} aria-pressed={!enabled}>{enabled ? <Pause size={13} /> : <Play size={13} />}<span>Motion {enabled ? 'on' : 'off'}</span></button><a className="header-contact" href="#contact">Get in touch <ArrowUpRight size={16} /></a><button className="menu-toggle icon-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button></div>
    <AnimatePresence>{open && <motion.nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{[['home', 'Home'], ...links].map(([id, label], i) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}<ArrowUpRight size={18} /></a>)}</motion.nav>}</AnimatePresence>
  </header>;
}

function Hero() {
  const ref = useRef(null);
  const enabled = useContext(MotionContext);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -35]);
  return <section id="home" className="hero" ref={ref}>
    <div className="hero-top"><span>ASPIRING PENETRATION TESTER<br/><span className="muted">PYTHON DEVELOPER</span></span><span className="availability"><i />FOCUS: SECURITY & SOFTWARE</span></div>
    <motion.div className="hero-title display" aria-hidden="true" style={enabled ? { y: titleY } : {}}>BUILD.</motion.div>
    <motion.div className="hero-visual" style={enabled ? { y: visualY } : {}} aria-label="Code editor inspired portfolio artwork">
      <div className="visual-orbit orbit-a"/><div className="visual-orbit orbit-b"/>
      <div className="terminal-card hero-terminal">
        <div className="terminal-bar"><span/><span/><span/><b>farhan@portfolio ~ /about</b><i>— □ ×</i></div>
        <div className="terminal-body"><aside><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span></aside><code><span className="code-muted"># curious mind, practical builds</span><br/><span className="code-pink">class</span> <span className="code-gold">MohammedFarhan</span>:<br/>&nbsp;&nbsp;<span className="code-pink">focus</span> = [<span className="code-green">"python"</span>,<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">"cybersecurity"</span>,<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">"useful software"</span>]<br/><br/>&nbsp;&nbsp;<span className="code-pink">def</span> <span className="code-blue">build</span>(problem):<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-pink">return</span> solution<br/><span className="terminal-cursor">▌</span></code></div>
        <div className="terminal-status"><span><i/> PYTHON 3.12</span><span>UTF-8</span><span>THALASSERY, IN</span></div>
      </div>
      <div className="visual-stamp"><ShieldCheck size={17}/><span>LEARN<br/>BUILD<br/>SECURE</span></div>
      <span className="visual-coordinate">KERALA<br/>INDIA</span>
    </motion.div>
    <motion.div className="hero-intro" style={enabled ? { y: copyY } : {}} initial={enabled ? { opacity: 0, x: -25 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: EASE }}>
      <p className="handwriting">Hello, I’m</p><h1 className="display">MOHAMMED<br/>FARHAN N P<span>.</span></h1><p className="hero-role">ASPIRING PENETRATION<br/>TESTER & DEVELOPER</p><p className="hero-description">I build practical software, explore cybersecurity, and turn problems into useful tools.</p>
      <Magnetic href="#portfolio" className="primary-link">Explore my work <ArrowDown size={17}/></Magnetic>
      <span className="hero-location"><MapPin size={12}/> THALASSERY, KERALA</span>
    </motion.div>
    <motion.div className="hero-side" initial={enabled ? { opacity: 0, x: 25 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: EASE }}>
      <div className="hero-manifesto"><span className="crosshair" aria-hidden="true">✳</span><p>Curiosity into<br/>working solutions.</p></div>
      <div className="hero-stats"><div><span className="display">05</span><p>FEATURED<br/>PROJECTS</p></div><div><span className="display">MCA</span><p>2024—2026<br/>KANNUR UNIVERSITY</p></div><div><span className="display">01</span><p>LIVE PUBLIC<br/>WEBSITE</p></div><a href={resumeUrl} download><Download size={16}/><span>DOWNLOAD RESUME</span></a></div>
    </motion.div>
    <div className="hero-bottom"><a className="reel-button" href={profile.github} target="_blank" rel="noopener noreferrer"><span className="play-circle"><Github size={14}/></span>GITHUB<span className="muted">PROJECTS & CODE</span></a><span className="hero-scroll">SCROLL TO EXPLORE <ArrowDown size={13}/></span><span className="edition">SOFTWARE / SECURITY / 2026</span></div>
  </section>;
}

function ProjectCard({ project, index, onOpen }) {
  const enabled = useContext(MotionContext);
  return <motion.article className="project-card" layout initial={enabled ? { opacity: 0, y: 24 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: enabled ? 0.55 : 0, delay: (index % 3) * 0.05, ease: EASE }}>
    <button className="project-open" onClick={() => onOpen(project)} aria-label={`View ${project.title}`}><div className="project-picture"><img src={project.image} alt={`${project.title} project preview`} loading="lazy"/></div><span className="project-type">{project.category.toUpperCase()} PROJECT</span><span className="project-hover"><ArrowUpRight size={22}/></span><span className="project-frame" aria-hidden="true"/></button>
    <button className="project-caption" onClick={() => onOpen(project)}><span className="project-number display">{String(index + 1).padStart(2, '0')}</span><span><h3>{project.title}</h3><span className="project-category">{project.year}</span></span><ArrowUpRight size={20}/></button>
  </motion.article>;
}

function Portfolio({ onProject }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const categories = ['All', 'Web', 'Python', 'ML', 'Security'];
  const results = projects.filter(project => (category === 'All' || project.category === category) && `${project.title} ${project.category} ${project.role} ${project.tech.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <section id="portfolio" className="portfolio section-wrap">
    <Reveal className="section-heading"><div><span className="eyebrow">01 / SELECTED PROJECTS</span><h2>TOOLS BUILT TO BE USEFUL<span className="accent">.</span></h2></div><span className="project-count">{String(projects.length).padStart(2, '0')} PROJECTS</span></Reveal>
    <Reveal className="portfolio-toolbar"><div className="filters" role="group" aria-label="Filter projects">{categories.map(item => <button key={item} className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}{category === item && <motion.span className="filter-line" layoutId="filter-line"/>}</button>)}</div><label className="search-box"><Search size={15}/><span>Search</span><input aria-label="Search projects" type="search" placeholder="Title or technology…" value={query} onChange={event => setQuery(event.target.value)}/></label></Reveal>
    <motion.div className="project-grid" layout><AnimatePresence mode="popLayout">{results.map((project, index) => <ProjectCard key={project.title} project={project} index={index} onOpen={onProject}/>)}</AnimatePresence></motion.div>
    {results.length === 0 && <div className="empty-state"><p>No projects match “{query}”.</p><button className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>Clear search <X size={15}/></button></div>}
    <Reveal className="project-note"><span className="project-note-mark">✳</span><p>From a student result portal to small desktop tools, each project started with a practical need.</p><a href={profile.github} target="_blank" rel="noopener noreferrer">More on GitHub <ArrowUpRight size={16}/></a></Reveal>
  </section>;
}

function Skills() {
  return <section id="skills" className="recognition section-wrap skills-section">
    <Reveal className="recognition-intro"><span className="eyebrow">02 / TECHNICAL TOOLKIT</span><h2 className="display">LEARN IT.<br/><span className="accent">PUT IT TO WORK.</span></h2><div className="skill-mark"><Code2/><span>CORE<br/>SKILLS</span></div><p>Programming, development tools, databases, and hands-on cybersecurity fundamentals.</p></Reveal>
    <div className="recognition-list skill-list"><div className="recognition-list-head"><span>AREAS & TOOLS</span><span>RESUME SKILLS</span></div>{skillGroups.map((group, index) => <Reveal as="article" className="skill-row" key={group.title} delay={index * 0.04}><span className="award-index">0{index + 1}</span><div><h3>{group.title}</h3><p>{group.note}</p><div className="skill-tags">{group.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><ArrowUpRight size={17}/></Reveal>)}</div>
  </section>;
}

function About() {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 75%'] });
  return <section id="about" className="about section-wrap" ref={ref}>
    <Reveal className="about-lead"><div><span className="eyebrow">03 / ABOUT ME</span><h2 className="display">BUILDING WITH<br/>CURIOSITY & <span className="accent">PURPOSE.</span></h2></div><p>I’m Mohammed Farhan N P, an aspiring penetration tester with strong Python skills and a practical, project-led approach. I’ve built and deployed a public website for students and created GUI applications that solve everyday problems.</p></Reveal>
    <div className="studio-grid about-grid">
      <Reveal className="education-panel"><h3 className="panel-heading">WHAT I’M EXPLORING</h3><p className="eyebrow accent">CYBERSECURITY</p><div className="education-row"><strong>Penetration testing</strong><span>Fundamentals</span><p>Practical learning through TryHackMe and security tools.</p></div><div className="education-row"><strong>Linux environments</strong><span>Working familiarity</span><p>Using command-line workflows and basic Bash scripting.</p></div><div className="education-row"><strong>Building software</strong><span>Python · Web</span><p>Learning by shipping tools and applications for real needs.</p></div></Reveal>
      <div className="process-panel"><Reveal><h3 className="panel-heading">A PRACTICAL PATH</h3></Reveal><div className="process-list"><div className="process-track"><motion.div style={{ scaleY: enabled ? scrollYProgress : 1 }}/></div>{[['01', 'LEARN', 'Explore concepts through structured coursework and hands-on practice.'], ['02', 'BUILD', 'Apply programming skills to websites and useful desktop applications.'], ['03', 'IMPROVE', 'Keep developing technical fluency through projects and security practice.']].map(([num, title, text], index) => <Reveal key={num} className="process-row" delay={index * 0.04}><span className="process-num display">{num}</span><span className="process-node"/><div><h4>{title}</h4><p>{text}</p></div></Reveal>)}</div></div>
      <Reveal className="about-photo-panel"><img src="./Asset/img/mohammed-farhan-hero.png" alt="Mohammed Farhan in a dark, cinematic portrait" loading="lazy"/><div className="about-photo-caption"><span className="eyebrow">MOHAMMED FARHAN N P</span><span>THALASSERY, KERALA</span></div></Reveal>
    </div>
  </section>;
}

function Education() {
  const [open, setOpen] = useState(0);
  return <section id="education" className="journey section-wrap">
    <Reveal className="section-heading"><div><span className="eyebrow">04 / EDUCATION</span><h2>LEARNING, STEP BY STEP<span className="accent">.</span></h2></div><a className="text-link" href={resumeUrl} download>DOWNLOAD RESUME <Download size={16}/></a></Reveal>
    <div className="journey-grid education-grid"><div className="experience-list">{education.map((item, index) => <Reveal className={`experience-row ${open === index ? 'is-open' : ''}`} key={item.title}><button aria-expanded={open === index} aria-controls={`education-${index}`} onClick={() => setOpen(open === index ? null : index)}><span className="experience-date">{item.date}</span><span><h3>{item.title}</h3><span className="experience-place">{item.place}</span></span>{open === index ? <Minus size={18}/> : <Plus size={18}/>}</button><AnimatePresence initial={false}>{open === index && <motion.div id={`education-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}><p>{item.text}</p></motion.div>}</AnimatePresence></Reveal>)}</div>
      <Reveal className="awards-panel education-aside"><p className="eyebrow">CONTINUOUS PRACTICE</p><GraduationCap size={34} className="education-icon"/><h3 className="display">STUDY.<br/><span className="accent">PRACTICE.</span><br/>BUILD.</h3><p className="education-aside-copy">MCA studies at Kannur University (2024–2026), alongside software projects and cybersecurity practice.</p><a className="text-link" href={profile.github} target="_blank" rel="noopener noreferrer">VIEW GITHUB <ArrowUpRight size={17}/></a></Reveal></div>
  </section>;
}

function Contact() {
  return <section id="contact" className="contact section-wrap">
    <div className="contact-grid"><Reveal className="contact-intro"><span className="eyebrow">05 / CONTACT</span><h2 className="display">LET’S BUILD<br/>SOMETHING<br/>USEFUL<span className="accent">.</span></h2><p>For opportunities, collaborations, or conversations about software and cybersecurity, reach out.</p><Magnetic href={`mailto:${profile.email}`} className="contact-cta"><span className="round-arrow"><ArrowUpRight size={21}/></span>SEND ME AN EMAIL</Magnetic></Reveal>
      <Reveal className="contact-links" delay={0.08}><a href={`mailto:${profile.email}`}><Mail/><span><small>EMAIL</small>{profile.email}</span><ArrowUpRight size={16}/></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><span className="contact-social-icon">in</span><span><small>LINKEDIN</small>Mohammed Farhan N P</span><ArrowUpRight size={16}/></a><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github/><span><small>GITHUB</small>mohammedfarhannp</span><ArrowUpRight size={16}/></a><a href={`tel:${profile.phone.replaceAll(' ', '')}`}><Phone/><span><small>PHONE</small>{profile.phone}</span><ArrowUpRight size={16}/></a><div><MapPin/><span><small>BASED IN</small>{profile.location}</span></div></Reveal>
      <Reveal className="contact-card" delay={0.16}><div className="contact-card-orbit"><span/><span/><span/><ShieldCheck size={35}/></div><span className="contact-card-label">PYTHON · SECURITY · SOFTWARE</span><strong>Curious about what<br/>we could build?</strong><a href={`mailto:${profile.email}`}>LET’S TALK <ArrowUpRight size={17}/></a></Reveal></div>
  </section>;
}

function ProjectDialog({ project, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!project) return undefined;
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [project, onClose]);
  const enabled = useContext(MotionContext);
  if (!project) return null;
  return <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div ref={ref} className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex="-1" initial={enabled ? { y: 35, scale: 0.98 } : false} animate={{ y: 0, scale: 1 }} exit={{ y: 18, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
      <div className="dialog-heading"><span className="eyebrow">{project.category} PROJECT / {project.year}</span><button onClick={onClose} className="icon-button" aria-label="Close project"><X/></button></div>
      <div className="dialog-media still"><img src={project.image} alt={`${project.title} preview`}/></div>
      <div className="dialog-description"><div><h2 id="dialog-title">{project.title}</h2><span className="accent">{project.role}</span><p>{project.description}</p><div className="dialog-tech">{project.tech.map(tag => <span key={tag}>{tag}</span>)}</div></div>{project.url && <a className="outline-button" href={project.url} target="_blank" rel="noopener noreferrer">Visit project <ExternalLink size={15}/></a>}</div>
    </motion.div>
  </motion.div>;
}

function App() {
  const reduced = useReducedMotion();
  const [motionOn, setMotionOn] = useState(() => { try { return localStorage.getItem('farhan-motion') !== 'off'; } catch { return true; } });
  const enabled = motionOn && !reduced;
  const [project, setProject] = useState(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });
  useEffect(() => { document.documentElement.dataset.motion = enabled ? 'on' : 'off'; }, [enabled]);
  const toggle = () => { setMotionOn(!motionOn); try { localStorage.setItem('farhan-motion', motionOn ? 'off' : 'on'); } catch {} };
  const closeProject = React.useCallback(() => setProject(null), []);
  return <MotionContext.Provider value={enabled}><MotionConfig reducedMotion={enabled ? 'user' : 'always'} transition={{ ease: EASE }}>
    <a className="skip-link" href="#portfolio">Skip to projects</a>
    <SwarmIntro enabled={enabled} blocked={!!project}/>
    <motion.div className="reading-progress" style={{ scaleX: enabled ? progress : scrollYProgress }}/>
    <Header enabled={enabled} onToggle={toggle}/>
    <main><Hero/><Portfolio onProject={setProject}/><Skills/><About/><Education/><Contact/></main>
    <footer className="footer"><a className="wordmark" href="#home">FARHAN<span>®</span></a><span>© {new Date().getFullYear()} MOHAMMED FARHAN N P · BUILT WITH CURIOSITY</span><div><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={17}/></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span className="footer-in">in</span></a><a href={`mailto:${profile.email}`} aria-label="Email"><Mail size={17}/></a></div></footer>
    <AnimatePresence>{project && <ProjectDialog project={project} onClose={closeProject}/>}</AnimatePresence>
  </MotionConfig></MotionContext.Provider>;
}

createRoot(document.getElementById('root')).render(<App/>);
