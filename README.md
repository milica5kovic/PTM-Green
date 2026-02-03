# 📅 PTM Booking System

Modern Parent-Teacher Meeting booking system built with React and Firebase.

## 🎯 Features

### For Parents
- ✅ Select child's year group (Y1-Y9)
- ✅ View available teachers for each year
- ✅ Book time slots with teachers
- ✅ View all bookings in one place
- ✅ Download PDF schedule

### For Teachers
- ✅ View personal booking schedule
- ✅ See all appointments with parent details
- ✅ Check availability by time slot

### For Admins
- ✅ View all bookings system-wide
- ✅ Manage PTM settings (date, time, slot duration)
- ✅ Assign/remove teachers to year groups
- ✅ Create new teachers
- ✅ Delete individual or all bookings
- ✅ Find and fix double bookings
- ✅ Generate PDF schedules for parents
- ✅ Search bookings by parent/student/teacher

## 🏗️ Project Structure

```
ptm-booking/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Layout.jsx
│   ├── context/
│   │   ├── FirebaseContext.jsx    # Firebase setup
│   │   └── PTMContext.jsx          # Booking logic
│   ├── data/
│   │   └── teachersData.js         # Teachers & assignments
│   ├── pages/
│   │   ├── HomePage.jsx            # Year selection
│   │   ├── BookingPage.jsx         # Booking flow
│   │   ├── AdminPage.jsx           # Admin panel
│   │   └── TeacherPage.jsx         # Teacher dashboard
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## 🚀 Installation

### Prerequisites
- Node.js v16+
- npm or yarn

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
http://localhost:3000
```

## 🔑 Login Credentials

### Admin Panel
```
Password: admin123
```

### Teacher Panel
```
Password: teacher123
```

## 📱 User Flow

### Parent Booking Flow
1. Select child's year group (Y1-Y9)
2. Choose teacher from assigned teachers list
3. Pick available time slot
4. Enter parent & student details
5. Confirm booking
6. Receive confirmation

### Admin Flow
1. Login with admin password
2. View all bookings by parent
3. Manage PTM settings (date, times)
4. Assign/remove teachers to years
5. Delete bookings or entire system
6. Find double bookings
7. Download PDF schedules

### Teacher Flow
1. Login with teacher password
2. Select your name
3. View all your bookings
4. See parent & student details
5. Check time slots

## 🎨 Design Features

- Modern gradient design (Emerald & Teal)
- Responsive layout (mobile-friendly)
- Smooth animations and transitions
- Color-coded year groups
- Clean, intuitive UI

## 🔥 Firebase Configuration

Firebase is already configured in `src/context/FirebaseContext.jsx` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBi_4NxMjjE2D-gvo_quXLUt4MNTrjG644",
  authDomain: "parent-teacher-meeting-927c9.firebaseapp.com",
  projectId: "parent-teacher-meeting-927c9",
  // ...
};
```

### Firestore Collections

**bookings**
```javascript
{
  yearGroup: "Y5",
  teacherId: "T_Jelena_Milanovic",
  teacherName: "Ms. Jelena Milanovic",
  timeSlot: "16:00",
  parentName: "John Doe",
  parentEmail: "john@example.com",
  studentName: "Jane Doe",
  createdAt: "2025-02-03T10:30:00Z"
}
```

## ⚙️ PTM Settings

Admins can configure:
- **Date**: PTM event date
- **Start Time**: e.g., 16:00
- **End Time**: e.g., 18:45
- **Slot Duration**: Minutes per meeting (default: 10)

## 👥 Teacher Management

### Current Teachers (22)
- Ms. Mirjana Ivanovic (Class Teacher)
- Ms. Ashleigh Williams (ESL)
- Mr. Petar Jedoksic (PE)
- ... and 19 more

### Year Assignments
Each year group (Y1-Y9) has specific teachers assigned. Admins can:
- Add teachers to year groups
- Remove teachers from year groups
- Create new teachers

## 📊 Admin Features Explained

### Delete All Bookings
⚠️ **Danger**: Permanently deletes all bookings from Firebase. Cannot be undone.

Use case: Reset system after PTM event or for new semester.

### Find Double Bookings
Scans all bookings to find:
- Same teacher booked at same time slot
- Duplicate entries

Displays results in console with details.

### Download PDF Schedule
Generates PDF for each parent containing:
- Parent & student details
- All booked appointments
- Time slots with teachers
- Year groups

## 🛠️ Customization

### Add New Year Group

Edit `src/context/PTMContext.jsx`:

```javascript
const yearGroups = [
  // ... existing years
  { id: 'Y10', name: 'Year 10', color: 'yellow' }
];
```

### Add New Teacher

1. **Via Admin Panel**: 
   - Login → Teachers tab → Create new teacher

2. **Via Code**: Edit `src/data/teachersData.js`:
```javascript
export const teachersData = [
  // ... existing teachers
  { 
    id: 'T_New_Teacher', 
    name: 'Ms. New Teacher', 
    subject: 'Subject' 
  }
];
```

### Change Colors

Edit color schemes in components:

```javascript
// Year group colors
const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  // ... add more
};
```

### Change Passwords

Edit `src/context/PTMContext.jsx`:

```javascript
// Admin login
const adminLogin = (password) => {
  if (password === 'your-new-password') {
    // ...
  }
};

// Teacher login
const teacherLogin = (password) => {
  if (password === 'your-new-password') {
    // ...
  }
};
```

## 📦 Build for Production

```bash
npm run build
```

Output: `dist/` folder

Deploy to:
- Vercel
- Netlify
- Firebase Hosting
- Your own server

## 🐛 Troubleshooting

### Bookings not loading?
- Check Firebase console for data
- Verify internet connection
- Check browser console for errors

### Can't login?
- Verify password is correct
- Check browser console

### Double bookings?
- Use "Find Double Bookings" feature
- Delete duplicates manually

## 📞 Support

Contact: milica.petkovic@example.com

## 📄 License

Made with ❤️ by Milica Petkovic

---

## 🎓 Technical Stack

- **Frontend**: React 18
- **Routing**: React Router 6
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **PDF**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Build**: Vite

## 🔒 Security Notes

**Important**: This is a demo application. For production:

1. **Change passwords** in `PTMContext.jsx`
2. **Secure Firebase rules** in Firebase Console
3. **Add proper authentication** (Firebase Auth)
4. **Enable email verification**
5. **Add rate limiting**
6. **Validate all inputs**

## 🚀 Future Enhancements

Potential additions:
- [ ] Email notifications (SendGrid/Mailgun)
- [ ] SMS reminders (Twilio)
- [ ] Calendar integration (Google Calendar)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export to Excel
- [ ] Booking conflicts auto-resolution
- [ ] Parent dashboard with booking history
- [ ] Teacher notes for each appointment
