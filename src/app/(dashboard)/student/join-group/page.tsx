import { createMetadata } from "@/app/metadata";
import GroupStatusGuard from "@/components/common/GroupStatusGuard";
import JoinGroupPageClient from "@/components/pages/student/JoinGroupPageClient";

export const metadata = createMetadata({
	title: "Join Group",
	description: "Join Group for TheSync - Find and Join Capstone Project Groups",
});

export default function StudentJoinGroupPage() {
	return (
		<GroupStatusGuard requiresGroup={false}>
			<JoinGroupPageClient />
		</GroupStatusGuard>
	);
}
