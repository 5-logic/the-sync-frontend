"use client";

import SharedThesisFilterBar from "@/components/common/SharedThesisFilterBar";
import { useSessionData } from "@/hooks/auth/useAuth";

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
	const { session } = useSessionData();

	// Check if user is moderator
	const isModerator =
		session?.user?.role === "moderator" || session?.user?.isModerator;

	// Define status options based on user role
	const statusOptions = isModerator
		? [
				{ value: "approved", label: "Approved" },
				{ value: "rejected", label: "Rejected" },
			]
		: [
				{ value: "new", label: "New" },
				{ value: "approved", label: "Approved" },
				{ value: "pending", label: "Pending" },
				{ value: "rejected", label: "Rejected" },
			];

	return (
		<SharedThesisFilterBar
			{...props}
			showOwnedFilter={true}
			showCreateButton={true}
			createButtonPath="/lecturer/thesis-management/create-thesis"
			createButtonText="Create Thesis"
			statusOptions={statusOptions}
		/>
	);
}
