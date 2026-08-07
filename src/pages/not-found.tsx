import { Link } from "react-router-dom";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { Seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/layout/wordmark";
import { REPO_URL } from "@/lib/github";

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you are looking for does not exist."
        path="/404"
      />
      <div className="relative flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 text-center">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
          <div className="absolute left-1/2 top-1/3 h-[380px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(91,140,255,0.15),transparent)] blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center">
          <Wordmark className="text-sm" />
          <p className="mt-10 font-display text-[clamp(6rem,20vw,12rem)] font-bold leading-none">
            4<span className="text-gradient-iris">0</span>4
          </p>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Game not found
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
            The page you're looking for doesn't exist — like a PS5 game the emulator hasn't booted
            yet. Let's get you back to something that works.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeftIcon className="size-4" aria-hidden="true" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
                <GithubIcon className="size-4" aria-hidden="true" />
                View the source
              </a>
            </Button>
          </div>
          <Link
            to="/download"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
            or grab the latest build
          </Link>
        </div>
      </div>
    </>
  );
}
