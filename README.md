v# DevTrack API

This is the backend API for the DevTrack project management and time tracking application.

## Features

- User registration and authentication (local and OAuth with Google and GitHub)
- User profile management
- Project, task, and report management
- Task timer start/stop with duration tracking
- File uploads for user profile images and CVs
- Validation and error handling for API requests

## Technologies Used

- Node.js with Express.js
- MongoDB with Mongoose
- Passport.js for authentication (local, Google, GitHub)
- Multer for file uploads
- JSON Web Tokens (JWT) for session management
- Docker for containerization (optional)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- Docker (optional, for containerized setup)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd devtrack-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3900
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
CLIENT_URL=<your-frontend-url>
```

4. Start the server:

```bash
npm start
```

### Using Docker (Optional)

1. Ensure Docker Desktop is installed and running.

2. Build and start the containers:

```bash
docker compose up --build
```

3. The API will be available at `http://localhost:3900`.

## API Endpoints

- `POST /api/users/register` - Register a new user (supports multipart/form-data for image and CV upload)
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (requires authentication)
- OAuth routes under `/auth` for Google and GitHub login

Refer to the API documentation for full details on all endpoints.

## Testing

- Use Postman or similar tools to test API endpoints.
- OAuth login returns a JSON token response for easy testing without frontend.

## Notes

- File uploads are stored in the `/uploads` directory.
- Password is required only for local authentication users.
- OAuth users are created automatically upon first login.

## License

MIT License

# DEV_TRACKER