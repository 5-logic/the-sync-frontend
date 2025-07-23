'use client';

import { Tag } from 'antd';
import React from 'react';

import { useCurrentSemester } from '@/hooks/semester';
import { SEMESTER_STATUS_COLORS } from '@/lib/constants/semester';

export const CurrentSemesterTag: React.FC = () => {
	const { currentSemester, loading } = useCurrentSemester();

	if (loading || !currentSemester) {
		return null;
	}

	return (
		<Tag
			color={SEMESTER_STATUS_COLORS[currentSemester.status]}
			style={{
				fontSize: '12px',
				fontWeight: 500,
				borderRadius: '6px',
				margin: 0,
			}}
		>
			{currentSemester.name} - {currentSemester.status}
		</Tag>
	);
};
