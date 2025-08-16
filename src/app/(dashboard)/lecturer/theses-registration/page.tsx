import { createMetadata } from "@/app/metadata";
import ThesesRegistrationClient from "@/components/pages/lecturer/ThesesRegistrationClient";

export const metadata = createMetadata({
	title: "Theses Registration",
	description:
		"Theses Registration for TheSync - Review and approve/reject pending thesis submissions",
});

export default function ThesesRegistrationPage() {
	return <ThesesRegistrationClient />;
}
