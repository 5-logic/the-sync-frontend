'use client';

import {
	CheckOutlined,
	CloseOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Row, Space } from 'antd';
import { useState } from 'react';

interface Props {
	showDuplicate: boolean;
	onToggleDuplicate: () => void;
	onApprove?: () => void;
	onReject?: (reason: string) => void;
	onExit?: () => void;
	onEdit?: () => void;
	status: string;
}

export default function ThesisActionButtons({
	onToggleDuplicate,
	onApprove,
	onReject,
	onExit,
}: Props) {
	const [rejectModalVisible, setRejectModalVisible] = useState(false);
	const [form] = Form.useForm();

	const handleRejectSubmit = async () => {
		try {
			const values = await form.validateFields();
			setRejectModalVisible(false);
			form.resetFields();
			onReject?.(values.reason);
		} catch {}
	};

	return (
		<>
			{status === 'Rejected' ? (
				<Row justify="end">
					<Space>
						<Button onClick={onExit}>Exit</Button>
						<Button type="primary" onClick={onExit}>
							Edit Thesis
						</Button>
					</Space>
				</Row>
			) : (
				<Row justify="space-between">
					<Col>
						<Button
							icon={<SearchOutlined />}
							onClick={onToggleDuplicate}
							type="primary"
						>
							Duplicate Thesis Detection
						</Button>
					</Col>
					<Col>
						<Space>
							<Button onClick={onExit}>Exit</Button>
							<Button
								danger
								icon={<CloseOutlined />}
								onClick={() => setRejectModalVisible(true)}
							>
								Reject
							</Button>
							<Button
								type="primary"
								icon={<CheckOutlined />}
								onClick={onApprove}
							>
								Approve
							</Button>
						</Space>
					</Col>
				</Row>
			)}

			<Modal
				title="Reject Thesis"
				open={rejectModalVisible}
				onCancel={() => setRejectModalVisible(false)}
				onOk={handleRejectSubmit}
				okText="Submit"
				cancelText="Cancel"
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label={
							<>
								Rejection Reason<span style={{ color: 'red' }}> *</span>
							</>
						}
						name="reason"
						rules={[
							{
								required: false,
								message: 'Please enter the reason for rejection',
							},
						]}
					>
						<Input.TextArea rows={4} placeholder="Enter reason..." />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}
