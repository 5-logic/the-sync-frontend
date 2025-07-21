import { DeleteOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { type SupervisorAssignmentData } from '@/store/useAssignSupervisorStore';
import { type DraftAssignment } from '@/store/useDraftAssignmentStore';

const { Text } = Typography;

/**
 * Color mapping for supervisor assignment status
 */
export const statusColorMap: Record<
	SupervisorAssignmentData['status'],
	string
> = {
	Finalized: 'green',
	Incomplete: 'orange',
	Unassigned: 'red',
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
						<div key={name}>{name} (Draft)</div>
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
 */
export const createActionRenderer = (
	onAssign: (record: SupervisorAssignmentData) => void,
	getDraftAssignment: (thesisId: string) => DraftAssignment | undefined,
	removeDraftAssignment: (thesisId: string) => void,
) => {
	// eslint-disable-next-line react/display-name
	return (_: unknown, record: SupervisorAssignmentData) => {
		const draft = getDraftAssignment(record.thesisId);
		const isFinalized = record.status === 'Finalized';

		return (
			<Space size="small">
				<Button type="primary" size="middle" onClick={() => onAssign(record)}>
					{isFinalized ? 'Change' : 'Assign'}
				</Button>
				{draft && (
					<Button
						type="text"
						size="middle"
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
 */

export const baseColumns: ColumnsType<SupervisorAssignmentData> = [
	{
		title: 'Abbreviation',
		dataIndex: 'groupName',
		key: 'groupName',
	},
	{
		title: 'English Name',
		dataIndex: 'thesisTitle',
		key: 'thesisTitle',
	},
	{
		title: 'Domain',
		dataIndex: 'memberCount',
		key: 'memberCount',
		render: (domain: string, record: SupervisorAssignmentData) => {
			if (record.groupName === 'No Abbreviation') {
				return <span style={{ color: '#999' }}>No Domain</span>;
			}
			return domain;
		},
	},
	{
		title: 'Supervisor',
		dataIndex: 'supervisors',
		key: 'supervisors',
		render: renderSupervisors,
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		render: (status: SupervisorAssignmentData['status']) => (
			<Tag color={statusColorMap[status] ?? 'default'}>{status}</Tag>
		),
	},
];
