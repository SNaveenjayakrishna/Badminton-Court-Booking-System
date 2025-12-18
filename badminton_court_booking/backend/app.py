from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

# -----------------------------
# Initialize Flask app
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# Database config (SQLite)
# -----------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///court_booking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -----------------------------
# Models
# -----------------------------
booking_equipment = db.Table('booking_equipment',
    db.Column('booking_id', db.Integer, db.ForeignKey('booking.id'), primary_key=True),
    db.Column('equipment_id', db.Integer, db.ForeignKey('equipment.id'), primary_key=True)
)

class Court(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    type = db.Column(db.String(10))  # indoor/outdoor

class Equipment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    quantity = db.Column(db.Integer)

class Coach(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    court_id = db.Column(db.Integer, db.ForeignKey('court.id'), nullable=False)
    coach_id = db.Column(db.Integer, db.ForeignKey('coach.id'), nullable=True)
    total_price = db.Column(db.Integer, nullable=False)
    equipment = db.relationship('Equipment', secondary=booking_equipment, backref='bookings')

# -----------------------------
# Create database and seed data
# -----------------------------
with app.app_context():
    db.create_all()

    # Seed data if tables are empty
    if Court.query.count() == 0:
        courts = [
            Court(name="Indoor Court 1", type="indoor"),
            Court(name="Indoor Court 2", type="indoor"),
            Court(name="Outdoor Court 1", type="outdoor"),
            Court(name="Outdoor Court 2", type="outdoor")
        ]
        db.session.add_all(courts)
        db.session.commit()

    if Equipment.query.count() == 0:
        equipment_list = [
            Equipment(name="Racket", quantity=5),
            Equipment(name="Shoes", quantity=10)
        ]
        db.session.add_all(equipment_list)
        db.session.commit()

    if Coach.query.count() == 0:
        coaches = [
            Coach(name="Coach A"),
            Coach(name="Coach B"),
            Coach(name="Coach C")
        ]
        db.session.add_all(coaches)
        db.session.commit()

# -----------------------------
# Routes
# -----------------------------

# GET all courts
@app.route("/api/courts", methods=["GET"])
def get_courts():
    courts = Court.query.all()
    return jsonify([{"id": c.id, "name": c.name, "type": c.type} for c in courts])

# GET all equipment
@app.route("/api/equipment", methods=["GET"])
def get_equipment():
    equipment = Equipment.query.all()
    return jsonify([{"id": e.id, "name": e.name, "quantity": e.quantity} for e in equipment])

# GET all coaches
@app.route("/api/coaches", methods=["GET"])
def get_coaches():
    coaches = Coach.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in coaches])

# POST create booking
@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.json
    date = data.get("date")
    time_slot = data.get("time_slot")
    court_id = data.get("court_id")
    coach_id = data.get("coach_id")
    equipment_ids = data.get("equipment_ids", [])
    total_price = data.get("total_price")

    # Check if court is already booked for that date and time
    existing = Booking.query.filter_by(date=date, time_slot=time_slot, court_id=court_id).first()
    if existing:
        return jsonify({"error": "Court already booked"}), 400

    booking = Booking(
        date=date,
        time_slot=time_slot,
        court_id=court_id,
        coach_id=coach_id,
        total_price=total_price
    )

    # Add equipment
    for eq_id in equipment_ids:
        eq = Equipment.query.get(eq_id)
        if eq:
            booking.equipment.append(eq)

    db.session.add(booking)
    db.session.commit()

    return jsonify({"message": "Booking created", "booking_id": booking.id})

# GET all bookings (optional for frontend)
@app.route("/api/bookings", methods=["GET"])
def get_bookings():
    bookings = Booking.query.all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "date": b.date,
            "time_slot": b.time_slot,
            "court": Court.query.get(b.court_id).name,
            "coach": Coach.query.get(b.coach_id).name if b.coach_id else None,
            "equipment": [e.name for e in b.equipment],
            "total_price": b.total_price
        })
    return jsonify(result)

@app.route("/api/bookings/date/<date>", methods=["GET"])
def get_bookings_by_date(date):
    bookings = Booking.query.filter_by(date=date).all()
    result = []
    for b in bookings:
        result.append({
            "time_slot": b.time_slot,
            "court_id": b.court_id
        })
    return jsonify(result)

@app.route("/api/availability")
def get_availability():
    date = request.args.get("date")
    time_slot = request.args.get("time_slot")

    if not date or not time_slot:
        return jsonify({"error": "date and time_slot required"}), 400

    # Booked courts
    booked_courts = [b.court_id for b in Booking.query.filter_by(date=date, time_slot=time_slot).all()]
    
    # Booked coaches
    booked_coaches = [b.coach_id for b in Booking.query.filter_by(date=date, time_slot=time_slot).all() if b.coach_id]

    # Booked equipment counts
    equipment_count = {}
    bookings = Booking.query.filter_by(date=date, time_slot=time_slot).all()
    for b in bookings:
        for eq in b.equipment:
            equipment_count[eq.id] = equipment_count.get(eq.id, 0) + 1

    return jsonify({
        "booked_courts": booked_courts,
        "booked_coaches": booked_coaches,
        "equipment_count": equipment_count
    })


# -----------------------------
# Run the app
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
