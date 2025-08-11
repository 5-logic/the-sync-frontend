"use client";

import BaseThesisInfoCard, {
	type BaseThesisInfo,
	type SupervisorInfo,
} from "@/components/common/BaseThesisInfoCard";
import { Lecturer } from "@/schemas/lecturer";
import { ThesisWithRelations } from "@/schemas/thesis";

interface EnhancedThesis extends ThesisWithRelations {
	lecturerInfo?: Lecturer;
}

interface Props {
	readonly thesis: EnhancedThesis;
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

	// Use lecturerInfo to create supervisor info
	const supervisor: SupervisorInfo | undefined = thesis.lecturerInfo
		? {
				name: thesis.lecturerInfo.fullName,
				email: thesis.lecturerInfo.email,
				phone: thesis.lecturerInfo.phoneNumber || "",
			}
		: undefined;

	return <BaseThesisInfoCard thesis={baseThesis} supervisor={supervisor} />;
}
