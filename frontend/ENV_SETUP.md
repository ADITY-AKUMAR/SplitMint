# Frontend Environment Configuration Guide

## Setup Instructions

### 1. Copy the template

```bash
cd frontend
cp .env.example .env
```

### 2. Configure each variable

#### VITE_API_BASE_URL (Default: http://localhost:5000/api)

The backend API endpoint that the frontend will communicate with.

```
VITE_API_BASE_URL=http://localhost:5000/api
```

**For Local Development**:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

- Assumes backend is running on port 5000
- Used for development with `npm run dev`

**For Production**:

```
VITE_API_BASE_URL=https://backend-api-domain.com/api
```

- Replace with your deployed backend URL
- Remove /api if backend routes don't use /api prefix

## Environment-Specific Configuration

### Development (.env.development)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Staging (.env.staging)

```
VITE_API_BASE_URL=https://staging-api.splitmint.com/api
```

### Production (.env.production)

```
VITE_API_BASE_URL=https://api.splitmint.com/api
```

## Vite Environment Variables

Vite prefixes client-side environment variables with `VITE_`. This means:

- `VITE_API_BASE_URL` becomes accessible as `import.meta.env.VITE_API_BASE_URL`
- Variables without `VITE_` prefix are not exposed to frontend (for security)

## Testing the Setup

After configuring .env:

```bash
npm install
npm run dev
```

You should see:

```
VITE v4.5.0  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Test that frontend can reach backend:

1. Open http://localhost:5173
2. Go to Network tab in DevTools
3. Try to login/register
4. Requests should go to http://localhost:5000/api/...

## Building for Production

```bash
npm run build
npm run preview
```

The `dist/` folder contains the production-ready files.

## Deployment to Vercel

When deploying to Vercel:

1. Go to https://vercel.com
2. Import your repository
3. Set environment variables:
   - `VITE_API_BASE_URL=https://your-deployed-backend.com/api`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

Vercel will:

- Build your frontend with the correct API URL
- Inject environment variables at build time
- Host on https://your-domain.vercel.app

## Debugging API Connection Issues

If frontend can't reach backend:

1. **Check .env file**

   ```bash
   cat .env
   ```

2. **Verify backend is running**

   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Check network requests in DevTools**
   - Open Browser DevTools (F12)
   - Go to Network tab
   - Try making a request
   - Check full URL and response

4. **Check CORS configuration**
   - Backend must have frontend URL in CORS whitelist
   - Check backend's CLIENT_URL env variable

5. **Verify API endpoints**
   - Each endpoint should start with VITE_API_BASE_URL
   - Example: `http://localhost:5000/api/auth/login`

## API Endpoint Examples

With `VITE_API_BASE_URL=http://localhost:5000/api`:

```
POST   http://localhost:5000/api/auth/register
POST   http://localhost:5000/api/auth/login
GET    http://localhost:5000/api/auth/me
POST   http://localhost:5000/api/groups
GET    http://localhost:5000/api/groups
GET    http://localhost:5000/api/groups/:id
POST   http://localhost:5000/api/expenses
GET    http://localhost:5000/api/expenses
```

## Security Notes

- 🔒 Environment variables are embedded in built JavaScript
- 🔒 Don't put secrets in frontend environment variables
- 🔒 Only put URLs and non-sensitive configuration
- 🔒 Sensitive data (API keys) should stay on backend
- 🔒 Use environment-specific URLs for different stages

## Common Issues

**"Cannot find module" or API returns 404**

- Check VITE_API_BASE_URL is correct
- Verify backend API route exists
- Ensure backend is running

**CORS errors in browser console**

- Check backend's CORS configuration
- Verify CLIENT_URL in backend matches frontend origin
- Backend should explicitly allow your frontend URL

**Different URLs for dev and production**

- Use `.env.development` and `.env.production` files
- Vite automatically selects based on mode
- Run: `npm run build` for production build
