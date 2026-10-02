import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiPlantLine,
  RiSeedlingLine,
  RiMicroscopeLine,
  RiSparklingLine,
  RiDropLine,
  RiCalendarEventLine,
  RiTeamLine,
  RiUser3Line,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (user?.role === "admin") return null;

  const links = [
    { to: "/app/dashboard", label: "Dashboard", icon: <RiDashboardLine /> },
    { to: "/app/gardens", label: "Gardens", icon: <RiPlantLine /> },
    { to: "/app/plants", label: "Plants", icon: <RiSeedlingLine /> },
    { to: "/app/diagnose", label: "Diagnose", icon: <RiMicroscopeLine /> },
    { to: "/app/crops", label: "Crop AI", icon: <RiSparklingLine /> },
    { to: "/app/watering", label: "Watering", icon: <RiDropLine /> },
    { to: "/app/schedule", label: "Schedule", icon: <RiCalendarEventLine /> },
    { to: "/app/community", label: "Community", icon: <RiTeamLine /> },
    { to: "/app/profile", label: "Profile", icon: <RiUser3Line /> },
  ];

  return (
    <>
      {/* Mobile hamburger floating button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle sidebar"
      >
        {open ? <RiCloseLine /> : <RiMenuLine />}
      </button>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-close-row">
          <button className="sidebar-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <RiCloseLine />
          </button>
        </div>
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setOpen(false)}
              >
                <span className="icon">{link.icon}</span>
                <span className="label">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
