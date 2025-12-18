import "./CoachSelector.css";

function CoachSelector({ coaches, selectedCoach, onSelectCoach, availability }) {
  return (
    <div className="coach-card">
      <h3>Select Coach</h3>
      {coaches.map(coach => {
  const isBooked = availability.booked_coaches.includes(coach.id);
  return (
    <label
      className={`coach-option ${isBooked ? "disabled" : ""}`}
      key={coach.id}
    >
      <input
        type="radio"
        name="coach"
        checked={selectedCoach?.id === coach.id}
        onChange={() => !isBooked && onSelectCoach(coach)}
        disabled={isBooked}
      />
      {coach.name} {isBooked && "(Booked)"}
    </label>
  );
})}

    </div>
  );
}

export default CoachSelector;
