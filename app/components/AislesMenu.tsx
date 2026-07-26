import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router';
import {AISLES, DEPARTMENTS} from '~/lib/brand';

/**
 * AISLES — the store directory, rendered as a mega-menu. The signage IS the
 * design: a numbered aisle board (front of store departments across the top,
 * the nine numbered aisles below). Closes on route change, Escape, or an
 * outside click. On mobile the same directory renders inline (see
 * <AisleDirectoryList/>) inside the menu Aside.
 */
export function AislesMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const {pathname, search} = useLocation();

  // Close whenever the route changes (a link was followed).
  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  // Close on Escape + outside click while open.
  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    const {signal} = ac;
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') setOpen(false);
      },
      {signal},
    );
    document.addEventListener(
      'click',
      (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      },
      {signal},
    );
    return () => ac.abort();
  }, [open]);

  return (
    <div className="aisles-menu" ref={wrapRef}>
      <button
        type="button"
        className={`aisles-trigger header-menu-item${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="aisles-directory"
        onClick={() => setOpen((v) => !v)}
      >
        AISLES <span aria-hidden>▾</span>
      </button>

      <div
        id="aisles-directory"
        className={`aisles-panel${open ? ' expanded' : ''}`}
        role="menu"
        hidden={!open}
      >
        <div className="aisles-panel-inner">
          <p className="label-type aisles-panel-eyebrow">STORE DIRECTORY</p>

          <div className="aisles-front">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept.handle}
                className="aisles-front-item"
                to={dept.to}
                prefetch="intent"
                role="menuitem"
              >
                {dept.title}
              </Link>
            ))}
          </div>

          <div className="aisles-grid">
            {AISLES.map((aisle) => (
              <Link
                key={aisle.handle}
                className="aisle-cell"
                to={`/collections/${aisle.handle}`}
                prefetch="intent"
                role="menuitem"
              >
                <span className="aisle-cell-num">{aisle.n}</span>
                <span className="aisle-cell-body">
                  <span className="aisle-cell-title">{aisle.title}</span>
                  <span className="aisle-cell-blurb">{aisle.blurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The same directory as a flat list, for the mobile menu Aside. `onNavigate`
 * lets the caller close the drawer on selection.
 */
export function AisleDirectoryList({onNavigate}: {onNavigate?: () => void}) {
  return (
    <div className="aisle-directory-mobile">
      <Link
        className="header-menu-item"
        to="/"
        prefetch="intent"
        onClick={onNavigate}
      >
        FRONT OF STORE
      </Link>

      <p className="label-type aisle-directory-heading">DEPARTMENTS</p>
      {DEPARTMENTS.map((dept) => (
        <Link
          key={dept.handle}
          className="header-menu-item"
          to={dept.to}
          prefetch="intent"
          onClick={onNavigate}
        >
          {dept.title}
        </Link>
      ))}

      <p className="label-type aisle-directory-heading">AISLES 1–9</p>
      {AISLES.map((aisle) => (
        <Link
          key={aisle.handle}
          className="header-menu-item aisle-directory-row"
          to={`/collections/${aisle.handle}`}
          prefetch="intent"
          onClick={onNavigate}
        >
          <span className="aisle-directory-num">{aisle.n}</span>
          <span>{aisle.title}</span>
        </Link>
      ))}
    </div>
  );
}
