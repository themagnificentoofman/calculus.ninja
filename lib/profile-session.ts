/** An existing owner-readable profile must not depend on a successful write API. */
export function startProfileSession<T>({ subscribe, bootstrap, profile, loading, error, ready }: {
  subscribe: (next: (value: T | null) => void, failed: () => void) => () => void;
  bootstrap?: () => Promise<unknown>; profile: (value: T) => void;
  loading: (value: boolean) => void; error: (message: string) => void; ready?: () => void;
}) {
  let stopped = false, saved = false, failed = false;
  const syncError = () => saved ? 'Your saved profile is loaded, but server sync is temporarily unavailable.' : 'Your profile could not be loaded. Please retry.';
  const stop = subscribe(value => {
    if (stopped) return;
    if (value) { saved = true; profile(value); loading(false); error(failed ? syncError() : ''); }
    else if (!bootstrap || failed) { loading(false); error('Your profile could not be loaded. Please retry.'); }
  }, () => { if (!stopped) { loading(false); error('Your profile could not be refreshed. Please retry.'); } });
  if (bootstrap) void bootstrap().then(() => { if (!stopped) { failed = false; error(''); ready?.(); } }).catch(() => {
    if (!stopped) { failed = true; loading(false); error(syncError()); }
  });
  return () => { stopped = true; stop(); };
}
