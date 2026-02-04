# SplitMint - Expense Splitting & Balance Management App

A production-ready Splitwise-like web application for managing shared expenses and calculating balances within groups.

## 🎯 Features

- **User Authentication**: Email/password registration and login with JWT-based auth
- 
<img width="1892" height="915" alt="image" src="https://github.com/user-attachments/assets/50cfc11f-d53e-4ac2-bfd8-1dbad3b6362c" />

- **Group Management**: Create groups with multiple participants (max 4 including owner)
- 
<img width="1896" height="925" alt="image" src="https://github.com/user-attachments/assets/c08faf35-02a7-45a8-95f3-d82d4213e180" />
<img width="1890" height="930" alt="image" src="https://github.com/user-attachments/assets/37bfcdd8-43bd-4c8c-8a9f-a75e53c9e56b" />
<img width="1887" height="921" alt="image" src="https://github.com/user-attachments/assets/cd7292d9-d0e2-4ba0-9399-7592c5cb3413" />

Add Group Member
<img width="1897" height="902" alt="image" src="https://github.com/user-attachments/assets/8c48d81d-845a-4b7a-a30c-99040875fe62" />

- **Expense Tracking**: Record and categorize shared expenses with multiple split modes

<img width="1916" height="924" alt="image" src="https://github.com/user-attachments/assets/ceacffcb-501c-4899-93e7-2e918a78ac5d" />

- 
- **Smart Balance Engine**: Automatically calculate who owes whom with minimal settlements

- <img width="1893" height="926" alt="image" src="https://github.com/user-attachments/assets/83b8baa9-87f7-4373-b9dd-132f88bb1a89" />

- **Split Modes**: Equal, custom amounts, or percentage-based splits
- 
<img width="1907" height="907" alt="image" src="https://github.com/user-attachments/assets/1a350910-ce21-4787-9ddb-41b0cf2db379" />

- **Transaction History**: Track all expenses with date, payer, amount, and split details
- 
<img width="1805" height="638" alt="image" src="https://github.com/user-attachments/assets/5ecd9312-2b90-4d46-a115-9e210fe7e208" />

- **Balance Summary**: Visual dashboard showing what you owe and are owed
- <img width="1875" height="916" alt="image" src="https://github.com/user-attachments/assets/64a72719-f20e-4be9-8971-e572d6054e1f" />

- **Responsive UI**: Clean, modern interface built with React and Tailwind CSS
- **Search & Filter**: Find expenses by text, participant, date range, or amount
<img width="1614" height="441" alt="image" src="https://github.com/user-attachments/assets/305c2bae-ebdb-4f8d-9de7-cba876a428fb" />



## 🏗️ Technology Stack

### Backend

- **Node.js + Express.js**: RESTful API server
- **MongoDB + Mongoose**: Database and ODM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Frontend

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling framework

## 📁 Project Structure

