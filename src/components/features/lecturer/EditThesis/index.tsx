'use client';

import { Alert, Button, Flex, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { Header } from '@/components/common/Header';
import ThesisForm from '@/components/features/lecturer/CreateThesis/ThesisForm';
import { useThesisForm } from '@/hooks/thesis';
import thesisService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { ThesisWithRelations } from '@/schemas/thesis';
import { useSkillSetStore } from '@/store';

interface Props {
	readonly thesisId?: string;
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
			} catch {
				setError('Failed to fetch thesis data');
			} finally {
				setLoading(false);
			}
		};

		fetchThesis();
		// Also fetch skillSets for the skills dropdown
		fetchSkillSets();
	}, [thesisId, fetchSkillSets]);

	// Helper function to get loading message based on current state
	const getLoadingMessage = () => {
		if (loading) return 'Loading thesis data...';
		if (skillSetsLoading) return 'Loading skills data...';
		return 'Preparing form...';
	};

	if (loading || skillSetsLoading || !isDataReady) {
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
					{getLoadingMessage()}
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
				<Header
					title="Edit Thesis"
					description="Modify and resubmit your thesis proposal for review."
				/>
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
