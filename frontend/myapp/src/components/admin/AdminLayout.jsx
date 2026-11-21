import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  FiGrid, FiBarChart2, FiTruck, FiCalendar, FiUsers, FiMail, FiLogOut 
} from "react-icons/fi";
import useAuth from "../../hooks/useAuth.js";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: FiGrid, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/admin/fleet", label: "Fleet Management", icon: FiTruck },
  { to: "/admin/bookings", label: "All Bookings", icon: FiCalendar },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/messages", label: "Messages", icon: FiMail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="zipree-admin">
      <aside className="zipree-admin__sidebar">
        <div className="zipree-admin__brand">
          <span className="zipree-admin__brand-text">ZIPREE</span>
          <span className="zipree-admin__brand-badge">Admin</span>
        </div>

        <nav className="zipree-admin__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `zipree-admin__link ${isActive ? "is-active" : ""}`
              }
            >
              <item.icon className="zipree-admin__link-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="zipree-admin__footer">
          <div className="zipree-admin__user">
            <div className="zipree-admin__avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="zipree-admin__name">{user?.name}</p>
              <p className="zipree-admin__role">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="zipree-admin__logout">
            <FiLogOut /> Log Out
          </button>
        </div>
      </aside>

      <main className="zipree-admin__main">
        <div className="zipree-admin__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}