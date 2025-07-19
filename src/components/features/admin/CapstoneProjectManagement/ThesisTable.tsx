'use client';

import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Table, Tag } from 'antd';
import React, { useMemo, useState } from 'react';

import { TablePagination } from '@/components/common/TablePagination';
import { allMockGroups } from '@/data/group';
import { mockTheses } from '@/data/thesis';

const { Option } = Select;

type ThesisTableData = {
	stt: number;
	studentId: string;
	name: string;
	major: string;
	thesisName: string;
	abbreviation: string;
	supervisor: string;
	rowSpanGroup: number; // chỉ dùng cho các cột cần merge
	groupId: string;
};

const ThesisTable = () => {
	const [searchText, setSearchText] = useState('');
	const [filteredMajor, setFilteredMajor] = useState<string | null>(null);

	const data = useMemo((): ThesisTableData[] => {
		const majors = ['Software Engineering', 'Artificial Intelligence'];
		let counter = 1;
		const groupCounts: Record<string, number> = {};
		const tempData: ThesisTableData[] = [];

		allMockGroups.forEach((group) => {
			const thesis = mockTheses.find((t) => t.groupId === group.id);
			groupCounts[group.id] = group.members.length;

			group.members.forEach((memberName, index) => {
				tempData.push({
					groupId: group.id,
					stt: counter++,
					studentId: `ST${group.id.toUpperCase()}${(index + 1).toString().padStart(2, '0')}`,
					name: memberName,
					major: majors[(counter + index) % majors.length], // giả định mix chuyên ngành
					thesisName: thesis?.englishName || group.title,
					abbreviation: thesis?.abbreviation || group.code,
					supervisor: group.supervisors.join(', '),
					rowSpanGroup: 1, // sẽ set bên dưới
				});
			});
		});

		// Gán rowSpan cho nhóm (chỉ cho các cột cần merge)
		const seenGroups = new Set();
		return tempData.map((item) => {
			if (!seenGroups.has(item.groupId)) {
				seenGroups.add(item.groupId);
				return { ...item, rowSpanGroup: groupCounts[item.groupId] };
			} else {
				return { ...item, rowSpanGroup: 0 };
			}
		});
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
		{
			title: 'Major',
			dataIndex: 'major',
			key: 'major',
			// ❌ Không merge cột này nữa
		},
		{
			title: 'Thesis Title',
			dataIndex: 'thesisName',
			key: 'thesisName',
			render: (text: string, record: ThesisTableData) => ({
				children: text,
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
		{
			title: 'Abbreviation',
			dataIndex: 'abbreviation',
			key: 'abbreviation',
			render: (abbreviation: string, record: ThesisTableData) => ({
				children: <Tag color="blue">{abbreviation}</Tag>,
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
		{
			title: 'Supervisor',
			dataIndex: 'supervisor',
			key: 'supervisor',
			render: (supervisor: string, record: ThesisTableData) => ({
				children: supervisor ? (
					supervisor
						.split(', ')
						.map((sup, index) => <div key={index}>{sup}</div>)
				) : (
					<span style={{ color: '#999' }}>-</span>
				),
				props: {
					rowSpan: record.rowSpanGroup,
				},
			}),
		},
	];

	return (
		<>
			<Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
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
				<Col style={{ width: 250 }}>
					<Select
						placeholder="Filter by major"
						onChange={handleFilterMajor}
						allowClear
						style={{ width: '100%' }}
						size="middle"
					>
						<Option value="Software Engineering">Software Engineering</Option>
						<Option value="Artificial Intelligence">
							Artificial Intelligence
						</Option>
						<Option value="Cybersecurity">Cybersecurity</Option>
					</Select>
				</Col>
				<Col style={{ width: 200 }}>
					<Button
						icon={<DownloadOutlined />}
						type="primary"
						size="middle"
						style={{ width: '100%' }}
					>
						Export PDF
					</Button>
				</Col>
			</Row>
			<Table
				columns={columns}
				dataSource={filteredData}
				pagination={TablePagination}
				rowKey="studentId"
				bordered
				rowClassName={(record, index) => {
					const currentGroup = record.groupId;
					const nextGroup = filteredData[index + 1]?.groupId;
					return currentGroup !== nextGroup ? 'group-end-row' : '';
				}}
			/>

			<style jsx global>{`
				.group-end-row {
					position: relative;
				}

				.group-end-row::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 0;
					height: 2px;
					width: 100%;
					background-color: #d9d9d9;
				}
			`}</style>
		</>
	);
};

export default ThesisTable;
