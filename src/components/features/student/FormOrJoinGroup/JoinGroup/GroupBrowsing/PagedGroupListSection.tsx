import { Col, Empty, Row } from 'antd';
import { useEffect, useState } from 'react';

import ListPagination from '@/components/common/ListPagination/ListPagination';
import GroupCard from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/GroupCard';

type GroupUI = {
	id: string;
	name: string;
	leader: string;
	domain: string;
	members: number;
};

interface PagedGroupListSectionProps {
	readonly groups: readonly GroupUI[];
	readonly fontSize: number;
	readonly pageSize?: number;
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
			{groups.length > 0 ? (
				<>
					<Row gutter={[16, 16]} align="stretch">
						{pagedGroups.map((group) => (
							<Col
								xs={24}
								sm={24}
								md={24}
								lg={12}
								xl={8}
								xxl={8}
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
					<ListPagination
						current={current}
						pageSize={currentPageSize}
						total={groups.length}
						onChange={handlePageChange}
						itemName="groups"
					/>
				</>
			) : (
				<Empty description="No groups available" style={{ margin: '40px 0' }} />
			)}
		</>
	);
}
