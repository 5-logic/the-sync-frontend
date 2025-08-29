import { Alert, Button, Modal, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import aiService, { type SuggestGroupsData } from '@/lib/services/ai.service';
import studentsService from '@/lib/services/students.service';
import { handleApiResponse } from '@/lib/utils/handleApi';

const FORM_CONFIG = {
	BUTTON_HEIGHT: 40,
	BUTTON_MIN_WIDTH: 180,
	BUTTON_FONT_SIZE: 14,
} as const;

const BUTTON_STYLES = {
	height: FORM_CONFIG.BUTTON_HEIGHT,
	padding: '0 16px',
	fontSize: FORM_CONFIG.BUTTON_FONT_SIZE,
	minWidth: 'auto',
} as const;

interface JoinGroupFormProps {
	readonly onSuggestionsReceived?: (data: SuggestGroupsData) => void;
}

export default function JoinGroupForm({
	onSuggestionsReceived,
}: JoinGroupFormProps) {
	const [loading, setLoading] = useState(false);
	const [showProfileDialog, setShowProfileDialog] = useState(false);
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();
	const router = useRouter();

	const callAISuggestAPI = useCallback(async () => {
		if (!session?.user?.id || !currentSemester?.id) {
			return;
		}

		try {
			const response = await aiService.suggestGroupsForStudent({
				studentId: session.user.id,
				semesterId: currentSemester.id,
			});

			// Direct access since service already returns proper response format
			if (response.success && response.data?.groups) {
				onSuggestionsReceived?.(response.data);
			}
		} catch (error) {
			console.error('Error calling AI suggest API:', error);
		}
	}, [session?.user?.id, currentSemester?.id, onSuggestionsReceived]);

	const handleSuggestGroups = useCallback(async () => {
		if (!session?.user?.id || !currentSemester?.id) {
			return;
		}

		try {
			setLoading(true);

			// First, get current student data to check their responsibility levels
			const studentResponse = await studentsService.findOne(session.user.id);
			const studentResult = handleApiResponse(studentResponse);

			if (!studentResult.success) {
				console.error('Failed to fetch student data');
				return;
			}

			const student = studentResult.data;
			const responsibilities = student?.studentResponsibilities || [];

			// Check if all responsibility levels are 0 or if no responsibilities exist
			const hasSetResponsibilities =
				responsibilities.length > 0 &&
				responsibilities.some((responsibility) => responsibility.level > 0);

			// Show modal if student hasn't set any responsibility levels (all are 0 or none exist)
			if (!hasSetResponsibilities) {
				setShowProfileDialog(true);
			} else {
				// If student has set responsibility levels, directly call API
				await callAISuggestAPI();
			}
		} catch (error) {
			console.error('Error in suggest groups:', error);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id, currentSemester?.id, callAISuggestAPI]);

	// Handle continuing with AI suggestion anyway
	const handleContinueAnyway = useCallback(async () => {
		setShowProfileDialog(false);
		await callAISuggestAPI();
	}, [callAISuggestAPI]);

	// Handle going to profile
	const handleGoToProfile = useCallback(() => {
		setShowProfileDialog(false);
		router.push('/student/account-setting');
	}, [router]);

	// Handle modal close (mask click or X button)
	const handleModalClose = useCallback(() => {
		setShowProfileDialog(false);
		// Don't redirect when just closing the modal
	}, []);

	return (
		<div style={{ width: '100%' }}>
			{/* Profile Setup Dialog */}
			<Modal
				title="Set Up Your Profile"
				open={showProfileDialog}
				onCancel={handleModalClose}
				maskClosable={true}
				centered
				footer={[
					<Button key="cancel" onClick={handleModalClose}>
						Cancel
					</Button>,
					<Button key="profile" onClick={handleGoToProfile}>
						Go to Profile
					</Button>,
					<Button key="continue" type="primary" onClick={handleContinueAnyway}>
						Continue Anyway
					</Button>,
				]}
			>
				<Space direction="vertical" size="small">
					<Typography.Text>
						To get the best group suggestions, please set up your responsibility
						levels in your profile first.
					</Typography.Text>
					<Typography.Text>
						This helps our AI algorithm find groups that match your preferences
						and skills.
					</Typography.Text>
				</Space>
			</Modal>

			{/* Desktop/Tablet: Alert with action button inline */}
			<div className="hidden sm:block">
				<Alert
					message="Having trouble finding a group?"
					description="Use our AI-powered group suggestion feature to find groups that match your responsibilities!"
					type="info"
					showIcon
					action={
						<Button
							type="primary"
							style={{
								...BUTTON_STYLES,
								width: '100%',
								maxWidth: '200px',
								whiteSpace: 'normal',
								textAlign: 'center',
								wordBreak: 'break-word',
							}}
							loading={loading}
							onClick={handleSuggestGroups}
						>
							{loading ? 'Finding Groups...' : 'Suggest Groups by AI'}
						</Button>
					}
					style={{ width: '100%' }}
				/>
			</div>

			{/* Mobile only: Alert and Button separately */}
			<div className="block sm:hidden">
				<Alert
					message="Having trouble finding a group?"
					description="Use our AI-powered group suggestion feature to find groups that match your responsibilities!"
					type="info"
					showIcon
					style={{
						width: '100%',
						marginBottom: '16px',
						wordBreak: 'break-word',
						wordWrap: 'break-word',
						overflowWrap: 'break-word',
					}}
				/>
				<Button
					type="primary"
					style={{
						...BUTTON_STYLES,
						width: '100%',
						whiteSpace: 'normal',
						textAlign: 'center',
						wordBreak: 'break-word',
					}}
					loading={loading}
					onClick={handleSuggestGroups}
				>
					{loading ? 'Finding Groups...' : 'Suggest Groups by AI'}
				</Button>
			</div>
		</div>
	);
}
