# GCIF Frontend - Project Structure Guide

## 📋 Overview

GCIF (Application to Support Group Formation and Capstone Thesis Development for Information Technology Students at FPT University) is a web platform that helps IT students at FPT University find suitable capstone project topics and form compatible teams through AI. The frontend is built with Next.js 14 App Router and Ant Design.

## 🎯 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Ant Design 5.x + @ant-design/icons
- **Styling**: Tailwind CSS 4.x (utility-first)
- **State Management**: Zustand (lightweight & modern)
- **Form Management**: React Hook Form + @hookform/resolvers
- **Schema Validation**: Zod (runtime type safety)
- **API Integration**: Axios (HTTP client)
- **Icons**: Lucide React + Ant Design Icons
- **Utilities**:
  - clsx (conditional classes)
  - dayjs (date manipulation)
- **Code Quality**: ESLint, Prettier, Husky
- **Package Manager**: pnpm (fast & efficient)
- **Build Tool**: Next.js built-in (Turbopack)

## 🏗️ Project Structure

```text
the-sync-frontend/
├── docs/                           # 📚 Project documentation
├── public/                         # 🖼️ Static assets (images, icons, etc.)
├── src/
│   ├── app/                        # 🛣️ Next.js App Router
│   │   ├── (auth)/                 # 🔐 Authentication routes (route group)
│   │   │   ├── layout.tsx          # Auth layout wrapper
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/            # 📊 Protected dashboard routes
│   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   ├── admin/              # 👨‍💼 Admin role routes
│   │   │   ├── lecturer/           # 👩‍🏫 Lecturer role routes
│   │   │   └── student/            # 👨‍🎓 Student role routes
│   │   ├── profile/                # 👤 Common profile (all roles)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home/Landing page
│   │   ├── loading.tsx             # Global loading UI
│   │   ├── error.tsx               # Global error UI
│   │   ├── not-found.tsx           # 404 page
│   │   └── globals.css             # Global styles
│   │
│   ├── components/                 # 🧩 React Components
│   │   ├── ui/                     # 🎨 Reusable UI components (Ant Design wrappers)
│   │   ├── layout/                 # 🏠 Layout components (Header, Sidebar, Footer)
│   │   ├── features/               # 🎯 Feature-specific components
│   │   └── common/                 # 🔧 Common shared components
│   │
│   ├── lib/                        # 📚 Utilities & Core Logic
│   │   ├── services/               # 🌐 API service layer
│   │   ├── api.ts                  # Axios instance & interceptors
│   │   ├── auth.ts                 # Authentication utilities
│   │   ├── constants.ts            # App constants & enums
│   │   ├── utils.ts                # General utility functions
│   │   └── validations.ts          # Form validation schemas
│   │
│   ├── hooks/                      # 🪝 Custom React hooks
│   ├── store/                      # 🏪 Zustand global state stores
│   │   ├── index.ts                # Store exports
│   │   ├── useAppStore.ts          # App-wide state (UI, preferences)
│   │   ├── useNotificationStore.ts # Notification system
│   │   └── useThemeStore.ts        # Theme & UI settings
│   ├── types/                      # 📝 TypeScript type definitions
│   ├── styles/                     # 🎨 Additional styling files
│   └── middleware.ts               # 🛡️ Route protection middleware
│
├── scripts/                        # 🔧 Build & deployment scripts
├── .github/                        # 🤖 GitHub workflows
└── [config files]                  # ⚙️ Configuration files
```

## 🎭 User Roles & Routes

### 👨‍💼 Admin Role

- **Base Route**: `/admin`
- **Features**: User management, semester setup, role assignment, system reports
- **Permissions**: Full system access

### 👩‍🏫 Lecturer Role

- **Base Route**: `/lecturer`
- **Features**: Thesis topic management, group supervision, progress monitoring
- **Permissions**: Topic CRUD, group approval, student evaluation

### 👨‍🎓 Student Role

- **Base Route**: `/student`
- **Features**: Profile setup, AI topic suggestions, group formation, progress tracking
- **Permissions**: Own profile, group participation, thesis registration

## 📁 Folder Conventions

### `/src/components/`

#### `ui/` - UI Components

```text
ui/
├── Button/
│   ├── index.tsx               # Main component
│   ├── Button.types.ts         # Props interface
│   └── Button.stories.tsx      # Storybook (optional)
└── index.ts                    # Barrel exports
```

**Purpose**: Wrapper components for Ant Design to customize theme/behavior

#### `layout/` - Layout Components

```text
layout/
├── Header/
├── Sidebar/
│   ├── AdminSidebar.tsx
│   ├── LecturerSidebar.tsx
│   └── StudentSidebar.tsx
├── Footer/
└── DashboardLayout/
```

#### `features/` - Feature Components

```text
features/
├── auth/                       # Authentication related
├── thesis/                     # Thesis management
├── groups/                     # Group formation
├── progress/                   # Progress tracking
└── reports/                    # Reports & analytics
```

#### `common/` - Shared Components

```text
common/
├── Loading.tsx                 # Loading spinners
├── ErrorBoundary.tsx           # Error handling
├── RoleGuard.tsx              # Permission wrapper
└── PageHeader.tsx             # Page title component
```

### `/src/lib/`

#### `services/` - API Layer

```typescript
// Example: userService.ts
export const userService = {
	getUsers: () => apiClient.get('/users'),
	createUser: (data) => apiClient.post('/users', data),
	updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
	deleteUser: (id) => apiClient.delete(`/users/${id}`),
};
```

#### Core Files

