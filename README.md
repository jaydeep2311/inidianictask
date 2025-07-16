# Indianic Task Management App

A full-stack task management application with user authentication, profile management, file uploads, email notifications, real-time updates, and CSV export.

## Tech Stack
- **Backend:** Node.js (Express), MongoDB (Mongoose), JWT, Multer, Nodemailer, Sharp, Socket.io, node-cron, Swagger
- **Frontend:** ReactJS (Vite), Material-UI (MUI), Axios, Socket.io-client, React Router

---

## Features
- User registration & login (JWT)
- Profile image upload & resize
- Task CRUD (create, update, delete, list)
- File upload per task (PDF, DOCX, JPG)
- Email notifications (task creation/completion, daily reminders)
- CSV export of tasks
- Real-time updates with Socket.io
- API documentation with Swagger

---

## Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd indianictask
```

### 2. Backend Setup
```bash
cd backend
npm install
```

#### Create a `.env` file in the `backend` folder:
```
MONGODB_URI=mongodb://localhost:27017/indianictask
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com (or Ethereal/SMTP user)
EMAIL_PASS=your_email_password (or Ethereal/SMTP password)
EMAIL_HOST=smtp.gmail.com (or smtp.ethereal.email)
EMAIL_PORT=465 (or 587 for Ethereal)
EMAIL_SECURE=true (or false for Ethereal)
CLIENT_URL=http://localhost:3000
```

#### Start the backend server
```bash
npm run dev
```
- The backend runs on `http://localhost:5000` (default)
- Swagger docs: `http://localhost:5000/api/docs`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

#### Update API base URL
- The frontend uses `http://localhost:8000` as the API base URL by default (see `src/api.js`).
- If your backend runs on a different port, update the base URL in `frontend/src/api.js`.

#### Start the frontend
```bash
npm run dev
```
- The frontend runs on `http://localhost:3000` (default)

---

## Environment Variables
| Variable         | Description                        | Example                        |
|------------------|------------------------------------|--------------------------------|
| MONGODB_URI      | MongoDB connection string          | mongodb://localhost:27017/indianictask |
| JWT_SECRET       | JWT secret for signing tokens      | your_jwt_secret                |
| EMAIL_USER       | Email/SMTP username                | your_email@gmail.com           |
| EMAIL_PASS       | Email/SMTP password/app password   | your_email_password            |
| EMAIL_HOST       | SMTP host                          | smtp.gmail.com                 |
| EMAIL_PORT       | SMTP port                          | 465                            |
| EMAIL_SECURE     | SMTP secure (true/false)           | true                           |
| CLIENT_URL       | Frontend URL (for CORS, etc.)      | http://localhost:3000          |

---

## Notes
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if 2FA is enabled.
- For testing emails, you can use [Ethereal Email](https://ethereal.email/).
- Make sure to restart the backend after changing `.env` variables.

---

## License
MIT 