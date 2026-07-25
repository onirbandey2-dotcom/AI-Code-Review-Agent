# CodeSage AI - Frontend

Enterprise AI-powered code review platform frontend built with React 19, TypeScript, and Vite.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **React Router** for routing
- **TanStack Query** for data fetching
- **Axios** for HTTP client
- **Monaco Editor** for code editing
- **Framer Motion** for animations
- **Lucide Icons** for icons

## Prerequisites

- Node.js 20+
- npm 9+ or yarn 1.22+

## Getting Started

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

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/auth/github/callback
VITE_APP_NAME=CodeSage AI
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Layout components (Sidebar, Navbar)
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── hooks/           # Custom hooks
│   ├── lib/
│   │   ├── api/         # API service modules
│   │   ├── axios.ts     # Axios instance with interceptors
│   │   └── utils.ts     # Utility functions
│   ├── pages/           # Route pages
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles & Tailwind
├── .env.example         # Environment variables template
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev` - Start development server on port 5173
- `npm run build` - TypeScript check and Vite build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check
- `npm run format` - Prettier formatting

## Features

- 🔐 GitHub OAuth Authentication
- 📊 Dashboard with metrics and activity charts
- 📦 Repository management
- 🔍 Pull request code reviews
- 🛡️ Security findings and analysis
- 🤖 AI-powered code chat (RAG)
- 📁 Code explorer with Monaco Editor
- ⚙️ User settings and preferences
- 👤 User profile management
- 🌓 Dark/Light theme support

## API Connection

The frontend connects to the FastAPI backend at `http://localhost:8000`. 
The Vite dev server proxies `/api` requests to the backend.

## License

MIT

