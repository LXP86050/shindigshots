import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const SERVICES = [
  {
    n: '01',
    title: 'Weddings & Engagements',
    body: 'The whole shindig — getting-ready candids, ceremony, golden-hour portraits, all-night dance floor.',
  },
  {
    n: '02',
    title: 'Birthdays & Events',
    body: 'Milestone parties, baby showers, cultural celebrations — the moments worth printing big.',
  },
  {
    n: '03',
    title: 'Portraits',
    body: 'On-location and studio portraiture — bold color, soft light, and a bit of fun in every frame.',
  },
  {
    n: '04',
    title: 'Family & Lifestyle',
    body: 'Kids on the field, candid mornings, the everyday made memorable.',
  },
  {
    n: '05',
    title: 'Travel · Fashion · Editorial',
    body: 'Wide skies, salt flats, lookbooks and editorial spreads with motion, mood and modern color.',
  },
];

function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? scrolled / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return p;
}

function useParallax(ref, speed = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.setProperty('--parallax-y', `${-offset}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, speed]);
}

function useManifest() {
  const [data, setData] = useState({ items: [], hero: null, count: 0, loading: true });
  useEffect(() => {
    let cancelled = false;
    fetch('/photos/manifest.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((m) => {
        if (cancelled) return;
        setData({
          items: Array.isArray(m.items) ? m.items : [],
          hero: m.hero || null,
          count: m.count || 0,
          loading: false,
        });
      })
      .catch(() => !cancelled && setData((d) => ({ ...d, loading: false })));
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

function ParallaxImage({ src, alt, speed = 0.2, className = '' }) {
  const ref = useRef(null);
  useParallax(ref, speed);
  return (
    <div className={`parallax-frame ${className}`}>
      <img ref={ref} src={src} alt={alt} loading="lazy" />
    </div>
  );
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}

function Hero({ heroSrc }) {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.setProperty('--hero-y', `${y * 0.3}px`);
      el.style.setProperty('--hero-fade', `${Math.max(0, 1 - y / 600)}`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      {heroSrc ? (
        <div
          className="hero__bg"
          style={{ backgroundImage: `url('${heroSrc}')` }}
        />
      ) : (
        <div className="hero__bg hero__bg--fallback" />
      )}
      <div className="hero__vignette" />
      <div className="hero__grain" />

      <div className="hero__inner">
        <div className="hero__eyebrow">
          <span className="dot-pulse" /> shindigshots · Photography
        </div>
        <h1 className="hero__title">
          <span className="word w1">Big skies.</span>
          <span className="word w2">Bold color.</span>
          <span className="word w3"><em>A little</em></span>
          <span className="word w4">shindig.</span>
        </h1>
        <p className="hero__sub">
          Weddings, birthdays, family, travel and editorial photography —
          chasing light from salt flats to dance floors. Now booking
          sessions across the PNW &amp; the American West.
        </p>

        <div className="hero__ctas">
          <a href="#work" className="hero__cta">
            <span>See the gallery</span>
            <svg width="36" height="12" viewBox="0 0 36 12" fill="none">
              <path d="M0 6h33M28 1l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
          <a href="#contact" className="hero__cta hero__cta--ghost">
            <span>Book a session</span>
          </a>
        </div>
      </div>

      <div className="hero__scroll">
        <span>scroll</span>
        <span className="hero__scrollbar" />
      </div>

      <div className="marquee" aria-hidden>
        <div className="marquee__track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              Weddings · Birthdays · Engagements · Travel · Portrait · Family · Editorial · Fashion ·
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ portrait }) {
  return (
    <section className="about" id="about">
      <div className="about__col about__col--text">
        <div className="section-label" data-reveal>
          <span /> About the studio
        </div>
        <p className="about__signature" data-reveal>shindigshots</p>
        <h2 className="about__heading" data-reveal>
          We chase the soft edge between <em>composition</em> and
          accident — the frame just before the moment ends.
        </h2>
        <p className="about__body" data-reveal>
          shindigshots is an independent travel and portrait studio. We shoot
          fashion, editorial, family and the small-town in-betweens —
          boutiques, canyons, big skies, soccer fields. Color forward, candid
          where it counts, and always a little bit of a party.
        </p>
        <ul className="about__stats">
          <li data-reveal>
            <strong>22+</strong>
            <span>frames in the archive</span>
          </li>
          <li data-reveal>
            <strong>Salt + Sky</strong>
            <span>favorite location</span>
          </li>
          <li data-reveal>
            <strong>Color forward</strong>
            <span>signature style</span>
          </li>
        </ul>
      </div>
      <div className="about__col about__col--image">
        {portrait ? (
          <ParallaxImage
            speed={0.18}
            src={portrait}
            alt="A frame from the archive"
          />
        ) : (
          <div className="parallax-frame" />
        )}
      </div>
    </section>
  );
}

function Work({ items }) {
  const gridRef = useRef(null);
  // Scroll-driven micro-parallax: each tile drifts at a slightly different speed.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || items.length === 0) return;
    const tiles = Array.from(grid.querySelectorAll('.mtile'));
    // Deterministic per-tile speed, between -1.0 and +1.0.
    const speeds = tiles.map((_, i) => {
      const r = Math.sin(i * 12.9898) * 43758.5453;
      return ((r - Math.floor(r)) * 2 - 1) * 0.18;
    });
    let raf = 0;
    const update = () => {
      const winH = window.innerHeight;
      tiles.forEach((tile, i) => {
        const rect = tile.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - winH / 2;
        const shift = -center * speeds[i];
        tile.style.setProperty('--scroll-shift', `${shift.toFixed(2)}px`);
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <section className="work" id="work">
      <header className="work__head">
        <div className="section-label" data-reveal>
          <span /> The archive · {items.length} frames
        </div>
        <h2 className="work__title" data-reveal>
          Frames from the <em>field</em>.
        </h2>
      </header>

      {items.length === 0 ? (
        <p className="work__empty">No photos found. Drop files into <code>/public/photos</code> and run <code>npm&nbsp;run&nbsp;photos</code>.</p>
      ) : (
        <div className="masonry" ref={gridRef}>
          {items.map((g, i) => (
            <figure
              key={g.src}
              className={`mtile ${g.ratio && g.ratio > 1.4 ? 'mtile--wide' : ''}`}
              data-reveal
              style={{ '--delay': `${(i % 6) * 40}ms` }}
            >
              <div className="mtile__frame">
                <img src={g.src} alt="" loading="lazy" />
                <span className="mtile__watermark">Shindig Shots</span>
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function PhotoStrip({ items, direction = 'left', speed = 60 }) {
  if (items.length === 0) return null;
  const loop = items.concat(items);
  return (
    <div className={`photostrip photostrip--${direction}`} aria-hidden>
      <div
        className="photostrip__track"
        style={{ animationDuration: `${speed}s` }}
      >
        {loop.map((p, i) => (
          <div className="photostrip__item" key={`${p.src}-${i}`}>
            <img src={p.src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Pinned({ items }) {
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Pick up to 6 wide-ish or featured images for the horizontal showcase.
  const slides = useMemo(() => {
    if (!items.length) return [];
    const wides = items.filter((it) => it.ratio && it.ratio > 1.4);
    const pool = wides.length >= 4 ? wides : items;
    return pool.slice(0, 6).map((p) => ({ img: p.src }));
  }, [items]);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || slides.length === 0) return;
    const onScroll = () => {
      const rect = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const distance = track.scrollWidth - window.innerWidth + 80;
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="pinned" ref={pinRef} aria-label="Featured stories">
      <div className="pinned__sticky">
        <div className="pinned__top">
          <div className="section-label">
            <span /> Featured frames
          </div>
          <div className="pinned__progress">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <div className="pinned__track" ref={trackRef}>
          {slides.map((s, i) => (
            <article className="slide" key={i}>
              <div className="slide__img">
                <img src={s.img} alt="" loading="lazy" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="services" id="services">
      <header className="services__head">
        <div className="section-label" data-reveal>
          <span /> What we make
        </div>
        <h2 className="services__title" data-reveal>
          Five ways we <em>work</em>.
        </h2>
      </header>
      <ul className="services__list">
        {SERVICES.map((s, i) => (
          <li className="service" key={s.n} data-reveal style={{ '--delay': `${i * 80}ms` }}>
            <span className="service__n">{s.n}</span>
            <h3 className="service__title">{s.title}</h3>
            <p className="service__body">{s.body}</p>
            <span className="service__line" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact__inner">
        <div className="section-label" data-reveal>
          <span /> Say hello
        </div>
        <h2 className="contact__title" data-reveal>
          Let&rsquo;s throw <em>a shindig.</em>
        </h2>
        <a className="contact__mail" href="mailto:srujansinghk@gmail.com" data-reveal>
          srujansinghk@gmail.com
          <svg width="40" height="14" viewBox="0 0 40 14">
            <path d="M0 7h36M30 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </a>
        <div className="contact__grid">
          <div data-reveal>
            <span className="contact__label">Phone</span>
            <p>
              <a href="tel:+19136622172">(913)&nbsp;662&nbsp;2172</a><br />
              Mon — Sat · Text first
            </p>
          </div>
          <div data-reveal>
            <span className="contact__label">Booking</span>
            <p>
              Weddings · Engagements<br />
              Birthdays · Events<br />
              Family · Portrait · Travel
            </p>
          </div>
          <div data-reveal>
            <span className="contact__label">Elsewhere</span>
            <p>
              <a
                href="https://www.instagram.com/shindigshots?igsh=MXN3NzlhOWo2aHA4dw=="
                target="_blank"
                rel="noreferrer"
              >
                @shindigshots
              </a>
              <br />
              <a href="mailto:srujansinghk@gmail.com">Inquiries</a>
            </p>
          </div>
        </div>
      </div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} shindigshots</span>
        <span className="footer__sig">Shindig Shots Photography</span>
      </footer>
    </section>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`nav ${scrolled ? 'nav--solid' : ''}`}>
      <a href="#top" className="nav__brand">
        {!logoError ? (
          <img
            src="/photos/logo.png"
            alt="Shindig Shots"
            className="nav__logo-img"
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className="nav__logo">
            <span className="nav__ring" />
            <span className="nav__dot" />
          </span>
        )}
      </a>
      <ul className="nav__links">
        <li><a href="#work">Work</a></li>
        <li><a href="#about">Studio</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="#contact" className="nav__cta">Book a session</a>
    </nav>
  );
}

function App() {
  const { items, hero, loading } = useManifest();
  // Pick a portrait-orientation photo for the About parallax frame.
  const aboutPortrait = useMemo(() => {
    if (!items.length) return null;
    const portraits = items.filter((p) => p.ratio && p.ratio < 0.95);
    return (portraits.length ? portraits : items)[Math.floor(Math.random() * (portraits.length || items.length))]?.src
      || items[0].src;
  }, [items]);

  useReveal([items.length]);
  const progress = useScrollProgress();

  return (
    <div className="App" id="top">
      <Cursor />
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <Nav />
      <Hero heroSrc={hero} />
      <About portrait={aboutPortrait} />
      <Work items={items} />
      <PhotoStrip items={items} direction="left" speed={70} />
      <Pinned items={items} />
      <Services />
      <PhotoStrip items={items.slice().reverse()} direction="right" speed={90} />
      <Contact />
      {loading && <div className="boot" aria-hidden />}
    </div>
  );
}

export default App;
