import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePTM } from '../context/PTMContext';
import { ArrowLeft, User, Mail, GraduationCap, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const BookingPage = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const {
    getTeachersForYear,
    generateTimeSlots,
    isSlotBooked,
    createBooking,
    yearGroups,
    ptmSettings,
    loadBookings
  } = usePTM();

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Teacher, 2: Time, 3: Details, 4: Confirm
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const yearGroup = yearGroups.find(y => y.id === year);
  const teachers = getTeachersForYear(year);
  const timeSlots = generateTimeSlots();

// Load saved parent data from localStorage
useEffect(() => {
  const savedName = localStorage.getItem('ptm_parent_name');
  const savedEmail = localStorage.getItem('ptm_parent_email');
  const savedStudent = localStorage.getItem('ptm_student_name');
  
  if (savedName) setParentName(savedName);
  if (savedEmail) setParentEmail(savedEmail);
  if (savedStudent) setStudentName(savedStudent);
}, []);

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedSlot(null);
    setBookingStep(2);
    setError('');
  };

  const handleSlotSelect = (slot) => {
    if (isSlotBooked(selectedTeacher.id, slot)) {
      setError('This slot is already booked!');
      return;
    }
    setSelectedSlot(slot);
    setBookingStep(3);
    setError('');
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!parentName || !parentEmail || !studentName) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    // Save parent data to localStorage
localStorage.setItem('ptm_parent_name', parentName);
localStorage.setItem('ptm_parent_email', parentEmail);
localStorage.setItem('ptm_student_name', studentName);

    const bookingData = {
      yearGroup: year,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      timeSlot: selectedSlot,
      parentName,
      parentEmail,
      studentName,
      createdAt: new Date().toISOString()
    };

    const result = await createBooking(bookingData);

    if (result.success) {
      setSuccess('Booking confirmed! You will receive a confirmation email shortly.');
      setBookingStep(4);
      // Reset form
      setTimeout(() => {
        setBookingStep(1);
        setSelectedTeacher(null);
        setSelectedSlot(null);
        setParentName('');
        setParentEmail('');
        setStudentName('');
        setSuccess('');
      }, 3000);
    } else {
      setError(result.error || 'Failed to create booking');
    }

    setIsSubmitting(false);
  };

  const getEndTime = (startTime) => {
    const end = new Date(`2000-01-01T${startTime}`);
    end.setMinutes(end.getMinutes() + ptmSettings.slotDuration);
    return end.toTimeString().substring(0, 5);
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Year Selection
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${colorClasses[yearGroup?.color]} rounded-2xl flex items-center justify-center text-white text-2xl font-bold`}>
                {year}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{yearGroup?.name}</h1>
                <p className="text-gray-600">Book appointments with your teachers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {['Teacher', 'Time Slot', 'Your Details', 'Confirm'].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    bookingStep > index + 1 ? 'bg-emerald-500 text-white' :
                    bookingStep === index + 1 ? 'bg-emerald-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {bookingStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    bookingStep >= index + 1 ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`h-px w-12 ${bookingStep > index + 1 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-2">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-700">{success}</p>
          </div>
        )}

        {/* Step 1: Teacher Selection */}
        {bookingStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Teacher</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => handleTeacherSelect(teacher)}
                  className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                      <User size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-600">{teacher.subject}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time Slot Selection */}
        {bookingStep === 2 && selectedTeacher && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="mb-6">
              <button
                onClick={() => {
                  setBookingStep(1);
                  setSelectedTeacher(null);
                }}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                ← Change Teacher
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                Select Time Slot with {selectedTeacher.name}
              </h2>
              <p className="text-gray-600 text-sm">{selectedTeacher.subject}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => {
                const booked = isSlotBooked(selectedTeacher.id, slot);
                return (
                  <button
                    key={slot}
                    onClick={() => !booked && handleSlotSelect(slot)}
                    disabled={booked}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      booked
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-emerald-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock size={16} className={booked ? 'text-gray-400' : 'text-emerald-600'} />
                      <span className="font-semibold text-sm">{slot}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {getEndTime(slot)}
                    </div>
                    {booked && (
                      <div className="text-xs text-red-600 mt-1 font-medium">Booked</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Parent Details */}
        {bookingStep === 3 && selectedTeacher && selectedSlot && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
            <div className="mb-6">
              <button
                onClick={() => {
                  setBookingStep(2);
                  setSelectedSlot(null);
                }}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                ← Change Time Slot
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mt-2">Your Details</h2>
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-600">Booking with:</p>
                <p className="font-semibold text-gray-800">{selectedTeacher.name}</p>
                <p className="text-sm text-emerald-700 font-medium mt-1">
                  {selectedSlot} - {getEndTime(selectedSlot)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="john.doe@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {bookingStep === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium shadow-lg"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
