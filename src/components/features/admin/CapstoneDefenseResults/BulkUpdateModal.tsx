import { Button } from 'antd';
import React from 'react';

interface SelectedStudent {
	studentId: string;
	name: string;
	status?: string;
}

interface BulkUpdateModalContentProps {
	selectedStudents: SelectedStudent[];
	getDisplayStatus: (status: string, studentId: string) => string;
}

export const BulkUpdateModalContent: React.FC<BulkUpdateModalContentProps> = ({
	selectedStudents,
	getDisplayStatus,
}) => {
	return (
		<div>
			<p>
				<strong>{selectedStudents.length}</strong> student(s) will be updated:
			</p>
			<div
				style={{
					maxHeight: 200,
					overflowY: 'auto',
					marginBottom: 5,
					marginTop: 16,
				}}
			>
				{selectedStudents.map((student) => (
					<div key={String(student.studentId)}>
						<b>{student.studentId}</b> - {student.name}
						<br />
						<small>
							Current:{' '}
							{getDisplayStatus(
								student.status ?? '',
								String(student.studentId),
							) || 'Not set'}
						</small>
					</div>
				))}
			</div>
			<p>Choose status to apply:</p>
		</div>
	);
};

interface BulkUpdateModalFooterProps {
	bulkUpdating: boolean;
	onCancel: () => void;
	onUpdate: (status: 'Passed' | 'Failed') => void;
}

export const BulkUpdateModalFooter: React.FC<BulkUpdateModalFooterProps> = ({
	bulkUpdating,
	onCancel,
	onUpdate,
}) => {
	return (
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
			<Button onClick={onCancel}>Cancel</Button>
			<div style={{ display: 'flex', gap: 8 }}>
				<Button
					style={{
						borderColor: '#ff4d4f',
						color: 'red',
					}}
					loading={bulkUpdating}
					onClick={() => onUpdate('Failed')}
				>
					FAILED
				</Button>
				<Button
					type="primary"
					style={{
						backgroundColor: '#52c41a',
						borderColor: '#52c41a',
					}}
					loading={bulkUpdating}
					onClick={() => onUpdate('Passed')}
				>
					PASSED
				</Button>
			</div>
		</div>
	);
};
