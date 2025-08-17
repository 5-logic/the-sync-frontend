import { createMetadata } from "@/app/metadata";
import AccountSettingClient from "@/components/pages/student/AccountSettingClient";

export const metadata = createMetadata({
	title: "Student Account Settings",
	description:
		"Manage your personal information, responsibilities, and account settings for TheSync platform.",
});

export default function StudentAccountSettingPage() {
	return <AccountSettingClient />;
}
