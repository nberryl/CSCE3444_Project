
import { useState, type FormEvent } from "react";

export default function AppointmentReminders() {
  const [emailOn, setEmailOn] = useState(true); // stores email reminder choice
  const [textOn, setTextOn] = useState(false); // stores text reminder choice
  const [email, setEmail] = useState(""); // stores user's email
  const [phone, setPhone] = useState(""); // stores user's phone number
  const [hours, setHours] = useState("24"); // stores reminder timing
  const [message, setMessage] = useState(""); // stores success or error message

  // Runs when the user clicks Save
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailOn && !textOn) {
      setMessage("Select at least one reminder method.");
    } else if (emailOn && !email.trim()) {
      setMessage("Enter your email.");
    } else if (textOn && !phone.trim()) {
      setMessage("Enter your phone number.");
    } else {
      setMessage("Preferences saved for this session (demo only).");
    }
  }

  // Styles for the input fields
  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    border: "1px solid #aaa",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
    fontSize: "16px",
    backgroundColor: "white",
    color: "black",
  };

  return (
    <section
      style={{
        maxWidth: 650,
        margin: "50px auto",
        padding: 30,
        background: "white",
        color: "black",
        borderRadius: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ color: "#7c3aed", fontSize: 22, fontWeight: "bold" }}>
        Appointment Reminders
      </h2>

      <p style={{ marginTop: 8, marginBottom: 25 }}>
        Choose how and when to receive reminders.
      </p>

      <form onSubmit={save}>

        {/* Email reminder checkbox */}
        <label style={{ display: "block", marginBottom: 15 }}>
          <input
            type="checkbox"
            checked={emailOn}
            onChange={e => setEmailOn(e.target.checked)}
            style={{ marginRight: 10 }}
          />
          Email Reminders
        </label>

        {/* Text reminder checkbox */}
        <label style={{ display: "block", marginBottom: 25 }}>
          <input
            type="checkbox"
            checked={textOn}
            onChange={e => setTextOn(e.target.checked)}
            style={{ marginRight: 10 }}
          />
          Text Message Reminders
        </label>

        {/* Email input field */}
        {emailOn && (
          <label style={{ display: "block", marginBottom: 20 }}>
            Email Address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />
          </label>
        )}

        {/* Phone input field */}
        {textOn && (
          <label style={{ display: "block", marginBottom: 20 }}>
            Phone Number
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
              style={inputStyle}
            />
          </label>
        )}

        {/* Reminder timing selection */}
        <label style={{ display: "block", marginBottom: 25 }}>
          When should we remind you?
          <select
            value={hours}
            onChange={e => setHours(e.target.value)}
            style={inputStyle}
          >
            <option value="24">24 hours before</option>
            <option value="48">48 hours before</option>
          </select>
        </label>

        {/* Save button */}
        <button
          type="submit"
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            padding: "14px 22px",
            borderRadius: 8,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Save Reminder Preferences
        </button>
      </form>

      {/* Success or error message */}
      <p role="status" style={{ marginTop: 15, color: "#6d28d9" }}>
        {message}
      </p>

      {/* Upcoming appointments section */}
      <div style={{ marginTop: 35 }}>
        <h3 style={{ fontSize: 19, fontWeight: "bold", marginBottom: 10 }}>
          Upcoming Appointment Reminders
        </h3>

        <p style={{ color: "#555" }}>
          Reminders will appear here when bookings are connected.
        </p>
      </div>
    </section>
  );
}
