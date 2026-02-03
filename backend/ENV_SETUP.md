# Backend Environment Configuration Guide

## Setup Instructions

### 1. Copy the template

```bash
cd backend
cp .env.example .env
```

### 2. Configure each variable

#### PORT (Default: 5000)

The port on which the Express server will run.

```
PORT=5000
```

- Use port 5000 for local development
- For production, use 8080 or any available port

#### MONGO_URI (Required)

MongoDB connection string. Get this from MongoDB Atlas.

**For MongoDB Atlas (Cloud)**:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string from "Connect" button
4. Replace username and password
5. Replace database name (splitmint recommended)

```
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/splitmint?retryWrites=true&w=majority
```

**For Local MongoDB**:

```
MONGO_URI=mongodb://localhost:27017/splitmint
```

#### JWT_SECRET (Required)

Secret key for signing JSON Web Tokens. Use a strong random string.

**Generate a secure secret**:

- Option 1: Use an online generator
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Option 2: Use any strong password (min 32 characters recommended)

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

⚠️ **IMPORTANT**: Change this in production! Use different secrets for different environments.

#### CLIENT_URL (Default: http://localhost:5173)

The frontend URL for CORS configuration.

```
CLIENT_URL=http://localhost:5173
```

- **Local development**: `http://localhost:5173`
- **Production**: Your deployed frontend URL (e.g., https://splitmint.vercel.app)

#### NODE_ENV (Default: development)

Environment mode.

```
NODE_ENV=development
```

- `development` - For local development with verbose logging
- `production` - For deployed application

## Complete .env Example

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/splitmint?retryWrites=true&w=majority
JWT_SECRET=8f5e9c1a2b3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Testing the Setup

After configuring .env:

```bash
npm install
npm run dev
```

You should see:

```
MongoDB Connected: cluster-name.mongodb.net
Server running on port 5000
```

## Production Checklist

- [ ] Generate new JWT_SECRET for production
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Set NODE_ENV=production
- [ ] Update CLIENT_URL to production frontend URL
- [ ] Use strong passwords for MongoDB
- [ ] Enable SSL/TLS for connections
- [ ] Use environment variables in deployment platform (Render, Railway, etc.)

## Common Issues

**Cannot connect to MongoDB**

- Check MONGO_URI format
- Verify IP is whitelisted in MongoDB Atlas
- Confirm database credentials are correct

**CORS errors**

- Verify CLIENT_URL matches frontend origin
- Include http:// or https:// in URL
- No trailing slashes in URL

**JWT authentication failures**

- JWT_SECRET must be same across restarts
- Token expires after 7 days
- Check Authorization header in requests

## Security Notes

- 🔒 Never commit .env file to version control
- 🔒 Rotate JWT_SECRET periodically in production
- 🔒 Use environment-specific secrets
- 🔒 Store secrets in deployment platform's secure vault