- **`api.ts`**: Axios configuration, interceptors, base URL setup
- **`auth.ts`**: Token management, auth state, login/logout utilities
- **`constants.ts`**: App-wide constants, enums, static data
- **`utils.ts`**: Helper functions, formatters, validators
- **`validations.ts`**: Zod/Yup schemas for form validation

### `/src/types/`

```typescript
// Example: user.ts
export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	createdAt: Date;
	updatedAt: Date;
}
```

## 🚀 Development Guidelines

### 1. **Adding New Pages**

```typescript
// src/app/(dashboard)/student/new-feature/page.tsx
export default function NewFeaturePage() {
	return (
		<div>
			<h1>New Feature</h1>
		</div>
	);
}
```

### 2. **Creating Components**

```typescript
// src/components/features/thesis/ThesisCard.tsx
import { Card } from '@/components/ui'
import { Thesis } from '@/types'

interface ThesisCardProps {
	thesis: Thesis
	onSelect?: (thesis: Thesis) => void
}

export function ThesisCard({ thesis, onSelect }: ThesisCardProps) {
	return (
		<Card>
			{/* Component content */}
		</Card>
	);
}
```

### 3. **Adding Services**

```typescript
// src/lib/services/thesisService.ts
import { apiClient } from '../api';

import { CreateThesisDto, Thesis } from '@/types';

export const thesisService = {
	getTheses: async (): Promise<Thesis[]> => {
		const response = await apiClient.get('/thesis');
		return response.data;
	},

	createThesis: async (data: CreateThesisDto): Promise<Thesis> => {
		const response = await apiClient.post('/thesis', data);
		return response.data;
	},
};
```

### 4. **Custom Hooks**

```typescript
// src/hooks/useThesis.ts
import { useEffect, useState } from 'react';

import { thesisService } from '@/lib/services';

export function useThesis() {
	const [theses, setTheses] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchTheses = async () => {
		setLoading(true);
		try {
			const data = await thesisService.getTheses();
			setTheses(data);
		} finally {
			setLoading(false);
		}
	};

	return { theses, loading, fetchTheses };
}
```

## 🔧 Import Conventions

### Absolute Imports (Configured in tsconfig.json)

```typescript
// ✅ Good - Use absolute imports
import { Button } from '@/components/ui'
import { userService } from '@/lib/services'
import { User } from '@/types'

// ❌ Avoid - Relative imports for src files
import { Button } from '../../../components/ui/Button'
```

### Barrel Exports

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';

// src/lib/services/index.ts
export { userService } from './userService';
export { thesisService } from './thesisService';
```

## 🛡️ Route Protection

### Middleware Setup

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
	// Auth check
	// Role-based access control
	// Redirect logic
}

export const config = {
	matcher: ['/admin/:path*', '/lecturer/:path*', '/student/:path*'],
};
```

### Role Guard Component

```typescript
// src/components/common/RoleGuard.tsx
interface RoleGuardProps {
	allowedRoles: UserRole[]
	children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
	const { user } = useAuth()

	if (!allowedRoles.includes(user.role)) {
		return <div>Access Denied</div>
	}

	return <>{children}</>
}
```

## 📝 Naming Conventions

### Files & Folders

- **Components**: PascalCase (`UserCard.tsx`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **Folders**: kebab-case (`user-management/`)
- **Hooks**: camelCase starting with 'use' (`useAuth.ts`)
- **Services**: camelCase ending with 'Service' (`userService.ts`)
- **Types**: PascalCase (`User.ts`, `ApiResponse.ts`)

### Code

- **Variables**: camelCase (`userData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`USER_ROLES`, `API_ENDPOINTS`)
- **Functions**: camelCase (`fetchUsers`, `handleSubmit`)
- **Interfaces**: PascalCase (`UserProps`, `ApiResponse`)

## 🔄 Development Workflow

### 1. **Feature Development**

```bash
1. Create feature branch: git checkout -b feature/thesis-management
2. Add types in /types if needed
3. Create service in /lib/services
4. Build components in /components/features
5. Create pages in appropriate role folder
6. Test & commit
```

### 2. **Component Development**

```bash
1. Create component in appropriate folder
2. Add props interface
3. Export from index.ts
4. Import and use in pages
```

### 3. **API Integration**

```bash
1. Define types for API responses
2. Create service functions
3. Use in custom hooks
4. Consume in components
```

## 🎨 Styling Guidelines

### Ant Design + Tailwind

```typescript
// ✅ Good - Combine both
<Button
	type="primary"
	className="w-full mt-4"
>
	Submit
</Button>

// ✅ Good - Use Ant Design props first
<Card
	title="User Info"
	className="shadow-lg"
>
	Content
</Card>
```

### Custom Themes

```css
/* src/styles/antd-custom.css */
.ant-btn-primary {
	/* Custom primary button styles */
}
```

## 🚀 Getting Started

### 1. **Setup Development Environment**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint
```

### 2. **Create Your First Feature**

1. Define types in `/src/types/`
2. Create service functions in `/src/lib/services/`
3. Build components in `/src/components/features/`
4. Add pages in appropriate role folder
5. Test your implementation

### 3. **Follow the Patterns**

- Look at existing components for patterns
- Use absolute imports
- Follow naming conventions
- Add proper TypeScript types
- Export from index.ts files

## 📞 Support

- **Documentation**: Check this file and inline comments
- **Code Examples**: Look at existing implementations
- **Team Lead**: Contact for architecture decisions
- **Issues**: Create GitHub issues for bugs/features

---

## Happy Coding! 🚀

_This structure is designed to scale with the GCIF project needs and provide clear separation of concerns for team collaboration._
