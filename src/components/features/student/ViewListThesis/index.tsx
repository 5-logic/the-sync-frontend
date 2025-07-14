'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Input, Row, Select, Space, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/common/Header';
import { ListPagination } from '@/components/common/ListPagination';
import ThesisCard from '@/components/features/student/ViewListThesis/ThesisCard';
import { useStudentGroupStatus } from '@/hooks/student/useStudentGroupStatus';
import { getSortedDomains } from '@/lib/constants/domains';
import lecturersService from '@/lib/services/lecturers.service';
import studentsService from '@/lib/services/students.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Thesis, ThesisWithRelations } from '@/schemas/thesis';

const { Option } = Select;

// Convert Thesis to ThesisWithRelations format
const convertToThesisWithRelations = async (
	thesis: Thesis,
): Promise<ThesisWithRelations | null> => {
	try {
		// Fetch lecturer info for this thesis
		const lecturerResponse = await lecturersService.findOne(thesis.lecturerId);
		const lecturerResult = handleApiResponse(lecturerResponse, 'Success');

		if (!lecturerResult.success || !lecturerResult.data) {
			return null;
		}

		const lecturer = lecturerResult.data;

		// Convert to ThesisWithRelations format
		return {
			...thesis,
			lecturer: {
				userId: lecturer.id,
				isModerator: lecturer.isModerator,
				user: {
					id: lecturer.id,
					fullName: lecturer.fullName,
					email: lecturer.email,
				},
			},
			thesisRequiredSkills: [], // Will be populated by API if available
			thesisVersions: [], // Will be populated by API if available
		};
	} catch (error) {
		console.error('Error converting thesis:', error);
		return null;
	}
};

export default function ViewListThesis() {
	const { data: session } = useSession();
	const { isLeader } = useStudentGroupStatus();
	const [currentPage, setCurrentPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [selectedDomain, setSelectedDomain] = useState<string | undefined>(
		undefined,
	);
	const [selectedSupervisor, setSelectedSupervisor] = useState<
		string | undefined
	>(undefined);
	const [theses, setTheses] = useState<ThesisWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const pageSize = 6;

	// Get student ID from session
	const studentId = session?.user?.id;

	// Fetch theses data
	const fetchThesesData = useCallback(
		async (forceRefresh = false) => {
			if (!studentId) return;

			try {
				if (forceRefresh) {
					setRefreshing(true);
				} else {
					setLoading(true);
				}

				// First, get student profile to get semester info
				const studentResponse = await studentsService.findOne(studentId);
				const studentResult = handleApiResponse(studentResponse, 'Success');

				if (!studentResult.success || !studentResult.data) {
					console.error('Failed to fetch student profile');
					return;
				}

				// Get the semester from student's enrollment
				const enrollment = studentResult.data.enrollments?.[0];
				if (!enrollment?.semester?.id) {
					console.error('No enrollment or semester found for student');
					return;
				}

				// Fetch theses for the semester
				const thesesResponse = await thesesService.findBySemester(
					enrollment.semester.id,
				);
				const thesesResult = handleApiResponse(thesesResponse, 'Success');

				if (thesesResult.success && thesesResult.data) {
					// Filter only published theses
					const publishedTheses = thesesResult.data.filter(
						(thesis) => thesis.isPublish && thesis.status === 'Approved',
					);

					// Convert each thesis to ThesisWithRelations format
					const thesesWithRelations = await Promise.all(
						publishedTheses.map(convertToThesisWithRelations),
					);

					// Filter out any null results and set state
					const validTheses = thesesWithRelations.filter(
						(thesis): thesis is ThesisWithRelations => thesis !== null,
					);
					setTheses(validTheses);
				}
			} catch (error) {
				console.error('Error fetching theses:', error);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[studentId],
	);

	// Fetch data on component mount
	useEffect(() => {
		if (studentId) {
			fetchThesesData();
		}
	}, [studentId, fetchThesesData]);

	// Handle refresh button
	const handleRefresh = () => {
		fetchThesesData(true);
	};

	// Get domain options from the constants
	const domainOptions = useMemo(() => getSortedDomains(), []);

	// Get supervisor options from fetched theses
	const supervisorOptions = useMemo(() => {
		const supervisors = theses
			.map((thesis) => thesis.lecturer.user.fullName)
			.filter(Boolean);
		return Array.from(new Set(supervisors));
	}, [theses]);

	// Apply filters and search
	const filteredTheses = useMemo(() => {
		return theses.filter((thesis) => {
			const matchesSearch =
				thesis.englishName.toLowerCase().includes(searchText.toLowerCase()) ||
				thesis.vietnameseName
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				thesis.description.toLowerCase().includes(searchText.toLowerCase());

			const matchesDomain = selectedDomain
				? thesis.domain === selectedDomain
				: true;

			const matchesSupervisor = selectedSupervisor
				? thesis.lecturer.user.fullName === selectedSupervisor
				: true;

			return matchesSearch && matchesDomain && matchesSupervisor;
		});
	}, [searchText, selectedDomain, selectedSupervisor, theses]);

	const paginatedTheses = filteredTheses.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px' }}>
				<Spin size="large" tip="Loading theses..." />
			</div>
		);
	}

	return (
		<Space
			direction="vertical"
			size="large"
			style={{ width: '100%', position: 'relative' }}
		>
			{/* Refresh Loading Overlay */}
			{refreshing && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1000,
					}}
				>
					<Spin size="large" tip="Refreshing theses..." />
				</div>
			)}

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
						value={selectedDomain}
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
						value={selectedSupervisor}
						onChange={(value) => setSelectedSupervisor(value)}
					>
						{supervisorOptions.map((name) => (
							<Option key={name} value={name}>
								{name}
							</Option>
						))}
					</Select>
				</Col>
				<Col>
					<Button
						icon={<ReloadOutlined />}
						onClick={handleRefresh}
						loading={refreshing}
						title="Refresh theses"
					>
						Refresh
					</Button>
				</Col>
			</Row>

			{/* Danh sách Thesis */}
			<Row gutter={[16, 16]}>
				{paginatedTheses.length > 0 ? (
					paginatedTheses.map((thesis) => (
						<Col xs={24} sm={12} md={8} key={thesis.id}>
							<ThesisCard
								thesis={thesis}
								studentRole={isLeader ? 'leader' : 'member'}
							/>
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
