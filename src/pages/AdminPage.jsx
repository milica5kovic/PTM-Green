import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePTM } from "../context/PTMContext";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Settings,
  Users,
  Trash2,
  AlertTriangle,
  Download,
  Edit2,
  Check,
  X,
  Plus,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminPage = () => {
  const navigate = useNavigate();
  const {
    adminLoggedIn,
    adminLogin,
    adminLogout,
    bookings,
    loadBookings,
    deleteBooking,
    deleteAllBookings,
    getUniqueParentCount,
    findDoubleBookings,
    ptmSettings,
    updatePTMSettings,
    yearGroups,
    allTeachers,
    yearTeacherAssignments,
    addTeacherToYear,
    removeTeacherFromYear,
    addNewTeacher,
    getTeachersForYear,
    isBookingOpen,
    toggleBookingStatus,
  } = usePTM();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...ptmSettings });
  const [managingYear, setManagingYear] = useState(null);
  const [teacherToAdd, setTeacherToAdd] = useState("");
  const [creatingNewTeacher, setCreatingNewTeacher] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({
    name: "",
    subject: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (adminLoggedIn) {
      loadBookings();
    }
  }, [adminLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminLogin(password)) {
      setError("");
      setPassword("");
    } else {
      setError("Invalid password");
    }
  };

  const handleDeleteAllBookings = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL bookings? This cannot be undone!",
      )
    ) {
      return;
    }

    const result = await deleteAllBookings();
    if (result.success) {
      alert("All bookings deleted successfully");
    } else {
      alert("Failed to delete bookings");
    }
  };

  const handleFindDoubleBookings = () => {
    const doubles = findDoubleBookings();
    if (doubles.length === 0) {
      alert("No double bookings found!");
    } else {
      alert(
        `Found ${doubles.length} double bookings. Check console for details.`,
      );
      console.log("Double bookings:", doubles);
    }
  };

  const handleSaveSettings = () => {
    updatePTMSettings(tempSettings);
    setEditingSettings(false);
    alert("PTM settings updated successfully!");
  };

  const handleAddTeacherToYear = () => {
    if (!teacherToAdd) return;
    addTeacherToYear(managingYear, teacherToAdd);
    setTeacherToAdd("");
    alert("Teacher added successfully!");
  };

  const handleRemoveTeacherFromYear = (teacherId, teacherName) => {
    if (!window.confirm(`Remove ${teacherName} from ${managingYear}?`)) return;
    removeTeacherFromYear(managingYear, teacherId);
    alert("Teacher removed successfully!");
  };

  const handleCreateNewTeacher = () => {
    if (!newTeacherData.name || !newTeacherData.subject) {
      alert("Please fill in all fields");
      return;
    }
    const newTeacher = addNewTeacher(newTeacherData);
    setNewTeacherData({ name: "", subject: "" });
    setCreatingNewTeacher(false);
    alert(`Teacher ${newTeacher.name} created successfully!`);
  };

  const generateParentPDF = (parentEmail) => {
    const parentBookings = bookings.filter(
      (b) => b.parentEmail === parentEmail,
    );
    if (parentBookings.length === 0) return;

    const parent = parentBookings[0];
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Parent-Teacher Meeting Schedule", 105, 20, { align: "center" });

    // Parent details
    doc.setFontSize(12);
    doc.text(`Parent: ${parent.parentName}`, 20, 40);
    doc.text(`Student: ${parent.studentName}`, 20, 50);
    doc.text(`Email: ${parent.parentEmail}`, 20, 60);
    doc.text(`Date: ${ptmSettings.date}`, 20, 70);

    // Table
    const tableData = parentBookings
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
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`PTM-Schedule-${parent.studentName}.pdf`);
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.parentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.teacherName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group bookings by parent
  const groupedBookings = filteredBookings.reduce((acc, b) => {
    if (!acc[b.parentEmail]) {
      acc[b.parentEmail] = {
        parentName: b.parentName,
        parentEmail: b.parentEmail,
        studentName: b.studentName,
        bookings: [],
      };
    }
    acc[b.parentEmail].bookings.push(b);
    return acc;
  }, {});

  const [swappingBooking, setSwappingBooking] = useState(null);

  const handleSwapBooking = async (booking) => {
    if (!swappingBooking) {
      // First booking selected
      setSwappingBooking(booking);
      alert(
        `Selected: ${booking.teacherName} at ${booking.timeSlot}\nNow select another booking to swap with.`,
      );
    } else {
      // Second booking selected - perform swap
      if (swappingBooking.id === booking.id) {
        alert("Cannot swap with the same booking!");
        setSwappingBooking(null);
        return;
      }

      if (
        window.confirm(
          `Swap these bookings?\n\n` +
            `1. ${swappingBooking.teacherName} - ${swappingBooking.timeSlot}\n` +
            `2. ${booking.teacherName} - ${booking.timeSlot}`,
        )
      ) {
        try {
          // Swap time slots
          const temp = swappingBooking.timeSlot;

          await updateDoc(doc(db, "bookings", swappingBooking.id), {
            timeSlot: booking.timeSlot,
          });

          await updateDoc(doc(db, "bookings", booking.id), {
            timeSlot: temp,
          });

          alert("Bookings swapped successfully!");
          await loadBookings();
          setSwappingBooking(null);
        } catch (error) {
          alert("Failed to swap bookings: " + error.message);
          setSwappingBooking(null);
        }
      } else {
        setSwappingBooking(null);
      }
    }
  };
