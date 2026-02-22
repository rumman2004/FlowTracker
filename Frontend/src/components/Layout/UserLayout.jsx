import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileNav from "./MobileNav.jsx";
import WelcomeAnimation from "../common/WelcomeAnimation.jsx";

const UserLayout = () => {
  const [welcomeDone, setWelcomeDone] = useState(false);

  return (
    <>
      {/* Welcome Animation - only on first open per session */}
      <WelcomeAnimation onComplete={() => setWelcomeDone(true)} />

      <div className="flex h-screen bg-gray-50 dark:bg-transparent overflow-hidden relative">
        {/* Floating Background Orbs (dark mode) */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Sidebar for desktop */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative z-10">
          <div className={welcomeDone ? "page-enter" : ""}>
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav for mobile */}
        <MobileNav />
      </div>
    </>
  );
};

export default UserLayout;