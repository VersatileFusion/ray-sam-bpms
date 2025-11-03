# Ray-Sam Frontend - Vue.js Application

A beautiful, modern frontend application for the Ray-Sam Request Management System built with Vue 3, Tailwind CSS, and Pinia.

## 🎨 Features

- **Modern UI/UX**: Beautiful gradient designs, smooth animations, and responsive layout
- **Glass Morphism**: Modern glassmorphism effects for a premium look
- **Smooth Animations**: Fade-in, slide, float, and more animations
- **Dashboard**: Interactive dashboard with statistics and quick actions
- **Request Management**: Full CRUD operations for requests
- **Authentication**: Secure login/logout with session management
- **Notifications**: Real-time notification system
- **Admin Panel**: User management for administrators
- **Persian Support**: Complete RTL support with Persian date formatting
- **Responsive Design**: Works on all devices and screen sizes

## 🚀 Technologies

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router for Vue.js
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Moment Jalaali** - Persian date support

## 📦 Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Development

The development server runs on `http://localhost:5173` by default.

The app connects to the backend API running on `http://localhost:3000` (configured via Vite proxy).

## 🎯 Structure

```
frontend/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/          # Page views
│   ├── store/          # Pinia stores
│   ├── router/         # Vue Router configuration
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── assets/         # Static assets
│   ├── App.vue         # Root component
│   ├── main.js         # Application entry point
│   └── style.css       # Global styles
├── public/             # Static public files
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── postcss.config.js   # PostCSS configuration
```

## 🎨 Design Features

### Colors
- **Primary**: Blue to Purple gradient
- **Success**: Green gradient
- **Warning**: Yellow gradient
- **Danger**: Red gradient
- **Info**: Blue gradient

### Animations
- `animate-fade-in-up`: Fade in from bottom
- `animate-slide-in-right`: Slide in from right
- `animate-float`: Floating effect
- `animate-bounce`: Bouncing effect
- `hover-lift`: Lift on hover
- `glow`: Glowing shadow effect

### Components
- **Cards**: Rounded corners with shadows and hover effects
- **Buttons**: Gradient backgrounds with hover animations
- **Inputs**: Rounded with focus states
- **Badges**: Colored badges with gradients
- **Glass**: Glassmorphism effect

## 🔐 Authentication

The app uses session-based authentication with the backend. Users are redirected to login if not authenticated.

## 📱 Responsive

The app is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Pages

- **Login**: Beautiful login page with glassmorphism
- **Dashboard**: Overview with statistics
- **Requests**: List and manage requests
- **Create Request**: Form to create new requests
- **Request Details**: View full request details
- **Notifications**: View and manage notifications
- **Profile**: User profile and settings
- **Admin Panel**: User management (admin only)

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- All dates are displayed in Persian (Jalali) calendar
- The app uses RTL layout for Persian content
- API calls are handled via Axios with interceptors
- State management uses Pinia
- Routing is protected with navigation guards

## 🎉 Enjoy!

This frontend provides a stunning, modern interface for managing requests with smooth animations and beautiful design that will impress your employer!

