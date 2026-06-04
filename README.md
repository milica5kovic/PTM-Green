# PTM Booking System

A production-ready Parent-Teacher Meeting booking system built for Green School Belgrade.
Live at [greenschool-ptm.com](https://greenschool-ptm.com)

## Tech Stack

React · Firebase (Firestore + Auth) · jsPDF

## Features

### Parents
- Select child's year group (Y1–Y9)
- View available teachers per year
- Book time slots
- View and download PDF schedule of all bookings

  <img width="2874" height="1626" alt="image" src="https://github.com/user-attachments/assets/833f0a5b-35b8-4a94-961a-78b2507d57f5" />



### Teachers
- View personal appointment schedule
- See parent and student details per slot
- Check availability by time slot

### Admin
- Full system overview of all bookings
- Configure PTM settings (date, time, slot duration)
- Assign and remove teachers from year groups
- Create teacher accounts
- Delete individual or all bookings
- Detect and resolve double bookings
- Generate PDF schedules per parent
- Search by parent, student, or teacher name

## Race Condition Protection

Simultaneous bookings of the same slot are prevented through a three-layer protection system:
Firestore transactions, optimistic UI locking, and server-side validation — ensuring no two
users can book the same slot even under concurrent load.

## Running Locally

```bash
git clone https://github.com/milica5kovic/PTM-Green
cd PTM-Green
npm install
npm run dev
```

Add your Firebase config to `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```
