'use client';

import { Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useStudentGroupStatus } from '@/hooks/useStudentGroupStatus';

interface GroupStatusGuardProps {
	children: React.ReactNode;
	requiresGroup?: boolean; // true for pages that require group (Group Dashboard), false for pages that require no group (Form/Join Group)
}

export default function GroupStatusGuard({
	children,
	requiresGroup = false,
}: GroupStatusGuardProps) {
	const { hasGroup, loading } = useStudentGroupStatus();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			if (requiresGroup && !hasGroup) {
				// Page requires group but student doesn't have one
				router.replace('/student/form-or-join-group');
			} else if (!requiresGroup && hasGroup) {
				// Page requires no group but student has one
				router.replace('/student/group-dashboard');
			}
		}
	}, [hasGroup, loading, requiresGroup, router]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	// If the guard condition is met, render children
	if ((requiresGroup && hasGroup) || (!requiresGroup && !hasGroup)) {
		return <>{children}</>;
	}

	// If guard condition is not met, show loading while redirecting
	return (
		<div className="flex justify-center items-center min-h-[400px]">
			<Spin size="large" />
		</div>
	);
}
