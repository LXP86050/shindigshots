import React, { useEffect, useState } from 'react';
import './App.css';

/* =========================================================
   DATA
   ========================================================= */

const PROFILE = {
  name: 'Lokesh Pulivarthi',
  first: 'Lokesh',
  last: 'Pulivarthi',
  title: 'Software Engineer',
  location: 'Redmond, Washington',
  email: 'lokesh.pulivarthi@hotmail.com',
  phone: '(913) 742-9950',
  linkedin: 'https://www.linkedin.com/in/lokesh-pulivarthi/',
};

const EXPERIENCE = [
  {
    co: 'Infosys',
    role: 'Software Engineer II',
    when: '2024 — Present',
    blurb:
      'Shipping production retrieval-augmented systems on Azure OpenAI and AI Search. Architecting Azure AD and RBAC for enterprise data, replatforming Python services into a long-term .NET architecture, and tightening the seams of full-stack performance.',
  },
  {
    co: 'UCLA',
    role: 'Full-Stack Developer',
    when: '2022 — 2024',
    blurb:
      'Re-architected legacy ASP.NET into modern .NET Core with Entity Framework Core, Dapper, and dependency injection. Designed REST APIs, reduced database load on large datasets, and owned the front-end of internal tools used across the institution.',
  },
  {
    co: 'Cognizant',
    role: 'Full-Stack Developer',
    when: '2018 — 2021',
    blurb:
      'Built and maintained enterprise .NET Core and React applications. Integrated payment, messaging, and analytics services through secure APIs at production scale.',
  },
];

const PROJECTS = [
  {
    n: 'I',
    name: 'Enterprise RAG Knowledge Assistant',
    sub: 'Azure OpenAI · LangChain · Vector Search',
    body:
      'A grounded retrieval system serving more than eight thousand internal queries each week. Hybrid retrieval — vector with keyword — paired with evaluation pipelines, response caching, and Azure AD with RBAC for cross-team access. Average latency held below one and a half seconds; token spend reduced by roughly a quarter.',
    metric: '−55%',
    metricLabel: 'analyst lookup time',
    stack: ['Python', 'LangChain', 'Azure OpenAI', 'Azure AI Search', 'REST', 'Azure AD'],
    year: '2025',
  },
  {
    n: 'II',
    name: 'Sentiment Analysis Platform',
    sub: 'Django · scikit-learn · PostgreSQL',
    body:
      'A real-time classifier for product reviews and customer feedback. Trained with scikit-learn and NLTK against a sizeable corpus to over ninety percent accuracy, served from a Django backend, with a PostgreSQL analytics layer driving sentiment dashboards. Deployed on Azure for multi-tenant access.',
    metric: '>90%',
    metricLabel: 'classification accuracy',
    stack: ['Python', 'Django', 'scikit-learn', 'NLTK', 'PostgreSQL', 'Azure'],
    year: '2024',
  },
  {
    n: 'III',
    name: 'A Quiet Replatforming',
    sub: 'Python → .NET · Architecture · IaC',
    body:
      'Cross-cutting work to migrate Python services into a .NET-based architecture aligned with a long-term scalability roadmap. Touched application services, Bicep infrastructure, AKS, and the Azure DevOps pipelines that move it all to production.',
    metric: '−30%',
    metricLabel: 'deployment time',
    stack: ['.NET Core', 'EF Core', 'Bicep', 'AKS', 'Azure DevOps'],
    year: '2024',
  },
];

const STACK = [
  { group: 'Languages', items: ['Python', 'C#', 'TypeScript', 'JavaScript', 'SQL'] },
  { group: 'Backend', items: ['Django', 'FastAPI', '.NET Core', 'EF Core', 'Dapper'] },
  { group: 'Frontend', items: ['React', 'Fluent UI', 'Material UI'] },
  { group: 'Data & Search', items: ['PostgreSQL', 'SQL Server', 'Cosmos DB', 'Azure AI Search'] },
  { group: 'Cloud & DevOps', items: ['Azure', 'AKS', 'Docker', 'Bicep', 'CI / CD'] },
  { group: 'AI & ML', items: ['Azure OpenAI', 'LangChain', 'RAG', 'scikit-learn', 'TensorFlow'] },
  { group: 'Security', items: ['Azure AD', 'OAuth', 'JWT', 'RBAC'] },
];

const NUMBERS = [
  { v: 'Six', n: '+', k: 'years shipping software' },
  { v: 'Eight', n: 'K', k: 'weekly retrieval queries' },
  { v: 'Three', n: '', k: 'companies, one quiet drift toward AI' },
  { v: 'One', n: '', k: 'opinionated stack' },
];

/* =========================================================
   HOOKS
   ========================================================= */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/* =========================================================
   TOP RAIL — tiny ticker / status bar
   ========================================================= */

function TopRail() {
  return (
    <div className="rail">
      <span>Portfolio of {PROFILE.name}</span>
      <span className="rail__sep">·</span>
      <span>Vol. I, Issue 04</span>
      <span className="rail__sep">·</span>
      <span className="rail__avail">
        <span className="rail__dot" /> Available for new work
      </span>
      <span className="rail__sep rail__sep--hide">·</span>
      <span className="rail__hide">{PROFILE.location}</span>
    </div>
  );
}

