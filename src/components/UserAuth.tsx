
import { useState, type FormEvent } from "react";

type User = {
  name: string;
  email: string;
};

export default function UserAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    // Demo only: No real account is created or verified.
    // A backend authentication API is required.
    if (mode === "login") {
      setMessage(
        "Login form validated. Backend authentication is not connected yet."
      );
      return;
    }

    setUser({ name: name.trim(), email: email.trim() });
    setPassword("");
    setMessage(
      "Demo profile created. This account is not saved to a database."
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
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "30px",
        borderRadius: "16px",
        background: "white",
        boxShadow: "0 4px 24px #00000015",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#8128ff" }}>Proxicut</h1>
      <h2>User and Profile Management</h2>

      {user ? (
        <section>
          <h3>Welcome, {user.name}!</h3>
          <p>Email: {user.email}</p>
          <p>This is a temporary demo profile.</p>
          <button type="button" onClick={logout}>
            Close Profile
          </button>
        </section>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

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

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "#8128ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </>
      )}

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}
    </main>
  );
}
