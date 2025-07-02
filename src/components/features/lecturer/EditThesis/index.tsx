'use client';

import { Alert, Button, Flex, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

import ThesisForm from '@/components/features/lecturer/CreateThesis/ThesisForm';
import { useThesisForm } from '@/hooks/thesis';
import thesisService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { ThesisWithRelations } from '@/schemas/thesis';
import { useSkillSetStore } from '@/store';

const { Title, Paragraph } = Typography;

interface Props {
	thesisId?: string;
}

export default function EditThesis({ thesisId }: Props) {
	const [thesis, setThesis] = useState<ThesisWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Use the thesis form hook for form handling
	const {
		loading: updating,
		handleSubmit: handleUpdate,
		getFormInitialValues,
		getInitialFile,
	} = useThesisForm({ mode: 'edit', thesisId, thesis });

	// Get skillSets store
	const {
		skillSets,
		loading: skillSetsLoading,
		fetchSkillSets,
	} = useSkillSetStore();

	// Check if all required data is loaded
	const isDataReady =
		!loading && !skillSetsLoading && thesis && skillSets.length > 0;

	// Fetch thesis data when component mounts
	useEffect(() => {
		const fetchThesis = async () => {
			if (!thesisId) {
				setError('Thesis ID is required');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const response = await thesisService.findOne(thesisId);
				const result = handleApiResponse(response);

				if (result.success && result.data) {
					setThesis(result.data);
					setError(null);
				} else if (result.error) {
					setError(result.error.message || 'Failed to fetch thesis');
				}
			} catch (err) {
				console.error('Error fetching thesis:', err);
				setError('Failed to fetch thesis data');
			} finally {
				setLoading(false);
			}
		};

		fetchThesis();
		// Also fetch skillSets for the skills dropdown
		fetchSkillSets();
	}, [thesisId, fetchSkillSets]);

	if (loading || skillSetsLoading || !isDataReady) {
		const loadingMessage = loading
			? 'Loading thesis data...'
			: skillSetsLoading
				? 'Loading skills data...'
				: 'Preparing form...';

		return (
			<Flex
				vertical
				justify="center"
				align="center"
				style={{
					minHeight: 'calc(100vh - 280px)',
					padding: '50px 24px',
					gap: '16px',
				}}
			>
				<Spin size="large" />
				<Typography.Text
					style={{
						color: '#666',
						fontSize: '16px',
						textAlign: 'center',
						fontWeight: 500,
					}}
				>
					{loadingMessage}
				</Typography.Text>
			</Flex>
		);
	}

	if (error) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Alert
					message="Error Loading Thesis"
					description={error}
					type="error"
					showIcon
					action={
						<Button
							type="link"
							onClick={() => window.location.reload()}
							style={{ padding: 0 }}
						>
							Retry
						</Button>
					}
				/>
			</Space>
		);
	}

	if (!thesis) {
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Alert
					message="Thesis Not Found"
					description="The requested thesis could not be found."
					type="warning"
					showIcon
				/>
			</Space>
		);
	}

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Space direction="vertical" size="small">
				<Title level={2} style={{ margin: 0 }}>
					Edit Thesis
				</Title>
				<Paragraph type="secondary" style={{ margin: 0 }}>
					Modify and resubmit your thesis proposal for review.
				</Paragraph>
			</Space>

			<ThesisForm
				mode="edit"
				initialValues={getFormInitialValues()}
				initialFile={getInitialFile()}
				onSubmit={handleUpdate}
				loading={updating}
			/>
		</Space>
	);
}
