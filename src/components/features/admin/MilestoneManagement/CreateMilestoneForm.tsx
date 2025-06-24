'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Row } from 'antd';

import MilestoneForm from '@/components/features/admin/MilestoneManagement/MilestoneForm';
import { Milestone, MilestoneCreate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';

type Props = Readonly<{
	semesters: Semester[];
	loadingSemesters: boolean;
	creating: boolean;
	existingMilestones: Milestone[];
	onSubmit: (data: MilestoneCreate) => Promise<void>;
}>;

export default function CreateMilestoneForm({
	semesters,
	loadingSemesters,
	creating,
	existingMilestones,
	onSubmit,
}: Props) {
	const [form] = Form.useForm(); // Handle form submission
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const [startDate, endDate] = values.duration ?? [];

			const milestoneData: MilestoneCreate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				semesterId: values.semesterId,
			};

			await onSubmit(milestoneData);
			form.resetFields();
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	return (
		<>
			{' '}
			<MilestoneForm
				form={form}
				semesters={semesters}
				loadingSemesters={loadingSemesters}
				existingMilestones={existingMilestones}
				showSemesterField={true}
			/>
			<Row justify="end" style={{ marginTop: 16 }}>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					loading={creating}
					onClick={handleSubmit}
				>
					Create New Milestone
				</Button>
			</Row>
		</>
	);
}
