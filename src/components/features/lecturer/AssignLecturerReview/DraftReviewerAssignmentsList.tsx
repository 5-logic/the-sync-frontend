import { DeleteOutlined } from '@ant-design/icons';
import { Badge, Button, Card, List, Space, Typography } from 'antd';
import { memo, useCallback } from 'react';

import { useDraftReviewerAssignmentStore } from '@/store/useDraftReviewerAssignmentStore';

const { Title, Text } = Typography;

interface Props {
	visible?: boolean;
}

const DraftReviewerAssignmentsList = memo<Props>(({ visible = true }) => {
	const {
		getDraftReviewerAssignmentsList,
		removeDraftReviewerAssignment,
		clearAllDraftReviewerDrafts,
		getDraftReviewerCount,
	} = useDraftReviewerAssignmentStore();

	const drafts = getDraftReviewerAssignmentsList();
	const draftCount = getDraftReviewerCount();

	const handleRemoveDraft = useCallback(
		(submissionId: string) => {
			removeDraftReviewerAssignment(submissionId);
		},
		[removeDraftReviewerAssignment],
	);

	const handleClearAll = useCallback(() => {
		clearAllDraftReviewerDrafts();
	}, [clearAllDraftReviewerDrafts]);

	if (!visible || draftCount === 0) {
		return null;
	}

	return (
		<Card
			title={
				<Space>
					<Title level={5} style={{ margin: 0 }}>
						Draft Reviewer Assignments
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
				renderItem={(draft) => (
					<List.Item
						key={draft.submissionId}
						actions={[
							<Button
								key="remove"
								type="text"
								size="small"
								danger
								icon={<DeleteOutlined />}
								onClick={() => handleRemoveDraft(draft.submissionId)}
								title="Remove draft reviewer assignment"
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
									<Text type="secondary">Reviewers:</Text>
									<Text>{draft.reviewerNames.join(', ')}</Text>
								</Space>
							}
						/>
					</List.Item>
				)}
			/>
		</Card>
	);
});

DraftReviewerAssignmentsList.displayName = 'DraftReviewerAssignmentsList';

export default DraftReviewerAssignmentsList;
