import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();

  // Hide the regular sidebar completely for admin users
  if (user?.role === "admin") {
    return null;
  }

  const links = [
    { to: "/app/dashboard", label: "Dashboard" },
    { to: "/app/gardens", label: "Gardens" },
    { to: "/app/plants", label: "Plants" },
    { to: "/app/diagnose", label: "Diagnose" },
    { to: "/app/crops", label: "Crop AI" },
    { to: "/app/watering", label: "Watering" },
    { to: "/app/schedule", label: "Schedule" },
    { to: "/app/community", label: "Community" },
    { to: "/app/profile", label: "Profile" },
  ];

  return (
    <aside className="sidebar">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
