import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Cpu,
  Download,
  GitFork,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Terminal,
  Users,
  CircleDot,
} from "lucide-react";
import { Github } from "../components/icons";
import {
  AnimatedNumber,
  AnimatedTabs,
  CodeBlock,
  FAQAccordion,
  Reveal,
  TransitionPanel,
} from "../components/primitives";
import {
  date,
  DownloadCTA,
  External,
  OSIcon,
  PageHeading,
  SectionHeading,
  useGithub,
  useProjectCommunity,
} from "../components/shared";
import {
  BUILD_REQUIREMENTS,
  BUILD_STEPS,
  CONTRIBUTOR_GUIDELINES,
  DOC_SECTIONS,
  FAQS,
  PLATFORMS,
  SYSTEM_REQUIREMENTS,
} from "../data/content";
import { osNames, repoUrl, reportUrl, type OS } from "../data/types";
import { releaseAsset } from "../lib/github";
import { QuickStart } from "../components/quick-start";
import { KittyAnimation } from "../components/loading-state";
import { forkManagementUrl, websiteRepo } from "../data/community-types";

const osKeys = Object.keys(osNames) as OS[];
const buildNotes: Record<OS, string> = {
  windows:
    "Use Visual Studio 2022 or Build Tools 2022 with Desktop development with C++ and C++ Clang tools for Windows, plus Qt 6 for MSVC 2022 64-bit. The MSVC compiler itself is not supported. VS Code debug configuration for launcher.exe and kyty_emulator.exe is included in the repository’s .vscode folder.",
  linux:
    "The bundled SDL2 needs the audio, Wayland and udev development packages. Without them, it silently builds without sound or gamepad hotplug. Install Qt 6 with Concurrent, Network and Widgets from your distribution or the official installer.",
  macos:
    "Builds target x86-64 and run under Rosetta 2 on Apple Silicon. Install Rosetta with softwareupdate --install-rosetta. Homebrew’s Qt is arm64-only; use the official universal Qt installation. Release archives include MoltenVK, and the build re-signs kyty_emulator with JIT entitlements.",
};

function BuildInstructions({ initial = "windows" }: { initial?: OS }) {
  const [os, setOs] = useState<OS>(initial);
  return (
    <div className="build-instructions">
      <AnimatedTabs
        items={osKeys.map((o) => ({
          value: o,
          label: (
            <>
              <OSIcon os={o} size={16} />
              {osNames[o]}
            </>
          ),
        }))}
        value={os}
        onChange={(v) => setOs(v as OS)}
        label="Build instructions platform"
        id="build-platform"
      />
      <TransitionPanel value={os}>
        <CodeBlock
          title={`${osNames[os]} · Clang + CMake + Ninja`}
          code={[...BUILD_STEPS.common, "", ...BUILD_STEPS[os]]}
        />
        <p>{buildNotes[os]}</p>
      </TransitionPanel>
    </div>
  );
}

