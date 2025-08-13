import { createMetadata } from "@/app/metadata";
import CreateGroup from "@/components/features/admin/CreateGroup";

export const metadata = createMetadata({
	title: "Admin Group Management",
	description:
		"Admin Group Management for TheSync - Group Formation and Capstone Thesis Development",
});

export default function AdminGroupManagementPage() {
	return <CreateGroup />;
}
