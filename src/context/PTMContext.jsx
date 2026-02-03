import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext';
import { teachersData, yearTeacherAssignments as initialYearTeacherAssignments } from '../data/teachersData';

const PTMContext = createContext();

export const usePTM = () => {
  const context = useContext(PTMContext);
  if (!context) {
    throw new Error('usePTM must be used within PTMProvider');
  }
  return context;
};

export const PTMProvider = ({ children }) => {
  const { db, collection, getDocs, addDoc, deleteDoc, doc, writeBatch, updateDoc } = useFirebase();

  // PTM Settings - Load from Firebase
  const [ptmSettings, setPtmSettings] = useState({
    date: '2026-02-03',
    startTime: '15:20',
    endTime: '19:00',
    slotDuration: 10
  });

  // Booking status
  const [isBookingOpen, setIsBookingOpen] = useState(true);

  // Teachers
  const [allTeachers, setAllTeachers] = useState(teachersData);
  const [yearTeacherAssignments, setYearTeacherAssignments] = useState(initialYearTeacherAssignments);

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auth
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [teacherLoggedIn, setTeacherLoggedIn] = useState(false);

  // Year groups
  const yearGroups = [
    { id: 'Y1', name: 'Year 1', color: 'blue' },
    { id: 'Y2', name: 'Year 2', color: 'green' },
    { id: 'Y3', name: 'Year 3', color: 'purple' },
    { id: 'Y4', name: 'Year 4', color: 'orange' },
    { id: 'Y5', name: 'Year 5', color: 'pink' },
    { id: 'Y6', name: 'Year 6', color: 'indigo' },
    { id: 'Y7', name: 'Year 7', color: 'red' },
    { id: 'Y8', name: 'Year 8', color: 'teal' },
    { id: 'Y9', name: 'Year 9', color: 'cyan' }
  ];

  // Load settings from Firebase
  const loadSettings = async () => {
    if (!db) return;
    
    try {
      const settingsDoc = await getDocs(collection(db, 'settings'));
      if (!settingsDoc.empty) {
        const data = settingsDoc.docs[0].data();
        setPtmSettings({
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          slotDuration: data.slotDuration
        });
        if (data.isBookingOpen !== undefined) {
          setIsBookingOpen(data.isBookingOpen);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Load bookings from Firebase
  const loadBookings = async () => {
    if (!db) return;
    
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      const loadedBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(loadedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update PTM settings in Firebase
  const updatePTMSettings = async (newSettings) => {
    setPtmSettings(newSettings);
    
    if (!db) return;
    
    try {
      const settingsSnapshot = await getDocs(collection(db, 'settings'));
      if (!settingsSnapshot.empty) {
        const settingsDocId = settingsSnapshot.docs[0].id;
        await updateDoc(doc(db, 'settings', settingsDocId), newSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Toggle booking status in Firebase
  const toggleBookingStatus = async () => {
    const newStatus = !isBookingOpen;
    setIsBookingOpen(newStatus);
    
    if (!db) return;
    
    try {
      const settingsSnapshot = await getDocs(collection(db, 'settings'));
      if (!settingsSnapshot.empty) {
        const settingsDocId = settingsSnapshot.docs[0].id;
        await updateDoc(doc(db, 'settings', settingsDocId), {
          isBookingOpen: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Create booking
  const createBooking = async (bookingData) => {
    if (!db) return { success: false, error: 'Database not initialized' };

    try {
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      await loadBookings();
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete booking
  const deleteBooking = async (bookingId) => {
    if (!db) return { success: false };

    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      await loadBookings();
      return { success: true };
    } catch (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete all bookings
  const deleteAllBookings = async () => {
    if (!db) return { success: false };

    try {
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(collection(db, 'bookings'));
      
      querySnapshot.docs.forEach((document) => {
        batch.delete(doc(db, 'bookings', document.id));
      });

      await batch.commit();
      await loadBookings();
      return { success: true };
    } catch (error) {
      console.error('Error deleting all bookings:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const start = new Date(`2000-01-01T${ptmSettings.startTime}`);
    const end = new Date(`2000-01-01T${ptmSettings.endTime}`);

    while (start <= end) {
      slots.push(start.toTimeString().substring(0, 5));
      start.setMinutes(start.getMinutes() + ptmSettings.slotDuration);
    }

    return slots;
  };

  // Get teachers for year
  const getTeachersForYear = (yearId) => {
    const teacherIds = yearTeacherAssignments[yearId] || [];
    return teacherIds
      .map(id => allTeachers.find(t => t.id === id))
      .filter(t => t !== undefined);
  };

  // Check if slot is booked
  const isSlotBooked = (teacherId, timeSlot) => {
    return bookings.some(
      b => b.teacherId === teacherId && b.timeSlot === timeSlot
    );
  };

  // Get bookings for teacher
  const getBookingsForTeacher = (teacherId) => {
    return bookings.filter(b => b.teacherId === teacherId);
  };

  // Get bookings for parent
  const getBookingsForParent = (parentEmail) => {
    return bookings.filter(b => b.parentEmail === parentEmail);
  };

  // Admin login
  const adminLogin = (password) => {
    if (password === 'Secret123') {
      setAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  // Teacher login
  const teacherLogin = (password) => {
    if (password === 'Teacher123!') {
      setTeacherLoggedIn(true);
      return true;
    }
    return false;
  };

  // Admin logout
  const adminLogout = () => {
    setAdminLoggedIn(false);
  };

  // Teacher logout
  const teacherLogout = () => {
    setTeacherLoggedIn(false);
  };

  // Add teacher to year
  const addTeacherToYear = (yearId, teacherId) => {
    setYearTeacherAssignments(prev => ({
      ...prev,
      [yearId]: [...(prev[yearId] || []), teacherId]
    }));
  };

  // Remove teacher from year
  const removeTeacherFromYear = (yearId, teacherId) => {
    setYearTeacherAssignments(prev => ({
      ...prev,
      [yearId]: (prev[yearId] || []).filter(id => id !== teacherId)
    }));
  };

  // Add new teacher
  const addNewTeacher = (teacherData) => {
    const newTeacher = {
      id: `T_${teacherData.name.replace(/\s+/g, '_')}`,
      name: teacherData.name,
      subject: teacherData.subject
    };
    setAllTeachers(prev => [...prev, newTeacher]);
    return newTeacher;
  };

  // Get unique parent count
  const getUniqueParentCount = () => {
    const uniqueEmails = new Set(bookings.map(b => b.parentEmail));
    return uniqueEmails.size;
  };

  // Find double bookings
  const findDoubleBookings = () => {
    const slots = {};
    const doubles = [];

    bookings.forEach(booking => {
      const key = `${booking.teacherId}-${booking.timeSlot}`;
      if (slots[key]) {
        doubles.push({ existing: slots[key], duplicate: booking });
      } else {
        slots[key] = booking;
      }
    });

    return doubles;
  };

  // Load bookings and settings on mount
  useEffect(() => {
    if (db) {
      loadBookings();
      loadSettings();
    }
  }, [db]);

  const value = {
    ptmSettings,
    updatePTMSettings,
    loadSettings,
    allTeachers,
    yearTeacherAssignments,
    getTeachersForYear,
    addTeacherToYear,
    removeTeacherFromYear,
    addNewTeacher,
    bookings,
    loading,
    loadBookings,
    createBooking,
    deleteBooking,
    deleteAllBookings,
    isSlotBooked,
    getBookingsForTeacher,
    getBookingsForParent,
    getUniqueParentCount,
    findDoubleBookings,
    generateTimeSlots,
    yearGroups,
    isBookingOpen,
    toggleBookingStatus,
    adminLoggedIn,
    teacherLoggedIn,
    adminLogin,
    teacherLogin,
    adminLogout,
    teacherLogout,
  };

  return <PTMContext.Provider value={value}>{children}</PTMContext.Provider>;
};