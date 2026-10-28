import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Download,
  Pause,
  Play,
  Plus,
  Expand,
  X,
} from "lucide-react";
import { Github } from "../components/icons";
import {
  AnimatedNumber,
  AnimatedTabs,
  Carousel,
  CodeBlock,
  FAQAccordion,
  Magnetic,
  Reveal,
  TextEffect,
  TransitionPanel,
} from "../components/primitives";
import {
  DownloadCTA,
  External,
  GameCard,
  GameImage,
  OSIcon,
  SectionHeading,
  StatusBadge,
  date,
  useProjectCommunity,
} from "../components/shared";
import { HeroDeck } from "../components/hero-deck";
import { CompatibilitySummary } from "../components/compatibility-summary";
import { BUILD_STEPS, FAQS, PLATFORMS } from "../data/content";
import { osNames, repoUrl, type OS } from "../data/types";
import { latestGames, latestCaptures } from "../lib/featured";
import { useCompatibilityGames } from "../hooks/use-compatibility-games";

function useFeaturedGames() {
  return latestGames(useCompatibilityGames());
}

function Hero() {
  const heroGames = useFeaturedGames();
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false);
  useEffect(() => {
    // Reduced motion removes the transition, not the slideshow's functionality.
    if (paused || heroGames.length < 2) return;
    const interval = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % heroGames.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [paused, active, heroGames.length]);
  const selected = heroGames.length ? active % heroGames.length : 0;
  const game = heroGames[selected];
  return (
    <section className="hero wrap">
      <Reveal className="hero-copy" from="left" distance={18}>
        <h1>
          <TextEffect>BEYOND THE CONSOLE.</TextEffect>
        </h1>
        <p className="hero-description">
          A free, open-source PlayStation 5 emulator.
          <br className="desktop-break" /> New possibilities for Windows, Linux,
          and macOS.
        </p>
        <div className="hero-cta">
          <Magnetic>
            <Link className="button" to="/download">
              <Download size={18} />
              Get KytyPS5
              <ArrowUpRight size={19} />
            </Link>
          </Magnetic>
          <External href={repoUrl} className="text-link">
            <Github size={18} />
            Explore the source
          </External>
        </div>
        <div className="hero-platforms">
          {(["windows", "linux", "macos"] as OS[]).map((os) => (
            <Link
              key={os}
              to={`/download#${os}`}
              title={`Download for ${osNames[os]}`}
            >
              <OSIcon os={os} />
              <span>{osNames[os]}</span>
            </Link>
          ))}
        </div>
        <p className="experimental-note">
          <span />
          An experiment in progress. Every build moves us forward.
        </p>
      </Reveal>
      <div className="hero-visual">
        <div className="visual-orbit orbit-one" aria-hidden="true" />
        <div className="visual-orbit orbit-two" aria-hidden="true" />
        <img className="hero-project-icon" src="/images/project-icon.svg" width="80" height="80" alt="" aria-hidden="true" />
        <HeroDeck games={heroGames} active={selected} onSelect={setActive} />
        {game && (
          <>
            <Link className="hero-caption-chip" to={`/game/${game.key}`}>
              <span>
                <span className="caption-chip-title">{game.title}</span>
                <span>
                  {game.latestReport
                    ? `${osNames[game.latestReport.os]} · ${date(game.latestReport.testedDate)}`
                    : "See the latest test report"}
                </span>
              </span>
              <ArrowUpRight size={20} />
            </Link>
          </>
        )}
        <div className="hero-carousel-controls">
          <div aria-label="Featured game">
            {heroGames.map((g, i) => (
              <button
                key={g.key}
                onClick={() => setActive(i)}
                aria-label={`Show ${g.title}`}
                aria-pressed={selected === i}
                className={selected === i ? "active" : ""}
              />
            ))}
          </div>
          <button
            className="slideshow-pause"
            onClick={() => setPaused(!paused)}
            aria-label={paused ? "Play game slideshow" : "Pause game slideshow"}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#compatibility-preview">
          A little curiosity goes a long way
          <ArrowDown size={16} />
        </a>
        <span>Independent. Community driven. Always open.</span>
      </div>
    </section>
  );
}

