# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For more information about this project, see the [README](./README.md).

---

## [0.1.0] - 2025-06-18

This is the first release of TheSync Frontend - a modern web application built with Next.js, Ant Design, and Tailwind CSS.

### Added

#### Authentication & Authorization

- Complete authentication system with NextAuth and JWT ([#9](https://github.com/5-logic/the-sync-frontend/pull/9), [#10](https://github.com/5-logic/the-sync-frontend/pull/10), [#11](https://github.com/5-logic/the-sync-frontend/pull/11))
- Role-based access control with admin, lecturer, and student roles
- Permission-based navigation and page protection
- Login page with support for both email and username authentication
- Token validation and session management with TTL caching

#### User Interface & Layout

- Responsive collapsible sidebar layout ([#12](https://github.com/5-logic/the-sync-frontend/pull/12), [#13](https://github.com/5-logic/the-sync-frontend/pull/13))
- Role-based navigation sidebars for admin, lecturer, and student
- Modern header components with user profile integration
- Footer component with responsive design
- Enhanced navigation loading with smart detection
- Chatbot widget integration for user support ([#46](https://github.com/5-logic/the-sync-frontend/pull/46), [#48](https://github.com/5-logic/the-sync-frontend/pull/48))

#### Admin Management Features

- Student management interface ([#19](https://github.com/5-logic/the-sync-frontend/pull/19), [#20](https://github.com/5-logic/the-sync-frontend/pull/20))
  - Create, read, update, delete student accounts
  - Import students from Excel files
  - Student filtering and search functionality
- Lecturer management system ([#35](https://github.com/5-logic/the-sync-frontend/pull/35))
  - Complete CRUD operations for lecturer accounts
  - Lecturer profile management
- Semester settings management ([#44](https://github.com/5-logic/the-sync-frontend/pull/44), [#45](https://github.com/5-logic/the-sync-frontend/pull/45))
  - Semester creation and editing
  - Semester table with search and filter capabilities
- Milestone management ([#50](https://github.com/5-logic/the-sync-frontend/pull/50))
  - Create and manage project milestones
  - Date validation and overlap checking
  - Milestone table with edit functionality

#### Thesis Management

- Comprehensive thesis creation and editing interface ([#39](https://github.com/5-logic/the-sync-frontend/pull/39))
- Thesis detail view with metadata and progress tracking
- File upload functionality for supporting documents
- Thesis duplicate detection and management
- Review system with timeline tracking
- Status management and action buttons

#### Data Management & Services

- Complete API integration with HTTP client service ([#23](https://github.com/5-logic/the-sync-frontend/pull/23))
- Comprehensive data schemas with Zod validation ([#23](https://github.com/5-logic/the-sync-frontend/pull/23))
- Service layer for all major entities (students, lecturers, semesters, milestones)
- Global state management with Zustand stores
- API response handling utilities with error management

#### Development Experience

- TypeScript configuration with strict type checking
- ESLint and Prettier integration with commit hooks
- Husky for git hooks and commit message validation
- GitHub Actions for CI/CD (build, lint, test workflows)
- Commitlint for conventional commit messages
- Automated release workflow with semantic versioning

#### UI Components & Styling

- Integration with Ant Design component library
- Tailwind CSS for utility-first styling
- Custom component library with form components
- Responsive design patterns
- Loading states and error handling components
- Notification system for user feedback

### Changed

- Migrated from class components to functional components with hooks
- Improved form validation with enhanced error messages
- Enhanced authentication loading logic and state management
- Optimized navigation performance with smart caching
- Refactored layout components for better reusability

### Fixed

- Sonar Cloud security issues and code quality improvements ([#62](https://github.com/5-logic/the-sync-frontend/pull/62))
- Build configuration and dependency issues
- Import path corrections throughout the application
- Form validation edge cases
- Navigation state persistence
- Performance optimizations for large data sets

### Technical Details

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Ant Design
- **Authentication**: NextAuth.js with JWT
- **State Management**: Zustand
- **Validation**: Zod schemas
- **HTTP Client**: Axios with interceptors
- **Development**: TypeScript, ESLint, Prettier
- **CI/CD**: GitHub Actions

---

## [Unreleased]

Changes that are committed but not yet released.

---

**Links:**

- [GitHub Repository](https://github.com/5-logic/the-sync-frontend)
- [Documentation](./README.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)

**Tags:**

- [0.1.0](https://github.com/5-logic/the-sync-frontend/releases/tag/0.1.0)
