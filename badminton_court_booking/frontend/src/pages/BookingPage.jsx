import { useState, useEffect } from "react";
import axios from "axios";
import "./BookingPage.css"

import CourtSelector from "../components/CourtSelector";
import EquipmentSelector from "../components/EquipmentSelector";
import CoachSelector from "../components/CoachSelector";
import TimeSlotSelector from "../components/TimeSlotSelector";
import BookingSummary from "../components/BookingSummary";

function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);

  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [availability, setAvailability] = useState({
  booked_courts: [],
  booked_coaches: [],
  equipment_count: {}
});

// Fetch availability whenever date or time slot changes
useEffect(() => {
  if (selectedDate && selectedTimeSlot) {
    axios.get(`https://badminton-court-booking-system-hr06.onrender.com/api/availability`, {
      params: { date: selectedDate, time_slot: selectedTimeSlot }
    }).then(res => setAvailability(res.data))
      .catch(err => console.log(err));
  } else {
    setAvailability({ booked_courts: [], booked_coaches: [], equipment_count: {} });
  }
}, [selectedDate, selectedTimeSlot]);


useEffect(() => {
  if (selectedDate) {
    axios
      .get(`https://badminton-court-booking-system-hr06.onrender.com/api/bookings/date/${selectedDate}`)
      .then((res) => setBookedSlots(res.data))
      .catch((err) => console.log(err));
  } else {
    setBookedSlots([]);
  }
}, [selectedDate]);

  // -----------------------------
  // Fetch data from backend
  // -----------------------------
  useEffect(() => {
    axios.get("https://badminton-court-booking-system-hr06.onrender.com/api/courts").then(res => setCourts(res.data));
    axios.get("https://badminton-court-booking-system-hr06.onrender.com/api/equipment").then(res => setEquipment(res.data));
    axios.get("https://badminton-court-booking-system-hr06.onrender.com/api/coaches").then(res => setCoaches(res.data));
  }, []);

  // -----------------------------
  // Helpers: peak hour & weekend
  // -----------------------------
  const isPeakHour = (timeSlot) => {
    if (!timeSlot) return false;
    return (
      timeSlot.includes("6:00") ||
      timeSlot.includes("7:00") ||
      timeSlot.includes("8:00")
    );
  };

  const isWeekend = (date) => {
    if (!date) return false;
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  // -----------------------------
  // Calculate total price
  // -----------------------------
  const calculatePrice = () => {
    let price = 0;
    if (selectedCourt) {
      price += 300;
      if (selectedCourt.type === "indoor") price += 100;
    }
    if (isPeakHour(selectedTimeSlot)) price += 150;
    if (isWeekend(selectedDate)) price += 100;
    price += selectedEquipment.length * 50;
    if (selectedCoach) price += 200;
    return price;
  };

  // -----------------------------
  // Confirm Booking (POST)
  // -----------------------------
  const confirmBooking = async () => {
    try {
      const payload = {
        date: selectedDate,
        time_slot: selectedTimeSlot,
        court_id: selectedCourt.id,
        coach_id: selectedCoach?.id || null,
        equipment_ids: selectedEquipment.map(e => e.id),
        total_price: calculatePrice()
      };

      const res = await axios.post("https://badminton-court-booking-system-hr06.onrender.com/api/bookings", payload);
      alert("Booking confirmed! ID: " + res.data.booking_id);

      // Reset selections after booking
      setSelectedDate("");
      setSelectedCourt(null);
      setSelectedTimeSlot(null);
      setSelectedEquipment([]);
      setSelectedCoach(null);

    } catch (err) {
      alert(err.response?.data?.error || "Booking failed");
    }
  };

  // -----------------------------
  // Time slots (static)
  // -----------------------------
  const timeSlots = [
    "6:00 - 7:00 PM",
    "7:00 - 8:00 PM",
    "8:00 - 9:00 PM",
    "9:00 - 10:00 PM"
  ];

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div className="page-container">
      <div className="section-card">
        <h3>Select Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <CourtSelector
        courts={courts}
        selectedCourt={selectedCourt}
        onSelectCourt={setSelectedCourt}
        availability={availability}   
      />

      <TimeSlotSelector
        timeSlots={timeSlots}
        selectedSlot={selectedTimeSlot}
        onSelectSlot={setSelectedTimeSlot}
        selectedCourt={selectedCourt}
        bookedSlots={bookedSlots}
        availability={availability}
      />


      <EquipmentSelector
        equipment={equipment}
        selectedEquipment={selectedEquipment}
        onSelectEquipment={setSelectedEquipment}
        availability={availability}
      />

      <CoachSelector
        coaches={coaches}
        selectedCoach={selectedCoach}
        onSelectCoach={setSelectedCoach}
        availability={availability}
      />

      <BookingSummary
        selectedDate={selectedDate}
        selectedCourt={selectedCourt}
        selectedTimeSlot={selectedTimeSlot}
        selectedEquipment={selectedEquipment}
        selectedCoach={selectedCoach}
        totalPrice={calculatePrice()}
        onConfirmBooking={confirmBooking}
      />
    </div>
  );
}

export default BookingPage;