```
splitmint/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── groupController.js
│   │   └── expenseController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Balance.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── groupRoutes.js
│   │   └── expenseRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── balanceEngine.js
│   ├── config/
│   │   └── database.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── BalanceSummary.jsx
    │   │   ├── BalanceTable.jsx
    │   │   └── TransactionHistory.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── CreateGroupPage.jsx
    │   │   └── GroupDetailPage.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── formatting.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── .env.example
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file from template**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `backend/.env`:

   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/splitmint?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

   **Variable Explanations**:
   - `PORT`: Server port (default: 5000)
   - `MONGO_URI`: MongoDB connection string (get from MongoDB Atlas)
   - `JWT_SECRET`: Secret key for signing JWT tokens (use a strong random string)
   - `CLIENT_URL`: Frontend URL for CORS configuration
   - `NODE_ENV`: Environment mode (development/production)

5. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file from template**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `frontend/.env`:

   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

   **Variable Explanation**:
   - `VITE_API_BASE_URL`: Backend API endpoint URL

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. JWT token is issued and stored in localStorage
4. Token is sent with every API request in Authorization header
5. Protected routes redirect to login if token is missing or invalid
6. Token expires after 7 days

## 💸 Balance Calculation

The balance engine works as follows:

1. **Track Individual Transactions**: For each expense, track who paid and how much each person owes
2. **Calculate Net Balances**: Determine the net amount between each pair of people
3. **Offset Debts**: If A owes B and B owes A, offset the amounts
4. **Minimize Settlements**: Group the results to show minimum required payments

Example:

- Alice paid ₹300 for dinner, split equally among 3 people
- Each person owes ₹100
- Bob paid ₹150 for drinks, split between Alice and Bob
- Alice owes ₹75 to Bob
- Final: Alice owes Bob ₹25 (₹100 - ₹75)

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Groups

- `POST /api/groups` - Create group (protected)
- `GET /api/groups` - List user's groups (protected)
- `GET /api/groups/:id` - Get group details (protected)
- `PUT /api/groups/:id` - Update group (protected)
- `DELETE /api/groups/:id` - Delete group (protected)
- `POST /api/groups/:id/participants` - Add participant (protected)
- `DELETE /api/groups/:id/participants` - Remove participant (protected)
- `PUT /api/groups/:id/participants` - Update participant (protected)

### Expenses

- `POST /api/expenses` - Create expense (protected)
- `GET /api/expenses` - List expenses with filters (protected)
- `GET /api/expenses/:id` - Get expense details (protected)
- `PUT /api/expenses/:id` - Update expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)
- `GET /api/expenses/group/:groupId/balances` - Get group balances (protected)


## 📊 Data Models

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Group

```javascript
{
  name: String,
  owner: ObjectId (ref: User),
  participants: [{
    userId: ObjectId,
    name: String,
    color: String,
    avatar: String
  }],
  totalSpent: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense

```javascript
{
  group: ObjectId (ref: Group),
  amount: Number,
  description: String,
  date: Date,
  payer: ObjectId (ref: User),
  payerName: String,
  splitMode: String (equal|custom|percentage),
  participants: [{
    userId: ObjectId,
    name: String,
    amount: Number
  }],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Balance

```javascript
{
  group: ObjectId (ref: Group),
  debtor: ObjectId (ref: User),
  debtorName: String,
  creditor: ObjectId (ref: User),
  creditorName: String,
  amount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Search & Filter

The expense list supports the following filters:

- **Text Search**: Search by description or notes
- **Participant**: Filter by who was involved
- **Date Range**: Filter by start and end dates
- **Amount Range**: Filter by minimum and maximum amount

Example API call:

```javascript
GET /api/expenses?search=dinner&participant=userId&startDate=2024-01-01&minAmount=100
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Color Coding**: Green for amounts owed to you, red for amounts you owe
- **Summary Cards**: Quick overview of financial status
- **Transaction List**: Detailed history of all expenses
- **Dark/Light Indicators**: Visual feedback for positive/negative balances
- **Loading States**: Feedback during async operations
- **Error Handling**: User-friendly error messages

## 📝 Best Practices Implemented

1. **Security**
   - Password hashing with bcrypt
   - JWT for stateless authentication
   - CORS configuration
   - Input validation on both frontend and backend

2. **Code Organization**
   - Separation of concerns (controllers, models, routes, utils)
   - Reusable components and hooks
   - Context API for state management
   - Custom hooks for abstraction

3. **Error Handling**
   - Try-catch blocks in async functions
   - Proper HTTP status codes
   - User-friendly error messages
   - Validation middleware

4. **Performance**
   - Database indexes on frequently queried fields
   - Efficient balance calculations
   - Request/response compression via Express
   - Lazy loading and code splitting ready

5. **Database**
   - Mongoose schemas with validation
   - Cascade delete for data integrity
   - Indexes for common queries
   - Transaction support ready for future use

## 🐛 Troubleshooting

### MongoDB Connection Error

- Verify MONGO_URI is correct
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure database user has correct credentials

### CORS Errors

- Verify CLIENT_URL in backend matches frontend origin
- Check that frontend API_BASE_URL is correct

### Port Already in Use

- Change PORT in .env to different value
- Or kill process using the port: `lsof -i :5000` (macOS/Linux)

### Token Expiration

- Tokens expire after 7 days
- User will be redirected to login
- Register/login again to get new token

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Open pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:

1. Check this README
2. Review API endpoint documentation
3. Check browser console for frontend errors
4. Check server logs for backend errors

---

**Built with ❤️ using React, Node.js, and MongoDB**
