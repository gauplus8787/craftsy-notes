import { useState } from "react";
import { Outlet } from "react-router-dom";
import KeepHeader from "./KeepHeader";
import KeepSidebar from "./KeepSidebar";

const KeepLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <KeepHeader onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)} />
      <div className="flex">
        <KeepSidebar expanded={sidebarExpanded} />
        <main className="flex-1 p-4 sm:p-8 transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KeepLayout;
