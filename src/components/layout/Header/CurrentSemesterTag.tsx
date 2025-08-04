"use client";

import { Space, Tag } from "antd";
import React from "react";

import { useCurrentSemester } from "@/hooks/semester";
import {
	ONGOING_PHASE_TEXT,
	SEMESTER_STATUS_COLORS,
	SEMESTER_STATUS_TEXT,
} from "@/lib/constants/semester";

export const CurrentSemesterTag: React.FC = () => {
	const { currentSemester, preparingSemester, loading } = useCurrentSemester();

	if (loading || !currentSemester) {
		return null;
	}

	// Build status text - include ongoing phase if available
	const statusText =
		currentSemester.status === "Ongoing" && currentSemester.ongoingPhase
			? `${SEMESTER_STATUS_TEXT[currentSemester.status]} - ${ONGOING_PHASE_TEXT[currentSemester.ongoingPhase]}`
			: SEMESTER_STATUS_TEXT[currentSemester.status];

	const currentTag = (
		<Tag
			color={SEMESTER_STATUS_COLORS[currentSemester.status]}
			style={{
				fontSize: "12px",
				fontWeight: 500,
				borderRadius: "6px",
				margin: 0,
			}}
		>
			{currentSemester.name} - {statusText}
		</Tag>
	);

	// If we have a preparing semester to show alongside current
	if (preparingSemester) {
		return (
			<Space size={4}>
				{currentTag}
				<Tag
					color={SEMESTER_STATUS_COLORS[preparingSemester.status]}
					style={{
						fontSize: "12px",
						fontWeight: 500,
						borderRadius: "6px",
						margin: 0,
					}}
				>
					{preparingSemester.name} -{" "}
					{SEMESTER_STATUS_TEXT[preparingSemester.status]}
				</Tag>
			</Space>
		);
	}

	return currentTag;
};
