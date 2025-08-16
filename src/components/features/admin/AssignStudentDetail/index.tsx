"use client";

import { useParams } from "next/navigation";
import AssignStudentDetail from "@/components/common/AssignStudentDetail";

export default function AdminAssignStudentsDetailPage() {
	const params = useParams();
	const groupId = params.id as string;

	return (
		<AssignStudentDetail
			groupId={groupId}
			backRoute="/admin/group-management"
			isAdminMode={true}
		/>
	);
}
