# 🚀 QUICK START - PTM Booking System

## Get Started in 3 Steps

### 1️⃣ Install
```bash
npm install
```

### 2️⃣ Run
```bash
npm run dev
```

### 3️⃣ Open
```
http://localhost:3000
```

---

## 🎯 What You'll See

### Homepage
- 9 year groups (Y1-Y9)
- Click any year to start booking
- Admin/Teacher login buttons at bottom

### Booking Flow
1. Select year group → 2. Choose teacher → 3. Pick time slot → 4. Enter details → 5. Confirm

### Admin Panel (Password: `admin123`)
- View all bookings
- Delete bookings
- Manage PTM settings
- Assign teachers to years
- Download PDF schedules

### Teacher Panel (Password: `teacher123`)
- Select your name
- View your schedule
- See parent/student details

---

## 📋 Demo Flow

### Book an Appointment

```
1. Homepage → Click "Year 5"
2. Select "Ms. Jelena Milanovic"
3. Choose time slot "16:00"
4. Enter:
   - Parent: John Doe
   - Email: john@example.com
   - Student: Jane Doe
5. Confirm Booking
✅ Done!
```

### Check as Admin

```
1. Homepage → "Admin Login"
2. Password: admin123
3. Click "Bookings" tab
4. See John Doe's booking
5. Download PDF if needed
```

---

## ⚡ Quick Tips

### For Parents
- Book multiple teachers for same child
- Use same email for all bookings
- Download PDF schedule after booking

### For Admins
- Check "Find Double Bookings" regularly
- Set PTM date/time before opening bookings
- Download PDFs before deleting bookings

### For Teachers
- Login to see your daily schedule
- Check bookings before PTM day
- Note parent emails for follow-up

---

## 🔧 Common Tasks

### Change PTM Date/Time
```
Admin Panel → Settings Tab → Edit Settings
```

### Add Teacher to Year
```
Admin Panel → Teachers Tab → Select Year → Add Teacher
```

### Delete All Bookings
```
Admin Panel → Bookings Tab → Delete All Bookings
⚠️ Warning: Cannot be undone!
```

### Find Problems
```
Admin Panel → Bookings Tab → Find Double Bookings
```

---

## 📱 Test Different Roles

### As Parent
1. Go to homepage
2. Click Year 1
3. Book with Ms. Mirjana Ivanovic
4. Fill parent details
5. Confirm

### As Teacher
1. Click "Teacher Login"
2. Password: teacher123
3. Select "Ms. Mirjana Ivanovic"
4. See all bookings

### As Admin
1. Click "Admin Login"
2. Password: admin123
3. View everything
4. Manage system

---

## 🎨 Year Groups & Colors

- **Y1** - Blue
- **Y2** - Green
- **Y3** - Purple
- **Y4** - Orange
- **Y5** - Pink
- **Y6** - Indigo
- **Y7** - Red
- **Y8** - Teal
- **Y9** - Cyan

---

## ⚙️ Default Settings

- **Date**: 2026-02-10
- **Start**: 16:00
- **End**: 18:45
- **Slot**: 10 minutes

Change in Admin Panel → Settings tab

---

## 📂 File Structure

```
src/
├── pages/          # Main pages
│   ├── HomePage.jsx
│   ├── BookingPage.jsx
│   ├── AdminPage.jsx
│   └── TeacherPage.jsx
├── context/        # State management
│   ├── FirebaseContext.jsx
│   └── PTMContext.jsx
└── data/           # Teachers data
    └── teachersData.js
```

---

## 🔥 Firebase Setup

Already configured! No setup needed.

Database: `parent-teacher-meeting-927c9`
Collection: `bookings`

---

## 📞 Need Help?

Check `README.md` for full documentation!

---

**Made with ❤️ by Milica Petkovic**
