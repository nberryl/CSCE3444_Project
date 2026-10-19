import { useState } from "react";
export default function ProfileCustomization() {
  const [name, setName] = useState("");

return (
  <div>
    <h2>My Profile</h2>

    <input
      placeholder="Enter your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <button disabled>Save Profile (Coming Soon)</button>

    <h3>Appointment History</h3>
    <p>No appointments to display yet.</p>
        </div>
        );
}
