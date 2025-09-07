// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="lp-root">
      <div className="lp-bg-grid" aria-hidden="true" />
      <main className="lp-container" role="main">
        <section className="lp-hero">
          <span className="lp-pill" aria-label="Tagline">
            <span className="lp-dot" aria-hidden="true" />
            Smarter learning, tailored to every student
          </span>

          <h1 className="lp-title">Student Matching System</h1>
          <p className="lp-subtitle">
            Personalised learning recommendations for students — built for Admins, Teachers, and Students.
          </p>

          <div className="lp-actions">
            <Link to="/login" className="lp-btn lp-btn--light">Login</Link>
            <Link to="/register" className="lp-btn lp-btn--primary">Create an account</Link>
          </div>

          <p className="lp-note">Admin / Teacher / Student — please log in to continue.</p>
        </section>

        <aside className="lp-card" aria-labelledby="why-works">
          <header className="lp-card__header">
            <div className="lp-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
                <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 14h-2v-2h2v2Zm0-4h-2V6h2v6Z" />
              </svg>
            </div>
            <div>
              <h3 id="why-works" className="lp-card__title">Why this works</h3>
              <p className="lp-card__meta">Adaptive matching · Progress-aware · Accessible UI</p>
            </div>
          </header>

          <div className="lp-features">
            <Feature title="Profiles" text="Store student needs, preferences & goals." />
            <Feature title="Activities" text="Curated tasks mapped by difficulty." />
            <Feature title="Recommendations" text="Smart ranking & diversity guards." />
            <Feature title="Feedback" text="Close the loop and improve next picks." />
          </div>

          <div className="lp-snippet" aria-label="API example">
            <code className="lp-code">GET /api/recommendations</code>
            <div className="lp-snippet__text">
              Return top-N activities for a student using profile and past feedback.
            </div>
          </div>

          <div className="lp-card__footer">
            <span>Need access?</span>
            <Link to="/register" className="lp-link">Create an account →</Link>
          </div>
        </aside>
      </main>

      <footer className="lp-footer">© {new Date().getFullYear()} Student Matching System</footer>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="lp-feature">
      <div className="lp-feature__title">{title}</div>
      <div className="lp-feature__text">{text}</div>
    </div>
  );
}
