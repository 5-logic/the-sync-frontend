"use client";

import BaseThesisInfoCard, {
	type BaseThesisInfo,
	type SupervisorInfo,
} from "@/components/common/BaseThesisInfoCard";
import { ThesisWithRelations } from "@/schemas/thesis";

interface Props {
	readonly thesis: ThesisWithRelations;
}

// Extended lecturer interface to handle both API formats
interface ExtendedLecturer {
	fullName?: string;
	email?: string;
	phoneNumber?: string;
	phone?: string;
	userId: string;
	isModerator: boolean;
	user?: {
		id: string;
		fullName: string;
		email: string;
		phoneNumber?: string;
	};
}

export default function ThesisInfoCard({ thesis }: Props) {
	// Transform ThesisWithRelations to BaseThesisInfo
	const baseThesis: BaseThesisInfo = {
		englishName: thesis.englishName,
		vietnameseName: thesis.vietnameseName,
		abbreviation: thesis.abbreviation,
		description: thesis.description,
		domain: thesis.domain,
		status: thesis.status,
		semesterId: thesis.semesterId,
		thesisRequiredSkills: thesis.thesisRequiredSkills,
		thesisVersions: thesis.thesisVersions,
	};

	// Transform lecturer info to supervisor info with safety checks
	const lecturer = thesis.lecturer as ExtendedLecturer;
	const supervisor: SupervisorInfo | undefined = lecturer
		? {
				name: lecturer.fullName || lecturer.user?.fullName || "",
				email: lecturer.email || lecturer.user?.email || "",
				phone:
					lecturer.phoneNumber ||
					lecturer.user?.phoneNumber ||
					lecturer.phone ||
					"",
			}
		: undefined;

	return <BaseThesisInfoCard thesis={baseThesis} supervisor={supervisor} />;
}
