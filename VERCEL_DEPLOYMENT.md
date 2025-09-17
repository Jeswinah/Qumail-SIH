# QuMail Vercel Deployment Guide

## 🚀 Deploy to Vercel

QuMail can be deployed to Vercel in multiple ways. This guide covers both frontend-only and full-stack deployments.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Node.js 18+** - For local building and testing

## Method 1: One-Click Deploy (Recommended)

### Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/qumail-sih&project-name=qumail&repository-name=qumail-sih)

### Manual Deploy Steps

1. **Push to GitHub**

   ```bash
   cd C:\Users\jeswi\OneDrive\Desktop\SIH\qumail
   git init
   git add .
   git commit -m "Initial QuMail deployment"
   git remote add origin https://github.com/your-username/qumail-sih.git
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure as below

3. **Project Configuration**

   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install --legacy-peer-deps
   ```

4. **Environment Variables**

   ```
   VITE_KM_ENDPOINT = https://your-project.vercel.app
   VITE_EMAIL_ENDPOINT = https://your-project.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Access your app at `https://your-project.vercel.app`

## Method 2: Vercel CLI Deploy

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login and Deploy

```bash
cd C:\Users\jeswi\OneDrive\Desktop\SIH\qumail
vercel login
vercel --prod
```

### Follow CLI Prompts

```
? Set up and deploy "C:\Users\jeswi\OneDrive\Desktop\SIH\qumail"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? qumail
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

## Method 3: GitHub Integration

### 1. Automatic Deployments

- Connect your GitHub repository to Vercel
- Every push to `main` branch triggers deployment
- Preview deployments for pull requests

### 2. Branch Deployments

```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Creates preview deployment automatically
```

## Configuration Files

### vercel.json

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/km/[...path].js": {
      "maxDuration": 10
    },
    "api/email/[...path].js": {
      "maxDuration": 10
    }
  }
}
```

### Environment Variables Setup

```bash
# Development
VITE_KM_ENDPOINT=http://localhost:8080
VITE_EMAIL_ENDPOINT=http://localhost:8081

# Production (Vercel)
VITE_KM_ENDPOINT=https://your-project.vercel.app
VITE_EMAIL_ENDPOINT=https://your-project.vercel.app
```

## Features Available on Vercel

### ✅ Working Features

- **Complete UI** - All React components and styling
- **Quantum Key Management** - Via serverless functions
- **Email Operations** - CRUD operations with mock data
- **Security Levels** - All 4 levels functional
- **Responsive Design** - Mobile and desktop support
- **Real-time Updates** - State management with Zustand

### ⚠️ Limitations

- **No Persistent Storage** - Data resets on function cold starts
- **Mock Services Only** - Not connected to real IMAP/SMTP
- **Limited Key Storage** - In-memory storage only
- **Function Timeouts** - 10-second maximum execution time

## Custom Domain Setup

### 1. Add Domain in Vercel

- Go to Project Settings → Domains
- Add your custom domain
- Configure DNS records

### 2. DNS Configuration

```
Type: CNAME
Name: qumail (or @)
Value: cname.vercel-dns.com
```

### 3. SSL Certificate

- Automatically provisioned by Vercel
- HTTPS enforced by default

## Performance Optimization

### Build Optimization

```json
{
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

### Caching Strategy

- Static assets cached for 1 year
- API responses cached for appropriate duration
- Service worker for offline functionality

## Monitoring and Analytics

### Vercel Analytics

```bash
npm install @vercel/analytics
```

### Error Tracking

```javascript
// Add to main.jsx
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear cache and retry
   vercel --prod --force
   ```

2. **Function Timeout**

   ```javascript
   // Reduce function complexity
   // Use proper async/await patterns
   ```

3. **Environment Variables**

   ```bash
   # Check variables are set
   vercel env ls
   ```

4. **CORS Issues**
   ```javascript
   // Ensure CORS headers are set
   res.setHeader("Access-Control-Allow-Origin", "*");
   ```

### Debug Mode

```bash
vercel dev --debug
```

### View Logs

```bash
vercel logs [deployment-url]
```

## Production Checklist

### Before Deployment

- [ ] All components render without errors
- [ ] Environment variables configured
- [ ] Build process completes successfully
- [ ] Mock services respond correctly
- [ ] Security levels functional
- [ ] Mobile responsive design verified

### After Deployment

- [ ] Application loads in browser
- [ ] All routes work correctly
- [ ] API endpoints respond
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] SSL certificate active

### Security Considerations

- [ ] No sensitive data in client code
- [ ] Environment variables secure
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation implemented

## Live Demo URLs

After deployment, your QuMail application will be available at:

- **Production**: `https://your-project.vercel.app`
- **API Endpoints**:
  - Key Manager: `https://your-project.vercel.app/api/km/`
  - Email Service: `https://your-project.vercel.app/api/email/`

## Support

### Vercel Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### QuMail Specific

- Check `TESTING.md` for validation procedures
- Review `API.md` for endpoint documentation
- Consult `USER_MANUAL.md` for feature usage

---

🚀 **Your QuMail application is now ready for global deployment on Vercel!**
