import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Gamepad2,
  Monitor,
  Terminal,
  Apple,
} from "lucide-react";
import { Reveal, TextEffect } from "./primitives";
import {
  statusMeta,
  osNames,
  type Game,
  type OS,
  type Status,
} from "../data/types";
import snapshot from "../data/github.json";
import { initialCommunity, loadCommunity, loadRelease } from "../lib/github";
import { useRefreshingData } from "../hooks/use-refreshing-data";
import { latestReportStatus } from "../lib/featured";

export function useProjectCommunity() {
  return useRefreshingData(initialCommunity, loadCommunity).data;
}

export function External({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span className={`wordmark ${large ? "large" : ""}`}>
      <img className="project-icon" src="/images/project-icon.svg" width="48" height="48" alt="" aria-hidden="true" />
      <span>
        kyty<span className="logo-ps">PS5</span>
      </span>
    </span>
  );
}
export function OSIcon({ os, size = 19 }: { os: OS; size?: number }) {
  return os === "macos" ? (
    <Apple size={size} aria-hidden="true" />
  ) : os === "linux" ? (
    <Terminal size={size} aria-hidden="true" />
  ) : (
    <Monitor size={size} aria-hidden="true" />
  );
}
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status status-${status}`}
      title={statusMeta[status].description}
    >
      <span />
      {statusMeta[status].label}
    </span>
  );
}
export function GameImage({
  src,
  title,
  className = "",
  eager = false,
}: {
  src?: string;
  title: string;
  className?: string;
  eager?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  return src && failedSource !== src ? (
    <img
      src={
        /^(?:[a-z]+:|\/)/i.test(src)
          ? src
          : `/${src.replace(/^(?:\.\/|public\/)/, "")}`
      }
      alt={title}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailedSource(src)}
    />
  ) : (
    <div className={`image-fallback ${className}`}>
      <Gamepad2 size={40} />
      <span>{title}</span>
    </div>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading wrap">
      <h1>
        <TextEffect>{title}</TextEffect>
      </h1>
      <Reveal className="page-intro" from="right" distance={18} delay={0.12}>
        <p>{description}</p>
        {children}
      </Reveal>
    </div>
  );
}
export function SectionHeading({
  title,
  description,
  link,
  label = "Explore compatibility",
}: {
  title: string;
  description?: string;
  link?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <Reveal from="left" distance={18}>
        <h2>{title}</h2>
      </Reveal>
      <Reveal from="right" distance={18} delay={0.08}>
        <div>
          {description && <p>{description}</p>}
          {link && (
            <Link className="text-link" to={link}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          )}
        </div>
      </Reveal>
    </div>
  );
}
export function GameCard({
  game,
  showLatestReport = false,
}: {
  game: Game;
  showLatestReport?: boolean;
}) {
  return (
    <Link to={`/game/${game.key}`} className="game-card">
      <div className="game-card-art">
        <GameImage src={game.cover} title={game.title} />
        <span className="game-card-open">
          <ArrowUpRight size={23} />
        </span>
      </div>
      <div className="game-card-info">
        <h3>{game.title}</h3>
        <StatusBadge
          status={showLatestReport ? latestReportStatus(game) : game.overall}
        />
        {showLatestReport && (
          <span className="featured-report-meta">
            {game.latestReport
              ? `${osNames[game.latestReport.os]} · `
              : "Overall · "}
            <time dateTime={game.latestTested}>{date(game.latestTested)}</time>
          </span>
        )}
      </div>
    </Link>
  );
}
export function DownloadCTA() {
  return (
    <Reveal as="section" className="download-band" distance={24}>
      <Link to="/download" className="wrap">
        <div>
          <ArrowUpRight size={48} aria-hidden="true" />
        </div>
        <h2>LET’S PLAY.</h2>
        <span>
          Get the latest KytyPS5 build. Free and open-source.
          <ArrowRight size={22} />
        </span>
      </Link>
    </Reveal>
  );
}
export function useGithub() {
  const { data, error, loading, refresh } = useRefreshingData(
    snapshot,
    loadRelease,
  );
  return { ...data, error, loading, refresh: () => refresh(true) };
}
export function date(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Not recorded";
}
