import { Modal } from 'antd';
import React from 'react';

import {
	BulkUpdateModalContent,
	BulkUpdateModalFooter,
} from '@/components/features/admin/CapstoneDefenseResults/BulkUpdateModal';
import {
	type BulkUpdateParams,
	useBulkDefenseUpdate,
} from '@/hooks/admin/useBulkDefenseUpdate';

export interface BulkUpdateModalParams extends BulkUpdateParams {
	bulkUpdating: boolean;
	setBulkUpdating: (value: boolean) => void;
	getDisplayStatus: (status: string, studentId: string) => string;
}

/**
 * Service for managing bulk update modal operations
 * Handles UI interactions while delegating business logic to hooks
 */
export const useBulkUpdateModal = () => {
	const { updateBulkStatus } = useBulkDefenseUpdate();

	const showBulkUpdateModal = React.useCallback(
		(params: BulkUpdateModalParams) => {
			const {
				selectedRowKeys,
				filteredData,
				bulkUpdating,
				setBulkUpdating,
				getDisplayStatus,
				...updateParams
			} = params;

			if (selectedRowKeys.length === 0) return;

			const selectedStudents = filteredData.filter((student) =>
				selectedRowKeys.includes(`${student.studentId}-${student.groupId}`),
			);

			const handleBulkUpdate = async (status: 'Passed' | 'Failed') => {
				setBulkUpdating(true);
				try {
					await updateBulkStatus(status, {
						selectedRowKeys,
						filteredData,
						...updateParams,
					});
					Modal.destroyAll();
				} finally {
					setBulkUpdating(false);
				}
			};

			const handleCancel = () => {
				updateParams.onSelectionClear();
				Modal.destroyAll();
			};

			Modal.confirm({
				title: 'Update Defense Results',
				width: 500,
				content: React.createElement(BulkUpdateModalContent, {
					selectedStudents,
					getDisplayStatus,
				}),
				footer: () =>
					React.createElement(BulkUpdateModalFooter, {
						bulkUpdating,
						onCancel: handleCancel,
						onUpdate: handleBulkUpdate,
					}),
			});
		},
		[updateBulkStatus],
	);

	return { showBulkUpdateModal };
};
