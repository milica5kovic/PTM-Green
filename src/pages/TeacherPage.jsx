import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePTM } from '../context/PTMContext';
import { ArrowLeft, Lock, Eye, EyeOff, User, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TeacherPage = () => {
  const navigate = useNavigate();
  const {
    teacherLoggedIn,
    teacherLogin,
    teacherLogout,
    bookings,
    loadBookings,
    allTeachers,
    ptmSettings
  } = usePTM();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    if (teacherLoggedIn) {
      loadBookings();
    }
  }, [teacherLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (teacherLogin(password)) {
      setError('');
      setPassword('');
    } else {
      setError('Invalid password');
    }
  };

  const getTeacherBookings = (teacherId) => {
    return bookings
      .filter((b) => b.teacherId === teacherId)
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  };

  const getEndTime = (startTime) => {
    const end = new Date(`2000-01-01T${startTime}`);
    end.setMinutes(end.getMinutes() + ptmSettings.slotDuration);
    return end.toTimeString().substring(0, 5);
  };

  const generateTeacherPDF = () => {
    if (!selectedTeacher) return;

    const teacherBookings = getTeacherBookings(selectedTeacher.id);
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Parent-Teacher Meeting Schedule', 105, 20, { align: 'center' });

    // Teacher details
    doc.setFontSize(12);
    doc.text(`Teacher: ${selectedTeacher.name}`, 20, 40);
    doc.text(`Subject: ${selectedTeacher.subject}`, 20, 50);
    doc.text(`Date: ${ptmSettings.date}`, 20, 60);
    doc.text(`Total Bookings: ${teacherBookings.length}`, 20, 70);

    // Table
    const tableData = teacherBookings.map(b => [
      b.timeSlot,
      getEndTime(b.timeSlot),
      b.parentName,
      b.studentName,
      b.yearGroup
    ]);

    doc.autoTable({
      startY: 80,
      head: [['Start Time', 'End Time', 'Parent', 'Student', 'Year']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] }
    });

    doc.save(`PTM-Schedule-${selectedTeacher.name.replace(/\s+/g, '-')}.pdf`);
  };

if (!teacherLoggedIn) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 border border-green-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <User size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Access</h1>
          <p className="text-gray-600 mt-2">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Teacher Dashboard</h1>
                <p className="text-gray-600">View your PTM bookings</p>
              </div>
            </div>
            <button
              onClick={teacherLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Teacher Selection */}
        {!selectedTeacher ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">Select Your Name</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allTeachers.map((teacher) => {
                const teacherBookings = getTeacherBookings(teacher.id);
                return (
                  <button
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.subject}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {teacherBookings.length} {teacherBookings.length === 1 ? 'booking' : 'bookings'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Teacher Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-900">{selectedTeacher.name}</h2>
                  <p className="text-gray-600">{selectedTeacher.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getTeacherBookings(selectedTeacher.id).length} appointments
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Change Teacher
                </button>
              </div>

              {/* Download Button */}
              {getTeacherBookings(selectedTeacher.id).length > 0 && (
                <button
                  onClick={generateTeacherPDF}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download My Schedule (PDF)
                </button>
              )}
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-green-900 mb-4">Your Bookings</h3>

              {getTeacherBookings(selectedTeacher.id).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getTeacherBookings(selectedTeacher.id).map((booking, index) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">
                            {booking.timeSlot} - {getEndTime(booking.timeSlot)}
                          </span>
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">
                            {booking.yearGroup}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{booking.parentName}</span> - Student: {booking.studentName}
                        </div>
                        <div className="text-xs text-gray-500">{booking.parentEmail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPage;