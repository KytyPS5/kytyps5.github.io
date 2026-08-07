import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/layouts/site-layout";

const HomePage = lazy(() => import("@/pages/home").then((m) => ({ default: m.HomePage })));
const DownloadPage = lazy(() => import("@/pages/download").then((m) => ({ default: m.DownloadPage })));
const CompatibilityPage = lazy(() =>
  import("@/pages/compatibility").then((m) => ({ default: m.CompatibilityPage })),
);
const GamePage = lazy(() => import("@/pages/game").then((m) => ({ default: m.GamePage })));
const DocumentationPage = lazy(() =>
  import("@/pages/documentation").then((m) => ({ default: m.DocumentationPage })),
);
const FaqPage = lazy(() => import("@/pages/faq").then((m) => ({ default: m.FaqPage })));
const ContributingPage = lazy(() =>
  import("@/pages/contributing").then((m) => ({ default: m.ContributingPage })),
);
const AboutPage = lazy(() => import("@/pages/about").then((m) => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading page">
      <span className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageFallback />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="download"
          element={
            <Suspense fallback={<PageFallback />}>
              <DownloadPage />
            </Suspense>
          }
        />
        <Route
          path="compatibility"
          element={
            <Suspense fallback={<PageFallback />}>
              <CompatibilityPage />
            </Suspense>
          }
        />
        <Route
          path="game/:key"
          element={
            <Suspense fallback={<PageFallback />}>
              <GamePage />
            </Suspense>
          }
        />
        <Route
          path="docs"
          element={
            <Suspense fallback={<PageFallback />}>
              <DocumentationPage />
            </Suspense>
          }
        />
        <Route
          path="faq"
          element={
            <Suspense fallback={<PageFallback />}>
              <FaqPage />
            </Suspense>
          }
        />
        <Route
          path="contributing"
          element={
            <Suspense fallback={<PageFallback />}>
              <ContributingPage />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<PageFallback />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<PageFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
