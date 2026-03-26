import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import "../styles/MyBookings.css";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const result = await getMyBookings();
    if (result.success) {
      setBookings(result.data);
    }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (
      window.confirm("Da li ste sigurni da želite da otkažete ovu rezervaciju?")
    ) {
      const result = await cancelBooking(id);
      if (result.success) {
        loadBookings();
      } else {
        alert(result.error);
      }
    }
  };

  const handleWriteReview = (playroomId) => {
    // Navigira na stranicu igraonice i skroluje do recenzija
    navigate(`/playrooms/${playroomId}#reviews`);
    // Mali delay da se stranica učita pa skrol
    setTimeout(() => {
      const element = document.getElementById("reviews-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
  };

  const getStatusText = (status) => {
    const statusMap = {
      cekiranje: {
        text: "⏳ Čeka potvrdu",
        class: "status-pending",
        clickable: false,
      },
      potvrdjeno: {
        text: "✅ Potvrđeno",
        class: "status-confirmed",
        clickable: false,
      },
      otkazano: {
        text: "❌ Otkazano",
        class: "status-cancelled",
        clickable: false,
      },
      zavrseno: {
        text: "🎉 Završeno - Klikni da ostaviš recenziju",
        class: "status-completed",
        clickable: true,
      },
    };
    return statusMap[status] || { text: status, class: "", clickable: false };
  };

  if (loading) {
    return <div className="container loading">Učitavanje...</div>;
  }

  return (
    <div className="container my-bookings-page">
      <h1>📋 Moje rezervacije</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>Još nemate nijednu rezervaciju.</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/playrooms")}
          >
            Pogledaj igraonice
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const status = getStatusText(booking.status);
            const slot = booking.timeSlotId;
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.playroomId?.naziv}</h3>
                  <span
                    className={`status-badge ${status.class} ${status.clickable ? "clickable" : ""}`}
                    onClick={() =>
                      status.clickable &&
                      handleWriteReview(
                        booking.playroomId?._id || booking.playroomId,
                      )
                    }
                    style={
                      status.clickable
                        ? { cursor: "pointer", textDecoration: "underline" }
                        : {}
                    }
                  >
                    {status.text}
                  </span>
                </div>
                <div className="booking-details">
                  <p>
                    📍 {booking.playroomId?.adresa}, {booking.playroomId?.grad}
                  </p>
                  <p>
                    📅 Datum:{" "}
                    {new Date(booking.datum).toLocaleDateString("sr-RS")}
                  </p>
                  <p>
                    ⏰ Vreme: {booking.vremeOd} - {booking.vremeDo}
                  </p>
                  <p>👶 Broj dece: {booking.brojDece || 1}</p>
                  <p>💰 Ukupno: {booking.ukupnaCena} RSD</p>
                  {booking.napomena && <p>📝 Napomena: {booking.napomena}</p>}
                </div>
                {booking.status === "cekiranje" && (
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancel(booking._id)}
                  >
                    Otkaži rezervaciju
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
