```md
# Movin Backend API

Movin Backend is a **Node.js + Express + MongoDB REST API** for a real estate platform.  
It provides authentication, property management, real-time auctions, notifications, reports system, and admin dashboard endpoints.

---

## Features

### Authentication & Security
- Register + Email Verification using OTP
- Login / Logout
- JWT Access Token + Refresh Token flow
- Google OAuth Login/Register
- Reset Password using OTP
- Role management (Buyer / Seller) + Switch Role

### Properties
- Create Property (with Cloudinary image upload)
- Property approval/rejection by admin
- Filter properties with pagination and sorting
- Property details for buyer (auto increment views)
- Favorites system
- Recommendation system based on favorites + search history

### Auctions System (Real-Time)
- Start auction on a property
- Admin approval workflow for auctions
- Real-time bidding using Socket.IO
- Auction auto-extension if bid placed in last 2 minutes
- Auction end event with winner notification

### Notifications
- Create notifications for users
- Notifications linked to specific actions (property details, auction page, etc.)
- Auction notifications in real-time

### Seller Dashboard Analytics
- Most viewed properties
- Monthly views chart (last 6 months)
- Buyer view history tracking

### Reports System
- Report a property or user
- Admin resolves reports
- Report status notifications

### Admin Dashboard
- Admin statistics endpoint
- Monthly growth chart for users/properties
- Manage properties approval workflow
- Manage auctions approval workflow
- Manage reports

---

## Tech Stack
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Passport.js (Google OAuth)
- Cloudinary
- Nodemailer

---

## Project Structure

```bash
src/
 ├── controllers/
 ├── routes/
 ├── services/
 ├── models/
 ├── middlewares/
 ├── utils/
 └── sockets/

**Installation & Setup**

1. Clone the repository

    git clone https://github.com/malakkhaled22/movin-app.git
    cd movin-backend

2. Install dependencies
   
   npm install

3. Setup environment variables

  Create a .env file in the root directory:

PORT=3000
MONGO_URL=""
JWT_SECRET=""
REFRESH_SECRET=""

EMAIL_USER=""
EMAIL_PASS=""

GOOGLE_CLIENT_ID="" 
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URL=""


CLOUD_NAME=""
CLOUD_API_KEY=""
CLOUD_API_SECRET=""

4. Run the server (Development)
  
   npm run dev

5. Run in production mode

   npm run build
   npm start

Server will run on: http://localhost:3000

or

Server will run on: https://movin-backend-production.up.railway.app

**Socket.IO Auction Events**

1. Client connects

   const socket = io("http://localhost:3000");
or
   const socket = io("https://movin-backend-production.up.railway.app");

2. Join auction room

   socket.emit("joinAuction", propertyId);

3. Place bid 
   
   socket.emit("placeBid", {
    propertyId,
    amount: 100000
 });

4. Server emits events

  auctionData
  newBid
  auctionExtended
  auctionEnded
  bidError
  auctionError



**API Endpoints Overview**

Auth Routes (/api/auth)

POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-verify-email
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout

Google Auth

GET /api/auth/google
GET /api/auth/google/callback

Reset Password (OTP)

POST /api/auth/forgot-password
POST /api/auth/verify-otp
POST /api/auth/resend-reset-otp
POST /api/auth/reset-password

Role Management

PUT /api/auth/choose-role
PUT /api/auth/switch-role

 User Profile Routes (/api/users/profile)

GET /api/users/profile
PUT /api/users/profile
PATCH /api/users/profile/change-password

 Seller Property Routes (/api/seller)

POST /api/seller/properties/create
PATCH /api/seller/properties/:propertyId
DELETE /api/seller/properties/:propertyId
GET /api/seller/properties/getAll
GET /api/seller/properties/getOne/:propertyId
GET /api/seller/properties/search
GET /api/seller/properties/recent-properties
GET /api/seller/properties/listing-type
GET /api/seller/properties/filter

Seller Analytics

GET /api/seller/properties/most-viewed
GET /api/seller/views-chart
GET /api/seller/dashboard-stats

Buyer View History

GET /api/seller/view-history
DELETE /api/seller/view-history/clear

Buyer Favorites Routes (/api/buyer)

POST /api/buyer/favorites/:propertyId
DELETE /api/buyer/favorites/:propertyId
GET /api/buyer/favorites/get/all
DELETE /api/buyer/favorites/clear/all

Notifications Routes (/api/notifications)

POST /api/notifications/add
GET /api/notifications/all
GET /api/notifications/messages
GET /api/notifications/alerts
PATCH /api/notifications/read-all
PATCH /api/notifications/:id/read
DELETE /api/notifications/clear

Reports Routes (/api/reports)

POST /api/reports
GET /api/reports/my

Recommendations Routes (/api/recommend)

GET /api/recommend/all

Auctions Routes (/api/properties)

GET /api/properties/auctions
GET /api/properties/auctions/:propertyId
PUT /api/properties/auction/create/:propertyId

AI Prediction Routes (/api/ai)

POST /api/ai/predict

Mapping Routes (/api/map)

POST /api/map/properties/metadata

Admin Routes (/api/admin)

Users

PATCH /api/admin/users/block/:id
PATCH /api/admin/users/unblock/:id
GET /api/admin/users/all
GET /api/admin/users/blocked

Properties

GET /api/admin/properties/all
GET /api/admin/properties/pending
PUT /api/admin/properties/approve/:id
PUT /api/admin/properties/reject/:id

Auctions

GET /api/admin/auctions/pending
GET /api/admin/auctions/approved
GET /api/admin/auctions/rejected
PUT /api/admin/auctions/:propertyId/approve
PUT /api/admin/auctions/:propertyId/reject

Reports

GET /api/admin/reports/all
PATCH /api/admin/reports/:id

Search & Stats

GET /api/admin/search
GET /api/admin/stats
Recent Activities
GET /api/admin/activities
  
**Notes**

Auctions require admin approval before being available.
Property views are tracked in a separate PropertyView collection.
Notifications support navigation actions (screen, entityId, extra)


**Author**

Backend developed by: [Malak Khaled Mohammed]
Faculty of Science - Ain Shams University
Computer Science Department
