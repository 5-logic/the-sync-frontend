# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For more information about this project, see the [README](./README.md).

---

## [1.0.4] - 2025-08-21

### Added

#### Dashboard Enhancement Features

- **Refresh Functionality:** Enhanced SemesterFilter with refresh button for real-time data updates ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Added refresh button with loading state and disabled state when no semester is selected
  - Integrated dashboard statistics and AI statistics refresh capabilities

#### Enhanced Data Tracking

- **Supervisor Load Analytics:** Improved supervisor workload tracking with additional metrics ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Added `rawThesisCount` to SupervisorLoadDistribution interface for enhanced data tracking
  - Better supervisor load distribution analysis

### Changed

#### Code Quality & Performance Improvements

- **Excel Import System Enhancement:** Comprehensive improvements to Excel import functionality ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Implemented robust `safeStringify` function for improved value handling in ExcelImportForm
  - Enhanced function to handle primitive types, complex objects, functions, and edge cases more safely
  - Added explicit type assertions for better type safety

#### User Interface Enhancements

- **Layout & Styling Improvements:** Comprehensive UI/UX improvements across multiple components ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Enhanced layout and styling for search & filter bars in admin components
  - Improved semester select styling in StudentFilterBar
  - Better responsive design for LecturerFilterBar and StudentFilterBar components
  - Enhanced MilestoneManagement component layout

#### Content & Terminology Updates

- **Improved User Experience Text:** Enhanced text clarity and consistency across components ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Updated thesis option descriptions for better clarity and consistency
  - Simplified tooltip titles in GroupAssignTable for improved user understanding
  - Simplified SupervisorLoadChart text by removing max load information for cleaner presentation

#### Data Model Improvements

- **Terminology Standardization:** Updated data model terminology for better consistency ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Renamed `thesisApproved` to `thesisPublished` in ProgressOverview and DashboardService
  - Better alignment with business terminology and workflow

### Fixed

#### Component Performance & Reliability

- **Table Component Improvements:** Enhanced table component stability and performance ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Added `draftContentHash` for improved key generation in supervisor assignment table component
  - Improved hash generation using `localeCompare` for consistent sorting
  - Better component re-rendering optimization

#### Code Standardization

