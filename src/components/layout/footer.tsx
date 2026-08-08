import { Link } from "react-router-dom";
import { GithubIcon } from "@/components/ui/icons";
import { Wordmark } from "@/components/layout/wordmark";
import { Container } from "@/components/layout/container";
import { REPO_URL } from "@/lib/github";

const COLUMNS = [
  {
    title: "Project",
    links: [
      { label: "Download", to: "/download" },
      { label: "Compatibility", to: "/compatibility" },
      { label: "Documentation", to: "/docs" },
      { label: "FAQ", to: "/faq" },
      { label: "Contributing", to: "/contributing" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Repository",
    links: [
      { label: "GitHub", href: REPO_URL },
      { label: "Releases", href: `${REPO_URL}/releases` },
      { label: "Issues", href: `${REPO_URL}/issues` },
      { label: "Pull requests", href: `${REPO_URL}/pulls` },
      { label: "License", href: `${REPO_URL}/blob/main/LICENSE` },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Wordmark className="text-2xl" />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              A free and open-source PlayStation 5 emulator for Windows, Linux and macOS — in early
              development, with prebuilt binaries published on the Download page.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-md text-sm text-text-muted transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
            >
              <GithubIcon className="size-4" />
              KytyPS5/KytyPS5
            </a>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) =>
                  "to" in link ? (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="rounded-sm text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="rounded-sm text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            KytyPS5 is licensed under the GNU GPL v2 and is not affiliated with Sony Interactive
            Entertainment or PlayStation.
          </p>
          <p>This website is open source. Screenshots © their respective owners.</p>
          <p>
            Website maintained by{" "}
            <a
              href="https://github.com/DistantMyth"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-text-secondary transition-colors duration-150 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              DistantMyth
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
