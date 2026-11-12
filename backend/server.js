const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "doctor_db"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("Database connection failed");
        console.log(err);
    } else {
        console.log("MySQL connected successfully");
    }
});

// Home API
app.get("/", (req, res) => {
    res.send("Doctor Appointment API is working");
});

// Get all doctors
app.get("/doctors", (req, res) => {

    const sql = "SELECT * FROM doctors";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(result);
    });
});

// Book appointment
app.post("/appointments", (req, res) => {

    const {
        patient_name,
        age,
        gender,
        phone,
        doctor_id,
        appointment_date,
        appointment_time,
        symptoms
    } = req.body;

    // Validate input
    if (
        !patient_name || !gender || !phone ||
        !doctor_id || !appointment_date ||
        !appointment_time || age === "" || age == null
    ) {
        return res.status(400).json({
            message: "Please enter all required details"
        });
    }

    const patientAge = Number(age);

    if (!Number.isInteger(patientAge) ||
        patientAge < 1 || patientAge > 120) {
        return res.status(400).json({
            message: "Enter a valid age"
        });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
            message: "Enter a valid 10-digit phone number"
        });
    }

    // Check doctor availability
    const checkSql = `
        SELECT appointment_id
        FROM appointments
        WHERE doctor_id = ?
        AND appointment_date = ?
        AND appointment_time = ?
        AND status = 'Booked'
    `;

    db.query(
        checkSql,
        [doctor_id, appointment_date, appointment_time],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Availability checking failed"
                });
            }

            if (result.length > 0) {
                return res.status(409).json({
                    message: "This time slot is already booked. Please select another time."
                });
            }

            // Insert appointment
            const sql = `
                INSERT INTO appointments
                (patient_name, age, gender, phone,
                 doctor_id, appointment_date,
                 appointment_time, symptoms, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked')
            `;

            const values = [
                patient_name,
                patientAge,
                gender,
                phone,
                doctor_id,
                appointment_date,
                appointment_time,
                symptoms || ""
            ];

            db.query(sql, values, (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Appointment booking failed"
                    });
                }

                res.status(201).json({
                    message: "Appointment booked successfully",
                    appointment_id: result.insertId,
                    patient_name,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    status: "Booked"
                });
            });
        }
    );
});

// View all appointments
app.get("/appointments", (req, res) => {

    const sql = `
        SELECT
            a.*,
            d.doctor_name,
            d.specialization
        FROM appointments a
        JOIN doctors d
        ON a.doctor_id = d.doctor_id
        ORDER BY a.appointment_id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to fetch appointments"
            });
        }

        res.json(result);
    });
});

// Cancel appointment
app.patch("/appointments/:id/cancel", (req, res) => {

    const sql = `
        UPDATE appointments
        SET status = 'Cancelled'
        WHERE appointment_id = ?
        AND status = 'Booked'
    `;

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Cancellation failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found or already cancelled"
            });
        }

        res.json({
            message: "Appointment cancelled successfully"
        });
    });
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
