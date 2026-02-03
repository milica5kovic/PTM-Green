import React from "react";
import { useNavigate } from "react-router-dom";
import { usePTM } from "../context/PTMContext";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HomePage = () => {
  const navigate = useNavigate();
  const { yearGroups, ptmSettings, bookings, isBookingOpen } = usePTM();

  // My Bookings Summary
  const MyBookingsSummary = () => {
    const parentEmail = localStorage.getItem("ptm_parent_email");
    if (!parentEmail) return null;

    const myBookings = bookings.filter(
      (b) => b.parentEmail.toLowerCase() === parentEmail.toLowerCase(),
    );

    if (myBookings.length === 0) return null;

    const downloadMyPDF = () => {
      const doc = new jsPDF();
      const firstBooking = myBookings[0];

      doc.setFontSize(20);
      doc.text("Parent-Teacher Meeting Schedule", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Parent: ${firstBooking.parentName}`, 20, 40);
      doc.text(`Student: ${firstBooking.studentName}`, 20, 50);
      doc.text(`Email: ${firstBooking.parentEmail}`, 20, 60);
      doc.text(`Date: ${ptmSettings.date}`, 20, 70);

      const tableData = myBookings
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
        .map((b) => {
          const endTime = new Date(`2000-01-01T${b.timeSlot}`);
          endTime.setMinutes(endTime.getMinutes() + ptmSettings.slotDuration);
          return [
            b.teacherName,
            b.yearGroup,
            b.timeSlot,
            endTime.toTimeString().substring(0, 5),
          ];
        });

      doc.autoTable({
        startY: 80,
        head: [["Teacher", "Year", "Start Time", "End Time"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
      });

      doc.save(`PTM-Schedule-${firstBooking.studentName}.pdf`);
    };

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-blue-900">Your Current Bookings</h4>
          <button
            onClick={downloadMyPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Download PDF
          </button>
        </div>
        <div className="space-y-2">
          {myBookings
            .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
            .map((b) => (
              <div
                key={b.id}
                className="text-sm bg-white p-2 rounded border-l-4 border-blue-400"
              >
                <span className="font-semibold">{b.teacherName}</span> (
                {b.yearGroup}) - {b.timeSlot}
              </div>
            ))}
        </div>
      </div>
    );
  };

  // If booking is closed
  if (!isBookingOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border-t-4 border-green-600">
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="data:image/png;base64,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"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-green-900">
                  Parent Teacher Meeting
                </h1>
                <h2 className="text-xl font-semibold text-green-700 mt-1">
                  Booking System
                </h2>
              </div>
              <div className="w-20"></div>
            </div>
          </div>

          {/* Closed Notice */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Booking Period Closed
            </h2>
            <p className="text-gray-600 mb-6">
              The booking period for Parent-Teacher Meetings ended on{" "}
              {ptmSettings.date
                ? new Date(ptmSettings.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "the scheduled date"}{" "}
              at 12:00 PM.
            </p>

            <p className="text-gray-700 font-medium mb-2">
              PTM Date:{" "}
              {ptmSettings.date
                ? new Date(ptmSettings.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "TBA"}
            </p>
            <p className="text-gray-700 font-medium">
              Time: {ptmSettings.startTime} - {ptmSettings.endTime}
            </p>
          </div>

          {/* My Bookings if exists */}
          <MyBookingsSummary />

          {/* Staff Access */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Staff Access
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/admin")}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Admin Login
              </button>
              <button
                onClick={() => navigate("/teacher")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Teacher Login
              </button>
            </div>
          </div>

          <footer className="text-center text-gray-600 text-sm mt-8">
            <p>Made with ❤️ by Milica Petkovic</p>
          </footer>
        </div>
      </div>
    );
  }

  // Normal booking page (before deadline)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="data:image/png;base64,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"
                alt="Green School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-green-900">
                Parent Teacher Meeting
              </h1>
              <h2 className="text-xl font-semibold text-green-700 mt-1">
                Booking System
              </h2>
            </div>
            <div className="w-20"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium">
              📅{" "}
              {ptmSettings.date
                ? new Date(ptmSettings.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Date TBA"}{" "}
              | 🕐 {ptmSettings.startTime} - {ptmSettings.endTime}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-2.5 rounded-lg font-medium transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              🔐 Admin View
            </button>
            <button
              onClick={() => navigate("/teacher")}
              className="px-6 py-2.5 rounded-lg font-medium transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              👨‍🏫 Teacher View
            </button>
          </div>
        </div>

        <MyBookingsSummary />

        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Select Your Child's Year Group
            </h3>
            <p className="text-gray-600 mb-4">
              Choose the year group to view available teachers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {yearGroups.map((year) => (
              <button
                key={year.id}
                onClick={() => navigate(`/booking/${year.id}`)}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-2xl transition-all hover:scale-105 border-2 border-transparent hover:border-green-500"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {year.id}
                </div>
                <div className="text-gray-700 font-medium">{year.name}</div>
              </button>
            ))}
          </div>
        </div>

        <footer className="text-center text-gray-600 text-sm mt-8">
          <p>Made with ❤️ by Milica Petkovic</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
