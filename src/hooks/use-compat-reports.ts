import * as React from "react";
import { COMPAT_REPORTS, loadCompatReports, type CompatReport } from "@/lib/compat";

interface CompatReportsState {
  reports: CompatReport[];
  /** True until the runtime JSON resolves (or fails) — pages can gate on this. */
  loading: boolean;
}

/**
 * Compatibility reports for the current page: the build-time bundle renders
 * immediately as a first-paint seed, then the deployed data/compat.json
 * refreshes it. On a content-only deploy (a merged report without a rebuild),
 * the JSON carries the new reports while the bundle stays stale — refreshing
 * keeps the site current. Falls back to the bundle when the fetch fails.
 */
export function useCompatReports(): CompatReportsState {
  const [state, setState] = React.useState<CompatReportsState>({
    reports: COMPAT_REPORTS,
    loading: true,
  });

  React.useEffect(() => {
    let alive = true;
    loadCompatReports()
      .then((fresh) => {
        if (!alive) return;
        setState(fresh.length > 0 ? { reports: fresh, loading: false } : { reports: COMPAT_REPORTS, loading: false });
      })
      .catch(() => {
        if (alive) setState({ reports: COMPAT_REPORTS, loading: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
