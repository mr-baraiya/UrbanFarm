import React from "react";
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
  RiUser3Line 
} from "react-icons/ri";
import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();

  // Hide the regular sidebar completely for admin users
  if (user?.role === "admin") {
    return null;
  }

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
    <aside className="sidebar">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="icon">{link.icon}</span>
              <span className="label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
