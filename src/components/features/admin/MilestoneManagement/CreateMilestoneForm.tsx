'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Row } from 'antd';
import { useState } from 'react';

import MilestoneForm from '@/components/features/admin/MilestoneManagement/MilestoneForm';
import { StorageService } from '@/lib/services/storage.service';
import { showNotification } from '@/lib/utils/notification';
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
	const [form] = Form.useForm();
	const [files, setFiles] = useState<File[]>([]);

	// Handle form submission
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			// Convert date range to individual dates
			const [startDate, endDate] = values.duration ?? [];

			let documentUrls: string[] = [];

			// Upload files to Supabase if any files are selected
			if (files.length > 0) {
				try {
					const uploadPromises = files.map((file) =>
						StorageService.uploadFile(file, 'milestone-templates'),
					);
					documentUrls = await Promise.all(uploadPromises);

					showNotification.success(
						'Upload Success',
						`${files.length} file(s) uploaded successfully`,
					);
				} catch (error) {
					showNotification.error(
						'Upload Failed',
						'Failed to upload some files. Please try again.',
					);
					console.error('File upload failed:', error);
					return; // Don't proceed with milestone creation if upload fails
				}
			}

			const milestoneData: MilestoneCreate = {
				name: values.milestoneName,
				startDate: startDate?.toDate(),
				endDate: endDate?.toDate(),
				semesterId: values.semesterId,
				note: values.note || undefined,
				documents: documentUrls.length > 0 ? documentUrls : undefined,
			};

			await onSubmit(milestoneData);
			form.resetFields();
			setFiles([]); // Reset files
		} catch (error) {
			console.error('Form validation failed:', error);
		}
	};

	return (
		<>
			<MilestoneForm
				form={form}
				semesters={semesters}
				loadingSemesters={loadingSemesters}
				existingMilestones={existingMilestones}
				showSemesterField={true}
				files={files}
				onFilesChange={setFiles}
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
