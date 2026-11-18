
import { useState, type FormEvent } from "react";

type User = {
  name: string;
  email: string;
};

type Mode = "login" | "register" | "forgot";

export default function UserAuth() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setMessage(
        "Password reset requests are not available until the backend is connected."
      );
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setMessage("Please enter your full name.");
        return;
      }

      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }

      // Frontend demo only. No real account is created.
      setUser({ name: name.trim(), email: cleanEmail });
      setPassword("");
      setConfirmPassword("");
      setMessage("Demo profile created. No account was saved.");
      return;
    }

    // Real login requires an authentication backend.
    setMessage(
      "Login form validated. Authentication is not connected yet."
    );
  }

  function logout() {
    setUser(null);
    setPassword("");
    setMessage("Demo profile closed.");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    boxSizing: "border-box" as const,
  };

  const buttonStyle = {
    padding: "12px",
    background: "#6d28d9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <section
      aria-label="User account"
      style={{
        maxWidth: "440px",
        margin: "60px auto",
        padding: "30px",
        borderRadius: "16px",
        background: "white",
        color: "#18181b",
        boxShadow: "0 4px 24px #00000015",
      }}
    >
      <h2 style={{ color: "#6d28d9" }}>Proxicut Account</h2>

      {user ? (
        <div>
          <h3>Welcome, {user.name}!</h3>
          <p>Email: {user.email}</p>
          <p>This is a temporary demo profile.</p>
          <button type="button" style={buttonStyle} onClick={logout}>
            Log Out
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => changeMode("login")}
              aria-pressed={mode === "login"}
            >
              Login
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => changeMode("register")}
              aria-pressed={mode === "register"}
            >
              Register
            </button>
          </div>

          <h3>
            {mode === "login"
              ? "Log In"
              : mode === "register"
                ? "Create Account"
                : "Forgot Password"}
          </h3>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            {mode !== "forgot" && (
              <>
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={8}
                  required
                />
              </>
            )}

            {mode === "register" && (
              <>
                <label htmlFor="auth-confirm">Confirm Password</label>
                <input
                  id="auth-confirm"
                  type="password"
                  style={inputStyle}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </>
            )}

            <button
              type="submit"
              style={{ ...buttonStyle, width: "100%" }}
            >
              {mode === "login"
                ? "Log In"
                : mode === "register"
                  ? "Create Account"
                  : "Request Password Reset"}
            </button>
          </form>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => changeMode("forgot")}
              style={{
                marginTop: "16px",
                background: "none",
                border: "none",
                color: "#6d28d9",
                textDecoration: "underline",
              }}
            >
              Forgot Password?
            </button>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => changeMode("login")}
              style={{
                marginTop: "16px",
                background: "none",
                border: "none",
                color: "#6d28d9",
                textDecoration: "underline",
              }}
            >
              Back to Login
            </button>
          )}
        </>
      )}

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}
    </section>
  );
}
