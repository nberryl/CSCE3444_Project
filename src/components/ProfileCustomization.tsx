
import { useState, type FormEvent } from "react";

type Appointment = {
  id: number;
  service: string;
  stylist: string;
  date: string;
  status: string;
};

const sampleAppointments: Appointment[] = [
  {
    id: 1,
    service: "Haircut",
    stylist: "Alex Morgan",
    date: "October 15, 2026",
    status: "Completed",
  },
  {
    id: 2,
    service: "Hair Coloring",
    stylist: "Jordan Kim",
    date: "November 20, 2026",
    status: "Upcoming",
  },
];

export default function ProfileCustomization() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savedProfile, setSavedProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavedProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    setMessage("Profile saved successfully (demo only).");
  }

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    marginBottom: "15px",
    border: "1px solid #aaa",
    borderRadius: "8px",
    boxSizing: "border-box" as const,
  };

  return (
    <section
      style={{
        maxWidth: "650px",
        margin: "50px auto",
        padding: "30px",
        background: "white",
        color: "#18181b",
        borderRadius: "16px",
        boxShadow: "0 4px 24px #00000015",
      }}
    >
      <h2 style={{ color: "#6d28d9" }}>My Profile</h2>
      <p>Update your information and view your appointments.</p>

      <form onSubmit={saveProfile}>
        <label htmlFor="profile-name">Full Name</label>
        <input
          id="profile-name"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="profile-email">Email Address</label>
        <input
          id="profile-email"
          type="email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="profile-phone">Phone Number</label>
        <input
          id="profile-phone"
          type="tel"
          style={inputStyle}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
        />

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            background: "#6d28d9",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Save Profile
        </button>
      </form>

      {message && (
        <p role="status" aria-live="polite">
          {message}
        </p>
      )}

      {savedProfile.name && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            background: "#f5f3ff",
            borderRadius: "8px",
          }}
        >
          <h3>Saved Profile</h3>
          <p>Name: {savedProfile.name}</p>
          <p>Email: {savedProfile.email}</p>
          <p>Phone: {savedProfile.phone || "Not provided"}</p>
        </div>
      )}

      <section style={{ marginTop: "35px" }}>
        <h3>Appointment History</h3>
        <p>Example appointments for demonstration:</p>

        {sampleAppointments.map((appointment) => (
          <article
            key={appointment.id}
            style={{
              padding: "15px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "10px",
            }}
          >
            <strong>{appointment.service}</strong>
            <p>Stylist: {appointment.stylist}</p>
            <p>Date: {appointment.date}</p>
            <p>Status: {appointment.status}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
