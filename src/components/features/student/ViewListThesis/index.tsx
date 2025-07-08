'use client';

import { Col, Empty, Pagination, Row, Tabs } from 'antd';
import { useState } from 'react';

import { mockTheses } from '@/data/thesis';

import ThesisCard from './ThesisCard';

export default function ThesisListStudentPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 6;

	const publishedTheses = mockTheses.filter((thesis) => thesis.isPublish);
	const paginatedTheses = publishedTheses.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	return (
		<div className="px-6 py-4">
			<h2 className="text-2xl font-semibold mb-4">List Thesis</h2>
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