/* =========================================================
   NAV
   ========================================================= */

function Nav() {
  const scrolled = useScrolled(40);
  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a href="#top" className="nav__brand">
        <span className="nav__brand-mono">L.P.</span>
        <span className="nav__brand-rule" />
        <span className="nav__brand-name">Lokesh Pulivarthi</span>
      </a>
      <div className="nav__links">
        <a href="#about">I. About</a>
        <a href="#work">II. Work</a>
        <a href="#experience">III. Experience</a>
        <a href="#stack">IV. Stack</a>
        <a href="#contact">V. Contact</a>
      </div>
      <a href={`mailto:${PROFILE.email}`} className="nav__cta">
        Get in touch
        <span className="nav__cta-arrow">→</span>
      </a>
    </nav>
  );
}

/* =========================================================
   HERO — magazine cover
   ========================================================= */

function Hero() {
  const time = useTime();
  const t = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="hero" id="top">
      <div className="hero__top">
        <div className="hero__top-l">
          <div className="hero__eyebrow">A working portfolio</div>
          <div className="hero__edition">— Edition · MMXXVI —</div>
        </div>
        <div className="hero__top-r">
          <div className="hero__loc">{PROFILE.location}</div>
          <div className="hero__time">{t} · Pacific</div>
        </div>
      </div>

      <h1 className="hero__title" aria-label={PROFILE.name}>
        <span className="hero__title-row">
          <span className="hero__title-word" data-reveal>{PROFILE.first}</span>
        </span>
        <span className="hero__title-row">
          <span className="hero__title-word hero__title-word--italic" data-reveal>
            {PROFILE.last}.
          </span>
        </span>
      </h1>

      <div className="hero__bottom">
        <p className="hero__deck" data-reveal>
          A <em>software engineer</em> who lives at the seam between
          AI and production systems — currently shipping retrieval-augmented
          tools on Azure for the curious, the careful, and the impatient.
        </p>
        <div className="hero__meta-stack" data-reveal>
          <div className="hero__meta-row">
            <span className="hero__meta-k">Filed under</span>
            <span className="hero__meta-v">Engineering, AI, Systems</span>
          </div>
          <div className="hero__meta-row">
            <span className="hero__meta-k">Now</span>
            <span className="hero__meta-v">SWE II · Infosys</span>
          </div>
          <div className="hero__meta-row">
            <span className="hero__meta-k">Pages</span>
            <span className="hero__meta-v">5 chapters · ~2 min read</span>
          </div>
        </div>
      </div>

      <div className="hero__cue">
        <span className="hero__cue-line" />
        <span className="hero__cue-text">Begin reading</span>
        <span className="hero__cue-arrow">↓</span>
      </div>
    </header>
  );
}

/* =========================================================
   SECTION HEAD
   ========================================================= */

function Head({ roman, title, kicker }) {
  return (
    <div className="head" data-reveal>
      <span className="head__roman">{roman}</span>
      <div className="head__center">
        <h2 className="head__title">{title}</h2>
        {kicker && <p className="head__kicker">{kicker}</p>}
      </div>
      <span className="head__rule" />
    </div>
  );
}

/* =========================================================
   ABOUT
   ========================================================= */

function About() {
  return (
    <section className="about" id="about">
      <Head
        roman="I."
        title="About"
        kicker="A short author's note, in lieu of a portrait."
      />
      <div className="about__grid">
        <article className="about__lead" data-reveal>
          <p className="about__para about__para--lead">
            <span className="dropcap">I</span>
            grew up writing C# in cubicles, drifted into Python for the AI work,
            and somewhere along the way fell for the discipline that holds the two
            together — <em>production engineering</em>. The boring parts: retries,
            auth, deploys, observability.
          </p>
          <p className="about__para">
            Today I work as a Software Engineer II at Infosys, where my days
            split between RAG systems on Azure OpenAI, the Azure AD plumbing
            that keeps them honest, and the long migration of Python services
            into a calmer .NET architecture. Before that, full-stack roles at
            UCLA and Cognizant taught me that the best feature a system can
            ship is a quiet on-call rotation.
          </p>
          <p className="about__para">
            I'm based in <em>Redmond, Washington</em>, and open to remote work
            anywhere a thoughtful team is building something durable.
          </p>
        </article>

        <aside className="about__side" data-reveal>
          <Side label="Currently">
            Software Engineer II, Infosys.
          </Side>
          <Side label="Studied">
            <span>M.S. Computer Science</span>
            <span className="side__faint">University of Central Missouri</span>
            <span style={{ marginTop: 8 }}>B.E. Electrical &amp; Electronics</span>
            <span className="side__faint">SR University</span>
          </Side>
          <Side label="Lives in">
            Redmond, Washington
            <span className="side__faint">Pacific Time</span>
          </Side>
          <Side label="Writes about">
            Retrieval, evaluation, the seams between languages.
          </Side>
        </aside>
      </div>
    </section>
  );
}

