import { Col, Pagination, Row } from 'antd';
import { useState } from 'react';

import GroupCard from '@/components/features/student/FormOrJoinGroup/GroupCard';

type GroupUI = {
	id: string;
	name: string;
	description: string;
	domain: string;
	members: number;
};

interface PagedGroupListSectionProps {
	groups: GroupUI[];
	fontSize: number;
	pageSize?: number;
}

export default function PagedGroupListSection({
	groups,
	fontSize,
	pageSize = 6,
}: PagedGroupListSectionProps) {
	const [current, setCurrent] = useState(1);

	const startIdx = (current - 1) * pageSize;
	const endIdx = startIdx + pageSize;
	const pagedGroups = groups.slice(startIdx, endIdx);

	return (
		<>
			<Row gutter={[16, 16]} align="stretch">
				{pagedGroups.map((group) => (
					<Col
						xs={24}
						sm={12}
						md={8}
						key={group.id}
						style={{
							display: 'flex',
							marginBottom: 16,
						}}
					>
						<div style={{ width: '100%' }}>
							<GroupCard group={group} fontSize={fontSize} />
						</div>
					</Col>
				))}
			</Row>
			{groups.length > pageSize && (
				<div
					style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}
				>
					<Pagination
						current={current}
						pageSize={pageSize}
						total={groups.length}
						onChange={setCurrent}
						showSizeChanger={false}
					/>
				</div>
			)}
		</>
	);
}
