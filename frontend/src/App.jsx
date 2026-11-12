
import { useEffect, useState } from "react";
import "./App.css";
const doctors = [
  {
    id: 1,
    name: "Dr. Ravi Kumar",
    specialization: "Cardiologist"
  },
  {
    id: 2,
    name: "Dr. Priya",
    specialization: "Dermatologist"
  },
  {
    id: 3,
    name: "Dr. Suresh",
    specialization: "Neurologist"
  },
  {
    id: 4,
    name: "Dr. Lakshmi",
    specialization: "General Physician"
  }
];
function App() {

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({
    patient_name: "",
    age: "",
    gender: "",
    phone: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    symptoms: ""
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Load doctors and appointments
  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/doctors"
      );

      if (!response.ok) {
        throw new Error("Unable to load doctors");
      }

      const data = await response.json();
      setDoctors(data);

    } catch (err) {
      setError(err.message);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/appointments"
      );

      if (!response.ok) {
        throw new Error("Unable to load appointments");
      }

      const data = await response.json();
      setAppointments(data);

    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Book appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setResult(data);

      setForm({
        patient_name: "",
        age: "",
        gender: "",
        phone: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        symptoms: ""
      });

      loadAppointments();

    } catch (err) {
      setError(err.message);
    }
  };

  // Cancel appointment
  const cancelAppointment = async (id) => {

    try {
      const response = await fetch(
        `http://localhost:5000/appointments/${id}/cancel`,
        {
          method: "PATCH"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setError("");
      loadAppointments();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">

      <h1>Online Doctor Appointment Management System</h1>

      <h2>Book Your Appointment</h2>
<h2>Available Doctors</h2>

{doctors.map((doctor) => (
  <div key={doctor.id}>
    <h3>{doctor.name}</h3>
    <p>{doctor.specialization}</p>
  </div>
))}
      <form onSubmit={handleSubmit}>

        <label>Patient Name</label>
        <input
          type="text"
          name="patient_name"
          value={form.patient_name}
          onChange={handleChange}
          placeholder="Enter Patient Name"
          required
        />

        <label>Age</label>
        <input
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          min="1"
          max="120"
          placeholder="Enter Age"
          required
        />

        <label>Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter 10-digit Phone Number"
          pattern="[0-9]{10}"
          maxLength="10"
          required
        />

        <label>Select Doctor</label>
        <select
          name="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Doctor</option>

          {doctors.map((doctor) => (
            <option
              key={doctor.doctor_id}
              value={doctor.doctor_id}
            >
              {doctor.doctor_name} - {doctor.specialization}
            </option>
          ))}

        </select>

        <label>Appointment Date</label>
        <input
          type="date"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
          min={new Date().toLocaleDateString("en-CA")}
          required
        />

        <label>Appointment Time</label>
        <select
          name="appointment_time"
          value={form.appointment_time}
          onChange={handleChange}
          required
        >
          <option value="">Select Time</option>
          <option value="09:00">09:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="14:00">02:00 PM</option>
          <option value="15:00">03:00 PM</option>
          <option value="16:00">04:00 PM</option>
          <option value="17:00">05:00 PM</option>
        </select>

        <label>Symptoms / Reason for Visit</label>
        <textarea
          name="symptoms"
          value={form.symptoms}
          onChange={handleChange}
          placeholder="Enter reason for appointment"
        />

        <button type="submit">
          Book Appointment
        </button>

      </form>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <div className="result">
          <h2>Appointment Confirmation</h2>

          <p>
            <b>Appointment ID:</b> {result.appointment_id}
          </p>

          <p>
            <b>Patient Name:</b> {result.patient_name}
          </p>

          <p>
            <b>Appointment Date:</b> {result.appointment_date}
          </p>

          <p>
            <b>Appointment Time:</b> {result.appointment_time}
          </p>

          <p>
            <b>Status:</b> {result.status}
          </p>
        </div>
      )}

      <h2>All Appointments</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.appointment_id}>
                <td>{appointment.appointment_id}</td>
                <td>{appointment.patient_name}</td>
                <td>{appointment.doctor_name}</td>
                <td>
                  {String(appointment.appointment_date).slice(0, 10)}
                </td>
                <td>{appointment.appointment_time}</td>
                <td>{appointment.status}</td>
                <td>
                  {appointment.status === "Booked" && (
                    <button
                      className="cancel"
                      onClick={() =>
                        cancelAppointment(appointment.appointment_id)
                      }
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan="7">No appointments available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;