function Side({ label, children }) {
  return (
    <div className="side">
      <div className="side__label">{label}</div>
      <div className="side__body">{children}</div>
    </div>
  );
}

/* =========================================================
   WORK
   ========================================================= */

function Work() {
  return (
    <section className="work" id="work">
      <Head
        roman="II."
        title="Selected Work"
        kicker="Three pieces, in chronological reverse."
      />
      <div className="work__list">
        {PROJECTS.map((p) => (
          <Project key={p.n} p={p} />
        ))}
      </div>
    </section>
  );
}

function Project({ p }) {
  return (
    <article className="proj" data-reveal>
      <div className="proj__rule" />
      <div className="proj__grid">
        <div className="proj__lead">
          <div className="proj__top">
            <span className="proj__roman">{p.n}</span>
            <span className="proj__year">{p.year}</span>
          </div>
          <h3 className="proj__name">
            {p.name}
            <span className="proj__name-arrow">↗</span>
          </h3>
          <div className="proj__sub">{p.sub}</div>
        </div>

        <div className="proj__body-col">
          <p className="proj__body">{p.body}</p>
          <div className="proj__stack">
            {p.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>

        <div className="proj__metric-col">
          <div className="proj__metric">{p.metric}</div>
          <div className="proj__metric-k">{p.metricLabel}</div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EXPERIENCE
   ========================================================= */

function Experience() {
  return (
    <section className="exp" id="experience">
      <Head
        roman="III."
        title="Experience"
        kicker="A short table of contents."
      />
      <ul className="exp__list">
        {EXPERIENCE.map((e, i) => (
          <li key={e.co} className="exp__row" data-reveal>
            <div className="exp__when">{e.when}</div>
            <div className="exp__main">
              <h3 className="exp__co">
                {e.co}
                {i === 0 && <span className="exp__live">Now</span>}
              </h3>
              <div className="exp__role">{e.role}</div>
              <p className="exp__blurb">{e.blurb}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   STACK / INDEX
   ========================================================= */

function Stack() {
  return (
    <section className="stack" id="stack">
      <Head
        roman="IV."
        title="Index of the stack"
        kicker="A loose taxonomy of the tools I reach for."
      />
      <div className="stack__list">
        {STACK.map((g) => (
          <div key={g.group} className="stack__row" data-reveal>
            <div className="stack__label">
              <span className="stack__label-em">— </span>
              <span>{g.group}</span>
            </div>
            <div className="stack__items">
              {g.items.map((s, i) => (
                <span key={s} className="stack__item">
                  {s}
                  {i < g.items.length - 1 && <span className="stack__sep">·</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   NUMBERS
   ========================================================= */

function Numbers() {
  return (
    <section className="nums">
      <div className="nums__grid">
        {NUMBERS.map((s, i) => (
          <div key={i} className="nums__cell" data-reveal>
            <div className="nums__v">
              <span className="nums__v-em">{s.v}</span>
              <span className="nums__v-suf">{s.n}</span>
            </div>
            <div className="nums__k">{s.k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT
   ========================================================= */

function Contact() {
  return (
    <section className="contact" id="contact">
      <Head
        roman="V."
        title="Get in touch"
        kicker="The fastest path is email; I read everything."
      />

      <div className="contact__inner" data-reveal>
        <a href={`mailto:${PROFILE.email}`} className="contact__big">
          <span>Let us</span>
          <em className="contact__big-em">build</em>
          <span>something</span>
          <em className="contact__big-em">durable</em>
          <span className="contact__big-arrow">↗</span>
        </a>

        <div className="contact__rows">
          <CRow k="Email" v={PROFILE.email} href={`mailto:${PROFILE.email}`} />
          <CRow k="Telephone" v={PROFILE.phone} href={`tel:${PROFILE.phone.replace(/\D/g, '')}`} />
          <CRow k="LinkedIn" v="linkedin.com/in/lokesh-pulivarthi" href={PROFILE.linkedin} ext />
          <CRow k="Location" v={`${PROFILE.location} · open to remote`} />
        </div>
      </div>
    </section>
  );
}

function CRow({ k, v, href, ext }) {
  const Wrap = href ? 'a' : 'div';
  const props = href ? { href, ...(ext ? { target: '_blank', rel: 'noreferrer' } : {}) } : {};
  return (
    <Wrap className="crow" {...props}>
      <span className="crow__k">{k}</span>
      <span className="crow__v">{v}</span>
      {href && <span className="crow__arrow">↗</span>}
    </Wrap>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="foot">
      <div className="foot__sig">
        <span className="foot__sig-pre">— Yours,</span>
        <span className="foot__sig-name">Lokesh</span>
      </div>
      <div className="foot__row">
        <span>© {new Date().getFullYear()} Lokesh Pulivarthi. All rights reserved.</span>
        <span className="foot__cred">Set in Fraunces &amp; Inter Tight. Hand-built in {PROFILE.location}.</span>
        <a href="#top" className="foot__top">Return to top ↑</a>
      </div>
    </footer>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  useReveal();
  return (
    <div className="paper">
      <TopRail />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <Numbers />
        <Experience />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
