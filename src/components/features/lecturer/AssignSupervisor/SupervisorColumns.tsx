import { DeleteOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { getSemesterTagColor } from '@/lib/utils/colorUtils';
import { type SupervisorAssignmentData } from '@/store/useAssignSupervisorStore';
import { type DraftAssignment } from '@/store/useDraftAssignmentStore';

const { Text } = Typography;

// UI Constants for table layout - responsive design with percentages
export const TABLE_WIDTHS = {
	ABBREVIATION: '12%', // Shortened for more space
	TITLE: '46%', // Extended for better readability
	SEMESTER: '15%',
	SUPERVISOR: '17%',
	ACTIONS: '10%',
} as const;

export const TEXT_DISPLAY = {
	MAX_LINES: 2,
	LINE_HEIGHT: '1.4',
	MAX_HEIGHT: '2.8em', // 2 lines * 1.4 line-height
} as const;

/**
 * Renders supervisor names in a vertical list
 */
export const renderSupervisors = (supervisors: string[]) =>
	supervisors.length > 0 ? (
		<div>
			{supervisors.map((sup) => (
				<div key={sup}>{sup}</div>
			))}
		</div>
	) : (
		'-'
	);

/**
 * Renders supervisor names with draft information
 * This should be used in a component that has access to draft store
 * Mobile-optimized design
 */
export const createSupervisorRenderer = (
	getDraftAssignment: (thesisId: string) => DraftAssignment | undefined,
) => {
	// eslint-disable-next-line react/display-name
	return (supervisors: string[], record: SupervisorAssignmentData) => {
		const draft = getDraftAssignment(record.thesisId);

		if (draft) {
			// Show draft supervisors as plain text, similar to current supervisors
			return (
				<div>
					{draft.lecturerNames.map((name: string) => (
						<div key={name}>
							{name} <Text type="warning">(Draft)</Text>
						</div>
					))}
					{/* Show current supervisors if any exist */}
					{supervisors.length > 0 && (
						<div style={{ marginTop: 8 }}>
							<Text type="secondary" style={{ fontSize: '11px' }}>
								Current: {supervisors.join(', ')}
							</Text>
						</div>
					)}
				</div>
			);
		}

		// Show current supervisors when no draft
		return supervisors.length > 0 ? (
			<div>
				{supervisors.map((sup) => (
					<div key={sup}>{sup}</div>
				))}
			</div>
		) : (
			'-'
		);
	};
};

/**
 * Creates action renderer with draft delete functionality
 * Mobile-optimized with compact button design
 */
export const createActionRenderer = (
	onAssign: (record: SupervisorAssignmentData) => void,
	getDraftAssignment: (thesisId: string) => DraftAssignment | undefined,
	removeDraftAssignment: (thesisId: string) => void,
) => {
	// eslint-disable-next-line react/display-name
	return (_: unknown, record: SupervisorAssignmentData) => {
		const draft = getDraftAssignment(record.thesisId);
		const supervisorCount = record.supervisors.length;
		const buttonText = supervisorCount >= 2 ? 'Change' : 'Assign';

		return (
			<Space size="small">
				<Button type="primary" onClick={() => onAssign(record)}>
					{buttonText}
				</Button>
				{draft && (
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						onClick={() => removeDraftAssignment(record.thesisId)}
						title="Remove draft assignment"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '4px 8px',
							borderRadius: '4px',
						}}
					/>
				)}
			</Space>
		);
	};
};

/**
 * Base column definitions for supervisor assignment table
 * Consistent with thesis management table styling
 */
export const baseColumns: ColumnsType<SupervisorAssignmentData> = [
	{
		title: 'Abbreviation',
		dataIndex: 'abbreviation',
		key: 'abbreviation',
		width: TABLE_WIDTHS.ABBREVIATION,
		ellipsis: {
			showTitle: false,
		},
		sorter: (a, b) => a.abbreviation.localeCompare(b.abbreviation),
		sortDirections: ['ascend', 'descend'],
		render: (text: string) => (
			<div
				style={{
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
					textAlign: 'left',
					width: '100%',
					paddingLeft: '8px',
				}}
				title={text}
			>
				{text}
			</div>
		),
	},
	{
		title: 'English Name',
		dataIndex: 'thesisTitle',
		key: 'thesisTitle',
		width: TABLE_WIDTHS.TITLE,
		ellipsis: false,
		sorter: (a, b) => a.thesisTitle.localeCompare(b.thesisTitle),
		sortDirections: ['ascend', 'descend'],
		render: (text: string) => (
			<div
				style={{
					display: '-webkit-box',
					WebkitLineClamp: TEXT_DISPLAY.MAX_LINES,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					lineHeight: TEXT_DISPLAY.LINE_HEIGHT,
					maxHeight: TEXT_DISPLAY.MAX_HEIGHT,
				}}
				title={text}
			>
				{text}
			</div>
		),
	},
	{
		title: 'Semester',
		dataIndex: 'semester',
		key: 'semester',
		width: TABLE_WIDTHS.SEMESTER,
		align: 'center' as const,
		ellipsis: {
			showTitle: false,
		},
		sorter: (a, b) => a.semester.localeCompare(b.semester),
		sortDirections: ['ascend', 'descend'],
		render: (semester: string) => (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
				}}
			>
				<Tag color={getSemesterTagColor(semester)} title={semester}>
					{semester}
				</Tag>
			</div>
		),
	},
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		key: 'supervisors',
		width: TABLE_WIDTHS.SUPERVISOR,
		render: renderSupervisors,
	},
];