if (!adminLoggedIn) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 border border-green-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Lock size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Access</h1>
          <p className="text-gray-600 mt-2">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl  mx-auto">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Panel
                </h1>
                <p className="text-gray-600">
                  Manage PTM bookings and settings
                </p>
              </div>
            </div>
            <button
              onClick={adminLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        {swappingBooking && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
            <p className="font-bold text-yellow-900">
              Swapping: {swappingBooking.teacherName} at{" "}
              {swappingBooking.timeSlot}
            </p>
            <p className="text-sm text-yellow-800">
              Select another booking to swap with, or click Cancel.
            </p>
            <button
              onClick={() => setSwappingBooking(null)}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Cancel Swap
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {bookings.length}
                </p>
                <p className="text-gray-600">Total Bookings</p>
              </div>
              <Calendar size={40} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {getUniqueParentCount()}
                </p>
                <p className="text-gray-600">Unique Parents</p>
              </div>
              <Users size={40} className="text-emerald-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {allTeachers.length}
                </p>
                <p className="text-gray-600">Total Teachers</p>
              </div>
              <Users size={40} className="text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: "bookings", label: "Bookings", icon: Calendar },
              { id: "settings", label: "PTM Settings", icon: Settings },
              { id: "teachers", label: "Manage Teachers", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                {/* Admin Tools */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-yellow-900">
                        ⚠️ Admin Tools
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        Manage system-wide bookings
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleFindDoubleBookings}
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 font-medium shadow-lg flex items-center gap-2"
                      >
                        <Search size={18} />
                        Find Double Bookings
                      </button>
                      <button
                        onClick={handleDeleteAllBookings}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium shadow-lg flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete All Bookings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bookings by parent, student, or teacher..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Bookings List */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    All Parent Bookings
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      ({getUniqueParentCount()} parents)
                    </span>
                  </h3>

                  {Object.keys(groupedBookings).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Calendar
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-600">No bookings found</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.values(groupedBookings).map((parent) => (
                        <div
                          key={parent.parentEmail}
                          className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500"
                        >
                          <div className="mb-3">
                            <div className="font-semibold text-lg text-gray-800">
                              {parent.parentName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {parent.parentEmail}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Student:{" "}
                              <span className="font-medium">
                                {parent.studentName}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                {parent.bookings.length}{" "}
                                {parent.bookings.length === 1
                                  ? "booking"
                                  : "bookings"}
                              </span>
                            </div>
                          </div>

                          {parent.bookings
                            .sort((a, b) =>
                              a.timeSlot.localeCompare(b.timeSlot),
                            )
                            .map((b) => {
                              const endTime = new Date(
                                `2000-01-01T${b.timeSlot}`,
                              );
                              endTime.setMinutes(
                                endTime.getMinutes() + ptmSettings.slotDuration,
                              );
                              const endStr = endTime
                                .toTimeString()
                                .substring(0, 5);
                              return (
                                <div
                                  key={b.id}
                                  className="border-l-4 border-emerald-400 pl-3 py-1.5 mb-2 bg-emerald-50 rounded text-sm flex items-center justify-between"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {b.teacherName}
                                    </span>{" "}
                                    ({b.yearGroup}) - {b.timeSlot} - {endStr}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSwapBooking(b)}
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        swappingBooking?.id === b.id
                                          ? "bg-yellow-500 text-white"
                                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                      }`}
                                      title="Swap time slot"
                                    >
                                      {swappingBooking?.id === b.id
                                        ? "✓ Selected"
                                        : "Swap"}
                                    </button>
                                    <button
                                      onClick={() => deleteBooking(b.id)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete booking"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                          <button
                            onClick={() =>
                              generateParentPDF(parent.parentEmail)
                            }
                            className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-full font-medium shadow-md flex items-center justify-center gap-2"
                          >
                            <Download size={18} />
                            Download PDF Schedule
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
{activeTab === 'settings' && (
  <div className="space-y-6">
    {/* PTM Configuration */}
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Settings size={24} className="text-blue-600" />
        PTM Configuration
      </h3>

      {!editingSettings ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Date</p>
            <p className="text-lg font-semibold text-gray-800">{ptmSettings.date}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="text-lg font-semibold text-gray-800">{ptmSettings.startTime}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">End Time</p>
              <p className="text-lg font-semibold text-gray-800">{ptmSettings.endTime}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Slot Duration</p>
            <p className="text-lg font-semibold text-gray-800">{ptmSettings.slotDuration} minutes</p>
          </div>

          <button
            onClick={() => {
              setEditingSettings(true);
              setTempSettings({ ...ptmSettings });
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            Edit Settings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PTM Date
            </label>
            <input
              type="date"
              value={tempSettings.date}
              onChange={(e) => setTempSettings({ ...tempSettings, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={tempSettings.startTime}
                onChange={(e) =>
                  setTempSettings({ ...tempSettings, startTime: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={tempSettings.endTime}
                onChange={(e) =>
                  setTempSettings({ ...tempSettings, endTime: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Duration (minutes)
            </label>
            <input
              type="number"
              value={tempSettings.slotDuration}
              onChange={(e) =>
                setTempSettings({ ...tempSettings, slotDuration: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min="5"
              max="60"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveSettings}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingSettings(false);
                setTempSettings({ ...ptmSettings });
              }}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Booking Status Control */}
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Booking Access Control
      </h3>

      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800 text-lg">
              Booking Status: {isBookingOpen ? (
                <span className="text-green-600">OPEN</span>
              ) : (
                <span className="text-red-600">CLOSED</span>
              )}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isBookingOpen 
                ? 'Parents can currently make new bookings' 
                : 'Booking period has ended - parents can only view existing bookings'}
            </p>
          </div>
          
          <button
            onClick={toggleBookingStatus}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isBookingOpen
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isBookingOpen ? '🔒 Close Booking' : '🔓 Open Booking'}
          </button>
        </div>

        {!isBookingOpen && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> When booking is closed, parents can still access the homepage to view their existing bookings and download PDFs, but cannot make new appointments.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

            {/* Teachers Tab */}
            {activeTab === "teachers" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Manage Teacher Assignments
                  </h3>

                  {/* Year Selection */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {yearGroups.map((year) => (
                      <button
                        key={year.id}
                        onClick={() => setManagingYear(year.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          managingYear === year.id
                            ? "border-purple-500 bg-purple-100"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="font-semibold text-gray-800">
                          {year.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getTeachersForYear(year.id).length} teachers
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Manage Selected Year */}
                  {managingYear && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        Teachers for{" "}
                        {yearGroups.find((y) => y.id === managingYear)?.name}
                      </h4>

                      {/* Add Teacher */}
                      <div className="mb-6">
                        <div className="flex gap-3">
                          <select
                            value={teacherToAdd}
                            onChange={(e) => setTeacherToAdd(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                          >
                            <option value="">Select teacher to add...</option>
                            {allTeachers
                              .filter(
                                (t) =>
                                  !yearTeacherAssignments[
                                    managingYear
                                  ]?.includes(t.id),
                              )
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} - {t.subject}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={handleAddTeacherToYear}
                            disabled={!teacherToAdd}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <Plus size={18} />
                            Add
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setCreatingNewTeacher(!creatingNewTeacher)
                          }
                          className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          + Create new teacher
                        </button>

                        {creatingNewTeacher && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={newTeacherData.name}
                                onChange={(e) =>
                                  setNewTeacherData({
                                    ...newTeacherData,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Teacher name (e.g., Ms. Jane Smith)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                              />
                              <input
                                type="text"
                                value={newTeacherData.subject}
                                onChange={(e) =>
                                  setNewTeacherData({
                                    ...newTeacherData,
                                    subject: e.target.value,
                                  })
                                }
                                placeholder="Subject (e.g., Mathematics)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCreateNewTeacher}
                                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                >
                                  Create Teacher
                                </button>
                                <button
                                  onClick={() => {
                                    setCreatingNewTeacher(false);
                                    setNewTeacherData({
                                      name: "",
                                      subject: "",
                                    });
                                  }}
                                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Current Teachers */}
                      <div className="space-y-2">
                        {getTeachersForYear(managingYear).map((teacher) => (
                          <div
                            key={teacher.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div>
                              <div className="font-medium text-gray-800">
                                {teacher.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {teacher.subject}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {
                                  bookings.filter(
                                    (b) =>
                                      b.teacherId === teacher.id &&
                                      b.yearGroup === managingYear,
                                  ).length
                                }{" "}
                                bookings
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveTeacherFromYear(
                                  teacher.id,
                                  teacher.name,
                                )
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm font-medium flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
