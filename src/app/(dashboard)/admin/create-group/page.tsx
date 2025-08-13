import { createMetadata } from "@/app/metadata";
import CreateGroup from "@/components/features/admin/CreateGroup";

export const metadata = createMetadata({
	title: "Admin Create Group",
	description:
		"Admin Create Group for TheSync - Group Formation and Capstone Thesis Development",
});

export default function AdminCreateGroupPage() {
	return <CreateGroup />;
}
