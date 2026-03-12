/**
 * FeatureSearch.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global Feature Search component — sidebar search box + dropdown suggestions.
 *
 * Props
 * ─────
 * @param {string} portal      - 'admin' | 'staff' | 'client'
 * @param {object} user        - Decoded JWT: { role, permissions[] }
 * @param {boolean} isCollapsed - Whether the parent sidebar is collapsed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useFeatureSearch } from '../hooks/useFeatureSearch';
import styles from './FeatureSearch.module.css';

/**
 * Compute position for the fixed dropdown so it anchors directly
 * below the input wrapper, escaping the sidebar's overflow:hidden.
 */
function getDropdownStyle(containerRef) {
  if (!containerRef.current) return {};
  const rect = containerRef.current.getBoundingClientRect();
  return {
    position: 'fixed',
    top: rect.bottom,
    left: rect.left,
    width: rect.width,
  };
}

// ── Category icon: small neutral dot
const CategoryDot = () => (
  <span className={styles.categoryDot} aria-hidden="true" />
);

// ── Search magnifier icon
const SearchIcon = () => (
  <svg
    className={styles.searchIcon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Keyboard shortcut badge
const KbdBadge = ({ children }) => (
  <kbd className={styles.kbd}>{children}</kbd>
);

export default function FeatureSearch({ portal, user, isCollapsed }) {
  const router = useRouter();
  const { query, setQuery, results, isOpen, setIsOpen, reset } =
    useFeatureSearch({ portal, user });

  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // ── Recalculate fixed position whenever the dropdown opens or window resizes
  useEffect(() => {
    if (!isOpen) return;
    setDropdownStyle(getDropdownStyle(containerRef));

    function handleResize() {
      setDropdownStyle(getDropdownStyle(containerRef));
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // ── Reset active index whenever results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // ── Close on outside click
  // The dropdown is position:fixed and NOT a DOM child of containerRef,
  // so we must check both the container and the dropdown ref.
  useEffect(() => {
    function handleOutside(e) {
      const inContainer = containerRef.current && containerRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inContainer && !inDropdown) {
        reset();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, reset]);

  // ── Close on route change
  useEffect(() => {
    reset();
  }, [router.pathname, reset]);

  // ── Navigate to selected item
  const navigateTo = useCallback(
    (item) => {
      reset();
      if (item.action) {
        router.push({ pathname: item.route, query: { action: item.action } });
      } else {
        router.push(item.route);
      }
    },
    [reset, router]
  );

  // ── Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen || results.length === 0) {
        if (e.key === 'Escape') {
          reset();
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < results.length) {
            navigateTo(results[activeIndex]);
          } else if (results.length === 1) {
            navigateTo(results[0]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          reset();
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [isOpen, results, activeIndex, navigateTo, reset]
  );

  // ── Scroll active item into view inside the dropdown
  useEffect(() => {
    if (activeIndex < 0 || !dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll('[data-item]');
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // ── When sidebar is collapsed, don't render the full search box
  //    — render a search icon button instead that expands on click
  if (isCollapsed) {
    return (
      <div className={styles.collapsedWrapper} title="Search features">
        <button
          className={styles.collapsedBtn}
          onClick={() => inputRef.current?.focus()}
          aria-label="Open feature search"
        >
          <SearchIcon />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="search"
      aria-label="Feature search"
    >
      {/* Input row */}
      <div className={`${styles.inputWrapper} ${isOpen && results.length > 0 ? styles.inputWrapperOpen : ''}`}>
        <SearchIcon />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Search features…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          autoComplete="off"
          spellCheck={false}
          aria-autocomplete="list"
          aria-controls="feature-search-listbox"
          aria-expanded={isOpen && results.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `fsr-item-${activeIndex}` : undefined
          }
        />
        {query.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={reset}
            tabIndex={-1}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown — rendered with position:fixed to escape sidebar overflow:hidden */}
      {isOpen && (
        <div
          id="feature-search-listbox"
          ref={dropdownRef}
          role="listbox"
          className={styles.dropdown}
          style={dropdownStyle}
          aria-label="Search suggestions"
        >
          {results.length === 0 ? (
            <div className={styles.noResults}>
              <span className={styles.noResultsText}>No results for "{query}"</span>
            </div>
          ) : (
            <>
              {results.map((item, idx) => (
                <button
                  key={item.id}
                  id={`fsr-item-${idx}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  data-item
                  className={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => navigateTo(item)}
                  tabIndex={-1}
                >
                  <span className={styles.itemLeft}>
                    <CategoryDot />
                    <span className={styles.itemTitle}>{item.title}</span>
                  </span>
                  <span className={styles.itemRight}>
                    <span className={styles.itemCategory}>{item.category}</span>
                  </span>
                </button>
              ))}

              {/* Footer hint */}
              <div className={styles.footer}>
                <span className={styles.footerHint}>
                  <KbdBadge>↑↓</KbdBadge> navigate &nbsp;
                  <KbdBadge>↵</KbdBadge> open &nbsp;
                  <KbdBadge>Esc</KbdBadge> close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
