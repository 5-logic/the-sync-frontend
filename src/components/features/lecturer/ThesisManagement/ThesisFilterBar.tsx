"use client";

import SharedThesisFilterBar from "@/components/common/SharedThesisFilterBar";

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status?: "approved" | "pending" | "rejected" | "new";
	onStatusChange: (val?: "approved" | "pending" | "rejected" | "new") => void;
	owned?: boolean;
	onOwnedChange: (val?: boolean) => void;
	semester?: string;
	onSemesterChange: (val?: string) => void;
	onRefresh: () => void;
}

export default function ThesisFilterBar(props: Readonly<Props>) {
	return (
		<SharedThesisFilterBar
			{...props}
			showOwnedFilter={true}
			showCreateButton={true}
			createButtonPath="/lecturer/thesis-management/create-thesis"
			createButtonText="Create Thesis"
		/>
	);
}
