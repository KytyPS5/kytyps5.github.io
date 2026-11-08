import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Download, Menu, X } from "lucide-react";
import { Github } from "./components/icons";
import * as Dialog from "@radix-ui/react-dialog";
import { Logo, External } from "./components/shared";
import { Reveal, ScrollProgress } from "./components/primitives";
import { repoUrl } from "./data/types";
import { ThemeToggle } from "./components/theme-toggle";
import { pageMetadata } from "./lib/page-metadata";
import { LoadingState } from "./components/loading-state";
import { initAnalytics, trackPageView } from "./lib/analytics";

const Home = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.Home })),
);
const Compatibility = lazy(() =>
  import("./pages/Compatibility").then((m) => ({ default: m.Compatibility })),
);
const GamePage = lazy(() =>
  import("./pages/Compatibility").then((m) => ({ default: m.GamePage })),
);
const DownloadPage = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.DownloadPage })),
);
const Documentation = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.Documentation })),
);
const FAQ = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.FAQ })),
);
const About = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.About })),
);
const Contributing = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.Contributing })),
);
const NotFound = lazy(() =>
  import("./pages/Resources").then((m) => ({ default: m.NotFound })),
);
const Patches = lazy(() =>
  import("./pages/Community").then((m) => ({ default: m.Patches })),
);
const Forks = lazy(() =>
  import("./pages/Community").then((m) => ({ default: m.Forks })),
);

const navigation = [
  { label: "Compatibility", to: "/compatibility" },
  { label: "Patches", to: "/patches" },
  { label: "Forks", to: "/forks" },
  { label: "Documentation", to: "/docs" },
];
const allNavigation = [
  { label: "Download", to: "/download" },
  ...navigation,
  { label: "Contribute", to: "/contributing" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
];

function Header() {
  const [menu, setMenu] = useState(false),
    [hover, setHover] = useState("");
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link to="/" aria-label="KytyPS5 home">
          <Logo />
        </Link>
        <nav
          className="desktop-nav"
          aria-label="Primary"
          onPointerLeave={() => setHover("")}
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onPointerEnter={() => setHover(item.to)}
            >
              {({ isActive }) => (
                <>
                  {(hover === item.to || (!hover && isActive)) && (
                    <motion.span
                      layoutId="navigation"
                      className="nav-background"
                      transition={{
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.1,
                      }}
                    />
                  )}
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <External href={repoUrl} className="github-nav">
            <Github size={18} />
            <span>GitHub</span>
            <ArrowUpRight size={14} />
          </External>
          <Link to="/download" className="button small">
            <Download size={16} />
            <span>Get KytyPS5</span>
          </Link>
          <Dialog.Root open={menu} onOpenChange={setMenu}>
            <Dialog.Trigger
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="menu-overlay" />
              <Dialog.Content className="mobile-menu">
                <div className="mobile-menu-head">
                  <Logo />
                  <Dialog.Close
                    className="icon-button"
                    aria-label="Close navigation"
                  >
                    <X size={23} />
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Explore downloads, compatibility and the project.
                </Dialog.Description>
                <nav aria-label="Mobile navigation">
                  {allNavigation.map((item) => (
                    <Link key={item.to} to={item.to}>
                      {item.label}
                      <ArrowUpRight size={24} />
                    </Link>
                  ))}
                </nav>
                <External href={repoUrl} className="text-link">
                  <Github size={18} />
                  View on GitHub
                </External>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
      <ScrollProgress />
    </header>
  );
}

function Footer() {
  return (
    <Reveal as="footer" className="site-footer" distance={20}>
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-about">
            <Link to="/" aria-label="KytyPS5 home">
              <Logo />
            </Link>
            <p>
              A new chapter for PlayStation 5 emulation.
              <br />
              Built in the open, by people like you.
            </p>
            <External href={repoUrl} className="text-link">
              <Github size={18} />
              KytyPS5 / KytyPS5
              <ArrowUpRight size={16} />
            </External>
          </div>
          <nav aria-label="Project links">
            <h3>Explore</h3>
            {allNavigation.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Repository links">
            <h3>Open source</h3>
            {[
              { label: "Source code", suffix: "" },
              { label: "Releases", suffix: "/releases" },
              { label: "Issues", suffix: "/issues" },
              { label: "Pull requests", suffix: "/pulls" },
              { label: "License", suffix: "/blob/main/LICENSE" },
            ].map((item) => (
              <External key={item.label} href={`${repoUrl}${item.suffix}`}>
                {item.label}
              </External>
            ))}
          </nav>
          <div className="footer-note">
            <span className="footer-symbol" aria-hidden="true">
              *
            </span>
            <p>
              Small steps.
              <br />
              New possibilities.
            </p>
            <a
              href="#top"
              className="text-link"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to top
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="footer-large" aria-hidden="true">
          PLAY IT FORWARD.
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} KytyPS5. Free under GPL-2.0.</p>
          <p>
            Not affiliated with Sony Interactive Entertainment or PlayStation.
          </p>
          <p>Game imagery belongs to its respective owners.</p>
        </div>
      </div>
    </Reveal>
  );
}

export default function App() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { pathname, hash } = location;
  const navigation = useNavigationType();
  const previousRoute = useRef("");
  useEffect(() => {
    initAnalytics();
    const original = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = original;
    };
  }, []);
  useEffect(() => {
    const route = `${pathname}${hash}`;
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    if (!hash && !(pathname === "/compatibility" && navigation === "POP"))
      window.scrollTo({ top: 0, behavior: "instant" });
    else
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    const title = (
      {
        "/": "Beyond the console",
        "/download": "Download",
        "/compatibility": "Game compatibility",
        "/patches": "Community patches",
        "/forks": "Community forks",
        "/docs": "Documentation",
        "/faq": "Frequently asked questions",
        "/about": "About",
        "/contributing": "Contributing",
      } as Record<string, string>
    )[pathname];
    pageMetadata(
      pathname,
      title ??
        (pathname.startsWith("/game/")
          ? "Compatibility report"
          : "Page not found"),
    );
    if (!pathname.startsWith("/game/")) {
      trackPageView(
        pathname,
        title ? `KytyPS5 — ${title}` : "KytyPS5 — Page not found",
      );
    }
  }, [pathname, hash, navigation]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <motion.main
        id="main"
        key={pathname}
        initial={{ opacity: reducedMotion ? 1 : 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.12 }}
      >
        <Suspense fallback={<LoadingState route />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/compatibility" element={<Compatibility />} />
            <Route path="/patches" element={<Patches />} />
            <Route path="/forks" element={<Forks />} />
            <Route path="/game/:key" element={<GamePage />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />
            <Route path="/contributing" element={<Contributing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.main>
      <Footer />
    </>
  );
}
