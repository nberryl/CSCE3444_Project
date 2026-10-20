jsx
// First version: pre-written tips mapped to each service.
// AI-generated tips are out of scope for now.
const TIPS = {
  "Silk Press": [
    "Wrap your hair at night with a silk scarf or bonnet.",
    "Avoid washing for 1–2 weeks to keep the style.",
  ],
  Braids: [
    "Moisturize your scalp a few times a week.",
    "Keep braids dry and avoid heavy products.",
  ],
  Color: [
    "Use sulfate-free, color-safe shampoo.",
    "Wash with cooler water to keep color longer.",
  ],
  // TODO: add tips for the remaining services
};

export default function AftercareTips({ service }) {
  const tips = TIPS[service] || [];

  return (
    <div>
      <h2>Aftercare Tips for {service}</h2>
      {tips.length === 0 ? (
        <p>Tips coming soon!</p>
      ) : (
        <ul>
          {tips.map((tip) => <li key={tip}>{tip}</li>)}
        </ul>
      )}
    </div>
  );
}
