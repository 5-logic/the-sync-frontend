'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Input, Row, Select, Space } from 'antd';
import { useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { ListPagination } from '@/components/common/ListPagination';
import ThesisCard from '@/components/features/student/ViewListThesis/ThesisCard';
import { mockTheses } from '@/data/thesis';

const { Option } = Select;

export default function ViewListThesis() {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [selectedDomain, setSelectedDomain] = useState<string | undefined>(
		undefined,
	);
	const [selectedSupervisor, setSelectedSupervisor] = useState<
		string | undefined
	>(undefined);
	const pageSize = 6;

	// Danh sách đã publish
	const publishedTheses = useMemo(
		() => mockTheses.filter((thesis) => thesis.isPublish),
		[],
	);

	// Lọc domain/supervisor duy nhất
	const domainOptions = useMemo(
		() =>
			Array.from(new Set(publishedTheses.map((t) => t.domain).filter(Boolean))),
		[publishedTheses],
	);

	const supervisorOptions = useMemo(
		() =>
			Array.from(
				new Set(publishedTheses.map((t) => t.supervisor?.name).filter(Boolean)),
			),
		[publishedTheses],
	);

	// Áp dụng filter + search
	const filteredTheses = useMemo(() => {
		return publishedTheses.filter((thesis) => {
			const matchesSearch =
				thesis.englishName.toLowerCase().includes(searchText.toLowerCase()) ||
				thesis.description.toLowerCase().includes(searchText.toLowerCase());

			const matchesDomain = selectedDomain
				? thesis.domain === selectedDomain
				: true;
			const matchesSupervisor = selectedSupervisor
				? thesis.supervisor?.name === selectedSupervisor
				: true;

			return matchesSearch && matchesDomain && matchesSupervisor;
		});
	}, [searchText, selectedDomain, selectedSupervisor, publishedTheses]);

	const paginatedTheses = filteredTheses.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Row justify="space-between" align="top" gutter={[16, 16]}>
				<Col flex="auto">
					<Header
						title="List Thesis"
						description="Browse available thesis topics proposed and published by lecturers.
				You can view details and register once your group is ready."
					/>
				</Col>
				<Col style={{ marginTop: 20 }}>
					<Button type="primary">AI Suggest</Button>
				</Col>
			</Row>

			{/* Search & Filters */}
			<Row gutter={[16, 16]}>
				<Col flex="auto">
					<Input
						placeholder="Search by name or description"
						allowClear
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						prefix={<SearchOutlined />}
					/>
				</Col>

				<Col style={{ minWidth: 200 }}>
					<Select
						placeholder="Filter by Domain"
						allowClear
						style={{ width: '100%' }}
						onChange={(value) => setSelectedDomain(value)}
					>
						{domainOptions.map((domain) => (
							<Option key={domain} value={domain}>
								{domain}
							</Option>
						))}
					</Select>
				</Col>
				<Col style={{ minWidth: 200 }}>
					<Select
						placeholder="Filter by Supervisor"
						allowClear
						style={{ width: '100%' }}
						onChange={(value) => setSelectedSupervisor(value)}
					>
						{supervisorOptions.map((name) => (
							<Option key={name} value={name}>
								{name}
							</Option>
						))}
					</Select>
				</Col>
			</Row>

			{/* Danh sách Thesis */}
			<Row gutter={[16, 16]}>
				{paginatedTheses.length > 0 ? (
					paginatedTheses.map((thesis) => (
						<Col xs={24} sm={12} md={8} key={thesis.id}>
							{/* Trường hợp role student <> leader */}
							{/* <ThesisCard thesis={thesis} /> */}
							{/* Trường hợp role student:= leader */}
							<ThesisCard thesis={thesis} studentRole="leader" />
						</Col>
					))
				) : (
					<Col span={24}>
						<Empty description="No thesis available." />
					</Col>
				)}
			</Row>

			{/* Phân trang */}
			<ListPagination
				current={currentPage}
				pageSize={pageSize}
				total={filteredTheses.length}
				onChange={(page) => setCurrentPage(page)}
				itemName="thesis"
			/>
		</Space>
	);
}
