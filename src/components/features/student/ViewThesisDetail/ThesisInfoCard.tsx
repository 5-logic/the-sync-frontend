'use client';

import BaseThesisInfoCard, {
	type BaseThesisInfo,
	type SupervisorInfo,
} from '@/components/common/BaseThesisInfoCard';
import { ThesisWithRelations } from '@/schemas/thesis';

interface Props {
	readonly thesis: ThesisWithRelations;
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

	// Transform lecturer info to supervisor info
	const supervisor: SupervisorInfo | undefined = thesis.lecturer
		? {
				name: thesis.lecturer.user.fullName,
				email: thesis.lecturer.user.email,
				phone:
					(thesis.lecturer.user as { phoneNumber?: string }).phoneNumber || '',
			}
		: undefined;

	return <BaseThesisInfoCard thesis={baseThesis} supervisor={supervisor} />;
}
