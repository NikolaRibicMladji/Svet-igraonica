import React from "react";
import { Link } from "react-router-dom";
import "../styles/BookingSuccess.css";

const BookingSuccess = () => {
  return (
    <div className="container success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Rezervacija uspešna!</h1>
        <p>Potvrda rezervacije je poslata na vaš email.</p>
        <p>Hvala vam što koristite Svet Igraonica!</p>
        <Link to="/playrooms" className="btn-primary">
          Pogledaj druge igraonice
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
