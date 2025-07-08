'use client';

import { Button, Col, Empty, Row, Space, Tabs, Typography } from 'antd';
import { useState } from 'react';

import { ListPagination } from '@/components/common/ListPagination';
import ThesisCard from '@/components/features/student/ViewListThesis/ThesisCard';
import { mockTheses } from '@/data/thesis';

export default function ViewListThesis() {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 6;

	const publishedTheses = mockTheses.filter((thesis) => thesis.isPublish);
	const paginatedTheses = publishedTheses.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	const { Title, Paragraph } = Typography;

	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<div className="flex justify-between items-start">
				<div>
					<Title level={2} style={{ marginBottom: 4 }}>
						List Thesis
					</Title>
					<Paragraph
						type="secondary"
						style={{ marginBottom: 0, maxWidth: 'auto' }}
					>
						Browse available thesis topics proposed and published by lecturers.
						You can view details and register once your group is ready.
					</Paragraph>
				</div>
				<Button type="primary">AI Suggest</Button>
			</div>

			<Tabs
				defaultActiveKey="1"
				items={[
					{
						key: '1',
						label: 'List All Thesis',
						children: (
							<Row gutter={[16, 16]}>
								{paginatedTheses.length > 0 ? (
									paginatedTheses.map((thesis) => (
										<Col span={8} key={thesis.id}>
											<ThesisCard thesis={thesis} />
										</Col>
									))
								) : (
									<Col span={24}>
										<Empty description="No thesis available." />
									</Col>
								)}
							</Row>
						),
					},
				]}
			/>

			<ListPagination
				current={currentPage}
				pageSize={pageSize}
				total={publishedTheses.length}
				onChange={(page) => setCurrentPage(page)}
				itemName="thesis"
			/>
		</Space>
	);
}
