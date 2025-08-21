import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IdleSessionLogout from 'idle-session-logout';
import CounterCard from '../components/CounterCards';
import '../index.css';

declare global {
  interface Window {
    _dashboard_cleanup?: () => void;
  }
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Dashboard(): React.ReactElement {
  const navigate = useNavigate();

  // typed ref for the class instance
  const idleRef = useRef<IdleSessionLogout | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [lastActive, setLastActive] = useState<number>(Date.now());
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  const TIMEOUT_MS = 15_000; // use 30*60*1000 for production

  useEffect(() => {
    let mounted = true;

    // Basic auth check: make sure token exists and is valid
    const token = localStorage.getItem('id_token');
    if (!token) {
      // no token -> redirect to login
      navigate('/login', { replace: true });
      return;
    }

    // validate token with profile endpoint (if server unreachable treat as invalid)
    (async () => {
      try {
        const res = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // invalid token -> clear and redirect
          localStorage.removeItem('id_token');
          if (mounted) navigate('/login', { replace: true });
          return;
        }
        // profile OK — continue to init UI & idle library
      } catch {
        // network error -> treat as invalid for demo
        localStorage.removeItem('id_token');
        if (mounted) navigate('/login', { replace: true });
        return;
      }

      // attach local UI activity listeners (for visual lastActive)
      const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;
      const onActivity = () => setLastActive(Date.now());
      activityEvents.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

      // session seconds ticker (counts up every second)
      const sessionTimer = setInterval(() => setSessionSeconds((s) => s + 1), 1000);

      // UI refresher (keeps ring smooth)
      const uiTick = setInterval(() => setLastActive((t) => t), 250);

      // init idle-logout library
      const idle = new IdleSessionLogout({
        timeout: TIMEOUT_MS,
        onTimeout: () => {
          localStorage.removeItem('id_token');
          setShowPopup(true);
          setTimeout(() => navigate('/login', { replace: true }), 1500);
        },
        popupMessage: "You've been inactive for 30 minutes (demo - shorter)",
      });

      idle.start();
      idleRef.current = idle;

      // cleanup function for this async init
      const cleanup = () => {
        idleRef.current?.stop?.();
        idleRef.current = null;
        clearInterval(sessionTimer);
        clearInterval(uiTick);
        activityEvents.forEach((e) => window.removeEventListener(e, onActivity));
      };

      // attach cleanup on unmount
      window._dashboard_cleanup = cleanup;
    })();

    return () => {
      mounted = false;
      // call the cleanup if it was created
      const maybeCleanup = window._dashboard_cleanup;
      if (typeof maybeCleanup === 'function') {
        maybeCleanup();
        delete window._dashboard_cleanup;
      }
    };
  }, [navigate]);

  // simulate API call (also updates lastActive)
  function makeApiCall() {
    setLastActive(Date.now());
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then((r) => r.json())
      .then((json) => console.log('API demo response', json))
      .catch(console.error);
  }

  // logout (manual)
  function handleLogout() {
    localStorage.removeItem('id_token');
    idleRef.current?.stop?.();
    navigate('/login', { replace: true });
  }

  const elapsed = Date.now() - lastActive;
  const remaining = Math.max(0, TIMEOUT_MS - elapsed);
  const progress = Math.max(0, Math.min(1, remaining / TIMEOUT_MS));

  return (
    <div className="page-root">
      {/* floating decorative shapes */}
      <div className="bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <header className="topbar">
        <h2 className="brand">Idle Logout — Demo</h2>
        <div className="actions">
          <button className="btn ghost" onClick={makeApiCall}>
            Make API call
          </button>
          <button
            className="btn"
            onClick={() => {
              setLastActive(Date.now());
              alert('Manual keep-alive');
            }}
          >
            Ping
          </button>
          <button className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">
        <CounterCard seconds={sessionSeconds} progress={progress} onReset={() => setLastActive(Date.now())} />

        <section className="info-card">
          <h3>Session activity</h3>
          <p>Last activity: {new Date(lastActive).toLocaleTimeString()}</p>
          <p>Timeout in: {(remaining / 1000).toFixed(1)}s</p>
          <p>Tip: Interact with page or click "Make API call" to reset the inactivity timer.</p>
        </section>
      </main>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>You've been inactive</h3>
            <p>Your session expired due to inactivity. Redirecting to login...</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => navigate('/login', { replace: true })}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
