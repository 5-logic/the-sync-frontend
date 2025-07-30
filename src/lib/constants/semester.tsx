import { Tag } from 'antd';

import { OngoingPhase, SemesterStatus } from '@/schemas/_enums';

// Status tag mapping for semester status display
export const SEMESTER_STATUS_TAGS: Record<SemesterStatus, JSX.Element> = {
	NotYet: <Tag color="blue">Not Yet</Tag>,
	Preparing: <Tag color="orange">Preparing</Tag>,
	Picking: <Tag color="purple">Picking</Tag>,
	Ongoing: <Tag color="green">Ongoing</Tag>,
	End: <Tag color="gray">End</Tag>,
};

// Status color mapping for consistent theming
export const SEMESTER_STATUS_COLORS: Record<SemesterStatus, string> = {
	NotYet: 'blue',
	Preparing: 'orange',
	Picking: 'purple',
	Ongoing: 'green',
	End: 'gray',
};

// Status display text mapping
export const SEMESTER_STATUS_TEXT: Record<SemesterStatus, string> = {
	NotYet: 'Not Yet',
	Preparing: 'Preparing',
	Picking: 'Picking',
	Ongoing: 'Ongoing',
	End: 'End',
};

// Ongoing phase display text mapping
export const ONGOING_PHASE_TEXT: Record<OngoingPhase, string> = {
	ScopeAdjustable: 'Scope Adjustable',
	ScopeLocked: 'Scope Locked',
};
