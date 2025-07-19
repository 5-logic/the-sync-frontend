'use client';

import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Table, Tag } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

const { Option } = Select;

// Kết hợp dữ liệu từ groups và theses
type ThesisTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	abbreviation: string;
	supervisor: string;
};

const ThesisTable = () => {
	const [searchText, setSearchText] = useState('');
	const [filteredMajor, setFilteredMajor] = useState<string | null>(null);

	// Tạo dữ liệu kết hợp từ groups và theses
	const data = useMemo((): ThesisTableData[] => {
		const combinedData: ThesisTableData[] = [];
		let counter = 1;

		// Danh sách major để phân bổ ngẫu nhiên
		const majors = ['Information Technology', 'Economics', 'Electronics'];

		allMockGroups.forEach((group) => {
			// Tìm thesis tương ứng với group
			const thesis = mockTheses.find((t) => t.groupId === group.id);

			// Thêm từng member trong group
			group.members.forEach((memberName, index) => {
				combinedData.push({
					stt: counter++,
					studentId: `ST${group.id.toUpperCase()}${(index + 1).toString().padStart(2, '0')}`,
					name: memberName,
					major: majors[index % majors.length], // Phân bổ major theo vòng lặp
					thesisName: thesis?.englishName || group.title,
					abbreviation: thesis?.abbreviation || `${group.code}`,
					supervisor:
						group.supervisors.length > 0
							? group.supervisors.join(', ')
							: 'Unassigned',
				});
			});
		});

		return combinedData;
	}, []);

	const handleSearch = (value: string) => {
		setSearchText(value.toLowerCase());
	};

	const handleFilterMajor = (value: string) => {
		setFilteredMajor(value);
	};

	const filteredData = data.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchText) ||
			item.thesisName.toLowerCase().includes(searchText);
		const matchesMajor = filteredMajor ? item.major === filteredMajor : true;
		return matchesSearch && matchesMajor;
	});

	const columns = [
		{ title: 'No.', dataIndex: 'stt', key: 'stt' },
		{ title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
		{ title: 'Full Name', dataIndex: 'name', key: 'name' },
		{ title: 'Major', dataIndex: 'major', key: 'major' },
		{ title: 'Thesis Title', dataIndex: 'thesisName', key: 'thesisName' },
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			render: (abbreviation: string) => <Tag color="blue">{abbreviation}</Tag>,
		},
		{ title: 'Supervisor', dataIndex: 'supervisor', key: 'supervisor' },
	];

	return (
		<>
			<Row
				gutter={[16, 16]}
				align="middle"
				justify="space-between"
				style={{ marginBottom: 16 }}
			>
				<Col xs={24} md={18}>
					<Row gutter={[8, 8]} wrap>
						<Col flex="auto">
							<Input
								placeholder="Search by name or thesis title..."
								value={searchText}
								onChange={(e) => handleSearch(e.target.value)}
								prefix={<SearchOutlined />}
								allowClear
								size="middle"
							/>
						</Col>
						<Col style={{ width: 200 }}>
							<Select
								placeholder="Filter by major"
								onChange={handleFilterMajor}
								allowClear
								style={{ width: '100%' }}
								size="middle"
							>
								<Option value="Information Technology">
									Information Technology
								</Option>
								<Option value="Economics">Economics</Option>
								<Option value="Electronics">Electronics</Option>
							</Select>
						</Col>
					</Row>
				</Col>
				<Col xs={24} md={6} style={{ textAlign: 'right' }}>
					<Button icon={<DownloadOutlined />} type="primary" size="middle">
						Export PDF
					</Button>
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={TablePagination}
				rowKey="studentId"
			/>
		</>
	);
};

export default ThesisTable;
