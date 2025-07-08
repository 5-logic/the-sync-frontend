'use client';

import { Button, Col, Empty, Pagination, Row, Tabs } from 'antd';
import { useState } from 'react';

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

	return (
		<div className="px-6 py-4">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-semibold">List Thesis</h2>
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
			<div className="flex justify-center mt-6">
				<Pagination
					current={currentPage}
					pageSize={pageSize}
					total={publishedTheses.length}
					onChange={(page) => setCurrentPage(page)}
					showSizeChanger={false}
				/>
			</div>
		</div>
	);
}
