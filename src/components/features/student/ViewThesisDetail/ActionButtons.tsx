'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Row, Space } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { useThesisRegistration } from '@/hooks/thesis';
import { ThesisWithRelations } from '@/schemas/thesis';

interface Props {
	readonly thesis: ThesisWithRelations;
	readonly disabled?: boolean;
}

export default function ActionButtons({ thesis, disabled = false }: Props) {
	const router = useRouter();
	const { hasGroup, isLeader } = useStudentGroupStatus();
	const { registerThesis, isRegistering } = useThesisRegistration();

	const handleBackToList = useCallback(() => {
		router.push('/student/list-thesis');
	}, [router]);

	const handleRegisterThesis = useCallback(async () => {
		await registerThesis(thesis.id);
	}, [registerThesis, thesis.id]);

	// Show register button only if user has group, is leader, and thesis is not assigned
	const showRegisterButton = hasGroup && isLeader && !thesis.groupId;

	return (
		<Row justify="end">
			<Space>
				<Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
					Back to List
				</Button>
				{showRegisterButton && (
					<Button
						type="primary"
						onClick={handleRegisterThesis}
						loading={isRegistering}
						disabled={disabled}
					>
						Register Thesis
					</Button>
				)}
			</Space>
		</Row>
	);
}
