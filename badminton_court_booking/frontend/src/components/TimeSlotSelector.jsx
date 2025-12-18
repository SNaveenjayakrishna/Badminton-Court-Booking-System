import "./TimeSlotSelector.css";

function TimeSlotSelector({ timeSlots, selectedSlot, onSelectSlot, selectedCourt, bookedSlots, availability }) {
  return (
    <div className="timeslot-card">
      <h3>Select Time Slot</h3>
      {timeSlots.map((slot) => {
        const isBooked = bookedSlots.some(
          (b) => b.time_slot === slot && b.court_id === selectedCourt?.id
        );

        return (
          <label
            className={`timeslot-option ${isBooked ? "disabled" : ""}`}
            key={slot}
          >
            <input
              type="radio"
              name="timeSlot"
              checked={selectedSlot === slot}
              onChange={() => !isBooked && onSelectSlot(slot)}
              disabled={isBooked}
            />
            {slot} {isBooked && "(Booked)"}
          </label>
        );
      })}
    </div>
  );
}

export default TimeSlotSelector; 