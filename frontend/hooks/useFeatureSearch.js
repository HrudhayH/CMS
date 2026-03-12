/**
 * useFeatureSearch.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure-frontend search engine for the Global Feature Search system.
 *
 * • Zero backend calls — all matching happens in memory against featureIndex.
 * • Sub-millisecond results — filtered from a static array, no I/O.
 * • Portal-aware — only shows items accessible to the current user/portal.
 * • Ranked — exact title match → prefix match → keyword match → partial match.
 * • Debounced at 80 ms to avoid flooding renders while typing fast.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Usage
 * ─────
 *   const { query, setQuery, results, isOpen, setIsOpen, reset } =
 *     useFeatureSearch({ portal: 'admin', user });
 *
 * @param {object} options
 * @param {string} options.portal  - 'admin' | 'staff' | 'client'
 * @param {object} options.user    - Decoded JWT: { role, permissions[] }
 * @param {number} [options.maxResults=8] - Max suggestions to return
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getAccessibleFeatures } from '../utils/featureIndex';

const DEFAULT_MAX = 8;
const DEBOUNCE_MS = 80;

export function useFeatureSearch({ portal, user, maxResults = DEFAULT_MAX } = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);

  // Debounce the raw query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Build the filtered feature set once per portal+user change (memoised)
  const accessibleFeatures = useMemo(
    () => getAccessibleFeatures(portal, user),
    [portal, user]
  );

  // Compute ranked results whenever the debounced query changes
  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    if (!q || q.length < 1) return [];

    const scored = [];

    for (const item of accessibleFeatures) {
      const titleLower = item.title.toLowerCase();
      const categoryLower = (item.category || '').toLowerCase();
      const descLower = (item.description || '').toLowerCase();
      const keywords = item.keywords || [];

      let score = 0;

      // ── Exact title match
      if (titleLower === q) {
        score = 100;
      }
      // ── Title starts with query
      else if (titleLower.startsWith(q)) {
        score = 80;
      }
      // ── Title contains query
      else if (titleLower.includes(q)) {
        score = 60;
      }
      // ── Exact keyword match
      else if (keywords.some((kw) => kw === q)) {
        score = 55;
      }
      // ── Keyword starts with query
      else if (keywords.some((kw) => kw.startsWith(q))) {
        score = 45;
      }
      // ── Keyword contains query
      else if (keywords.some((kw) => kw.includes(q))) {
        score = 35;
      }
      // ── Category match
      else if (categoryLower.includes(q)) {
        score = 25;
      }
      // ── Description match
      else if (descLower.includes(q)) {
        score = 10;
      }

      if (score > 0) {
        scored.push({ ...item, _score: score });
      }
    }

    // Sort descending by score, then alphabetically by title for ties
    scored.sort((a, b) =>
      b._score !== a._score
        ? b._score - a._score
        : a.title.localeCompare(b.title)
    );

    return scored.slice(0, maxResults);
  }, [debouncedQuery, accessibleFeatures, maxResults]);

  // Open dropdown when there is a query; close when empty
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // Reset everything (called after navigation or outside click)
  const reset = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    reset,
  };
}
