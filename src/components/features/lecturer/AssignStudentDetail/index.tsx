"use client";

import { useParams } from "next/navigation";
import AssignStudentDetail from "@/components/common/AssignStudentDetail";

export default function AssignStudentsDetailPage() {
	const params = useParams();
	const groupId = params.groupId as string;

	return (
		<AssignStudentDetail
			groupId={groupId}
			backRoute="/lecturer/group-management"
			headerBadgeText="Moderator Only"
			isAdminMode={true}
		/>
	);
}
