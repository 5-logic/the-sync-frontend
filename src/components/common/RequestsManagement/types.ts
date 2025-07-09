import { type GroupRequest } from '@/lib/services/requests.service';

export type RequestsMode = 'group-leader' | 'student';

export interface RequestsConfig {
	mode: RequestsMode;
	title: string;
	fetchRequests: (forceRefresh?: boolean) => Promise<void>;
	groupId?: string; // For group leader mode
}

export interface RequestsDialogProps {
	visible: boolean;
	onCancel: () => void;
	config: RequestsConfig;
	onRequestsUpdate?: () => void;
}

export interface RequestsButtonProps {
	config: RequestsConfig;
	children: React.ReactNode;
	requests: GroupRequest[];
}

export interface RequestsTabProps {
	requestType: 'invite' | 'join';
	dataSource: GroupRequest[];
	loading: boolean;
	searchText: string;
	statusFilter: string | undefined;
	onSearchChange: (value: string) => void;
	onStatusFilterChange: (value: string | undefined) => void;
	onRefresh: () => void;
	mode: RequestsMode;
	getActionProps: (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string, // Group name for student, Student name for leader
	) => ActionProps;
}

export interface ActionProps {
	primaryAction: {
		text: string;
		title: string;
		description: string;
		okText: string;
		okType?: 'primary' | 'danger';
		onConfirm: () => void;
	};
	secondaryAction?: {
		text: string;
		title: string;
		description: string;
		okText: string;
		okType?: 'primary' | 'danger';
		onConfirm: () => void;
	};
}
