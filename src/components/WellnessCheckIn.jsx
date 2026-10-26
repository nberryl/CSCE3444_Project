jsx
import { useState } from "react";

const QUESTIONS = [
  { id: "scalp", label: "How does your scalp feel?", options: ["Fine", "Dry", "Sensitive"] },
  { id: "stress", label: "Stress level this week?", options: ["Low", "Medium", "High"] },
  { id: "concern", label: "Main hair concern?", options: ["Breakage", "Dryness", "Growth", "None"] },
];

export default function WellnessCheckIn() {
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: attach answers to the appointment record in the database
    console.log({ answers, notes });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Wellness Check-In</h2>

      {QUESTIONS.map((q) => (
        <div key={q.id}>
          <p>{q.label}</p>
          {q.options.map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name={q.id}
                value={opt}
                onChange={() => setAnswers({ ...answers, [q.id]: opt })}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      <textarea
        placeholder="Anything else your stylist should know? (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button type="submit">Submit Check-In</button>
    </form>
  );
}