function ProjectStrip() {
  const games = useCompatibilityGames();
  const reportCount = games.reduce(
    (sum, game) =>
      sum +
      Object.values(game.reportCounts).reduce<number>(
        (s, n) => s + (n ?? 0),
        0,
      ),
    0,
  );
  const inGame = games.filter((game) => game.overall === "in-game").length;
  return (
    <Reveal className="project-strip" distance={20}>
      <div className="wrap">
        <div className="project-strip-intro">
          <span className="open-symbol">
            <Code2 size={27} />
          </span>
          <p>
            Built in the open.
            <br />
            <strong>Progress you can see.</strong>
          </p>
        </div>
        <div>
          <strong>
            <AnimatedNumber value={games.length} />
          </strong>
          <span>Games tested</span>
        </div>
        <div>
          <strong>
            <AnimatedNumber value={inGame} />
          </strong>
          <span>Reach in-game</span>
        </div>
        <div>
          <strong>
            <AnimatedNumber value={reportCount} />
          </strong>
          <span>Community reports</span>
        </div>
        <External href={repoUrl} className="strip-github">
          <Github size={19} />
          <span>Follow the development</span>
          <ArrowUpRight size={17} />
        </External>
      </div>
    </Reveal>
  );
}

function CompatibilityPreview() {
  const games = useCompatibilityGames();
  const featured = useFeaturedGames();
  return (
    <section id="compatibility-preview" className="section wrap">
      <SectionHeading
        title="REAL GAMES. REAL PROGRESS."
        description="The latest community test reports, newest first. See the tested platform, date and current status."
        link="/compatibility"
      />
      <CompatibilitySummary games={games} />
      <Carousel label="Featured tested games">
        {featured.map((game) => (
          <Reveal key={game.key} from="center">
            <GameCard game={game} showLatestReport />
          </Reveal>
        ))}
      </Carousel>
      <div className="compatibility-note">
        <span>
          <span className="status-dot" />
          In-game means gameplay is reached. Performance and visual issues may
          remain.
        </span>
        <Link to="/compatibility">
          All {games.length} tested games
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function CaptureShowcase() {
  const games = useCompatibilityGames();
  const captures = latestCaptures(games);
  const primary = captures
    .filter(
      (capture, index) =>
        captures.findIndex((item) => item.key === capture.key) === index,
    )
    .slice(0, 3);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(!reduced);
  const [hovered, setHovered] = useState(false);
  const region = useRef<HTMLElement>(null);
  const visible = useInView(region, { amount: 0.2 });
  const selected = current % Math.max(1, captures.length);
  const game = captures[selected];
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);
  useEffect(() => {
    if (!playing || hovered || lightbox || !visible || !captures.length) return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setCurrent((index) => (index + 1) % captures.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, hovered, lightbox, visible, captures.length, current]);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setCurrent(
          (index) =>
            (index + (event.key === "ArrowLeft" ? -1 : 1) + captures.length) %
            captures.length,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, captures.length]);
  useEffect(() => {
    if (!playing || !visible || document.hidden || !captures.length) return;
    const image = new Image();
    image.decoding = "async";
    image.src = captures[(selected + 1) % captures.length].screenshot!;
  }, [playing, visible, selected, captures.length]);
  if (!game) return null;
  return (
    <section
      className="capture-section"
      ref={region}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="wrap capture-grid">
        <div className="capture-copy">
          <Reveal from="left" distance={18}>
            <h2>
              THE FIRST FRAME
              <br />
              IS JUST THE START.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p>
              Real captures. Real hardware. An honest look at emulation taking
              shape, one community report at a time.
            </p>
          </Reveal>
          <div className="capture-selector">
            {primary.map((g) => {
              const i = captures.indexOf(g);
              return (
                <button
                  key={g.key}
                  onClick={() => setCurrent(i)}
                  aria-pressed={selected === i}
                >
                  <span>{g.title}</span>
                  <ArrowUpRight size={17} />
                  {selected === i && (
                    <motion.span
                      layoutId="capture-selection"
                      className="capture-active"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <label className="capture-browse">
            Browse all community captures
            <select
              aria-label="Browse community captures"
              value={selected}
              onChange={(event) => setCurrent(Number(event.target.value))}
            >
              {captures.map((capture, index) => (
                <option key={`${capture.key}-${index}`} value={index}>
                  {capture.title} · {index + 1} / {captures.length}
                </option>
              ))}
            </select>
          </label>
          <Link to={`/game/${game.key}`} className="text-link">
            Read the full report
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="capture-frame">
          <div className="capture-top">
            <span>
              Captured with KytyPS5
              {game.captureOS ? ` · ${osNames[game.captureOS]}` : ""}
            </span>
            <StatusBadge
              status={
                (game.captureOS && game.os[game.captureOS]) || game.overall
              }
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${game.key}-${selected}`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.3 }}
              transition={{ duration: 0.25 }}
            >
              <GameImage
                src={game.screenshot}
                title={`${game.title} community emulator screenshot`}
              />
            </motion.div>
          </AnimatePresence>
          <div className="capture-bottom">
            <span>{game.title}</span>
            <div className="capture-controls">
              <button
                className="icon-button"
                aria-label="Previous capture"
                onClick={() =>
                  setCurrent(
                    (index) => (index - 1 + captures.length) % captures.length,
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label={
                  playing ? "Pause capture slideshow" : "Play capture slideshow"
                }
                aria-pressed={playing}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
              </button>
              <button
                className="icon-button"
                aria-label="Next capture"
                onClick={() =>
                  setCurrent((index) => (index + 1) % captures.length)
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Link
              to={`/game/${game.key}`}
              aria-label={`View ${game.title} report`}
            >
              <ArrowUpRight size={20} />
            </Link>
          </div>
          <Dialog.Root open={lightbox} onOpenChange={setLightbox}>
            <Dialog.Trigger
              className="icon-button capture-expand"
              aria-label={`Expand ${game.title} capture`}
            >
              <Expand size={19} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="lightbox-overlay" />
              <Dialog.Content className="lightbox">
                <Dialog.Title>
                  {game.title} · Capture {selected + 1} of {captures.length}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Community emulator screenshot. Use the arrow keys to browse
                  captures.
                </Dialog.Description>
                <Dialog.Close
                  className="icon-button lightbox-close"
                  aria-label="Close screenshot"
                >
                  <X size={25} />
                </Dialog.Close>
                <GameImage
                  src={game.screenshot}
                  title={`${game.title} community capture`}
                  eager
                />
                <div className="lightbox-controls">
                  <button
                    className="icon-button"
                    aria-label="Previous screenshot"
                    onClick={() =>
                      setCurrent(
                        (index) =>
                          (index - 1 + captures.length) % captures.length,
                      )
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next screenshot"
                    onClick={() =>
                      setCurrent((index) => (index + 1) % captures.length)
                    }
                  >
                    <ChevronRight />
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </section>
  );
}

function Platforms() {
  const [os, setOs] = useState<OS>("windows");
  return (
    <section className="section wrap">
      <SectionHeading
        title="YOUR PLATFORM. YOUR WAY."
        description="Start with a prebuilt release or make it your own. One open-source project, three ways to explore."
      />
      <div className="platform-board">
        <Reveal className="platform-primary" from="left" distance={18}>
          <div className="platform-card-heading">
            <OSIcon os="windows" size={37} />
            <span>Primary platform</span>
          </div>
          <div className="windows-art" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div>
            <h3>WINDOWS</h3>
            <p>
              Ready for your next experiment.
              <br />
              Windows 10 1803+ · x86-64 · Vulkan 1.3
            </p>
            <Link to="/download#windows" className="button light">
              <Download size={17} />
              Get Windows build
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
        <div className="platform-secondary">
          {PLATFORMS.slice(1).map((platform, i) => (
            <Reveal
              className={`platform-mini platform-${i}`}
              key={platform.name}
            >
              <div className="platform-card-heading">
                <OSIcon os={i === 0 ? "linux" : "macos"} size={30} />
                <span>{platform.tag}</span>
              </div>
              <h3>{platform.name === "macOS" ? "macOS" : "LINUX"}</h3>
              <p>{platform.requirement}</p>
              <Link
                className="text-link"
                to={`/download#${i === 0 ? "linux" : "macos"}`}
              >
                Get the build
                <ArrowUpRight size={18} />
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="platform-code" from="right" distance={18}>
          <div className="platform-code-title">
            <Code2 size={25} />
            <h3>MAKE IT YOURS.</h3>
          </div>
          <p>Prefer to build from source? You’re in good company.</p>
          <AnimatedTabs
            items={Object.entries(osNames).map(([value, label]) => ({
              value,
              label,
            }))}
            value={os}
            onChange={(v) => setOs(v as OS)}
            label="Build platform"
            id="home-platform"
          />
          <TransitionPanel value={os}>
            <CodeBlock
              title={`${osNames[os]} · Build from source`}
              code={[...BUILD_STEPS.common, "", ...BUILD_STEPS[os]]}
            />
          </TransitionPanel>
          <Link to="/docs#build" className="text-link">
            Full build instructions
            <ArrowRight size={17} />
          </Link>
        </Reveal>
      </div>
      <p className="platform-disclaimer">
        <Check size={16} />
        No external low-level modules required. Bring your own legally obtained
        game files.
      </p>
    </section>
  );
}

function GettingStarted() {
  const steps = [
    {
      title: "FIRST, GET THE BUILD.",
      text: "Choose your platform and grab the latest release. Extract the archive to a folder on your computer.",
      link: "/download",
      label: "Find your download",
    },
    {
      title: "THEN, ADD YOUR GAMES.",
      text: "Open the launcher and add your game folders in global settings. It finds directories containing eboot.bin.",
      link: "/docs#running",
      label: "Meet the launcher",
    },
    {
      title: "PRESS PLAY. REPORT BACK.",
      text: "Try a title, see what happens, and share what you find. Your report helps make the next build better.",
      link: "/contributing",
      label: "Make a contribution",
    },
  ];
  return (
    <section className="getting-started wrap">
      <h2 className="sr-only">Getting started with KytyPS5</h2>
      {steps.map((step, i) => (
        <Reveal
          className={`start-step step-${i}`}
          from={i === 0 ? "left" : i === 2 ? "right" : "bottom"}
          distance={18}
          delay={i * 0.06}
          key={step.title}
        >
          <div className="start-mark" aria-hidden="true">
            {i === 2 ? <Play size={32} /> : <Plus size={35} />}
          </div>
          <div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <Link to={step.link} className="text-link">
              {step.label}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
      ))}
    </section>
  );
}

function FAQPreview() {
  return (
    <section className="faq-section wrap">
      <div>
        <Reveal>
          <h2>
            A LITTLE
            <br />
            MORE CONTEXT.
          </h2>
        </Reveal>
        <p>
          Early days. Big questions.
          <br />
          Here are a few good places to start.
        </p>
        <Link to="/faq" className="text-link">
          All your questions
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <FAQAccordion items={FAQS.slice(0, 5)} />
    </section>
  );
}

function Community() {
  const github = useProjectCommunity();
  return (
    <section className="community-section wrap">
      <Reveal className="community-art" from="left" distance={18}>
        <div className="avatar-cloud">
          {github.contributors.slice(0, 9).map((c, i) => (
            <External
              href={c.html_url}
              key={c.login}
              className={`community-avatar avatar-${i}`}
            >
              <img
                src={c.avatar_url}
                alt={`${c.login}, KytyPS5 contributor`}
                loading="lazy"
              />
            </External>
          ))}
          <span className="community-plus">
            <Plus size={35} />
          </span>
        </div>
      </Reveal>
      <div className="community-copy">
        <Reveal>
          <h2>
            THE NEXT CHAPTER
            <br />
            IS A GROUP PROJECT.
          </h2>
        </Reveal>
        <p>
          Test a game. File a report. Write some code. KytyPS5 grows through the
          curiosity of people who want to see what’s possible.
        </p>
        <Link className="button" to="/contributing">
          Find your way to contribute
          <ArrowUpRight size={19} />
        </Link>
        <External href={`${repoUrl}/graphs/contributors`} className="text-link">
          Meet the contributors
          <ArrowRight size={17} />
        </External>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <ProjectStrip />
      <CompatibilityPreview />
      <CaptureShowcase />
      <Platforms />
      <GettingStarted />
      <FAQPreview />
      <Community />
      <DownloadCTA />
    </>
  );
}
