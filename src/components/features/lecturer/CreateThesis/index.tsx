'use client';

import { Card, Col, Row } from 'antd';

import ThesisForm from '@//components/features/lecturer/CreateThesis/ThesisForm';
import { Header } from '@/components/common/Header';
import { useThesisForm } from '@/hooks/thesis';

export default function CreateThesis() {
	const { loading, handleSubmit } = useThesisForm({ mode: 'create' });

	return (
		<div>
			<Header
				title="Create New Thesis"
				description="Create and publish a new thesis topic for students to review and register."
			/>

			<Card>
				<Row gutter={[24, 24]}>
					<Col span={24}>
						<ThesisForm
							mode="create"
							onSubmit={handleSubmit}
							loading={loading}
						/>
					</Col>
				</Row>
			</Card>
		</div>
	);
}
