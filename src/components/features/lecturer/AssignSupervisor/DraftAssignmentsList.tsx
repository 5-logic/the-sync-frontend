import { DeleteOutlined } from '@ant-design/icons';
import { Badge, Button, Card, List, Space, Typography } from 'antd';
import { memo, useCallback } from 'react';

import {
	type DraftAssignment,
	useDraftAssignmentStore,
} from '@/store/useDraftAssignmentStore';

const { Title, Text } = Typography;

interface Props {
	readonly visible?: boolean;
}

/**
 * Optimized component to display and manage draft assignments
 * Uses React.memo and useCallback to prevent unnecessary re-renders
 */
const DraftAssignmentsList = memo<Props>(({ visible = true }) => {
	const {
		getDraftAssignmentsList,
		removeDraftAssignment,
		clearAllDrafts,
		getDraftCount,
	} = useDraftAssignmentStore();

	const drafts = getDraftAssignmentsList();
	const draftCount = getDraftCount();

	const handleRemoveDraft = useCallback(
		(thesisId: string) => {
			removeDraftAssignment(thesisId);
		},
		[removeDraftAssignment],
	);

	const handleClearAll = useCallback(() => {
		clearAllDrafts();
	}, [clearAllDrafts]);

	if (!visible || draftCount === 0) {
		return null;
	}

	return (
		<Card
			title={
				<Space>
					<Title level={5} style={{ margin: 0 }}>
						Draft Assignments
					</Title>
					<Badge count={draftCount} showZero={false} />
				</Space>
			}
			extra={
				<Button size="small" danger onClick={handleClearAll}>
					Clear All
				</Button>
			}
			size="small"
		>
			<List
				dataSource={drafts}
				renderItem={(draft: DraftAssignment) => (
					<List.Item
						key={draft.thesisId}
						actions={[
							<Button
								key="remove"
								type="text"
								size="small"
								danger
								icon={<DeleteOutlined />}
								onClick={() => handleRemoveDraft(draft.thesisId)}
								title="Remove draft assignment"
							/>,
						]}
					>
						<List.Item.Meta
							title={
								<Text strong>
									{draft.groupName} - {draft.thesisTitle}
								</Text>
							}
							description={
								<Space>
									<Text type="secondary">Supervisors:</Text>
									<Text>{draft.lecturerNames.join(', ')}</Text>
								</Space>
							}
						/>
					</List.Item>
				)}
			/>
		</Card>
	);
});

DraftAssignmentsList.displayName = 'DraftAssignmentsList';

export default DraftAssignmentsList;
