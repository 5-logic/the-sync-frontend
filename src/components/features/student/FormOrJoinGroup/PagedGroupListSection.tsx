import { Col, Row } from 'antd';
import { useEffect, useState } from 'react';

import ListPagination from '@/components/common/ListPagination/ListPagination';
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
	const [currentPageSize, setCurrentPageSize] = useState(pageSize);

	useEffect(() => {
		setCurrent(1);
	}, [groups.length]);

	const startIdx = (current - 1) * currentPageSize;
	const endIdx = startIdx + currentPageSize;
	const pagedGroups = groups.slice(startIdx, endIdx);

	const handlePageChange = (page: number, newPageSize: number) => {
		if (newPageSize !== currentPageSize) {
			setCurrent(1);
		} else {
			setCurrent(page);
		}
		setCurrentPageSize(newPageSize);
	};

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
			{groups.length > 0 && (
				<ListPagination
					current={current}
					pageSize={currentPageSize}
					total={groups.length}
					onChange={handlePageChange}
					itemName="groups"
				/>
			)}
		</>
	);
}
