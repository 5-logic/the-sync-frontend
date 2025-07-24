'use client';

import { Breadcrumb as AntBreadcrumb } from 'antd';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Define route mapping for breadcrumb titles
const ROUTE_TITLES: Record<string, string> = {
	// Admin routes
	'/admin': 'Admin Dashboard',
	'/admin/lecturer-management': 'Lecturer Management',
	'/admin/students-management': 'Student Management',
	'/admin/milestone-management': 'Milestone Management',
	'/admin/semester-settings': 'Semester Settings',
	'/admin/create-new-lecturer': 'Create New Lecturer',
	'/admin/create-new-student': 'Create New Student',

	// Lecturer routes
	'/lecturer': 'Lecturer Dashboard',
	'/lecturer/thesis-management': 'Thesis Management',
	'/lecturer/group-progress': 'Group Progress',
	'/lecturer/group-review': 'Group Review',
	'/lecturer/checklist-management': 'Checklist Management',
	'/lecturer/checklist-detail': 'Checklist Detail',
	'/lecturer/checklist-edit': 'Edit Checklist',
	'/lecturer/create-checklist': 'Create Checklist',
	'/lecturer/thesis-management/create-thesis': 'Create Thesis',
	'/lecturer/account-setting': 'Account Setting',
	'/lecturer/assign-lecturer-review': 'Assign Lecturer Review',
	'/lecturer/assign-list-publish-thesis': 'Assign List Publish Thesis',
	'/lecturer/assign-student': 'Assign Student',
	'/lecturer/assign-supervisor': 'Assign Supervisor',
	'/lecturer/thesis-version-control': 'Thesis Version Control',
	'/lecturer/timeline-review': 'Timeline Review',

	// Student routes
	'/student': 'Student Dashboard',
	'/student/form-or-join-group': 'Form or Join Group',
	'/student/group-dashboard': 'Group Dashboard',
	'/student/group-detail': 'Group Detail',
	'/student/invite-to-group': 'Invite to Group',
	'/student/list-thesis': 'List Thesis',
	'/student/register-thesis': 'Register Thesis',
	'/student/suggested-thesis': 'Suggested Thesis',
	'/student/track-progress': 'Track Progress',
	'/student/account-setting': 'Account Setting',
	'/student/profile': 'Profile',
	'/student/first-login-dashboard': 'First Login Dashboard',
};

// Define patterns for dynamic routes
const DYNAMIC_ROUTE_PATTERNS: Array<{
	pattern: RegExp;
	getTitle: (matches: RegExpMatchArray) => string;
	getParentPath?: (matches: RegExpMatchArray) => string;
}> = [
	// Lecturer dynamic routes
	{
		pattern: /^\/lecturer\/thesis-management\/(.+)\/edit-thesis$/,
		getTitle: () => 'Edit Thesis',
		getParentPath: () => '/lecturer/thesis-management',
	},
	{
		pattern: /^\/lecturer\/thesis-management\/(.+)$/,
		getTitle: () => 'Thesis Detail',
		getParentPath: () => '/lecturer/thesis-management',
	},
	{
		pattern: /^\/lecturer\/group-progress\/(.+)$/,
		getTitle: () => 'Group Detail',
		getParentPath: () => '/lecturer/group-progress',
	},
	{
		pattern: /^\/lecturer\/group-review\/(.+)$/,
		getTitle: () => 'Review Detail',
		getParentPath: () => '/lecturer/group-review',
	},
	{
		pattern: /^\/lecturer\/checklist-detail\/(.+)$/,
		getTitle: () => 'Checklist Detail',
		getParentPath: () => '/lecturer/checklist-management',
	},
	{
		pattern: /^\/lecturer\/checklist-edit\/(.+)$/,
		getTitle: () => 'Edit Checklist',
		getParentPath: () => '/lecturer/checklist-management',
	},

	// Student dynamic routes - add patterns for any dynamic routes here
	{
		pattern: /^\/student\/list-thesis\/(.+)$/,
		getTitle: () => 'Thesis Detail',
		getParentPath: () => '/student/list-thesis',
	},
	{
		pattern: /^\/student\/group-detail\/(.+)$/,
		getTitle: () => 'Group Detail',
		getParentPath: () => '/student',
	},
	{
		pattern: /^\/student\/profile\/(.+)$/,
		getTitle: () => 'Student Profile',
		getParentPath: () => '/student',
	},

	// Admin dynamic routes (if any)
	{
		pattern: /^\/admin\/lecturer-management\/(.+)$/,
		getTitle: () => 'Lecturer Detail',
		getParentPath: () => '/admin/lecturer-management',
	},
	{
		pattern: /^\/admin\/students-management\/(.+)$/,
		getTitle: () => 'Student Detail',
		getParentPath: () => '/admin/students-management',
	},
];

interface BreadcrumbItem {
	title: string;
	href?: string;
}

interface BreadcrumbProps {
	readonly className?: string;
	readonly style?: React.CSSProperties;
}

// Extract dynamic route handling to a separate function to reduce complexity
function getDynamicRouteBreadcrumbs(pathname: string): BreadcrumbItem[] | null {
	const dynamicPattern = DYNAMIC_ROUTE_PATTERNS.find(({ pattern }) =>
		pattern.test(pathname),
	);

	if (!dynamicPattern) return null;

	const matches = dynamicPattern.pattern.exec(pathname);
	if (!matches) return null;

	const items: BreadcrumbItem[] = [];

	// Add parent path if available
	if (dynamicPattern.getParentPath) {
		const parentPath = dynamicPattern.getParentPath(matches);
		const parentTitle = ROUTE_TITLES[parentPath];
		if (parentTitle) {
			items.push({
				title: parentTitle,
				href: parentPath,
			});
		}
	}

	// Add current page
	items.push({
		title: dynamicPattern.getTitle(matches),
	});

	return items;
}

// Extract static route handling to a separate function
function getStaticRouteBreadcrumbs(segments: string[]): BreadcrumbItem[] {
	const items: BreadcrumbItem[] = [];

	for (let i = 0; i < segments.length; i++) {
		const path = '/' + segments.slice(0, i + 1).join('/');
		const title = ROUTE_TITLES[path];

		if (title) {
			items.push({
				title,
				href: i === segments.length - 1 ? undefined : path, // Last item has no href
			});
		}
	}

	return items;
}

export default function Breadcrumb({ className, style }: BreadcrumbProps) {
	const pathname = usePathname();

	const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
		// Split pathname into segments
		const segments = pathname.split('/').filter(Boolean);

		// Handle homepage
		if (segments.length === 0) {
			return [{ title: 'Home' }];
		}

		// First check if it's a dynamic route
		const dynamicItems = getDynamicRouteBreadcrumbs(pathname);
		if (dynamicItems) return dynamicItems;

		// Otherwise handle as static route
		return getStaticRouteBreadcrumbs(segments);
	}, [pathname]);

	// Don't render if there's only one item or no items
	if (breadcrumbItems.length <= 1) {
		return null;
	}

	return (
		<AntBreadcrumb
			className={className}
			style={style}
			items={breadcrumbItems.map((item) => ({
				title: item.title,
				href: item.href,
				// Make the last item non-clickable
				onClick: item.href ? undefined : (e) => e.preventDefault(),
			}))}
		/>
	);
}
