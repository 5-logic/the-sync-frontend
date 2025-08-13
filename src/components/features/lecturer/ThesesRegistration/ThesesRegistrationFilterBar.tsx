"use client";

import SharedThesisFilterBar from "@/components/common/SharedThesisFilterBar";

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status?: "approved" | "pending" | "rejected" | "new";
	onStatusChange: (val?: "approved" | "pending" | "rejected" | "new") => void;
	semester?: string;
	onSemesterChange: (val?: string) => void;
	onRefresh: () => void;
}

const statusOptions = [{ value: "pending", label: "Pending" }];

export default function ThesesRegistrationFilterBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	semester,
	onSemesterChange,
	onRefresh,
}: Readonly<Props>) {
	return (
		<SharedThesisFilterBar
			search={search}
			onSearchChange={onSearchChange}
			status={status}
			onStatusChange={onStatusChange}
			semester={semester}
			onSemesterChange={onSemesterChange}
			onRefresh={onRefresh}
			showOwnedFilter={false}
			showStatusFilter={false}
			showCreateButton={false}
			statusOptions={statusOptions}
		/>
	);
}
