# QuMail - Quantum Secure Email Client (Frontend Demo)

> **Revolutionary email security using Quantum Key Distribution (QKD) technology**

[![ISRO SIH 2024](https://img.shields.io/badge/ISRO-SIH%202024-orange)](https://sih.gov.in/)
[![ETSI Compliant](https://img.shields.io/badge/ETSI-GS%20QKD%20014-blue)](https://www.etsi.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb)](https://reactjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com/)

## 🌟 Overview

QuMail is a next-generation email client that brings quantum-grade security to everyday communications. This is a **frontend-only demonstration** developed for ISRO's Smart India Hackathon 2024 (Problem ID: 25179), showcasing quantum-secure email functionality with simulated backend services.

### ✨ Key Features

- **🔐 Quantum Key Distribution UI**: ETSI GS QKD 014 compliant interface
- **🛡️ Multi-Level Security**: 4 security levels from standard to quantum-secure
- **📧 Email Interface**: Outlook-style UI with mock email functionality
- **🎯 Microsoft Outlook-like Interface**: Familiar and intuitive user experience
- **📱 Responsive Design**: Works on desktop and mobile devices
- **⚡ Fast Performance**: Optimized React frontend with Vite

## 🚀 Live Demo

### 🌐 Deployed Application

**Visit**: [Your Vercel URL here]

### 📊 Demo Features

- Complete QuMail UI interface
- 4 security level selection and demonstration
- Mock email composition and viewing
- Quantum key management simulation
- Responsive design showcase

## 🏗️ Architecture (Frontend-Only)

### Component Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Mock Services  │────│ Static UI Demo  │
│   (Vercel)      │    │  (Simulated)    │    │  (No Backend)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Levels (UI Demo)

| Level | Name                          | Description             | UI Features         |
| ----- | ----------------------------- | ----------------------- | ------------------- |
| 4     | **Quantum Secure**            | One-Time Pad simulation | Security indicators |
| 3     | **Quantum-aided AES**         | AES with quantum UI     | Key status display  |
| 2     | **Post-Quantum Cryptography** | Quantum-resistant UI    | Algorithm selection |
| 1     | **Standard Encryption**       | Traditional AES UI      | Basic security UI   |

## 💻 Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm package manager
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/Jeswinah/Qumail-SIH.git
cd qumail

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server (localhost:5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## 🎯 What's Included

### ✅ Frontend Components

- **Email Composer** - Full email composition interface
- **Security Level Selector** - 4-tier security system UI
- **Key Manager Interface** - Quantum key management UI
- **Email List View** - Inbox/folder navigation
- **Settings Panel** - Configuration interface
- **Status Indicators** - Connection and security status

### ✅ Mock Services

- **Simulated Key Manager** - Quantum key generation simulation
- **Mock Email Service** - Email operations simulation
- **Fake Email Data** - Realistic email content for demo
- **Security Simulations** - Encryption/decryption UI

### ⚠️ What's NOT Included (Frontend-Only)

- ❌ Real backend servers
- ❌ Actual QKD hardware integration
- ❌ Real email provider connections
- ❌ Persistent data storage
- ❌ User authentication

## 🎨 UI Features

### 📧 Email Interface

- Microsoft Outlook-inspired design
- Folder navigation (Inbox, Sent, Drafts, etc.)
- Email composition with rich text
- Attachment UI (simulated)
- Search functionality UI

### 🔒 Security Interface

- Security level selector with descriptions
- Quantum key status indicators
- Encryption progress animations
- Security warnings and notifications

### 📱 Responsive Design

- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts
- Cross-browser compatibility

## 🚀 Deployment on Vercel

### Auto-Deploy Setup

1. **Connect to Vercel**:

   ```bash
   git push origin main  # Triggers auto-deployment
   ```

2. **Manual Deploy**:
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Import this repository
   - Deploy automatically

### 🔧 Vercel Configuration

The project includes:

- `vercel.json` - Deployment configuration
- `.npmrc` - Dependency resolution
- `package.json` - Optimized build scripts

## 📖 Usage Guide

### 1. Security Level Demo

1. Open the application
2. Navigate to Compose Email
3. Select different security levels (1-4)
4. Observe UI changes and security indicators

### 2. Email Interface Demo

1. Browse the inbox with mock emails
2. Click on emails to view content
3. Use the compose feature
4. Explore folder navigation

### 3. Mock Services Demo

1. Check connection status indicators
2. View simulated quantum key generation
3. Test different encryption modes
4. Explore settings and configuration

## 🧪 Demo Scenarios

### 📋 Testing Checklist

- [ ] Application loads without errors
- [ ] All security levels selectable
- [ ] Email composition works
- [ ] Mock services respond
- [ ] Responsive design functional
- [ ] No console errors

### 🎭 Demo Script

1. **Introduction** - Show main interface
2. **Security Levels** - Demonstrate 4 tiers
3. **Email Flow** - Compose and view emails
4. **Quantum Features** - Show KM simulation
5. **Mobile View** - Test responsive design

## 🏆 ISRO SIH 2024 Compliance

**Problem Statement ID**: 25179  
**Organization**: Indian Space Research Organisation (ISRO)

### ✅ Requirements Met (UI Demo)

- [x] Outlook-like email client interface
- [x] 4 different security levels UI
- [x] QKD Key Manager interface simulation
- [x] Email service integration UI
- [x] Professional user interface
- [x] Security level indicators

### 🎯 Demonstration Value

- Complete UI implementation
- All required security levels
- Professional interface design
- Mobile responsiveness
- ETSI standard compliance (UI)

## 📝 Technology Stack

### Frontend

- **React** 19.1.1 - UI framework
- **Vite** 7.1.2 - Build tool
- **Tailwind CSS** 4.1.13 - Styling
- **Lucide React** - Icons
- **Zustand** - State management

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel** - Deployment platform

## 🔍 Project Structure

```
qumail/
├── src/
│   ├── components/          # React UI components
│   │   ├── Email/          # Email-related components
│   │   ├── Security/       # Security UI components
│   │   └── Common/         # Shared components
│   ├── services/           # Mock service implementations
│   ├── stores/            # State management
│   ├── types/             # TypeScript definitions
│   └── assets/            # Static resources
├── public/                # Public assets
├── vercel.json           # Vercel deployment config
├── .npmrc                # NPM configuration
└── README.md             # This file
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **ISRO** for the challenging problem statement
- **React & Vite** for excellent development experience
- **Vercel** for seamless deployment
- **Open Source Community** for foundational libraries

## 📞 Support

For questions about this frontend demo:

- 🐛 Issues: [GitHub Issues](https://github.com/Jeswinah/Qumail-SIH/issues)
- 📖 Repository: [GitHub Repository](https://github.com/Jeswinah/Qumail-SIH)

---

**QuMail Frontend Demo** - _Showcasing the future of quantum-secure email interfaces_ 🚀
