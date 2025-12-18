import "./CourtSelector.css";

function CourtSelector({ courts, selectedCourt, onSelectCourt, availability }) {
  return (
    <div className="court-card">
      <h3>Select Court</h3>
      {courts.map(court => {
  const isBooked = availability.booked_courts.includes(court.id);
  return (
    <label
      className={`court-option ${isBooked ? "disabled" : ""}`}
      key={court.id} >
      <input
        type="radio"
        name="court"
        checked={selectedCourt?.id === court.id}
        onChange={() => !isBooked && onSelectCourt(court)}
        disabled={isBooked}
      />
      {court.name} ({court.type}) {isBooked && "(Booked)"}
    </label>
  );
})}

    </div>
  );
}

export default CourtSelector;
