import {useEffect, useState} from 'react';
import {useNavigation} from 'react-router';

/**
 * A slim signage-red progress bar pinned to the top of the viewport during
 * route navigations — the kind of perceived-speed cue premium storefronts use.
 * Purely presentational; respects reduced-motion (renders nothing).
 */
export function NavProgress() {
  const navigation = useNavigation();
  const active = navigation.state === 'loading';
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    // Let the bar finish to 100% before hiding.
    const t = setTimeout(() => setVisible(false), 260);
    return () => clearTimeout(t);
  }, [active]);

  if (reduced || (!active && !visible)) return null;

  return (
    <div className="nav-progress" role="presentation" aria-hidden="true">
      <div className={`nav-progress-bar${active ? ' is-loading' : ' is-done'}`} />
    </div>
  );
}
