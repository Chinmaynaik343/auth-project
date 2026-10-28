
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupSuccess, logout } from "./index.jsx";

function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (accessToken) {
      navigate("/profile", { replace: true });
    }
  }, [accessToken, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email || !formData.password) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const user = {
      name,
      email,
      password: formData.password
    };

    const accessToken =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);

      dispatch(
        signupSuccess({
          user,
          accessToken
        })
      );

      setSuccess("Signup successful! Redirecting to your profile...");

      navigate("/profile", {
        replace: true,
        state: {
          successMessage:
            "Signup successful! Welcome to your profile."
        }
      });
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setError("Unable to save your details. Please try again.");
    }
  }

  return (
    <main className="page-container">
      <section className="auth-card">
        <div className="brand-icon">A</div>

        <h1>Create your account</h1>
        <p className="subtitle">
          Sign up to get started with your profile.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
            <small>Use at least 6 characters.</small>
          </div>

          {error && (
            <p className="message error-message" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="message success-message" role="status">
              {success}
            </p>
          )}

          <button className="primary-button" type="submit">
            Create Account
          </button>
        </form>

        <p className="footer-text">
          Your profile will be created after signup.
        </p>
      </section>
    </main>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, accessToken } = useSelector(
    (state) => state.auth
  );

  const [success, setSuccess] = useState(
    location.state?.successMessage || ""
  );

  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/", { replace: true });
    }
  }, [accessToken, user, navigate]);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    dispatch(logout());

    navigate("/", {
      replace: true,
      state: { loggedOut: true }
    });
  }

  if (!accessToken || !user) {
    return null;
  }

  return (
    <main className="page-container">
      <section className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1>My Profile</h1>
            <p className="subtitle">
              Your account information
            </p>
          </div>
        </div>

        {success && (
          <p className="message success-message" role="status">
            {success}
          </p>
        )}

        <div className="profile-details">
          <div className="detail-row">
            <span>Full Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="detail-row">
            <span>Email Address</span>
            <strong>{user.email}</strong>
          </div>

          <div className="detail-row">
            <span>Account Status</span>
            <strong className="status-active">Active</strong>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const [loggedOut, setLoggedOut] = useState(
    Boolean(location.state?.loggedOut)
  );

  useEffect(() => {
    if (location.state?.loggedOut) {
      setLoggedOut(true);
      navigateToSignupStateCleanup();
    }

    function navigateToSignupStateCleanup() {
      window.history.replaceState({}, document.title, "/");
    }
  }, [location]);

  return (
    <>
      {loggedOut && location.pathname === "/" && (
        <div className="logout-notice">
          You have been logged out successfully.
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setLoggedOut(false)}
          >
            ×
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
