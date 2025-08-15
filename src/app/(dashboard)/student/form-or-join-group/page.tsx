import { createMetadata } from "@/app/metadata";
import GroupStatusGuard from "@/components/common/GroupStatusGuard";
import FormOrJoinGroupPageClient from "@/components/pages/student/FormOrJoinGroupPageClient";

export const metadata = createMetadata({
	title: "Join Group",
	description: "Join Group for TheSync - Find and Join Capstone Project Groups",
});

export default function StudentFormOrJoinGroupPage() {
	return (
		<GroupStatusGuard requiresGroup={false}>
			<FormOrJoinGroupPageClient />
		</GroupStatusGuard>
	);
}
