import BaseThesisInfoCard, {
	type BaseThesisInfo,
	type SupervisorInfo,
} from '@/components/common/BaseThesisInfoCard';
import { Thesis } from '@/schemas/thesis';

// Enhanced thesis type cho UI display
type EnhancedThesis = Thesis & {
	skills?: string[];
	version?: string;
	supervisor?: {
		name: string;
		phone: string;
		email: string;
	};
	thesisRequiredSkills?: Array<{
		id: string;
		name: string;
	}>;
	thesisVersions?: Array<{
		id: string;
		version: number;
		supportingDocument: string;
	}>;
};

type Props = {
	readonly thesis: EnhancedThesis;
};

export default function ThesisInfoCard({ thesis }: Props) {
	// Transform EnhancedThesis to BaseThesisInfo
	const baseThesis: BaseThesisInfo = {
		englishName: thesis.englishName,
		vietnameseName: thesis.vietnameseName,
		abbreviation: thesis.abbreviation,
		description: thesis.description,
		domain: thesis.domain,
		status: thesis.status,
		thesisRequiredSkills: thesis.thesisRequiredSkills,
		thesisVersions: thesis.thesisVersions,
	};

	// Use supervisor info from EnhancedThesis
	const supervisor: SupervisorInfo | undefined = thesis.supervisor;

	return <BaseThesisInfoCard thesis={baseThesis} supervisor={supervisor} />;
}