- **Code Quality Fixes:** Comprehensive code formatting and standardization ([#367](https://github.com/5-logic/the-sync-frontend/pull/367))
  - Standardized string quotes throughout multiple components for consistency
  - Improved code formatting in NoThesisCard and ExcelImportForm components

### Technical Details

- **Files Changed:** 12 files with 681 additions and 479 deletions
- **Enhanced Components:** ProgressOverview, SemesterFilter, SupervisorLoadChart, ExcelImportForm, LecturerFilterBar, StudentFilterBar, GroupAssignTable, NoThesisCard
- **Service Improvements:** Enhanced dashboard.service.ts with improved data model and terminology
- **Performance:** Better table key generation, improved hash algorithms, enhanced component re-rendering
- **User Experience:** Refresh functionality, improved layouts, clearer text and tooltips

### Migration Notes

- **API Changes:** Applications using `thesisApproved` field should update to use `thesisPublished`
- **Data Model:** New `rawThesisCount` field in SupervisorLoadDistribution interface provides additional analytics data
- **Component Updates:** Enhanced Excel import functionality provides better error handling and type safety
- **UI Changes:** Improved layouts and styling may require testing for custom styling implementations

---

## [1.0.3] - 2025-08-20

### Added

#### Group Responsibility Analytics System

- **Responsibility Radar Visualization:** New group responsibility tracking and visualization features ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - GroupResponsibilityAverage interface for tracking average responsibility levels
  - getGroupResponsibilities API endpoint for fetching group responsibility data
  - Integration of responsibility radar charts into GroupInfoCard for group analytics
  - Real-time responsibility level tracking with loading states and error handling

#### Enhanced AI Reasoning & Analysis

- **AI Reasoning Display:** New AIReasoningCollapse component for improved AI analysis transparency ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Collapsible AI reasoning explanations with custom styling
  - Integration into AI suggestion components for better user understanding
  - Enhanced AISuggestThesisCard with detailed reasoning display and orientation tagging

#### Template Management System

- **Enhanced Template Downloads:** Improved template download functionality with fallback support ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Added local template fallback system for reliable downloads
  - New "Thesis Register Document Template.docx" file in public assets
  - Remote template validation with automatic local fallback
  - Enhanced error handling for template download failures

#### Role-Based Thesis Management

- **Role-Specific Filtering:** Enhanced thesis management with role-based access control ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Dynamic status options based on user role (moderator vs regular lecturer)
  - Improved ThesisFilterBar with role-aware filtering capabilities
  - Enhanced thesis management workflow for different user types

### Changed

#### Enhanced User Profile Management

- **Profile Setup Integration:** Improved user profile management and group suggestions ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Enhanced StudentAccountForm with required field validation
  - Profile setup modal integration for better group suggestion experience
  - Improved AI suggestion visibility logic for group leaders

#### Radar Chart System Improvements

- **Chart Visualization Enhancements:** Refined radar chart functionality and display ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Corrected PolarRadiusAxis angle in BaseRadarChart for proper orientation
  - Removed artificial minimum level constraints for more accurate data representation
  - Simplified responsibility display logic in StudentInfoCard for better readability
  - Enhanced SuggestedStudentCard layout and styling

#### Milestone & Submission Management

- **Enhanced Milestone Tracking:** Improved milestone submission and tracking capabilities ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Enhanced MilestoneDetailCard with better error handling and notifications
  - Improved submission update logic with proper validation
  - Better user feedback for milestone-related actions

#### Code Quality & Standardization

- **Comprehensive Code Improvements:** Standardized code quality across components ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Standardized string quotes throughout the codebase
  - Improved useStudentRequestStatus hook functionality
  - Enhanced component rendering logic and performance optimization

### Fixed

#### Group Management & Permissions

- **Group Modification Logic:** Improved group management permissions and validation ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Removed unnecessary group modification checks in GroupInfoCard
  - Simplified group leader permissions for editing group information
  - Enhanced group validation logic in JoinGroupForm with better comments

#### AI Suggestion System

- **AI Component Performance:** Enhanced AI suggestion system reliability and performance ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Improved AI suggestion button visibility logic
  - Enhanced orientation display in thesis suggestions
  - Better error handling in AI reasoning components

#### Form Validation & User Experience

- **Enhanced Form Handling:** Improved form validation and user interaction ([#366](https://github.com/5-logic/the-sync-frontend/pull/366))
  - Required field validation in StudentAccountForm
  - Enhanced thesis-related form handling and validation
  - Improved user feedback and notification systems

### Technical Details

- **Files Changed:** 22 files with 595 additions and 284 deletions
- **Enhanced Components:** GroupInfoCard, AIReasoningCollapse, ThesisFileUpload, ThesisFilterBar, BaseRadarChart, StudentInfoCard, AISuggestThesisCard, MilestoneDetailCard
- **Service Improvements:** Enhanced groups.service.ts with responsibility tracking, improved ai.service.ts
- **New Features:** Group responsibility analytics, AI reasoning display, template fallback system, role-based filtering
- **Performance:** Enhanced component rendering, better error handling, improved loading states

### Migration Notes

- **Group Responsibilities:** New responsibility tracking requires backend support for responsibility analytics
- **Template System:** Enhanced template download system provides better reliability but may require cache refresh
- **Role-Based Features:** New role-specific filtering requires proper user role configuration
- **AI Enhancements:** Enhanced AI reasoning display may require updates to existing AI integration implementations

---

## [1.0.2] - 2025-08-18

### Added

#### Radar Chart Visualization System

- **Responsibility Radar Charts:** New interactive chart components for visualizing student responsibility levels ([#365](https://github.com/5-logic/the-sync-frontend/pull/365))
  - BaseRadarChart component for foundational radar chart functionality
  - InteractiveRadarChart component for interactive responsibility assessment
  - ResponsibilityRadarChart component for displaying student responsibility levels
  - Integration of radar charts into SuggestedStudentCard and StudentInfoCard components

#### Enhanced AI Suggestions

- **Improved Group Recommendations:** Enhanced AI suggestion system with better group matching
  - Updated AISuggestionCard with group leader information and member count logic
  - Enhanced AISuggestions component with improved data handling using SuggestGroupsData structure
  - Better thesis application logic integration in AI recommendations

### Changed

#### Terminology Updates

- **"Register" to "Apply" Migration:** Comprehensive terminology update across the application
  - Renamed "Register Thesis Request" to "Apply Thesis Request" throughout the UI
  - Updated page route from `/student/register-thesis` to `/student/apply-thesis-request`
  - Updated ThesisCard and ActionButtons components to use "apply" terminology
  - Enhanced thesis application workflow with improved user experience

#### Component Architecture Improvements

- **Enhanced Code Clarity:** Improved component structure and prop handling
  - Refactored join request handling in AISuggestionCard for better code reusability
  - Updated key props in AISuggestThesisCard and ViewListThesis for improved rendering
  - Enhanced props with readonly modifiers in BaseRadarChart and ResponsibilityRadarChart
  - Updated student-related components and services for better consistency

#### Skills System Removal

- **Streamlined Data Model:** Removed skills-based functionality to simplify the application
  - Removed skill.ts and skillSet.ts data files
  - Eliminated skill-sets.service.ts and related skill functionality
  - Removed useSkillSetStore.ts from state management
  - Updated AI suggestions to remove skills references and focus on other matching criteria

### Fixed

#### UI and Rendering Improvements

- **Better Component Rendering:** Enhanced user interface consistency and performance
  - Fixed key props issues in thesis and group-related components
  - Improved radar chart component immutability with readonly props
  - Enhanced color definitions and clarity in chart components (level 2 color improvements)
  - Updated thesis application handling with better state management

#### Code Quality Enhancements

- **Improved Code Consistency:** Better code organization and readability
  - Standardized code formatting and consistency across multiple components
  - Enhanced join group logic with better error handling
  - Improved component prop validation and type safety
  - Better state management in thesis application workflows

## [1.0.1] - 2025-08-16

### Added

#### Group Management System Enhancement

- **Complete Group Management Page:** Comprehensive group management functionality for administrators ([#356](https://github.com/5-logic/the-sync-frontend/pull/356), [#360](https://github.com/5-logic/the-sync-frontend/pull/360), [#361](https://github.com/5-logic/the-sync-frontend/pull/361))
  - New Group Management page with full CRUD operations for groups
  - AdminGroup interface implementation for enhanced group data handling
  - CreateForm component for efficient group creation with bulk functionality
  - GroupsTable component with advanced filtering, sorting, and management features
  - Group formatting functionality with confirmation modals for admin users
  - Enhanced group deletion functionality with comprehensive error handling

#### Thesis Request Management System

- **Request Apply Thesis Feature:** New comprehensive thesis application management system ([#357](https://github.com/5-logic/the-sync-frontend/pull/357))
  - RequestApplyThesisTable component for managing thesis applications
  - ThesisRequestsModal for detailed thesis request handling
  - GroupDetailModal and ThesisDetailModal for comprehensive information display
  - Enhanced thesis application workflow with status management and approval processes
  - Thesis application filtering and search capabilities

#### Enhanced Thesis Registration System

- **Theses Registration Page:** Advanced thesis registration management for lecturers ([#358](https://github.com/5-logic/the-sync-frontend/pull/358))
  - ThesesRegistrationTable with comprehensive filtering and search functionality
  - SharedThesisFilterBar for consistent filtering across thesis-related components
  - ThesisApplicationTable with reusable columns and search/filter controls
  - Enhanced thesis orientation feature with display and selection options
  - Duplicate theses detection with automatic checking for pending applications

#### Student Join Group Enhancement

- **Improved Join Group Experience:** Enhanced group joining functionality for students
  - Refactored Join Group page with improved navigation and user experience
  - Enhanced GroupCard component with better status checks and button configuration
  - Improved group join logic with better notifications and error handling
  - Enhanced group browsing with better filtering and display options

### Changed

#### Administrative Interface Improvements

- **Enhanced Admin Navigation:** Improved administrative interface with new management tools
  - Added Group Management route to admin sidebar with dynamic routing support
  - Enhanced breadcrumb navigation for Group Management sections
  - Improved admin user interface with better component organization

#### Thesis Management Enhancements

- **Improved Thesis Workflows:** Streamlined thesis-related processes across all user roles
  - Enhanced thesis application handling with local state management
  - Improved thesis registration terminology for better clarity
  - Updated thesis orientation labels and selection interface
  - Enhanced thesis filtering logic with better validation

#### Component Architecture Improvements

- **Reusable Component Development:** Enhanced component reusability and maintainability
  - Extracted shared rendering utilities for group management components
  - Implemented reusable ThesisApplicationTable columns for consistent UI
  - Enhanced SearchAndFilterControls for standardized filtering interfaces
  - Improved component prop handling with readonly modifiers

#### Code Quality & Standardization

- **Comprehensive Code Improvements:** Enhanced code quality and consistency
  - Standardized quotation marks across all components
  - Improved regex patterns for group code extraction
  - Enhanced error handling with Axios error support
  - Optimized component rendering with useCallback implementations

### Fixed

#### Group Management Fixes

- **Enhanced Group Operations:** Improved group management functionality and reliability
  - Fixed group status checks and button configuration logic
  - Enhanced group creation error handling with detailed user messages
  - Improved group join logic with better notifications and status management
  - Fixed group deletion restrictions and permission handling

#### Form and Validation Improvements

- **Better Form Handling:** Enhanced form validation and user experience
  - Improved error handling in group creation with dedicated error functions
  - Enhanced semester selection with status tags in forms
  - Fixed validation logic for group operations and thesis applications
  - Better handling of form state management and change detection

#### User Interface Fixes

- **UI/UX Enhancements:** Improved user interface and interaction patterns
  - Enhanced tooltip functionality for action buttons in tables
  - Improved responsive design for group and thesis management interfaces
  - Better loading state management across components
  - Fixed navigation and routing issues in student interfaces

### Technical Details

- **Files Changed:** 107 files with 6,957 additions and 3,139 deletions
- **New Components:** GroupManagement suite (CreateForm, GroupsTable), RequestApplyThesis components (GroupDetailModal, ThesisDetailModal, ThesisRequestsModal), ThesesRegistration components
- **Enhanced Services:** thesis-application.service.ts, enhanced groups.service.ts with admin functionality
- **New Hooks:** useAdminGroupActions, useCreateGroups, useFormatGroups, useGroupManagement, useRequestApplyThesis, useThesisRequests, useThesisApplications
- **Enhanced Stores:** useGroupsStore with improved state management
- **New Utilities:** groupManagementRenderer for shared component rendering, enhanced orientation constants

### API Enhancements

- **Group Management:** New admin APIs for comprehensive group management operations
- **Thesis Applications:** Enhanced thesis application endpoints with status management
- **Request System:** Improved request handling for thesis applications and group management
- **Authentication:** Enhanced role-based access control for administrative functions

### Migration Notes

- **Group Management:** New admin group management features require proper administrative permissions
- **Thesis Applications:** Enhanced thesis application system may require updates to existing workflow implementations
- **Navigation Updates:** New routing structure for group management requires cache refresh for optimal performance
- **Component Updates:** Shared component utilities provide better code reuse but may require updates to custom implementations

---

## [1.0.0] - 2025-08-12

### Added

#### Enhanced User Experience & Accessibility

- **Improved Chart Accessibility:** Enhanced AIUsageChart with better keyboard navigation and accessibility features ([#354](https://github.com/5-logic/the-sync-frontend/pull/354), [#352](https://github.com/5-logic/the-sync-frontend/pull/352))
  - Replaced legend divs with buttons for improved accessibility and keyboard interaction
  - Added role attributes and enhanced keyboard navigation support
  - Responsive design improvements with better skeleton loading states

#### Student Review System Enhancements

- **ReviewerInfo Component:** New comprehensive reviewer information display for students ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Added ReviewerInfo component with detailed reviewer display functionality
  - Enhanced student review hooks (useReviews) for better data management
  - Improved review information presentation in student dashboard

#### Supervisor Assignment Improvements

- **Enhanced Assignment Features:** Comprehensive improvements to supervisor assignment workflow ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Added status filter to supervisor assignment page for better navigation
  - Implemented sorting by picked status in supervisor assignment table
  - Enhanced supervisor assignment table with improved filtering and status management

### Changed

#### Chart and Data Visualization

- **Dynamic Chart Configuration:** Improved chart performance and visual presentation ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Updated chart configuration to dynamically calculate maxValue and gridValue
  - Enhanced chart responsiveness and data presentation
  - Improved skeleton loading states for better user experience

#### Submission Management System

- **Enhanced Submission Handling:** Comprehensive improvements to submission workflow ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Updated submission handling with proper update permissions and user messages
  - Enhanced submission validation with better timeframe checks
  - Streamlined document rendering checks and validation logic

#### User Interface Improvements

- **Responsive Design Enhancements:** Improved responsive behavior across multiple components ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Added responsive behavior to MyThesisSection component
  - Enhanced responsive design for assign supervisor page
  - Improved mobile and tablet experience across key components

#### Code Quality & Consistency

- **Code Standardization:** Comprehensive code quality improvements ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Standardized quotation marks across multiple components for consistency
  - Improved code readability in ThesisTable and GroupTable components
  - Enhanced formatting in CapstoneDefenseResults and GroupTableInfo components

### Fixed

#### Review Assignment System

- **Simplified Review Logic:** Enhanced review assignment and data extraction ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Simplified assignment reviews extraction with optional chaining
  - Improved error handling in review data processing
  - Better null and undefined handling in review components

#### User Feedback & Interaction

- **Enhanced User Feedback:** Improved user interaction and feedback systems ([#354](https://github.com/5-logic/the-sync-frontend/pull/354))
  - Updated register button text and loading state for improved user feedback
  - Enhanced loading states and user messaging throughout the application
  - Better error handling and user notification systems

#### Data Processing & Validation

- **Robust Data Handling:** Improved data processing and validation throughout the application
  - Enhanced submission update logic to allow changes within specified timeframe
  - Better validation logic for document rendering and submission processing
  - Improved error handling and data consistency checks

### Technical Details

- **Files Changed:** 16 files with significant improvements across dashboard, lecturer, and student components
- **Enhanced Components:** AIUsageChart, GroupTableInfo, SupervisorLoadChart, ThesisOverviewTable, MilestoneDetailCard, ReviewerInfo
- **Service Improvements:** Enhanced reviews.service.ts with better data handling and API integration
- **New Features:** Status filtering, improved sorting, enhanced accessibility, responsive design
- **Performance:** Dynamic chart calculations, optimized data loading, better skeleton states

### Migration Notes

- **Chart Components:** AIUsageChart now uses dynamic calculations - existing implementations should be tested for compatibility
- **Review System:** Enhanced review hooks provide better data management - review custom review implementations
- **Responsive Design:** New responsive behaviors may affect custom styling - test mobile and tablet layouts
- **Accessibility:** Enhanced keyboard navigation may require updates to custom accessibility implementations

---

## [0.9.1] - 2025-08-12

### Added

#### Duplicate Thesis Detection Enhancement

- **Reason Display for Duplicates:** Enhanced duplicate thesis detection with detailed reason explanations ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Added reasons for duplicate theses display in DuplicateThesisCard component
  - Enhanced AI duplicate detection service with improved reason reporting
  - PercentageDisplay component extracted for better readability and reusability

#### Authentication & Security Improvements

- **Enhanced Cookie Management:** Improved authentication system with centralized cookie utilities ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - New CookieUtils utility for standardized cookie management across authentication services
  - Enhanced token management with improved security and reliability
  - Better logout functionality with proper cleanup and session management

#### Supervisor Assignment Enhancements

- **Enhanced Data Structure:** Improved supervisor assignment system with comprehensive tracking ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Updated supervisor assignment data structure to include group ID and status information
  - Enhanced SupervisorColumns component with better sorting and status management
  - Extracted sorting logic for picked status into separate reusable functions

### Changed

#### Code Quality & Standardization

- **String Quote Standardization:** Comprehensive code standardization across all components ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Standardized string quotes throughout the entire codebase for consistency
  - Improved code formatting and readability across 35+ components
  - Enhanced import statement organization and component structure

#### Component Architecture Improvements

- **Enhanced Thesis Management:** Streamlined thesis-related components with better data handling ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Enhanced thesis detail fetching with parallel data retrieval for better performance
  - Improved thesis publish logic in ThesisTable and AssignListPublishThesis components
  - Better loading state handling in thesis actions and table components

#### User Interface Enhancements

- **Improved Form Handling:** Enhanced form components with better validation and user experience ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Simplified OTP input handling with improved validation in PasswordResetOtpForm
  - Enhanced UserForm component with better semester selection logic
  - Improved error handling in thesis registration hooks

#### Performance Optimizations

- **Data Fetching Improvements:** Optimized data retrieval and component rendering ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Streamlined thesis detail fetching with parallel data retrieval
  - Enhanced semester fetching in ThesisFilterBar and related components
  - Improved component structure for better maintainability

### Fixed

#### Authentication & Security Fixes

- **Token Management:** Fixed authentication issues with improved token handling ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Replaced deprecated substr with substring for cookie name extraction
  - Enhanced logout functionality across all authentication services
  - Improved session management with better cleanup procedures

#### Component Functionality Fixes

- **Enhanced Component Logic:** Fixed various component issues and improved functionality ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Fixed supervisor information handling in ThesisInfoCard component
  - Enhanced thesis detail fetching to include supervisors and lecturer information
  - Improved status transition logic in SemesterTable component

#### User Experience Fixes

- **Form and Navigation Improvements:** Enhanced user interaction and navigation ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Simplified percentage display logic in DuplicateThesisCard for better clarity
  - Enhanced breadcrumb navigation with improved path handling
  - Better component naming and organization for developer experience

### Removed

#### Deprecated Components

- **Timeline Review System:** Removed unused timeline review components ([#351](https://github.com/5-logic/the-sync-frontend/pull/351))
  - Removed TimelineReview page and associated components
  - Cleaned up ProjectMilestone, ReviewGroupTable, and TimelineStats components
  - Updated sidebar configuration to remove timeline review navigation

### Technical Details

- **Files Changed:** 35 files with 2,042 additions and 1,697 deletions
- **Enhanced Components:** DuplicateThesisCard, PasswordResetOtpForm, SupervisorColumns, ThesisInfoCard, UserForm, SemesterTable
- **New Utilities:** CookieUtils for centralized cookie management in authentication
- **Removed Components:** TimelineReview components and related infrastructure
- **Code Quality:** Comprehensive string quote standardization and formatting improvements

### Migration Notes

- **Authentication Updates:** Applications using custom authentication may need to update cookie handling to use the new CookieUtils
- **Component Updates:** Components relying on timeline review functionality should migrate to alternative review systems
- **Code Standards:** Development teams should adopt the standardized string quote conventions for consistency

---

## [0.9.0] - 2025-08-04

### Added

#### AI-Enhanced Analytics & Statistics

- **AI Usage Dashboard:** Comprehensive AI statistics tracking and visualization ([#320](https://github.com/5-logic/the-sync-frontend/pull/320), [#318](https://github.com/5-logic/the-sync-frontend/pull/318))
  - AIUsageChart component with interactive donut chart visualization
  - AI statistics service for tracking AI feature usage across semesters
  - Enhanced dashboard with AI usage metrics for administrators
  - Support for multiple AI services: duplicate checking, thesis suggestions, and participant suggestions

#### Enhanced AI-Powered Thesis System

- **AI Thesis Suggestions:** Advanced AI-powered thesis recommendation system ([#314](https://github.com/5-logic/the-sync-frontend/pull/314), [#311](https://github.com/5-logic/the-sync-frontend/pull/311))
  - AISuggestThesisCard component with relevance scoring and matching factors
  - Enhanced thesis listing with AI-powered recommendations
  - Intelligent thesis matching based on student skills and preferences
  - Interactive matching factors modal for detailed recommendation insights

#### Advanced Review Management System

- **Comprehensive Review Workflow:** Enhanced review system with submission tracking ([#320](https://github.com/5-logic/the-sync-frontend/pull/320), [#319](https://github.com/5-logic/the-sync-frontend/pull/319))
  - ExistingReviewsList component for managing historical reviews
  - ViewReviewModal for detailed review examination
  - AssignedReviewersInfo component for reviewer assignment tracking
  - Enhanced milestone timing controls for non-main reviewers
  - Radio button interface for review response selection

#### Thesis Document Management

- **Document Version Control:** Advanced thesis document versioning system ([#313](https://github.com/5-logic/the-sync-frontend/pull/313))
  - ThesisDocumentVersionDialog for managing thesis document versions
  - Support for viewing and downloading different document versions
  - Enhanced thesis file upload with better validation and error handling

#### Workload Management Tools

- **Supervisor Workload Visualization:** Enhanced supervisor assignment with workload tracking ([#317](https://github.com/5-logic/the-sync-frontend/pull/317))
  - WorkloadDialog component for supervisor workload analysis
  - SupervisorLoadChart improvements with better data visualization
  - Enhanced supervisor assignment process with workload considerations

### Changed

#### Enhanced Semester Management

- **Unified Semester Handling:** Improved semester management across all components ([#318](https://github.com/5-logic/the-sync-frontend/pull/318))
  - Centralized semester store for consistent semester state management
  - Enhanced CurrentSemesterTag with improved semester display
  - useLecturerSemesterFilter hook refactored to utilize centralized semester store
  - useMilestonesSemesterFilter hook for milestone-specific semester filtering

#### Improved User Interface & Experience

- **Standardized Code Quality:** Comprehensive code standardization and UI improvements ([#320](https://github.com/5-logic/the-sync-frontend/pull/320))
  - Standardized string quotes across all components for consistency
  - Enhanced empty state handling in tables and components
  - Improved loading states with Ant Design Skeleton components
  - Better component organization and import statement formatting

#### Enhanced Review Components

- **Streamlined Review Process:** Improved review workflow and component architecture ([#319](https://github.com/5-logic/the-sync-frontend/pull/319))
  - Enhanced MilestoneDetailCard with auto-fetch and loading states
  - Improved review management with SubmissionReviewWithReviewer integration
  - Standardized date formatting across all review components
  - Enhanced layout and styling in review modals and tables

#### Service Layer Improvements

- **Consolidated Service Architecture:** Enhanced and consolidated service layer ([#320](https://github.com/5-logic/the-sync-frontend/pull/320))
  - Enhanced reviews.service.ts with expanded functionality
  - Enhanced submissions.service.ts with better submission handling
  - Removed redundant review.service.ts and submission.service.ts files
  - Enhanced AI service with improved thesis suggestion capabilities

### Fixed

#### Performance & Optimization

- **Component Performance:** Enhanced component rendering and state management
  - Optimized ReviewChecklistTable with loading skeletons
  - Improved supervisor loading display logic in GroupReviewPage
  - Enhanced empty state handling across multiple components
  - Better error handling and loading states throughout the application

#### Data Consistency & Validation

- **Enhanced Data Management:** Improved data fetching and validation
  - Fixed thesis registration logic to allow registration during "Ongoing" semester status
  - Enhanced semester filter logic with improved validation
  - Better handling of thesis document versions and file uploads
  - Improved export functionality with better data formatting

#### UI/UX Improvements

- **User Interface Enhancements:** Refined user experience across all interfaces
  - Improved layout in ViewReviewModal with better div structure and styles
  - Enhanced GroupInfo component with conditional rendering for admin users
  - Better component spacing and organization throughout the application
  - Standardized button styles and interaction patterns

### Technical Details

- **Files Changed:** 69 files with 4,168 additions and 2,145 deletions
- **New Components:** AIUsageChart, AISuggestThesisCard, ThesisDocumentVersionDialog, WorkloadDialog, ExistingReviewsList, ViewReviewModal, AssignedReviewersInfo
- **Enhanced Services:** ai-statistics.service.ts, enhanced reviews.service.ts and submissions.service.ts
- **New Hooks:** useMilestonesSemesterFilter for milestone-specific semester filtering
- **Store Improvements:** Enhanced useDashboardStore with AI statistics, improved useReviewStore and useSubmissionStore
- **Removed Components:** Deprecated Capstone Project Management page from admin sidebar

### API Enhancements

- **AI Integration:** Enhanced AI service endpoints for thesis suggestions and statistics tracking
- **Review Management:** Improved review APIs with better submission tracking and reviewer management
- **Document Versioning:** New APIs for thesis document version management and retrieval
- **Workload Analytics:** Enhanced supervisor workload tracking and analysis endpoints

### Migration Notes

- **AI Features:** New AI statistics require proper backend integration for data collection
- **Review System:** Enhanced review workflow may require updates to existing review implementations
- **Service Consolidation:** Applications using deprecated review.service.ts and submission.service.ts should migrate to the enhanced versions
- **Semester Management:** Components using custom semester handling should migrate to the centralized semester store for consistency

---

## [0.8.0] - 2025-08-01

### Added

#### Reviewer Assignment System

- **Complete Reviewer Assignment Workflow:** Comprehensive reviewer assignment system for lecturers ([#308](https://github.com/5-logic/the-sync-frontend/pull/308), [#310](https://github.com/5-logic/the-sync-frontend/pull/310), [#305](https://github.com/5-logic/the-sync-frontend/pull/305), [#300](https://github.com/5-logic/the-sync-frontend/pull/300))
  - AssignReviewerModal with support for both assignment and change operations
  - ReviewerColumns component for consistent reviewer display across tables
  - Draft reviewer assignment functionality with bulk operations
  - Advanced reviewer eligibility filtering and selection logic
  - Enhanced GroupTable with reviewer assignment capabilities

#### Dashboard Enhancements

- **Enhanced Dashboard System:** Improved dashboard with semester filtering and advanced statistics ([#307](https://github.com/5-logic/the-sync-frontend/pull/307), [#306](https://github.com/5-logic/the-sync-frontend/pull/306))
  - SemesterFilter component for dynamic semester selection
  - Enhanced DashboardStats with loading states and error handling
  - Improved ProgressOverview with enhanced data visualization
  - SupervisorLoadChart with search and filter functionality
  - New DashboardService for comprehensive statistics management

#### Group Review & Evaluation System

- **Comprehensive Group Review System:** Complete lecturer review management for group evaluations ([#310](https://github.com/5-logic/the-sync-frontend/pull/310))
  - EditReviewModal for creating and editing group reviews
  - ExistingReviewsList for managing previous reviews
  - MilestoneStepFilter for filtering reviews by milestone phases
  - ReviewGroupSearchTable for advanced group search and filtering
  - ReviewersList component for reviewer management
  - Enhanced ReviewChecklistTable with comprehensive review functionality

#### Data Export & Management

- **Export Functionality:** Enhanced data export capabilities for administrative tasks ([#307](https://github.com/5-logic/the-sync-frontend/pull/307))
  - useExportGroups hook for group data export
  - Advanced filtering and export options for group management
  - Improved data formatting for exported files

### Changed

#### Enhanced Lecturer Tools

- **Lecturer Dashboard Improvements:** Streamlined lecturer workflows with enhanced progress tracking
  - Improved LecturerProgressOverviewCard with better timeline visualization
  - Enhanced MilestoneDetailCard with improved submission file handling
  - Better GroupDetailCard with simplified thesis existence checks
  - Updated SupervisorInfoCard with enhanced display logic

#### Checklist Management Enhancements

- **Checklist System Overhaul:** Comprehensive improvements to checklist management ([#310](https://github.com/5-logic/the-sync-frontend/pull/310))
  - Enhanced ChecklistItemTable with optimized performance
  - Improved ChecklistExcelImport with better error handling
  - Standardized string quotes and improved type usage across components
  - Enhanced validation logic for review checklists
  - Better state management in useChecklistStore

#### Service Layer Improvements

- **New Service Architecture:** Expanded service layer with comprehensive API integration
  - New ReviewService and ReviewsService for review management
  - Enhanced SubmissionService for submission tracking
  - New DashboardService for statistics and analytics
  - Improved MilestoneService with enhanced semester filtering
  - Added utility services for error handling and milestone management

#### Store & State Management

- **Enhanced State Management:** Comprehensive store improvements for better data flow
  - New useReviewStore for review state management
  - New useSubmissionStore for submission tracking
  - New useDraftReviewerAssignmentStore for draft management
  - Enhanced useDashboardStore for dashboard statistics
  - Improved useMilestoneStore with semester-based filtering

### Fixed

#### Code Quality & Performance

- **Code Standardization:** Comprehensive code quality improvements across the application ([#310](https://github.com/5-logic/the-sync-frontend/pull/310))
  - Standardized string quotes throughout codebase
  - Improved type usage and interface definitions
  - Enhanced component prop definitions and state management
  - Optimized rendering performance with better key generation
  - Reduced code nesting and improved readability

#### Data Fetching & Consistency

- **Enhanced Data Management:** Improved data fetching and state consistency
  - Updated milestone fetching to use findAllBySemester for consistency
  - Enhanced supervisor and reviewer data synchronization
  - Improved error handling across service layers
  - Better caching mechanisms for frequently accessed data

#### UI/UX Improvements

- **User Interface Enhancements:** Refined user experience across lecturer and admin interfaces
  - Improved button sizing and action consistency
  - Enhanced loading states and error messaging
  - Better form validation and user feedback
  - Streamlined navigation and workflow optimization

### Technical Details

- **Files Changed:** 63 files with 7,175 additions and 1,743 deletions
- **New Components:** SemesterFilter, ReviewerColumns, EditReviewModal, ExistingReviewsList, MilestoneStepFilter, ReviewGroupSearchTable, ReviewersList
- **New Hooks:** 13 new specialized hooks for lecturer functionality including reviewer assignment, supervision management, and review operations
- **New Services:** ReviewService, ReviewsService, SubmissionService, DashboardService with comprehensive API integration
- **New Stores:** useReviewStore, useSubmissionStore, useDraftReviewerAssignmentStore, useDashboardStore
- **New Utilities:** Error handling utilities, milestone management utilities, UI constants for consistent theming

### API Enhancements

- **Reviewer Management:** Complete API integration for reviewer assignment and management
- **Dashboard Analytics:** Enhanced statistics and analytics endpoints
- **Submission Tracking:** Comprehensive submission management with detailed tracking
- **Review System:** Full review workflow with milestone-based evaluations

### Migration Notes

- **Reviewer Assignment:** New reviewer assignment system requires proper lecturer permissions
- **Dashboard Updates:** Enhanced dashboard may require cache refresh for optimal performance
- **Checklist Management:** Improved checklist system with enhanced validation - review custom implementations
- **State Management:** New stores provide better performance but may require updates to existing state dependencies

---

## [0.7.1] - 2025-08-01

### Fixed

#### Performance & User Experience Improvements

- **Group Management Optimization:** Improved group fetching logic to utilize cached data and prevent unnecessary loading states ([#304](https://github.com/5-logic/the-sync-frontend/pull/304))
  - Enhanced GroupAssignTable with better caching mechanisms
  - Streamlined group management index with reduced redundant API calls
  - Optimized useGroupsStore for better state management and performance

#### Dashboard & Statistics Enhancements

- **Dashboard Statistics Clarity:** Updated dashboard stats titles for better clarity and filtered out expired milestones
  - Enhanced DashboardStats component with more descriptive labels
  - Improved milestone filtering logic in LecturerDashboardStore
  - Better handling of milestone expiration in statistics calculations

#### Form Handling & Validation Improvements

- **Thesis Form Enhancement:** Streamlined field change detection logic and improved file upload handling
  - Enhanced ThesisForm component with better change detection algorithms
  - Improved ThesisFileUpload with enhanced file handling and validation
  - Fixed file upload reset issues to prevent unintended form resets
  - Normalized domain field comparison and better handling of empty skills arrays
  - Enhanced useThesisForm hook with optimized form state management

#### Data Management & UI Fixes

- **Student Management:** Updated validation message for full name to require at least 2 characters in EditStudentDialog
- **Group Table:** Fixed abbreviation fallback in group table data to use proper default values
- **Batch Operations:** Updated batch create action to add new items to the beginning of arrays for consistency
  - Enhanced storeHelpers with improved batch operation handling
  - Better array management in useCapstoneManagementStore

### Technical Details

- **Files Changed:** 11 files with 150 additions and 84 deletions
- **Enhanced Components:** ThesisForm, ThesisFileUpload, DashboardStats, GroupAssignTable, EditStudentDialog
- **Store Improvements:** Enhanced useGroupsStore, useLecturerDashboardStore, and useCapstoneManagementStore for better performance
- **Hook Optimization:** Improved useThesisForm with better state management and validation logic

### Migration Notes

- Group management operations now utilize improved caching - existing cached data will be refreshed automatically
- Dashboard statistics now filter expired milestones - ensure milestone date handling is up to date
- Form validation improvements may affect custom validation implementations

---

## [0.7.0] - 2025-07-30

### Added

#### AI-Powered Features

- **AI Student Suggestions:** Integrated AI-powered student suggestions in group invitation system ([#294](https://github.com/5-logic/the-sync-frontend/pull/294), [#303](https://github.com/5-logic/the-sync-frontend/pull/303))
  - SuggestedStudentCard component for displaying student match percentages and details
  - TagList component for displaying skills and responsibilities with overflow handling
  - AI service integration for suggesting students based on group requirements
  - Enhanced InviteMembersDialog with AI suggestions section and improved UI
- **AI Group Recommendations:** Complete AI group suggestion system for students seeking groups ([#302](https://github.com/5-logic/the-sync-frontend/pull/302))
  - AISuggestions component with compatibility scoring and pagination
  - Group matching based on skills and responsibilities alignment
  - JoinGroupForm integration with AI-powered recommendations

#### Administrative Enhancements

- **Capstone Defense Results Management:** Comprehensive defense results tracking and bulk update system ([#283](https://github.com/5-logic/the-sync-frontend/pull/283), [#284](https://github.com/5-logic/the-sync-frontend/pull/284))
  - BulkUpdateModal for efficient status updates across multiple students
  - Defense results export functionality with Excel integration
  - Real-time status tracking with validation and error handling
  - Enhanced filtering and search capabilities for defense management
- **Capstone Project Management:** Advanced project management dashboard for administrators ([#276](https://github.com/5-logic/the-sync-frontend/pull/276), [#278](https://github.com/5-logic/the-sync-frontend/pull/278))
  - CapstoneManagementStore for centralized data management
  - Enhanced Excel export with rowspan calculations and styling
  - Semester-based filtering and validation for data export
  - Group table management with improved performance and UI

#### Lecturer Dashboard & Progress Tracking

- **Enhanced Lecturer Dashboard:** Comprehensive lecturer dashboard with statistics and progress tracking ([#295](https://github.com/5-logic/the-sync-frontend/pull/295))
  - LecturerDashboardStore for centralized state management
  - Real-time statistics fetching for theses, groups, and milestones
  - MilestonesTimeline component with semester filtering capabilities
  - Enhanced dashboard stats with loading states and error handling
- **Group Progress Management:** Advanced group progress tracking system ([#265](https://github.com/5-logic/the-sync-frontend/pull/265), [#297](https://github.com/5-logic/the-sync-frontend/pull/297))
  - GroupDetailCard with comprehensive group information display
  - LecturerProgressOverviewCard for milestone and submission tracking
  - SemesterFilter component for improved data filtering
  - Enhanced MilestoneDetailCard with submission file handling

#### User Interface & Experience

- **Improved Component Architecture:** Enhanced reusability and maintainability across components ([#289](https://github.com/5-logic/the-sync-frontend/pull/289), [#293](https://github.com/5-logic/the-sync-frontend/pull/293))
  - BaseThesisInfoCard for consistent thesis information display
  - Enhanced ProgressOverviewCard with improved accessibility
  - Standardized group member sorting and display logic
  - Enhanced form validation and error handling patterns
- **File Upload & Management:** Streamlined file handling across thesis and milestone management
  - Optimized ThesisFileUpload component with better validation
  - Enhanced file upload handling in forms with improved user feedback
  - Better file validation and error messaging

### Changed

#### Terminology & Consistency Updates

- **Student Code Standardization:** Updated terminology from "Student ID" to "Student Code" across all components for consistency ([#294](https://github.com/5-logic/the-sync-frontend/pull/294))
  - Updated UserForm, SemesterForm, and all related components
  - Enhanced validation rules and display labels
  - Improved consistency in data import and export functionality

#### Enhanced Data Management

- **Thesis Management:** Improved thesis handling with better semester integration and validation
  - Enhanced ThesisForm with dynamic field handling and validation
  - Better integration with semester data and filtering
  - Improved thesis editing and creation workflows
- **Session Management:** Replaced useAuth with useSessionData for improved session handling across components
  - Better authentication state management
  - Enhanced security and user session tracking
  - Improved error handling for authentication-related operations

#### UI/UX Improvements

- **Component Accessibility:** Enhanced accessibility features across key components ([#289](https://github.com/5-logic/the-sync-frontend/pull/289))
  - Improved keyboard navigation for ProgressOverviewCard
  - Enhanced button accessibility with proper ARIA labels
  - Better focus management and screen reader support
- **Table & Data Display:** Enhanced table rendering and data presentation
  - Improved GroupSearchTable with loading states and skeleton components
  - Better table pagination and filtering performance
  - Enhanced data visualization with consistent styling

### Fixed

#### Performance & Optimization

- **Component Optimization:** Streamlined component rendering and reduced unnecessary re-renders
  - Optimized loop calculations in SkillsDisplay component
  - Enhanced memory management in thesis and group components
  - Improved state synchronization across related components
- **Data Consistency:** Fixed various data synchronization and state management issues
  - Enhanced error handling for API operations
  - Improved cache management and loading state handling
  - Better handling of concurrent operations and race conditions

#### Form & Validation Improvements

- **Enhanced Form Handling:** Improved form validation and error handling across components
  - Better domain field value conversion in ThesisForm
  - Enhanced file upload validation and error messaging
  - Improved form state management and change detection

### Technical Details

- **Files Changed:** 72 files with 4,580 additions and 2,637 deletions
- **New Components:** SuggestedStudentCard, TagList, AISuggestions, BulkUpdateModal, GroupDetailCard, LecturerProgressOverviewCard
- **Enhanced Services:** AI service integration, enhanced semester service, improved file handling utilities
- **Store Improvements:** New CapstoneManagementStore, enhanced LecturerDashboardStore with statistics tracking
- **New Utilities:** Student invite helpers, defense results API utilities, Excel export enhancements

### API Enhancements

- **AI Integration:** New AI service endpoints for student and group suggestions
- **Bulk Operations:** Enhanced bulk update APIs for defense results and student management
- **Progress Tracking:** Improved APIs for lecturer dashboard statistics and progress monitoring

### Migration Notes

- **Component Updates:** Components using student identification should use "Student Code" terminology
- **Session Management:** Applications using useAuth should migrate to useSessionData for consistency
- **AI Features:** New AI-powered features require proper backend integration for optimal functionality
- Enhanced Excel export functionality may require cache refresh for updated styling and formatting

---

## [0.6.5] - 2025-07-28

### Added

#### Enhanced Milestone Management

- Start and end date tracking in milestone editing with improved change detection ([#290](https://github.com/5-logic/the-sync-frontend/pull/290))
- Debug logging for milestone change detection to improve development experience
- Comprehensive change tracking for milestone duration updates
- Enhanced document change detection with proper logging for milestone management

#### User Interface Improvements

- Allow clearing selection in field of study dropdown in thesis form for better user experience
- Conditional unassign button visibility in thesis detail modal based on context
- Enhanced thesis detail modal with configurable unassign button display

### Changed

#### Group Permission Management

- **Enhanced Group Actions:** Updated group action permissions to be based on semester status for more granular control
- Improved group modification logic to distinguish between leave/invite actions and delete actions
- Enhanced permission checks for group operations with better user feedback
- Refined group action availability based on semester preparation status

#### Milestone Change Detection

- Simplified duration checks in milestone editing for better performance and reliability
- Enhanced change detection algorithm to properly handle duration modifications
- Improved form validation for milestone updates with comprehensive change tracking
- Better handling of note field changes with proper trimming and validation

#### User Experience Enhancements

- Enhanced thesis detail modal to show unassign button only when contextually appropriate
- Improved group permission messaging with more specific error descriptions
- Better separation of concerns between thesis assignment and unassignment workflows
- Enhanced user feedback for group operations with context-aware messaging

### Fixed

#### Group Management Issues

- Fixed group action permissions to properly handle semester status restrictions
- Improved group deletion logic to check thesis/submissions before semester status
- Enhanced group leave and invite member functionality based on semester preparation status
- Fixed group modification restrictions to be more contextually appropriate

#### Milestone Management Fixes

- Fixed duration change detection in milestone editing to properly track start and end date modifications
- Improved milestone data submission to include only changed fields
- Enhanced document handling in milestone updates with proper array management
- Fixed change detection for note fields with proper string trimming and comparison

#### UI and Component Fixes

- Fixed thesis detail modal to conditionally show unassign button based on source context
- Improved notification handling by removing redundant success messages
- Enhanced form state management in milestone editing with better validation
- Fixed component prop handling for conditional button visibility

### Technical Details

- **Files Changed:** 6 files with 101 additions and 28 deletions
- **Enhanced Components:** EditMilestoneDialog, ThesisDetailModal, GroupInfoCard, ThesisForm
- **Improved Logic:** Group permission handling, milestone change detection, thesis detail management
- **Better UX:** Contextual button visibility, enhanced error messaging, improved form validation

### Migration Notes

- Group action permissions now respect semester status more granularly - review group management workflows
- Milestone editing now tracks duration changes separately - existing milestone update logic may need review
- Thesis detail modal button visibility is now context-dependent - check custom thesis detail implementations

---

## [0.6.4] - 2025-07-27

### Added

#### Lecturer Moderator Dashboard

- New moderator dashboard page for lecturers with comprehensive management capabilities ([#287](https://github.com/5-logic/the-sync-frontend/pull/287))
- LecturerModeratorDashboardClient component with lazy loading and authentication
- Enhanced sidebar navigation with dedicated moderator dashboard access
- Updated auth constants to support moderator dashboard routing

### Changed

#### Supervisor Assignment Enhancements

- **Breaking Change:** Now requires both supervisors in all assignment modes for improved thesis management
- Enhanced AssignSupervisorModal with stricter validation for supervisor selection ([#287](https://github.com/5-logic/the-sync-frontend/pull/287))
- Improved supervisor assignment workflow with both assign and change modes requiring dual supervision
- Enhanced form validation to ensure complete supervisor assignment before submission

#### Error Handling and User Experience

- Improved error handling in thesis publishing by utilizing backend error messages
- Enhanced supervision store integration for better error handling in supervisor assignment
- Better error feedback and user notifications throughout supervisor assignment process
- Improved state management for assignment operations with proper error boundaries

#### Navigation and Accessibility

- Updated lecturer sidebar configuration to include moderator dashboard menu item
- Enhanced route protection and authentication for moderator-specific features
- Improved navigation patterns for seamless transition between lecturer and moderator functions

### Fixed

#### Assignment and Publishing Issues

- Fixed supervisor assignment validation to prevent incomplete assignments
- Improved thesis publishing error handling with proper backend message integration
- Enhanced assignment modal state management for better user experience
- Fixed navigation issues in lecturer sidebar for moderator dashboard access

### Technical Details

- **Files Changed:** 11 files with 592 additions and 498 deletions
- **New Components:** LecturerModeratorDashboardClient for dedicated moderator interface
- **Enhanced Components:** AssignSupervisorModal, ThesisTable, LecturerSidebar configuration
- **Store Improvements:** Enhanced usePublishThesesStore and useSupervisionStore for better error handling
- **Authentication:** Extended auth constants for moderator dashboard routing

### Migration Notes

- Supervisor assignments now require both supervisors in all modes - review existing assignments
- Moderator dashboard requires proper authentication - ensure user permissions are configured
- Enhanced error handling may change error message display - review custom error components

---

## [0.6.3] - 2025-07-26

### Added

#### Student Thesis Management Enhancements

- New StudentEditThesisModal component for students to edit thesis details directly from the group dashboard ([#285](https://github.com/5-logic/the-sync-frontend/pull/285))
- Enhanced ThesisStatusCard with improved thesis editing capabilities and better user interface
- Enhanced ProgressOverviewCard to always display 'View Thesis Details' button for better navigation
- Added note field support to milestone management forms and related components

#### Lecturer Thesis Assignment Features

- Thesis unassignment functionality for lecturers in group management ([#285](https://github.com/5-logic/the-sync-frontend/pull/285))
- Enhanced ThesisCard component with lecturer name display and improved assignment controls
- Enhanced ThesisDetailModal with better thesis information presentation
- Improved group assignment workflows with better error handling

#### Administrative Enhancements

- Enhanced milestone management with note field support for better tracking and documentation
- Improved document change detection in EditMilestoneDialog with document array sorting
- Enhanced user creation forms with better validation and error handling
- Updated milestone table with note field display capabilities

### Changed

#### UI/UX Improvements

- Enhanced CurrentSemesterTag component with improved status display and phase information
- Updated semester constants to include ongoing phase text mapping for better status representation
- Improved milestone detail cards with enhanced layout and information display
- Enhanced group dashboard with better thesis status visualization

#### Component Enhancements

- Refactored SubmittedFilesView to display 'Reviewer' instead of 'Supervisor' for better role clarity
- Enhanced ThesisInfoCard with improved thesis information layout
- Streamlined ViewThesisDetail component by removing redundant code and improving performance
- Improved thesis card components across student and lecturer interfaces

#### Error Handling and Data Management

- Enhanced group data refresh functionality with helper functions for better state management
- Improved error handling for thesis operations throughout the application
- Enhanced group deletion process with better error handling and user feedback
- Better document change detection in milestone management

### Fixed

#### Semester Status Management

- Updated semester status references to only include 'Preparing' status where appropriate
- Fixed semester status consistency across components and services
- Improved semester phase handling and display logic

#### Form and Modal Improvements

- Fixed document array sorting in EditMilestoneDialog for consistent change detection
- Enhanced form validation and error handling in user creation and milestone management
- Improved modal state management and data persistence
- Fixed thesis assignment and unassignment workflows

#### Performance and Stability

- Optimized component rendering with reduced redundant code
- Improved memory management in thesis and group management components
- Enhanced data consistency across related components
- Fixed potential state synchronization issues

### Technical Details

- **Schema Updates:** Added note field to MilestoneSchema for enhanced milestone tracking
- **Constants Enhancement:** Added ONGOING_PHASE_TEXT mapping for better phase display
- **Component Refactoring:** Enhanced thesis management components with better separation of concerns
- **Error Handling:** Improved error boundaries and user feedback systems

### Migration Notes

- Milestone management now supports note field - existing milestones will have empty notes
- Semester status handling has been refined - check custom status implementations
- Thesis management interfaces have been enhanced - review custom thesis components
- Document change detection improvements may affect custom milestone workflows

---

## [0.6.2] - 2025-07-25

### Added

#### Lecturer Group Management System

- Complete group management feature for lecturers with student assignment capabilities ([#277](https://github.com/5-logic/the-sync-frontend/pull/277))
- New group management page at `/lecturer/group-management` with comprehensive student and thesis assignment
- Dynamic route for assigning students and thesis in group management (`/lecturer/group-management/[groupId]`)
- Group deletion functionality with confirmation modal in GroupAssignTable
- Group capacity notification system that disables student selection when groups are full

#### Thesis Assignment and Management

- Enhanced AssignStudentsDetailPage with thesis assignment functionality and advanced filtering
- New ThesisFilterBar component for searching and filtering theses by semester
- ThesisDetailModal component for displaying detailed thesis information
- ThesisCard component for displaying group thesis details with visual indicators
- AvailableThesesTable component for thesis selection and detailed viewing
- AssignThesisModal component for thesis assignment confirmation workflows
- Methods to retrieve theses with semester information and assign thesis to groups

#### Enhanced Assignment Workflows

- Improved supervisor assignment with bulk processing capabilities
- Enhanced assignment result handling with dedicated notifications
- Bulk assignment processing for supervisor updates with improved error handling
- Single API call optimization for draft assignments
- Better notification handling for assignment operations

### Changed

#### Architecture and Navigation

- **Breaking Change:** Refactored lecturer assignment structure from `/assign-student` to `/group-management`
- Updated sidebar navigation and breadcrumb components to reflect new group management structure
- Enhanced route protection and authentication constants for new group management routes
- Improved lecturer sidebar configuration with updated navigation paths

#### Enhanced Component Structure

- **Major Refactor:** Moved and renamed components from `AssignStudent` to `GroupManagement`
  - `AssignStudent/GroupTable.tsx` → `GroupManagement/GroupTable.tsx`
  - `AssignStudent/StudentTable.tsx` → `GroupManagement/StudentTable.tsx`
  - `AssignStudent/StudentFilterBar.tsx` → `GroupManagement/StudentFilterBar.tsx`
  - `AssignStudent/index.tsx` → `GroupManagement/index.tsx`
- Enhanced GroupTable with improved filtering and assignment capabilities
- Improved StudentTable with better group capacity handling and selection logic
- Updated StudentFilterBar with enhanced search and filtering options

#### Thesis Management Improvements

- Enhanced thesis filtering with semester-based filtering and color-coded status indicators
- Improved thesis table layout with better column organization and status alignment
- Added semester color utility for consistent visual representation across components
- Enhanced thesis service with new methods for group assignment and semester filtering
- Improved thesis management components with better state management and error handling

#### Store and State Management

- **Major Refactor:** Enhanced `useAssignSupervisorStore` with improved bulk assignment logic (1267 lines changed)
- Improved `useSupervisionStore` with better state management and error handling (501 lines changed)
- Enhanced `usePublishThesesStore` with optimized thesis publishing workflows
- Better caching strategies and state synchronization across stores
- Improved error handling and notification systems in all stores

### Fixed

#### Error Handling and User Experience

- Improved error handling for student and thesis assignment processes
- Better type safety with correct Group type imports from groupService
- Fixed typo in publishTheses API call parameter name for better reliability
- Enhanced assignment result processing with proper error boundaries
- Improved notification timing and messaging for assignment operations

#### UI and Component Issues

- Fixed student selection logic when groups reach capacity limits
- Improved table rendering and pagination in group management components
- Enhanced modal handling and confirmation dialogs
- Better responsive design for group management interfaces
- Fixed component re-rendering issues in assignment workflows

### Technical Details

- **Files Changed:** 34 files with 2,980 additions and 2,139 deletions
- **New Components:** ThesisFilterBar, ThesisDetailModal, ThesisCard, AvailableThesesTable, AssignThesisModal, GroupAssignTable
- **New Utilities:** Color utilities for semester status representation
- **Enhanced Services:** Extended thesis service with group assignment capabilities
- **Store Improvements:** Major refactoring of assignment and supervision stores

### API Changes

- Enhanced thesis service with new methods for semester-based filtering and group assignment
- Improved bulk assignment API integration with better error handling
- Updated group assignment endpoints with enhanced validation and capacity checking

### Migration Notes

- **Navigation Update:** Lecturer users should note the new group management URL structure
- **Component References:** Any custom components referencing the old AssignStudent structure need updating
- **Store Usage:** Applications using assignment stores may need to update method calls
- Browser cache refresh recommended for updated UI components and navigation

---

## [0.6.1] - 2025-07-24

### Added

#### Enhanced User Interface Components

- New ConfirmModal component with 100 lines of enhanced confirmation dialog functionality
- Loading state notifications for better user feedback during async operations
- Search functionality for project area selection in group forms
- Semester filtering capabilities in thesis management components
- Loading states for duplicate checks in thesis submission and approval actions

#### Form and Data Management Improvements

- Form change detection in ThesisForm for both create and edit modes
- Enhanced edit dialogs with change tracking and validation for admin, lecturer, and student management
- Real-time group data updates with refresh functionality in GroupInfoCard
- Background member invitation processing in group creation flow
- Improved array comparison logic and utilities

### Changed

#### Thesis Management Enhancements

- Moved lecturer create thesis page to new structure: `src/app/(dashboard)/lecturer/thesis-management/create-thesis/page.tsx`
- Increased thesis description maximum length from 1000 to 2000 characters
- Simplified thesisRequiredSkills structure across components and hooks
- Updated thesis route paths to reflect new organizational structure
- Enhanced thesis filtering with semester-based filtering and loading states
- Improved thesis table layout with better column width adjustments and status alignment

#### Group Management Improvements

- Enhanced GroupInfoCard with member limits and improved refresh functionality (463 lines of changes)
- Improved GroupMembersCard with loading states and better member action handling
- Enhanced InviteMembersDialog with better user exclusion and search functionality
- Refined group creation flow with better error handling and user feedback
- Added group member constants for maximum limits management

#### User Experience Enhancements

- Enhanced notification system with titles and loading notification support
- Improved search functionality with loading states and better user feedback
- Enhanced account settings modal with form change tracking and password validation
- Better handling of null and undefined values in thesis and group operations
- Improved breadcrumb navigation and filtering components

#### API and Service Improvements

- Changed publishTheses method from PUT to POST for correct HTTP method usage
- Enhanced duplicate check integration in thesis submission workflow
- Improved error handling with better API error utilization
- Optimized cache management and loading state handling
- Enhanced semester update logic to only send changed fields

### Fixed

#### Authentication and Security

- Fixed logout functionality after admin profile updates when password is changed
- Enhanced password field validation in account settings
- Improved session and authentication state management

#### UI and Form Handling

- Fixed edit and delete permissions for thesis based on ownership and status
- Corrected navigation paths in breadcrumb and thesis filter components
- Fixed student search feedback with proper loading states
- Resolved array comparison issues in form validation
- Fixed conditional display logic for requests button in group dashboard

#### Data Management

- Fixed thesis taken check to handle both null and undefined values
- Improved register button logic for thesis group handling
- Enhanced semester update validation and refresh mechanisms
- Fixed fetch logic for students list in invite dialogs
- Corrected skills comparison using toSorted for consistent ordering

#### Performance and Stability

- Optimized loading state management in cached fetch actions
- Improved memory management and prevented unnecessary re-renders
- Enhanced error boundary handling across components
- Fixed race conditions in form submissions and data updates

### Technical Details

- **Major Refactoring:** Thesis management structure reorganization with new routing
- **Component Updates:** 52 files changed with 2074 additions and 815 deletions
- **Enhanced Utilities:** New notification utilities and form validation helpers
- **Store Improvements:** Better cache management and optimized state updates
- **Schema Updates:** Enhanced thesis schema with improved validation patterns

### API Breaking Changes

- Thesis creation endpoint structure updates for skill requirements
- Group member management API enhancements with new validation rules
- Semester filtering integration in thesis management endpoints

### Migration Notes

- Update thesis management navigation to use new route structure
- Refresh browser cache for updated UI components and styling
- Review group member limits and validation rules for existing groups
- Check thesis description length constraints (now 2000 characters)

---

## [0.6.0] - 2025-07-23

### Added

#### Admin Dashboard & Capstone Management

- Complete Capstone Defense Results page with thesis table and import/export functionality ([#270](https://github.com/5-logic/the-sync-frontend/pull/270))
- Capstone Project Management page with comprehensive group management ([#244](https://github.com/5-logic/the-sync-frontend/pull/244), [#253](https://github.com/5-logic/the-sync-frontend/pull/253))
- Enhanced admin dashboard with statistics and group table information
- Excel export functionality for defense results and group management data
- Advanced filtering and search capabilities for capstone project management

#### Lecturer Dashboard & Tools

- Complete lecturer dashboard with statistics, assigned groups, and thesis management ([#252](https://github.com/5-logic/the-sync-frontend/pull/252), [#257](https://github.com/5-logic/the-sync-frontend/pull/257))
- Moderator dashboard page with supervisor load charts and progress overview ([#242](https://github.com/5-logic/the-sync-frontend/pull/242))
- Enhanced supervisor assignment with draft assignments and bulk operations ([#209](https://github.com/5-logic/the-sync-frontend/pull/209), [#210](https://github.com/5-logic/the-sync-frontend/pull/210))
- Comprehensive checklist management with Excel import/export capabilities ([#258](https://github.com/5-logic/the-sync-frontend/pull/258))
- AI-powered thesis duplicate detection system ([#268](https://github.com/5-logic/the-sync-frontend/pull/268), [#269](https://github.com/5-logic/the-sync-frontend/pull/269), [#271](https://github.com/5-logic/the-sync-frontend/pull/271))

#### Student Progress & Milestone Management

- Enhanced track progress page with milestone detail management ([#226](https://github.com/5-logic/the-sync-frontend/pull/226), [#241](https://github.com/5-logic/the-sync-frontend/pull/241))
- Advanced milestone submission system with file upload and document management
- Milestone progress tracking with timeline visualization
- Enhanced milestone detail cards with submission status and file handling
- Document upload functionality for milestone submissions

#### File Management & Upload System

- Advanced document management system with drag-and-drop file upload
- File item components for enhanced file display and interaction
- Document upload buttons with progress tracking
- Template download functionality for milestone submissions
- Enhanced file handling for thesis supporting documents

#### Dashboard Components & Analytics

- Comprehensive dashboard statistics for all user roles
- Supervisor load charts with visual progress indicators
- Progress overview cards with milestone tracking
- Group table information with advanced filtering
- Version tag component with animated styling effects

### Changed

#### Enhanced User Interface

- Improved layout and styling across all dashboard components
- Enhanced responsive design for mobile and desktop views
- Updated navigation breadcrumbs with dynamic route patterns
- Current semester tag in header for improved context awareness
- Enhanced sidebar with version information display

#### API & Schema Improvements

- **Checklist Schema:** Enhanced with milestone relationships and document support
- **Supervision Schema:** New comprehensive schema for supervisor assignments and bulk operations
- **Submission Schema:** Enhanced with document and status field support
- **Group Schema:** Added extended group data with member and thesis information
- **Milestone Schema:** Updated with document upload and submission tracking

#### Service Layer Enhancements

- **ChecklistService & ChecklistItemService:** Complete CRUD operations with Excel import/export
- **SupervisionService:** Enhanced with bulk assignment and draft management capabilities
- **AiDuplicateService:** New service for AI-powered thesis duplicate detection
- **ThesesService:** Enhanced with relations support and duplicate checking
- **MilestoneService:** Added submission and document management capabilities

#### Performance & Architecture

- Enhanced store management with specialized stores for supervision, checklist, and draft assignments
- Improved caching strategies with background refresh capabilities
- Better state management with optimistic updates
- Enhanced loading states with skeleton components
- Improved error handling and user feedback systems

### Fixed

- Fixed row key type issues in group overview tables for better flexibility
- Improved form validation and error handling across all components
- Enhanced table pagination and sorting functionality
- Fixed responsive design issues on mobile devices
- Improved accessibility and keyboard navigation
- Fixed memory leaks in background processes and polling

### Technical Details

- **New Services:** `ChecklistService`, `ChecklistItemService`, `AiDuplicateService`
- **Enhanced Stores:** `useChecklistStore`, `useAssignSupervisorStore`, `useDraftAssignmentStore`, `useSupervisionStore`
- **New Components:** Dashboard components, file upload system, milestone detail management
- **Utility Functions:** Excel export utilities, defense results exporter, document management helpers
- **Enhanced Hooks:** `useAssignSupervisor`, `useMilestoneProgress`, `useAiDuplicateCheck`, `useCurrentSemester`

### API Breaking Changes

- **Supervision Management:** New bulk assignment endpoints with enhanced request/response structures
- **Checklist Management:** Enhanced API with milestone relationships and document support
- **Milestone Submissions:** New submission tracking with document and status management
- **Dashboard Analytics:** New endpoints for statistics and progress tracking

### Migration Notes

- Users should refresh browser cache for new dashboard components and styling
- Excel templates have been updated with new field requirements for checklist import
- Supervisor assignment workflows now support draft and bulk operations
- Milestone submission system requires updated document handling

---

## [0.5.0] - 2025-07-16

### Added

- Student Dashboard page and improved student group/thesis management ([#166](https://github.com/5-logic/the-sync-frontend/pull/166), [#172](https://github.com/5-logic/the-sync-frontend/pull/172), [#179](https://github.com/5-logic/the-sync-frontend/pull/179), [#204](https://github.com/5-logic/the-sync-frontend/pull/204), [#211](https://github.com/5-logic/the-sync-frontend/pull/211))
- UI for student to view and register thesis, including AI-suggested topics ([#221](https://github.com/5-logic/the-sync-frontend/pull/221), [#230](https://github.com/5-logic/the-sync-frontend/pull/230), [#234](https://github.com/5-logic/the-sync-frontend/pull/234))
- Group assignment and invitation features for students ([#166](https://github.com/5-logic/the-sync-frontend/pull/166), [#179](https://github.com/5-logic/the-sync-frontend/pull/179))
- Breadcrumb navigation and improved layout for all roles ([#205](https://github.com/5-logic/the-sync-frontend/pull/205))
- Admin account settings modal and admin data management ([#231](https://github.com/5-logic/the-sync-frontend/pull/231))
- Password reset and OTP verification flows ([#181](https://github.com/5-logic/the-sync-frontend/pull/181), [#201](https://github.com/5-logic/the-sync-frontend/pull/201))
- Track progress UI for students and groups ([#205](https://github.com/5-logic/the-sync-frontend/pull/205))
- Enhanced group dashboard with thesis, supervisor, and progress cards ([#230](https://github.com/5-logic/the-sync-frontend/pull/230))

### Changed

- Refactored and improved layout for thesis, group, and student components
- Enhanced caching and force refresh for students, lecturers, milestones, and groups
- Improved error handling and notification for password reset and OTP flows
- Updated breadcrumb and sidebar navigation for all roles
- Improved performance and UI consistency across pages

### Fixed

- Fixed SonarCloud issues and code quality improvements
- Fixed UI bugs in student, group, and thesis pages
- Fixed build and import issues for new components
- Fixed password validation and OTP input handling

### Technical Details

- Major refactor of student/group/thesis hooks and stores
- Added new Zod schemas for password reset and OTP
- Improved modularization of services and hooks
- Enhanced test cases and removed debug logs

### Migration Notes

- No breaking API changes, but new features require updated UI and store logic
- Users should refresh browser cache for new UI and navigation

---

## [0.4.0] - 2025-07-10

### Added

#### Group Management System

- Complete group dashboard with comprehensive member management ([#158](https://github.com/5-logic/the-sync-frontend/pull/158), [#161](https://github.com/5-logic/the-sync-frontend/pull/161), [#169](https://github.com/5-logic/the-sync-frontend/pull/169))
- Group creation with skill requirements and member invitation system
- Advanced group member management with leader assignment and removal capabilities
- Group requests management with invitation and join request handling
- Group status guards and navigation protection
- Enhanced group browsing and discovery features
- Group confirmation modals for sensitive operations

#### Student Features Enhancement

- Student account management with skills and responsibilities ([#146](https://github.com/5-logic/the-sync-frontend/pull/146), [#183](https://github.com/5-logic/the-sync-frontend/pull/183), [#189](https://github.com/5-logic/the-sync-frontend/pull/189))
- Enhanced student profile with skill level tracking and phone number validation
- Student group dashboard with detailed group information
- Improved form validation and user experience
- Student thesis detail viewing capabilities

#### Lecturer Tools & Management

- Comprehensive checklist management system ([#150](https://github.com/5-logic/the-sync-frontend/pull/150), [#154](https://github.com/5-logic/the-sync-frontend/pull/154))
- Checklist creation with manual and Excel import options
- Checklist editing and detailed view functionality
- Lecturer assignment and review workflows ([#140](https://github.com/5-logic/the-sync-frontend/pull/140), [#144](https://github.com/5-logic/the-sync-frontend/pull/144))
- Enhanced thesis publishing management with bulk operations
- Group review and evaluation capabilities
- Improved lecturer profile settings and account management

#### Request Management System

- Centralized request management with status tracking ([#164](https://github.com/5-logic/the-sync-frontend/pull/164), [#170](https://github.com/5-logic/the-sync-frontend/pull/170))
- Request status management with cancellation capabilities
- Enhanced invite and join request workflows
- Request filtering and search functionality
- Real-time request status updates and notifications

#### UI/UX Improvements

- Enhanced navigation with role-based sidebar improvements ([#148](https://github.com/5-logic/the-sync-frontend/pull/148))
- Common download template components for Excel operations
- Improved form validation and error handling across all features
- Enhanced responsive design and mobile compatibility
- Better loading states and user feedback systems

### Changed

#### API Schema Enhancements

- **Group Schema:** Added comprehensive `GroupDashboardSchema` with member, skill, and responsibility relationships
- **Student Schema:** Enhanced with profile management and skill tracking capabilities
- **Responsibility Schema:** Improved validation and API response handling
- **Request Management:** Enhanced request status handling with 'Cancelled' status support

#### Service Layer Improvements

- **GroupService:** Added member management, leader assignment, and group operations
- **RequestService:** Enhanced with cancellation and status management capabilities
- **ResponsibilityService:** Converted to static class with improved method definitions
- **PasswordService:** New centralized password management service
- **StudentsService:** Enhanced with group-related filtering and profile management

#### Performance & Architecture

- Enhanced store management with specialized stores for groups, requests, and responsibilities
- Improved caching strategies for group and request data
- Better state management with context providers for group status
- Optimized data fetching patterns with background refresh capabilities
- Enhanced error handling and notification systems

#### Authentication & Security

- Enhanced password management with unified service layer
- Improved phone number validation for Vietnamese format
- Better session handling and user profile management
- Enhanced role-based access controls

### Fixed

- Form validation edge cases in group creation and member management
- Request management synchronization issues
- Navigation state persistence in group workflows
- Mobile responsiveness issues in group and checklist interfaces
- Memory leaks in request polling and status updates
- Excel import validation for checklist and member data
- Search and filtering performance optimizations

### API Breaking Changes

- **Group Dashboard:** New API structure with detailed member and relationship data
- **Request Management:** Enhanced request status with 'Cancelled' option
- **Student Profile:** Changed API structure for profile updates and skill management
- **Password Management:** Centralized password change endpoints

### Technical Details

- **New Services:** `GroupService`, `RequestService`, `ResponsibilityService`, `PasswordService`
- **Enhanced Stores:** Group dashboard store, requests store, responsibility store
- **Context Providers:** Group status context for navigation and state management
- **Utility Functions:** Text normalization, member management helpers, student invite utilities
- **Schema Validation:** Enhanced group, student, and responsibility schemas
- **Excel Templates:** New templates for checklist creation

### Migration Notes

- Group-related API calls now return enhanced data structures with member details
- Request management requires handling of new 'Cancelled' status
- Student profile updates should use new unified profile API
- Password management operations should use centralized PasswordService
- Excel import templates have been updated with new field requirements

---

## [0.3.0] - 2025-07-02

### Added

#### Storage & File Management

- Complete Supabase Storage integration for file uploads ([#103](https://github.com/5-logic/the-sync-frontend/pull/103), [#117](https://github.com/5-logic/the-sync-frontend/pull/117))
- `StorageService` with file upload, download, and deletion capabilities
- File sanitization and unique naming for storage compatibility
- Secure file URLs with expiration support
- Support for thesis supporting documents and attachments

#### Authentication & Security Enhancements

- Enhanced authentication system with modular architecture ([#102](https://github.com/5-logic/the-sync-frontend/pull/102), [#115](https://github.com/5-logic/the-sync-frontend/pull/115))
- Advanced TokenManager with remember me functionality and storage strategy
- Throttled token refresh mechanism to prevent excessive API calls
- Smart storage management (localStorage vs sessionStorage)
- Enhanced session callbacks with proper typing and remember me support
- Account validation and status checking during authentication
- Token expiration aligned with backend settings (1h access, 7d refresh)

#### Thesis Management System

- Comprehensive thesis CRUD operations with enhanced API schema ([#120](https://github.com/5-logic/the-sync-frontend/pull/120), [#122](https://github.com/5-logic/the-sync-frontend/pull/122), [#124](https://github.com/5-logic/the-sync-frontend/pull/124))
- Thesis creation with skill requirements and file uploads
- Thesis version control and history tracking
- Enhanced thesis filtering and status management
- Thesis assignment and supervision features
- Group assignment and supervision workflows
- Milestone integration with thesis progress tracking

#### Student & Group Management

- Student account management with semester-based filtering ([#125](https://github.com/5-logic/the-sync-frontend/pull/125), [#126](https://github.com/5-logic/the-sync-frontend/pull/126))
- Group creation and joining functionality
- Enhanced student dashboard with first-login experience
- Group progress tracking and milestone management
- Student profile settings and account management

#### Lecturer Features

- Lecturer dashboard with comprehensive management tools ([#128](https://github.com/5-logic/the-sync-frontend/pull/128), [#130](https://github.com/5-logic/the-sync-frontend/pull/130))
- Thesis assignment to students and groups
- Supervisor assignment workflows
- Group progress monitoring and milestone tracking
- Enhanced lecturer profile management
- Timeline review and approval system

#### UI/UX Improvements

- Enhanced navigation with role-based sidebar configurations ([#133](https://github.com/5-logic/the-sync-frontend/pull/133), [#136](https://github.com/5-logic/the-sync-frontend/pull/136))
- Improved authentication flow with loading states
- Enhanced form components with better validation
- Responsive design improvements across all pages
- Optimized pagination and table components
- Enhanced modal and dialog components

### Changed

#### API Schema & Endpoints

- **Thesis Schema Enhancement:** Added `ThesisWithRelationsSchema` for API responses with relationships
- **Thesis Create Schema:** Simplified with `skillIds` array and `supportingDocument` field
- **Thesis Update Schema:** Enhanced with skill management and file update support
- **Authentication Schemas:** Enhanced validation patterns and error handling

#### Package Dependencies

- **Added:** `@supabase/supabase-js@2.50.2` for storage and database integration
- **Removed:** `quill@2.0.3` and `react-quill@2.0.0` - replaced with simpler text editing solutions

#### Performance & Architecture

- Migrated to modular authentication architecture
- Enhanced HTTP client timeout configuration (extended to 1 hour)
- Improved caching strategies with TTL and invalidation
- Optimized token management with smart storage selection
- Enhanced error handling and user feedback systems

#### Security Improvements

- Token storage strategy based on remember me preference
- Enhanced session management with proper expiration
- Improved CSRF protection and request validation
- Better error handling without exposing sensitive information

### Fixed

- Authentication flow edge cases and token refresh issues
- File upload validation and error handling
- Form validation and submission edge cases
- Navigation state persistence across page reloads
- Responsive design issues on mobile devices
- Memory leaks in token refresh mechanisms
- CORS and API communication improvements

### API Breaking Changes

- **Thesis Creation:** Now requires `supportingDocument` field and accepts `skillIds` array
- **File Upload:** Migrated from custom backend storage to Supabase Storage
- **Authentication:** Enhanced token structure with remember me metadata
- **Storage URLs:** Changed from backend-generated to Supabase public URLs

### Technical Details

- **Storage Integration:** Complete Supabase Storage setup with bucket management
- **Enhanced Services:** New `StorageService` for file operations
- **Authentication Refactor:** Modular auth services (`AdminAuthService`, `UserAuthService`, `BaseAuthService`)
- **Token Management:** Advanced `TokenManager` with conditional storage and throttling
- **HTTP Client:** Enhanced timeout and interceptor configuration
- **Error Handling:** Centralized `AuthErrorHandler` for consistent error processing

### Migration Notes

- Files previously stored on backend should be migrated to Supabase Storage
- Authentication tokens will be automatically migrated to new storage strategy
- Rich text editing features using Quill have been simplified to basic text input
- Update environment variables to include Supabase configuration

---

## [0.2.0] - 2025-06-25

### Added

#### Student Management Enhancements

- Complete student management system with CRUD operations ([#84](https://github.com/5-logic/the-sync-frontend/pull/84), [#96](https://github.com/5-logic/the-sync-frontend/pull/96))
- Excel import functionality for bulk student creation ([#97](https://github.com/5-logic/the-sync-frontend/pull/97), [#98](https://github.com/5-logic/the-sync-frontend/pull/98))
- Student status toggle with confirmation modals
- Semester-based student filtering and management
- Student status toggle API endpoint

#### Lecturer Management System

- Complete lecturer management interface with CRUD operations ([#84](https://github.com/5-logic/the-sync-frontend/pull/84))
- Moderator role toggle functionality for lecturers
- Lecturer status management with confirmation dialogs
- Excel import support for bulk lecturer creation
- Enhanced lecturer filtering and search capabilities

#### Data Management & API Improvements

- **New API Endpoints:**
  - `POST /students/import` - Bulk student creation from Excel import
  - `POST /students/{id}/toggle-status` - Toggle student active status
  - `POST /lecturers/{id}/toggle-status` - Toggle lecturer active status
  - `POST /lecturers/{id}/toggle-moderator` - Toggle lecturer moderator role
  - `DELETE /milestones/{id}` - Delete milestone functionality
- Enhanced HTTP client timeout from 10s to 10 minutes for large operations
- Improved error handling and API response utilities

#### Store & State Management

- Complete Zustand stores for all major entities (students, lecturers, majors, semesters, milestones)
- Centralized caching utilities with TTL support ([#85](https://github.com/5-logic/the-sync-frontend/pull/85))
- Generic toggle operations for status management
- Background refresh handling for real-time data updates
- Enhanced store actions with batch operations

#### UI/UX Improvements

- Centralized TablePagination component for consistent pagination ([#91](https://github.com/5-logic/the-sync-frontend/pull/91), [#92](https://github.com/5-logic/the-sync-frontend/pull/92))
- Enhanced milestone management interface ([#83](https://github.com/5-logic/the-sync-frontend/pull/83), [#87](https://github.com/5-logic/the-sync-frontend/pull/87), [#89](https://github.com/5-logic/the-sync-frontend/pull/89))
- Milestone deletion with confirmation dialogs
- Improved timeline review components with project milestones ([#70](https://github.com/5-logic/the-sync-frontend/pull/70), [#80](https://github.com/5-logic/the-sync-frontend/pull/80), [#81](https://github.com/5-logic/the-sync-frontend/pull/81))
- Enhanced thesis management and detail views ([#68](https://github.com/5-logic/the-sync-frontend/pull/68), [#69](https://github.com/5-logic/the-sync-frontend/pull/69), [#71](https://github.com/5-logic/the-sync-frontend/pull/71), [#74](https://github.com/5-logic/the-sync-frontend/pull/74), [#75](https://github.com/5-logic/the-sync-frontend/pull/75))
- Semester status tags and improved semester management
- Excel template files for student and lecturer imports

### Changed

#### API Schema Updates

- **Student Schema:** Added `ImportStudentSchema` and `ImportStudentItemSchema` for batch operations
- **Student API:** Updated `StudentCreateSchema` to include required `semesterId` field
- **Lecturer Schema:** Enhanced with `LecturerToggleStatus` schema for status management
- **Toggle Operations:** Standardized toggle APIs to use POST requests instead of PATCH

#### Data Flow Improvements

- Migrated from local state to global Zustand stores across all management components
- Enhanced form validation with field-specific error handling
- Improved data fetching patterns with caching and background refresh
- Streamlined semester-based filtering across student and lecturer management

#### Performance Optimizations

- Lazy loading implementation for management components
- Optimized re-renders with proper state management
- Enhanced table performance with virtualization support
- Background data refresh without blocking UI

### Fixed

- Code quality improvements and SonarCloud issue resolution ([#101](https://github.com/5-logic/the-sync-frontend/pull/101))
- Enhanced error handling in Excel import validation
- Fixed form validation edge cases in milestone management
- Improved disabled state logic for milestone edit/delete operations
- Corrected semester selection and filtering logic
- Fixed whitespace and formatting issues across components
- Enhanced notification messaging consistency

### API Breaking Changes

- **Student Creation:** Now requires `semesterId` parameter in create operations
- **Toggle Operations:** Status toggle endpoints changed from PATCH to POST
- **Bulk Operations:** New import endpoints require specific schema format:
  ```typescript
  // Student Import
  POST /students/import
  {
    semesterId: string,
    majorId: string,
    students: Array<{
      studentId: string,
      email: string,
      fullName: string,
      password: string,
      gender: string,
      phoneNumber: string
    }>
  }
  ```

### Technical Details

- **New Services:** `LecturerService`, `StudentService` with full CRUD operations
- **Enhanced Stores:** Complete state management with caching and optimistic updates
- **Validation:** Enhanced Zod schemas with import-specific validation
- **File Handling:** Excel template generation and processing utilities
- **Error Handling:** Centralized API error handling with user-friendly messages

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

- [0.4.0](https://github.com/5-logic/the-sync-frontend/releases/tag/0.4.0)
- [0.3.0](https://github.com/5-logic/the-sync-frontend/releases/tag/0.3.0)
- [0.2.0](https://github.com/5-logic/the-sync-frontend/releases/tag/0.2.0)
- [0.1.0](https://github.com/5-logic/the-sync-frontend/releases/tag/0.1.0)
