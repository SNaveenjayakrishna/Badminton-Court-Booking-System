import "./BookingSummary.css";

function BookingSummary({
  selectedDate,
  selectedCourt,
  selectedTimeSlot,
  selectedEquipment,
  selectedCoach,
  totalPrice,
  onConfirmBooking,
}) {
  return (
    <div className="summary-card">
      <h4>Booking Summary</h4>
      <p><strong>Date:</strong> {selectedDate || "Not selected"}</p>
      <p><strong>Time Slot:</strong> {selectedTimeSlot || "Not selected"}</p>
      <p><strong>Court:</strong> {selectedCourt ? selectedCourt.name : "Not selected"}</p>
      <p><strong>Equipment:</strong> {selectedEquipment.length > 0 ? selectedEquipment.map(e => e.name).join(", ") : "None"}</p>
      <p><strong>Coach:</strong> {selectedCoach ? selectedCoach.name : "None"}</p>
      <p><strong>Total Price:</strong> ₹{totalPrice}</p>
      <button
        disabled={!selectedDate || !selectedCourt || !selectedTimeSlot}
        onClick={onConfirmBooking} >
        Confirm Booking
      </button>
      <p className="helper-text">*Price includes peak hour & weekend charges if applicable</p>
    </div>
  );
}

export default BookingSummary;
