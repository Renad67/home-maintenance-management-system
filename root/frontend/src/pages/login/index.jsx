import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/auth.service.js";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState(""); // 🔥 NEW: State for our professional message

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg(""); // Clear info messages on new attempts
    try {
      const { user } = await login(email, password);
      if (user.role === "admin") navigate("/admin-dashboard");
      else if (user.role === "technician") navigate("/technician-dashboard");
      else navigate("/customer-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email or password is wrong.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    try {
      await register({
        name,
        email: regEmail,
        phone,
        password: regPass,
        Region: "Cairo",
        district: district || "Not Specified",
        Address: address,
        role,
      });
      alert("Account created! Please sign in.");
      setIsRightPanelActive(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div
        className={`container ${isRightPanelActive ? "right-panel-active" : ""}`}
      >
        {/* SIGN UP PANEL */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="auth-header">
              <h2>Create Account</h2>
              <p className="auth-subtitle">
                Join Maintenance System to manage your home appliances.
              </p>
            </div>

            {error && isRightPanelActive && (
              <div className="error-message">{error}</div>
            )}

            <div className="role-selector">
              <div
                className={`role-card ${role === "customer" ? "active" : ""}`}
                onClick={() => setRole("customer")}
              >
                👤 Customer
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="123 Main St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>District</label>
                <input
                  type="text"
                  placeholder="e.g. Nasr City"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="form-btn">
              Create Account →
            </button>
          </form>
        </div>

        {/* SIGN IN PANEL */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="brand-title">
              <div className="brand-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              Maintenance System
            </div>

            <div className="auth-header">
              <h2>Welcome back</h2>
              <p className="auth-subtitle">
                Enter your credentials to access your account.
              </p>
            </div>

            {/* 🔥 NEW PROFESSIONAL MESSAGES HERE 🔥 */}
            {error && !isRightPanelActive && (
              <div className="error-message">{error}</div>
            )}
            {infoMsg && !isRightPanelActive && (
              <div className="info-message">{infoMsg}</div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="password-header">
                <label>Password</label>
                {/* 🔥 UPDATED FORGOT PASSWORD LINK 🔥 */}
                <a
                  href="#"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setError(""); // Clear any red errors
                    setInfoMsg(
                      "Please contact support at 0106598755 to reset your password.",
                    );
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="password-wrapper">
                <input
                  className="password-input"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowLoginPassword((p) => !p)}
                >
                  {showLoginPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" className="form-btn">
              Sign In →
            </button>

            {/* Support Banner */}
            <div className="support-banner">
              <p>
                Need help? Call Support: <strong>0106598755</strong>
              </p>
            </div>
          </form>
        </div>

        {/* OVERLAY */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>Already have an account? Sign in here.</p>
              <button
                className="ghost"
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Join Maintenance System</h2>
              <p>Enter your details to create an account.</p>
              <button
                className="ghost"
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
