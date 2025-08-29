'use client';

import { Space } from 'antd';
import React, { useCallback } from 'react';

import CreateForm, {
	CreateFormValues,
} from '@/components/features/admin/GroupManagement/CreateForm';
import { useCreateGroups } from '@/hooks/admin/useCreateGroups';
import { useGroupManagement } from '@/hooks/admin/useGroupManagement';
import { useGroupManagementRenderer } from '@/lib/utils/groupManagementRenderer';

const GroupManagement: React.FC = () => {
	const { semesters } = useGroupManagement();
	const { createGroups, isCreating } = useCreateGroups();
	const { renderGroupAssignTable, renderUngroupedStudentsCard } =
		useGroupManagementRenderer({
			routePrefix: '/admin',
			isAdminMode: true, // Enable admin mode for enhanced delete functionality
		});

	const handleGenerate = useCallback(
		async ({ semesterId, numberOfGroups }: CreateFormValues) => {
			await createGroups({
				semesterId,
				numberOfGroup: numberOfGroups,
			});
			// The hook handles all success/error notifications and data refresh
		},
		[createGroups],
	);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<CreateForm
				onGenerate={handleGenerate}
				loading={isCreating}
				semesters={semesters}
			/>

			{renderGroupAssignTable()}
			{renderUngroupedStudentsCard()}
		</Space>
	);
};

export default GroupManagement;
