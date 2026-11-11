// TODO: add email and text reminders

import { useState, type FormEvent } from "react";

export default function AppointmentReminders() {
  const [emailOn, setEmailOn] = useState(true);  //stores user's remider choice
  const [textOn, setTextOn] = useState(false);
  const [email, setEmail] = useState("");  //stores users email and phone number
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("24");  //stores when the reminder should happen
  const [message, setMessage] = useState("");  //store messages shwon to user

  function save(event: FormEvent<HTMLFormElement>) {   // runs when the user clicks save
    event.preventDefault();

    if (!emailOn && !textOn) {   // checks if user picke a reminder option
      setMessage("Select at least one reminder method.");
    } else if (emailOn && !email.trim()) {  // checks if email was entered
      setMessage("Enter your email.");
    } else if (textOn && !phone.trim()) {  //  checks  if phone number was entered
      setMessage("Enter your phone number.");
    } else {
      setMessage("Preferences saved for this session (demo only).");   //do the e-mails need to actually work for thr demo?     shows messege when everything is filled out
    }
  }
  // Displays everything on the page
  return (
    <section style={{
      maxWidth: 500, margin: "50px auto", padding: 30,
      background: "white", color: "black", borderRadius: 12 
    }}>
      <h2>Appointment Reminders</h2>
      <p>Choose how and when to receive reminders.</p>

      <form onSubmit={save}> 
        {
          // Lets users turn email reminders on or off
        }
        <label>
          <input type="checkbox" checked={emailOn}
            onChange={e => setEmailOn(e.target.checked)} />
          Email Reminders  
        </label>

        <br />
        {
          // Lets users turn text reminders on or off
        }
        <label>
          <input type="checkbox" checked={textOn}
            onChange={e => setTextOn(e.target.checked)} />
          Text Message Reminders
        </label>

        <br />
        {
          // Shows the email box when email reminders are selected
        }
        {emailOn && (
          <label>
            Email Address
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </label>
        )}
        {
          // Shows the phone box when text reminders are selected
        }
        {textOn && (
          <label>
            Phone Number
            <input type="tel" value={phone}
              onChange={e => setPhone(e.target.value)} required />
          </label>
        )}
        {
          // Lets users choose when to receive reminders
        }
        <p>When should we remind you?</p>
        <select value={hours} onChange={e => setHours(e.target.value)}>
          <option value="24">24 hours before</option>
          <option value="48">48 hours before</option>
        </select>

        <br /><br />
        {
          // Saves the user's reminder choices
        }
        <button type="submit">Save Reminder Preferences</button>
      </form>
      {
        // Displays a success or error message
      }
      <p role="status">{message}</p>
      {
        // Shows where future appointment reminders will appear
      }
      <h3>Upcoming Appointment Reminders</h3>
      <p>Reminders will appear here when bookings are connected.</p>
    </section>
  );
}
