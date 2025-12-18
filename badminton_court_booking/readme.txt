Setup Instructions:

Backend Setup:
cd backend
pip install -r requirements.txt
python app.py

Frontend Setup:
cd frontend
npm install
npm run dev

Seed Data
Courts: 2 indoor, 2 outdoor
Equipment: Rackets (5), Shoes (10)
Coaches: 3 coaches
Pricing Rules: Applied dynamically in frontend logic


Short Write-Up:

Database Design & Pricing Engine Approach

The database design focuses on simplicity, clarity, and scalability while supporting multi-resource bookings. SQLite is used as the database to enable quick setup without requiring external dependencies, making it suitable for rapid development and assessment purposes.

The core entities in the system are Courts, Equipment, Coaches, and Bookings. Each court has a type attribute (indoor or outdoor), allowing pricing differentiation. Equipment is modeled with a quantity field to track limited inventory. Coaches are represented as independent resources that can only be booked once per time slot.

The Booking table acts as the central entity, storing the booking date, time slot, selected court, optional coach, and total price. 

Availability is handled dynamically by querying bookings for a selected date and time slot. For courts and coaches, the system checks whether an existing booking already uses the same resource at the same time. If so, the resource is marked unavailable and disabled in the frontend UI. For equipment, the system aggregates the number of times each equipment item has been booked and compares it with the total available quantity, ensuring that equipment cannot be overbooked.

The pricing engine is designed to be rule-based and composable. A base price is applied for court booking, with additional charges stacked based on configurable conditions. Indoor courts attract a premium. Peak hours (6–9 PM) and weekends apply additional surcharges. Optional resources such as equipment and coaches add fixed costs on top of the court price. These rules are applied cumulatively, allowing multiple pricing factors to affect the final price.

Pricing is calculated in real time on the frontend to provide immediate feedback to the user and is stored in the backend when the booking is confirmed. The backend ensures atomicity by validating availability before persisting the booking, preventing double bookings even during concurrent attempts.

Overall, the design cleanly separates concerns, ensures data consistency, and provides a flexible foundation for future enhancements such as admin-configurable pricing rules, authentication, and waitlist functionality.
