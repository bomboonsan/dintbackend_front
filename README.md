# Dint Admin Panel

A modern admin panel built with Next.js and Tailwind CSS for managing Dint Backend data.

## Features

- 🔐 **Authentication System** - Login with username and password
- 👥 **Agent Management** - Full CRUD operations for agents
- 💬 **Flex Message Management** - Manage LINE Flex Messages with JSON import/export
- 📊 **Statistics Dashboard** - View agent activity statistics and analytics
- 🎨 **Modern UI** - Clean and responsive design with Tailwind CSS
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm (recommended) or npm

### Installation

1. Navigate to the front directory:
```bash
cd front
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy and edit .env.local file
cp .env.local.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

- **Username**: `@dmin`
- **Password**: `@dm$n9876623`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
ADMIN_USERNAME=@dmin
ADMIN_PASSWORD=@dm$n9876623
```

## Features Overview

### Dashboard
- Overview of system statistics
- Quick action buttons
- Recent activity feed

### Agent Management
- View all agents in a paginated table
- Create new agents
- Edit existing agents
- Delete agents
- Search functionality

### Flex Message Management
- Manage LINE Flex Messages
- JSON editor for message content
- Import multiple messages from JSON files
- Toggle message active/inactive status
- Filter by status (draft/published)

### Statistics
- View agent activity over time
- Interactive charts and graphs
- Date range filtering
- Export functionality

## API Integration

The frontend integrates with the Dint Backend API endpoints:

- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/flex` - List flex messages
- `POST /api/flex` - Create flex message
- `PUT /api/flex/:id` - Update flex message
- `DELETE /api/flex/:id` - Delete flex message
- `POST /api/flex/import` - Import flex messages

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons

## Project Structure

```
front/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── agents/       # Agent management
│   │   ├── flex/         # Flex message management
│   │   └── stats/        # Statistics page
│   ├── login/            # Login page
│   ├── layout.js         # Root layout
│   └── page.js           # Home page
├── components/           # Reusable components
│   ├── DashboardLayout.js # Dashboard layout wrapper
│   └── withAuth.js       # HOC for authentication
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── lib/                # Utilities
│   └── api.js          # API client and endpoints
└── public/             # Static assets
```

## Development

### Code Style
- Use ESLint for code linting
- Follow Next.js and React best practices
- Use Tailwind CSS for styling

### Building for Production
```bash
pnpm build
pnpm start
```

## Security Notes

- Authentication is currently implemented as a simple mock system
- In production, implement proper JWT authentication with the backend
- Use HTTPS in production
- Validate all user inputs
- Implement proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Dint system and follows the project's licensing terms.
