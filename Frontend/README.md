# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
# Notes App - Secure Login/Register System

A full-stack Notes application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring secure authentication and user-specific note management.

## Features

### Authentication System

- **User Registration**: Secure user registration with validation
- **User Login**: JWT-based authentication
- **Password Security**: Bcrypt hashing for password protection
- **Protected Routes**: Route protection based on authentication status
- **Logout Functionality**: Secure session termination

### Notes Management

- **User-Specific Notes**: Each user can only access their own notes
- **CRUD Operations**: Create, Read, Update, Delete notes
- **Real-time Validation**: Input validation on both frontend and backend
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Security Features

- **JWT Tokens**: Secure authentication tokens with expiration
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Cross-origin resource sharing configuration
- **Environment Variables**: Secure configuration management

## Tech Stack

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: JSON Web Tokens for authentication
- **Bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Dotenv**: Environment variable management

### Frontend

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Hot Toast**: User notifications
- **Tailwind CSS**: Styling framework
- **DaisyUI**: Component library

## Project Structure

```
Notes App - Copy/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # Database connection
│   │   │   └── upstash.js     # Redis configuration
│   │   ├── controller/
│   │   │   ├── authController.js   # Authentication logic
│   │   │   └── notesController.js  # Notes CRUD operations
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT authentication middleware
│   │   │   ├── errorHandler.js    # Global error handling
│   │   │   ├── rateLimiter.js # Rate limiting middleware
│   │   │   └── validation.js  # Input validation middleware
│   │   ├── models/
│   │   │   ├── User.js        # User schema
│   │   │   └── Notes.js       # Notes schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js  # Authentication routes
│   │   │   └── notesRoutes.js # Notes routes
│   │   └── server.js          # Server configuration
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AuthLayout.jsx     # Authentication layout
    │   │   ├── Navbar.jsx         # Navigation component
    │   │   ├── NoteCard.jsx       # Note display component
    │   │   ├── ProtectedRoute.jsx # Route protection
    │   │   └── RateLimiterUi.jsx  # Rate limit UI
    │   ├── context/
    │   │   └── AuthContext.jsx    # Authentication context
    │   ├── lib/
    │   │   ├── axios.js           # HTTP client configuration
    │   │   └── utils.js           # Utility functions
    │   ├── pages/
    │   │   ├── CreatePage.jsx     # Create note page
    │   │   ├── HomePage.jsx       # Home page
    │   │   ├── Layout.jsx         # Main layout
    │   │   ├── LoginPage.jsx      # Login page
    │   │   ├── NotesPage.jsx     # Notes listing page
    │   │   └── RegisterPage.jsx  # Registration page
    │   └── main.jsx               # App entry point
    └── package.json
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (protected)

### Notes Routes (`/api/notes`)

- `GET /` - Get user's notes (protected)
- `POST /` - Create new note (protected)
- `GET /:id` - Get specific note (protected)
- `PUT /:id` - Update note (protected)
- `DELETE /:id` - Delete note (protected)

## Database Schemas

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Notes Schema

```javascript
{
  title: String (required),
  content: String (required),
  userId: ObjectId (required, references User),
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notes-app

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5001

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token

# CORS Origin (for production)
CORS_ORIGIN=http://localhost:5173
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the required environment variables (see above)

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Demo Account

For testing purposes, you can use the demo account:

- **Email**: `demo@example.com`
- **Password**: `demo123456`

To create the demo user and sample notes, run:

```bash
cd Backend
node setup-demo.js
```

### Regular Usage

1. **Registration**: Visit `/register` to create a new account
2. **Login**: Visit `/login` to sign in to your account
3. **Create Notes**: Click "Create Note" to add new notes
4. **Manage Notes**: View, edit, and delete your notes
5. **Logout**: Click the logout button to sign out

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation on all inputs
- **Rate Limiting**: Protection against brute force attacks
- **User Isolation**: Users can only access their own notes
- **Error Handling**: Secure error messages without sensitive information

## Production Deployment

### Security Considerations

- Use HTTPS in production
- Set strong JWT secrets
- Configure proper CORS origins
- Use environment variables for sensitive data
- Implement proper logging and monitoring

### Database

- Use MongoDB Atlas or another cloud database service
- Configure proper database security
- Set up regular backups

### Server

- Use a process manager like PM2
- Configure reverse proxy (nginx)
- Set up SSL certificates
- Monitor server performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
