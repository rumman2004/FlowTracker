import { Outlet } from "react-router-dom";

// AdminLayout is now a pure shell:
// ✅ Auth-guarding is handled by <AdminRoute> in App.jsx
// ✅ Background, grid, global styles live here once — not duplicated in dashboard
const AdminLayout = () => {
  return (
    <>
      {/* ── Global admin styles — single source of truth ────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar        { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track  { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb  {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(249,115,22,0.4); }

        /* ── Root shell ── */
        .admin-root {
          min-height: 100vh;
          min-height: 100dvh;
          font-family: 'Inter', system-ui, sans-serif;
          background:
            radial-gradient(ellipse at 10% 10%, rgba(249,115,22,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 90%, rgba(220,38,38,0.06)  0%, transparent 50%),
            #030712;
          color: #f8fafc;
          overflow-x: hidden;
        }

        /* ── Dot-grid background ── */
        .admin-grid-bg {
          position: fixed; inset: 0;
          z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        /* ── Content layer ── */
        .admin-content {
          position: relative;
          z-index: 1;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* ── Shared animations ── */
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ────────────────────────────────────────────────────────────────
           RESPONSIVE HELPERS
           These target classNames used inside AdminDashboard so that
           media-query rules are never beaten by inline display:none.
        ──────────────────────────────────────────────────────────────── */

        /* ── Hamburger: hidden by default, shown on mobile ── */
        .admin-hamburger { display: none; }
        @media (max-width: 768px) {
          .admin-hamburger { display: flex !important; }
        }

        /* ── Desktop tab bar: shown by default, hidden on mobile ── */
        .admin-tabs-desktop { display: flex; }
        @media (max-width: 768px) {
          .admin-tabs-desktop { display: none !important; }
        }

        /* ── Logout label: hide text on mobile, keep icon ── */
        .admin-logout-label { display: inline; }
        @media (max-width: 768px) {
          .admin-logout-label { display: none; }
        }

        /* ── Header inner padding ── */
        .admin-header-inner { padding: 0 24px; }
        @media (max-width: 1024px) {
          .admin-header-inner { padding: 0 16px; }
        }

        /* ── Main padding ── */
        .admin-main { padding: clamp(16px,3vw,32px) clamp(16px,3vw,24px); }
        @media (max-width: 768px) {
          .admin-main { padding: 12px; }
        }

        /* ── Stat card grid ── */
        .admin-stat-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1024px) {
          .admin-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .admin-stat-grid { grid-template-columns: 1fr; }
        }

        /* ── Chart grid ── */
        .admin-chart-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 900px) {
          .admin-chart-grid { grid-template-columns: 1fr; }
        }

        /* ── Table horizontal scroll on mobile ── */
        .admin-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .admin-table-wrap table { min-width: 640px; }

        /* ── Leaderboard rows on very small screens ── */
        @media (max-width: 420px) {
          .leaderboard-row   { flex-wrap: wrap; gap: 8px; }
          .leaderboard-email { display: none; }
        }

        /* ── Wide screens ── */
        @media (min-width: 1440px) {
          .admin-header-inner,
          .admin-main { max-width: 1400px !important; }
        }
      `}</style>

      <div className="admin-root">
        <div className="admin-grid-bg" />
        <div className="admin-content">
          {/* Renders AdminDashboard (or any future admin child route) */}
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;