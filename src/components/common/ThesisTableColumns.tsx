import { LoadingOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { UI_CONSTANTS } from '@/lib/constants/thesis';
import { getSemesterTagColor } from '@/lib/utils/colorUtils';
import { formatDate } from '@/lib/utils/dateFormat';
import { Thesis } from '@/schemas/thesis';

interface CreateColumnOptions {
	getLecturerById: (id: string) => { fullName: string } | undefined;
	getSemesterById: (id: string) => { name: string } | undefined;
	getStatusColor: (status: string) => string;
	semesterLoading: boolean;
}

export function createTitleColumn(): ColumnsType<Thesis>[0] {
	return {
		title: 'Title',
		dataIndex: 'englishName',
		key: 'title',
		width: UI_CONSTANTS.TABLE_WIDTHS.TITLE,
		sorter: (a, b) => a.englishName.localeCompare(b.englishName),
		ellipsis: {
			showTitle: false,
		},
		render: (text: string) => (
			<Tooltip title={text} placement="topLeft">
				<div
					style={{
						display: '-webkit-box',
						WebkitLineClamp: UI_CONSTANTS.TEXT_DISPLAY.MAX_LINES,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: UI_CONSTANTS.TEXT_DISPLAY.LINE_HEIGHT,
						maxHeight: UI_CONSTANTS.TEXT_DISPLAY.MAX_HEIGHT,
						wordBreak: 'break-word',
						whiteSpace: 'normal',
					}}
				>
					{text}
				</div>
			</Tooltip>
		),
	};
}

export function createOwnerColumn(
	getLecturerById: CreateColumnOptions['getLecturerById'],
): ColumnsType<Thesis>[0] {
	return {
		title: 'Owner',
		dataIndex: 'lecturerId',
		key: 'owner',
		width: UI_CONSTANTS.TABLE_WIDTHS.OWNER,
		ellipsis: {
			showTitle: false,
		},
		render: (lecturerId: string) => {
			const lecturer = getLecturerById(lecturerId);
			const displayName = lecturer?.fullName ?? 'Unknown';

			return (
				<Tooltip title={displayName} placement="topLeft">
					<div
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{displayName}
					</div>
				</Tooltip>
			);
		},
	};
}

export function createSemesterColumn(
	getSemesterById: CreateColumnOptions['getSemesterById'],
	semesterLoading: CreateColumnOptions['semesterLoading'],
): ColumnsType<Thesis>[0] {
	return {
		title: 'Semester',
		dataIndex: 'semesterId',
		key: 'semester',
		width: UI_CONSTANTS.TABLE_WIDTHS.DOMAIN,
		align: 'center' as const,
		ellipsis: {
			showTitle: false,
		},
		render: (semesterId: string) => {
			const semester = getSemesterById(semesterId);
			const displayName = semester?.name ?? 'Unknown';
			const color = getSemesterTagColor(semesterId);

			// Show loading spinner while semesters are being fetched
			if (semesterLoading && !semester) {
				return (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: '100%',
						}}
					>
						<LoadingOutlined spin style={{ color: '#1890ff' }} />
					</div>
				);
			}

			return (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
					}}
				>
					<Tooltip title={displayName} placement="topLeft">
						<Tag
							color={color}
							style={{
								maxWidth: '100%',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								display: 'inline-block',
							}}
						>
							{displayName}
						</Tag>
					</Tooltip>
				</div>
			);
		},
	};
}

export function createStatusColumn(
	getStatusColor: CreateColumnOptions['getStatusColor'],
): ColumnsType<Thesis>[0] {
	return {
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
		width: UI_CONSTANTS.TABLE_WIDTHS.STATUS,
		align: 'center' as const,
		render: (status: string) => (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					height: '100%',
				}}
			>
				<Tag color={getStatusColor(status)}>{status}</Tag>
			</div>
		),
	};
}

export function createDateColumn(): ColumnsType<Thesis>[0] {
	return {
		title: 'Created date',
		dataIndex: 'createdAt',
		key: 'createdDate',
		width: UI_CONSTANTS.TABLE_WIDTHS.DATE,
		align: 'center' as const,
		sorter: (a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		render: (date: Date) => formatDate(date),
	};
}

export function createActionsColumn(
	renderActionsColumn: (record: Thesis) => React.ReactNode,
): ColumnsType<Thesis>[0] {
	return {
		title: 'Actions',
		key: 'actions',
		width: UI_CONSTANTS.TABLE_WIDTHS.ACTIONS,
		align: 'center' as const,
		render: (_, record) => renderActionsColumn(record),
	};
}
