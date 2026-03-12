/**
 * useActionParam.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Listens for a specific URL query parameter (e.g. ?action=add) injected by
 * the Global Feature Search system and fires a one-time callback, then
 * immediately removes the param from the URL (shallow replace) so the user
 * can bookmark the clean URL without retriggers on subsequent visits.
 *
 * Usage
 * ─────
 *   useActionParam('add', openAddModal);
 *
 * Parameters
 * ──────────
 * @param {string}   expectedValue  The value to match against router.query.action
 * @param {Function} callback       Called once when the value matches.
 *                                  Must be stable (useCallback or plain function
 *                                  defined outside the render cycle).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function useActionParam(expectedValue, callback) {
  const router = useRouter();

  useEffect(() => {
    if (router.query.action !== expectedValue) return;

    // Fire the action
    callback();

    // Strip ?action= from the URL immediately (no full page reload)
    const { action: _removed, ...restQuery } = router.query;
    router.replace(
      { pathname: router.pathname, query: restQuery },
      undefined,
      { shallow: true }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.action]);
  // Intentionally only re-runs when action query param changes.
  // callback and expectedValue are treated as stable across renders.
}
