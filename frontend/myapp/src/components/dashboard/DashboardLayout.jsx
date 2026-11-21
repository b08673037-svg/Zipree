import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import "./DashboardLayout.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/bookings", label: "My Bookings" },
  { to: "/dashboard/wishlist", label: "Saved Vehicles" },
  { to: "/dashboard/notifications", label: "Notifications" },
  { to: "/dashboard/profile", label: "My Profile" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="zipree-dash">
      <aside className="zipree-dash__sidebar">
        <div className="zipree-dash__user">
          <div className="zipree-dash__avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="zipree-dash__name">{user?.name}</p>
            <p className="zipree-dash__email">{user?.email}</p>
          </div>
        </div>

        <nav className="zipree-dash__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `zipree-dash__link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="zipree-dash__logout">
          Log Out
        </button>
      </aside>

      <main className="zipree-dash__main">
        <div className="zipree-dash__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}