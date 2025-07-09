import { type GroupRequest } from '@/lib/services/requests.service';

export type RequestsMode = 'group-leader' | 'student';

export interface RequestsConfig {
	readonly mode: RequestsMode;
	readonly title: string;
	readonly fetchRequests: (forceRefresh?: boolean) => Promise<void>;
	readonly groupId?: string; // For group leader mode
}

export interface RequestsDialogProps {
	readonly visible: boolean;
	readonly onCancel: () => void;
	readonly config: RequestsConfig;
	readonly onRequestsUpdate?: () => void;
}

export interface RequestsButtonProps {
	readonly config: RequestsConfig;
	readonly children: React.ReactNode;
	readonly requests: GroupRequest[];
}

export interface RequestsTabProps {
	readonly requestType: 'invite' | 'join';
	readonly dataSource: GroupRequest[];
	readonly loading: boolean;
	readonly searchText: string;
	readonly statusFilter: string | undefined;
	readonly onSearchChange: (value: string) => void;
	readonly onStatusFilterChange: (value: string | undefined) => void;
	readonly onRefresh: () => void;
	readonly mode: RequestsMode;
	readonly getActionProps: (
		requestId: string,
		requestType: 'Invite' | 'Join',
		targetName: string, // Group name for student, Student name for leader
	) => ActionProps;
}

export interface ActionProps {
	readonly primaryAction: {
		readonly text: string;
		readonly title: string;
		readonly description: string;
		readonly okText: string;
		readonly okType?: 'primary' | 'danger';
		readonly onConfirm: () => void;
	};
	readonly secondaryAction?: {
		readonly text: string;
		readonly title: string;
		readonly description: string;
		readonly okText: string;
		readonly okType?: 'primary' | 'danger';
		readonly onConfirm: () => void;
	};
}