export function DownloadPage() {
  const { release, fetchedAt, error, loading, refresh } = useGithub();
  const { hash } = useLocation();
  useEffect(() => {
    if (hash)
      setTimeout(
        () =>
          document
            .getElementById(hash.slice(1))
            ?.scrollIntoView({ block: "center", behavior: "smooth" }),
        220,
      );
  }, [hash]);
  return (
    <>
      <PageHeading
        title="YOUR NEXT BUILD STARTS HERE."
        description="Choose a platform. Try something new. Get the latest KytyPS5 release, free and open-source, just as it should be."
      />
      <section className="wrap download-content">
        <div className="release-info">
          <span>
            <span className="release-dot" />
            Latest release
          </span>
          <External href={release.html_url}>
            {release.tag_name}
            <ArrowUpRight size={16} />
          </External>
          <time>{date(release.published_at)}</time>
          <button
            className="release-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh latest release"
            aria-busy={loading}
          >
            {loading ? <KittyAnimation compact /> : <RefreshCw size={16} />}
          </button>
        </div>
        {error && (
          <div className="fetch-notice" role="status">
            GitHub is unavailable. Showing the saved release from{" "}
            {date(fetchedAt)}. <button onClick={refresh}>Try again</button>
          </div>
        )}
        <div className="download-platforms">
          {osKeys.map((os, i) => {
            const asset = releaseAsset(release.assets, os);
            return (
              <Reveal
                key={os}
                className={`download-platform download-platform-${i}`}
                from={i === 0 ? "left" : i === 2 ? "right" : "bottom"}
                distance={18}
                delay={i * 0.07}
              >
                <div id={os} className="download-platform-top">
                  <OSIcon os={os} size={40} />
                  <span>{PLATFORMS[i].tag}</span>
                </div>
                <h2>{osNames[os]}</h2>
                <p>{PLATFORMS[i].description}</p>
                <div className="download-architecture">
                  <span>{os === "windows" ? "x64" : "x86_64"}</span>
                  <span>
                    {asset
                      ? `${(asset.size / 1048576).toFixed(1)} MB`
                      : "Release archive"}
                  </span>
                </div>
                <a
                  className={`button ${i === 0 ? "light" : ""}`}
                  href={
                    asset?.browser_download_url ?? `${repoUrl}/releases/latest`
                  }
                >
                  <Download size={18} />
                  {asset
                    ? `Download for ${osNames[os]}`
                    : "Browse release assets"}
                  <ArrowUpRight size={17} />
                </a>
                <span className="download-filetype">
                  {asset?.name.endsWith(".tar.gz")
                    ? ".tar.gz archive"
                    : ".zip archive"}
                  {os === "macos" && " · Rosetta 2 required"}
                </span>
              </Reveal>
            );
          })}
        </div>
        <div className="release-links">
          <External href={release.html_url} className="text-link">
            Read the release notes
            <ArrowUpRight size={17} />
          </External>
          <External href={`${repoUrl}/releases`} className="text-link">
            Browse previous builds
            <ArrowUpRight size={17} />
          </External>
        </div>
        <p className="experiment-callout">
          <ShieldCheck size={23} />
          <span>
            <strong>Early development. Real exploration.</strong> Expect
            crashes, graphical glitches and varying performance. Use only game
            files you obtained legally. No games or copyrighted system software
            are included.
          </span>
        </p>
      </section>
      <section className="requirements-section">
        <div className="wrap">
          <SectionHeading title="A FEW THINGS YOU’LL NEED." />
          <div className="requirements-grid">
            <div>
              <Cpu size={31} />
              <h3>System requirements</h3>
              <ul>
                {SYSTEM_REQUIREMENTS.map((r) => (
                  <li key={r}>
                    <Check size={17} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Code2 size={31} />
              <h3>Building from source?</h3>
              <ul>
                {BUILD_REQUIREMENTS.map((r) => (
                  <li key={r}>
                    <Check size={17} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="section wrap">
        <SectionHeading
          title="TAKE THE SOURCE ROUTE."
          description="The same toolchain on every platform. Clone the project, initialize the submodules, then configure and build the launcher."
        />
        <BuildInstructions />
        <div className="inline-help">
          <BookOpen size={24} />
          <div>
            <h3>A little help getting started?</h3>
            <p>
              Installation, launch options and troubleshooting are all in the
              docs.
            </p>
          </div>
          <Link to="/docs" className="text-link">
            Read the documentation
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal as="section" className="doc-section" id={id} distance={18}>
      <h2>{title}</h2>
      <div>{children}</div>
    </Reveal>
  );
}

export function Documentation() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <PageHeading
        title="FROM SOURCE TO SCREEN."
        description="Everything you need to install, build and run KytyPS5. Find your starting point and take it from there."
      />
      <div className="wrap docs-layout">
        <aside className="docs-nav">
          <span>In this guide</span>
          <nav aria-label="Documentation sections">
            {DOC_SECTIONS.map((s) => (
              <a
                className={
                  hash === `#${s.id}` || (!hash && s.id === "quick-start")
                    ? "active"
                    : ""
                }
                href={`#${s.id}`}
                key={s.id}
              >
                {s.label}
                <ArrowUpRight size={14} />
              </a>
            ))}
            <Link to="/faq">
              Frequently asked questions
              <ArrowUpRight size={14} />
            </Link>
          </nav>
          <External
            href={`${repoUrl}/blob/main/README.md`}
            className="text-link"
          >
            <Github size={16} />
            Read on GitHub
          </External>
        </aside>
        <div className="docs-body">
          <DocSection id="quick-start" title="Quick Start">
            <QuickStart />
          </DocSection>
          <DocSection id="install" title="Installation">
            <p>
              The fastest way to get started is to{" "}
              <Link to="/download">download the prebuilt archive</Link> for your
              platform. Extract it into a folder, then launch the application.
              If you prefer, build the launcher from source using the
              instructions below.
            </p>
            <p className="doc-callout">
              KytyPS5 is in early development. It does not distribute games or
              copyrighted system software. Only use legally obtained game files.
            </p>
            <p>
              Windows is the primary platform. Linux is supported, and macOS
              support is experimental with x86-64 builds running under Rosetta 2
              on Apple Silicon.
            </p>
          </DocSection>
          <DocSection id="build" title="Building from source">
            <p>
              Initialize every submodule before configuring. The build uses
              CMake, Ninja and Clang. On Windows use clang-cl; the MSVC compiler
              is not supported.
            </p>
            <BuildInstructions />
            <p>
              The install step copies the Qt libraries and plugins next to the
              binaries so the installation folder can run without a matching
              system Qt.
            </p>
            <CodeBlock
              title="Windows · Regression tests"
              code={[
                "cmake --build _Build/windows --target kyty_tests",
                "ctest --test-dir _Build/windows --output-on-failure",
              ]}
            />
          </DocSection>
          <DocSection id="dependencies" title="Dependencies">
            <p>
              Most libraries are vendored as Git submodules: SDL2,
              Vulkan-Headers, SPIRV-Tools, SPIRV-Headers, VulkanMemoryAllocator,
              ffmpeg-core, fmt, spdlog, tracy, imgui and more.
            </p>
            <ul>
              {BUILD_REQUIREMENTS.map((r) => (
                <li key={r}>{r}</li>
              ))}
              <li>A Vulkan 1.3-capable GPU with current drivers</li>
            </ul>
          </DocSection>
          <DocSection id="running" title="Running">
            <p>Launch the graphical game launcher:</p>
            <CodeBlock
              title="Windows · Launcher"
              code={[String.raw`.\_Build\windows\install\launcher.exe`]}
            />
            <CodeBlock
              title="Linux · Launcher"
              code={["./_Build/linux/install/launcher"]}
            />
            <p>
              On first launch, add one or more game folders in global settings.
              The launcher searches recursively for directories containing{" "}
              <code>eboot.bin</code>. Select a detected game from the list and
              run it.
            </p>
            <p>
              You can also start the emulator directly with a legally obtained
              game directory or ELF file. Run <code>kyty_emulator --help</code>{" "}
              to see graphics, logging, validation, profiling and debugging
              options.
            </p>
            <CodeBlock
              title="Windows · Command line"
              code={[
                String.raw`kyty_emulator.exe --game "D:\Games\ExampleGame"`,
              ]}
            />
            <CodeBlock
              title="Linux · Command line"
              code={[
                './_Build/linux/install/kyty_emulator --game "/games/ExampleGame"',
              ]}
            />
            <p>
              On macOS, point SDL explicitly at MoltenVK. The hardened runtime
              prevents it from being found in the executable’s directory:
            </p>
            <CodeBlock
              title="macOS · Command line"
              code={[
                "cd _Build/macos/install",
                'SDL_VULKAN_LIBRARY="$PWD/libMoltenVK.dylib" ./kyty_emulator --game "/games/ExampleGame"',
              ]}
            />
          </DocSection>
          <DocSection
            id="community-resources"
            title="Patches and community forks"
          >
            <p>
              Find game-specific fixes in the{" "}
              <Link to="/patches">patches directory</Link> and alternative
              builds in <Link to="/forks">community forks</Link>. A game page
              lists its associated resources separately from test reports, so a
              report update does not remove them.
            </p>
            <p>
              Read each patch’s description for its supported game version,
              emulator build and installation steps, then download the related
              ZIP package. Forks appear on game pages only when a maintainer
              explicitly lists those game IDs. A fork with no targets is
              available in the forks directory and is associated with no games.
            </p>
            <h3>For maintainers</h3>
            <p>
              Repository collaborators with write access can add or update a
              fork on the{" "}
              <External href={forkManagementUrl}>
                fork-management issue
              </External>
              :
            </p>
            <CodeBlock
              title="Fork commands"
              code={[
                "/fork https://github.com/OWNER/REPOSITORY PPSA21567 PPSA21564",
                "/fork https://github.com/OWNER/REPOSITORY",
                "/unfork https://github.com/OWNER/REPOSITORY",
              ]}
            />
            <p>
              The first command lists game targets. The second lists a fork with
              no targets, clearing an existing target list. The third removes
              the fork. Commands open or update a checked data PR; publication
              follows its merge.
            </p>
            <p>For patches, add files manually to the website repository:</p>
            <CodeBlock
              title="Patch source layout"
              code={[
                "patches/PPSA21567/Patch name/description.md",
                "patches/PPSA21567/Patch name/patch.zip",
                "patches/PPSA21567/Patch name/optional-second-package.zip",
              ]}
            />
            <p>
              Each named patch needs a description and at least one ZIP. See the{" "}
              <External
                href={`${websiteRepo}/blob/main/docs/COMMUNITY_RESOURCES.md`}
              >
                maintenance guide
              </External>{" "}
              and{" "}
              <External href={`${websiteRepo}/blob/main/patches/README.md`}>
                patch instructions
              </External>{" "}
              for the full process.
            </p>
          </DocSection>
          <DocSection id="troubleshooting" title="Troubleshooting">
            <FAQAccordion
              items={[
                {
                  q: "Rendering looks wrong",
                  a: "Update your graphics drivers first. Graphical glitches are expected during early development, and compatibility can change significantly between builds.",
                },
                {
                  q: "A game won’t boot or crashes",
                  a: "Check the game’s compatibility report and compare your platform and build. If you file a bug, search existing issues first and attach the complete log file using the Game Emulation Bug Report template.",
                },
                {
                  q: "Linux has no sound or gamepad hotplug",
                  a: "Install the audio, Wayland and udev development packages, then reconfigure CMake and rebuild. If those packages were missing at configuration time, SDL2 silently disabled those backends.",
                },
                {
                  q: "Qt fails to link on macOS",
                  a: "Use the official universal Qt installation with x86-64 support. Homebrew’s Qt is arm64-only and cannot link to this x86-64 target. Make sure Rosetta 2 is installed.",
                },
              ]}
            />
            <External
              href={`${repoUrl}/issues/new/choose`}
              className="text-link"
            >
              Open the issue templates
              <ArrowUpRight size={17} />
            </External>
          </DocSection>
          <DocSection id="contributing" title="Contributing">
            <p>
              Testing games and submitting detailed reports are useful
              contributions. Code changes should stay focused and build on every
              platform they touch. Read the{" "}
              <Link to="/contributing">contribution guidelines</Link>, including
              formatting setup and the AI-use policy.
            </p>
          </DocSection>
          <DocSection id="repository" title="Repository links">
            <RepositoryLinks />
            <p>
              Found an error in this guide? The content follows the project
              README. Open an issue or pull request against the repository.
            </p>
          </DocSection>
        </div>
      </div>
    </>
  );
}

function RepositoryLinks() {
  return (
    <div className="repository-links">
      {[
        { label: "Source code", suffix: "" },
        { label: "Releases", suffix: "/releases" },
        { label: "Issues", suffix: "/issues" },
        { label: "Pull requests", suffix: "/pulls" },
        { label: "License (GPL-2.0)", suffix: "/blob/main/LICENSE" },
      ].map((l) => (
        <External key={l.label} href={`${repoUrl}${l.suffix}`}>
          {l.label}
          <ArrowUpRight size={17} />
        </External>
      ))}
    </div>
  );
}

export function FAQ() {
  const [query, setQuery] = useState("");
  const items = FAQS.filter((f) =>
    `${f.q} ${f.a}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="GOOD QUESTIONS. OPEN ANSWERS."
        description="What works, what’s next, and where to start. Here’s a little more context about the project."
      />
      <Reveal as="section" className="wrap faq-page" distance={18}>
        <div className="faq-page-aside">
          <h2>Curiosity is welcome.</h2>
          <p>
            Still looking for an answer? The docs go deeper into setup and
            troubleshooting.
          </p>
          <Link to="/docs" className="text-link">
            Read the documentation
            <ArrowUpRight size={17} />
          </Link>
          <External href={`${repoUrl}/issues`} className="text-link">
            Browse GitHub issues
            <ArrowUpRight size={17} />
          </External>
          <External href={`${repoUrl}/discussions`} className="text-link">
            Ask the community
            <ArrowUpRight size={17} />
          </External>
        </div>
        <div>
          <div className="search-box">
            <Search size={19} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search frequently asked questions"
              placeholder="Find an answer…"
            />
          </div>
          {items.length ? (
            <FAQAccordion items={items} />
          ) : (
            <p className="empty-state" role="status">
              No questions match that search. Try another word.
            </p>
          )}
        </div>
      </Reveal>
      <DownloadCTA />
    </>
  );
}

function Contributors() {
  const community = useProjectCommunity();
  return (
    <div className="contributors">
      <Reveal className="contributor-grid" distance={24}>
        {community.contributors.map((c) => (
          <External href={c.html_url} key={c.login}>
            <img src={c.avatar_url} alt="" loading="lazy" />
            <div>
              <strong>{c.login}</strong>
              <span>{c.contributions.toLocaleString()} contributions</span>
            </div>
            <ArrowUpRight size={18} />
          </External>
        ))}
      </Reveal>
      <External href={`${repoUrl}/graphs/contributors`} className="text-link">
        All contributors on GitHub
        <ArrowUpRight size={18} />
      </External>
      <p className="small-note">
        Contributor data from {date(community.fetchedAt)}. Testers and community
        reporters make a difference too.
      </p>
    </div>
  );
}

export function About() {
  const community = useProjectCommunity();
  return (
    <>
      <PageHeading
        title="A DIFFERENT KIND OF PLAY."
        description="An open-source experiment in PlayStation 5 emulation. Built by the community, for the community, with curiosity at its core."
      />
      <section className="wrap about-story">
        <div>
          <h2>
            THE CONSOLE IS JUST
            <br />
            THE BEGINNING.
          </h2>
          <div className="about-logomark" aria-hidden="true">
            <img src="/images/project-icon.svg" width="160" height="160" alt="" />
            <span>C++ / Vulkan 1.3</span>
          </div>
        </div>
        <div>
          <p>
            KytyPS5 is a free and open-source PlayStation 5 emulator written in
            C++. It is based on a heavily modified version of the original{" "}
            <External href="https://github.com/InoriRus/Kyty">
              Kyty project
            </External>
            .
          </p>
          <p>
            Today it can boot 2D games and a selection of 3D games, including
            titles built with Unreal Engine 4/5, Unity and custom engines, with
            no external low-level emulation modules required.
          </p>
          <p>
            Development focuses on compatibility and boot reliability. Windows
            is the primary platform, Linux builds and runs, and macOS is
            experimental. On Apple Silicon, x86-64 code runs through Rosetta 2
            with Vulkan provided by the bundled MoltenVK.
          </p>
          <p>
            This is early-stage software. Crashes, glitches and poor performance
            are expected. The point is to make the fundamentals better, one
            build at a time.
          </p>
          <External href={repoUrl} className="button">
            <Github size={18} />
            Explore the project
            <ArrowUpRight size={18} />
          </External>
        </div>
      </section>
      <section className="architecture-section">
        <div className="wrap">
          <SectionHeading title="WHAT MAKES IT TICK." />
          <Reveal className="architecture-grid" distance={24}>
            {[
              {
                icon: Code2,
                title: "Shader recompiler",
                text: "RDNA 2 instruction decoding, intermediate representation, control flow, resource tracking and SPIR-V emission, using AMD’s RDNA 2 ISA reference.",
              },
              {
                icon: Layers,
                title: "Guest GPU",
                text: "PS5 (Prospero) GPU formats and command processing, translating the commands that games actually submit.",
              },
              {
                icon: Cpu,
                title: "Host GPU",
                text: "A Vulkan 1.3 backend with resource management built on modern memory-allocation libraries.",
              },
              {
                icon: Check,
                title: "Tests that matter",
                text: "Focused memory, shader and resource-tracking regression tests protect the foundations.",
              },
            ].map((item) => (
              <div key={item.title}>
                <item.icon size={30} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </Reveal>
          <div className="tech-list">
            {[
              "C++",
              "CMake",
              "Ninja",
              "Clang",
              "Vulkan 1.3",
              "SPIR-V",
              "RDNA 2",
              "Qt 6",
              "SDL2",
              "FFmpeg",
              "imgui",
              "tracy",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap">
        <SectionHeading title="OPEN BY DESIGN." />
        <Reveal className="legal-grid" from="center">
          <div>
            <ShieldCheck size={29} />
            <h3>Free, for everyone.</h3>
            <p>
              KytyPS5 is licensed under GNU GPL version 2. The original Kyty
              project used the MIT License; its copyright and license notice are
              preserved in the repository.
            </p>
            <External
              href={`${repoUrl}/blob/main/LICENSE`}
              className="text-link"
            >
              Read the license
              <ArrowUpRight size={17} />
            </External>
          </div>
          <div>
            <Github size={29} />
            <h3>Independent, always.</h3>
            <p>
              KytyPS5 is not affiliated with Sony Interactive Entertainment or
              PlayStation. It does not distribute games or copyrighted system
              software. Use only legally obtained game files.
            </p>
            <Link to="/faq" className="text-link">
              More about the project
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>
        <div className="repo-stats">
          {[
            {
              icon: Star,
              label: "GitHub stars",
              value: community.repo.stargazers_count,
              path: "/stargazers",
            },
            {
              icon: GitFork,
              label: "Forks",
              value: community.repo.forks_count,
              path: "/forks",
            },
            {
              icon: CircleDot,
              label: "Open issues",
              value: community.repo.open_issues_count,
              path: "/issues",
            },
            {
              icon: Users,
              label: "Contributors",
              value: community.contributorsCount,
              path: "/graphs/contributors",
            },
          ].map((s) => (
            <External href={`${repoUrl}${s.path}`} key={s.label}>
              <s.icon size={24} />
              <strong>
                <AnimatedNumber value={s.value} />
              </strong>
              <span>{s.label}</span>
            </External>
          ))}
        </div>
        <SectionHeading
          title="THE PEOPLE BEHIND THE PROGRESS."
          description="Developers, tinkerers and curious minds. This is what building in the open looks like."
        />
        <Contributors />
      </section>
      <DownloadCTA />
    </>
  );
}

export function Contributing() {
  return (
    <>
      <PageHeading
        title="PLAY YOUR PART."
        description="The next breakthrough might start with your report. Help build a better emulator, one test, one fix, one idea at a time."
      >
        <External href={repoUrl} className="button">
          <Github size={18} />
          Explore on GitHub
          <ArrowUpRight size={18} />
        </External>
      </PageHeading>
      <section className="wrap contribution-content">
        <div className="contribution-guidelines">
          {CONTRIBUTOR_GUIDELINES.map((g, i) => (
            <Reveal key={g.title}>
              <span className="contribution-symbol">
                {i === 0 ? (
                  <Search size={31} />
                ) : i === 1 ? (
                  <Code2 size={31} />
                ) : i === 2 ? (
                  <Terminal size={31} />
                ) : (
                  <ShieldCheck size={31} />
                )}
              </span>
              <div>
                <h2>{g.title}</h2>
                <p>{g.description}</p>
                {i === 0 && (
                  <External href={reportUrl} className="text-link">
                    Submit a game report
                    <ArrowUpRight size={17} />
                  </External>
                )}
                {i === 1 && (
                  <External href={`${repoUrl}/pulls`} className="text-link">
                    Browse pull requests
                    <ArrowUpRight size={17} />
                  </External>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal
          as="section"
          className="reporting-guide"
          from="left"
          distance={18}
        >
          <SectionHeading
            title="A GOOD REPORT GOES A LONG WAY."
            description="Search existing issues first. Include the game and title ID, emulator build, status, operating system, hardware and the complete log file."
          />
          <External href={`${repoUrl}/issues/new/choose`} className="button">
            Open the issue templates
            <ArrowUpRight size={18} />
          </External>
          <p>
            Expect crashes, graphical glitches, low compatibility and poor
            performance. Behavior changes between builds. A game that worked in
            one build may not boot in another.
          </p>
        </Reveal>
        <Reveal as="section" className="compat-flow" distance={24}>
          <div>
            <h2>
              FROM YOUR TEST
              <br />
              TO THE COLLECTION.
            </h2>
            <ol>
              <li>
                File a Game Emulation Status Report in the emulator repository.
              </li>
              <li>
                The website’s mirror workflow picks up unconverted issues every
                30 minutes.
              </li>
              <li>
                A maintainer verifies the report and comments{" "}
                <code>/compat</code> on the mirrored issue to create a report
                pull request.
              </li>
              <li>
                Once merged, the site shows the result for that game and
                platform. Linux and Windows reports keep their own statuses.
              </li>
            </ol>
          </div>
          <div>
            <CodeBlock
              title="Maintainer · Convert a mirrored report"
              code={["# Comment on the mirror issue:", "/compat"]}
            />
            <p>
              Re-running <code>/compat</code> updates the same pull request.
              Successful conversion closes the mirrored issue.
            </p>
            <External
              href="https://github.com/KytyPS5/kytyps5.github.io/issues?q=label%3Acompat"
              className="text-link"
            >
              See the open mirrors
              <ArrowUpRight size={17} />
            </External>
          </div>
        </Reveal>
        <Reveal
          as="section"
          className="formatting-section"
          from="right"
          distance={18}
        >
          <div>
            <h2>KEEP THE CODE IN SHAPE.</h2>
            <p>
              Install the clang-format hook after cloning. It formats staged{" "}
              <code>.cpp</code>, <code>.h</code> and <code>.inc</code> files in{" "}
              <code>src</code>. Include relevant tests where practical;
              regression tests live in <code>tests</code>.
            </p>
          </div>
          <CodeBlock
            title="Formatting hook"
            code={[
              "python -m pip install pre-commit",
              "python -m pre_commit install --install-hooks",
            ]}
          />
        </Reveal>
        <Reveal as="section" className="thanks-section" from="center">
          <SectionHeading title="GOOD WORK BUILDS ON GOOD WORK." />
          <div className="thanks-links">
            <External href="https://github.com/InoriRus/Kyty">
              <h3>
                InoriRus / Kyty
                <ArrowUpRight size={22} />
              </h3>
              <p>
                The original Kyty project, released under MIT, is the starting
                point of this heavily modified fork.
              </p>
            </External>
            <External href="https://github.com/shadps4-emu/shadPS4">
              <h3>
                shadps4-emu / shadPS4
                <ArrowUpRight size={22} />
              </h3>
              <p>
                A reference for memory-model understanding and the AVPlayer
                implementation.
              </p>
            </External>
          </div>
        </Reveal>
        <SectionHeading
          title="THERE’S ROOM FOR YOU HERE."
          description="Every contributor counts, including the testers behind the reports."
        />
        <Contributors />
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="wrap empty-state route-empty">
      <span className="not-found-number">404</span>
      <h1>A LITTLE OFF THE MAP.</h1>
      <p>This page doesn’t exist. Let’s get you back to familiar ground.</p>
      <Link to="/" className="button">
        <ArrowLeft size={18} />
        Back to home
      </Link>
    </section>
  );
}
