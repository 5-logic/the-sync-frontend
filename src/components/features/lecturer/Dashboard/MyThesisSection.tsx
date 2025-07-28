import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Flex,
	Row,
	Select,
	Spin,
	Tag,
	Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useSessionData } from '@/hooks/auth/useAuth';
import { useCurrentSemester } from '@/hooks/semester/useCurrentSemester';
import { DOMAIN_COLOR_MAP } from '@/lib/constants/domains';
import semestersService from '@/lib/services/semesters.service';
import thesesService from '@/lib/services/theses.service';
import { handleApiResponse } from '@/lib/utils/handleApi';
import { Semester } from '@/schemas/semester';
import { Thesis } from '@/schemas/thesis';

const statusColor = {
	Approved: 'green',
	Pending: 'orange',
	Rejected: 'red',
	Draft: 'blue',
};

const SkillsDisplay: React.FC<{
	skills: Array<{ id: string; name: string }>;
}> = ({ skills }) => {
	const [visibleSkills, setVisibleSkills] = useState<
		Array<{ id: string; name: string }>
	>([]);
	const [hiddenCount, setHiddenCount] = useState(0);

	useEffect(() => {
		const maxTagsPerRow = 6;
		const maxRows = 2;
		const maxVisibleTags = maxTagsPerRow * maxRows;

		if (skills.length <= maxVisibleTags) {
			setVisibleSkills(skills);
			setHiddenCount(0);
		} else {
			const visible = maxVisibleTags - 1;
			setVisibleSkills(skills.slice(0, visible));
			setHiddenCount(skills.length - visible);
		}
	}, [skills]);

	return (
		<div
			style={{
				minHeight: '70px',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '8px',
				alignItems: 'flex-start',
				maxHeight: '64px',
			}}
		>
			{visibleSkills.map((skill) => (
				<Tag
					key={skill.id}
					style={{
						padding: '4px 8px',
						borderRadius: '6px',
						fontSize: '12px',
						margin: 0,
					}}
				>
					{skill.name}
				</Tag>
			))}
			{hiddenCount > 0 && (
				<Tag
					style={{
						padding: '4px 8px',
						borderRadius: '6px',
						fontSize: '12px',
						margin: 0,
						backgroundColor: '#f0f0f0',
						borderColor: '#d9d9d9',
						color: '#666',
					}}
				>
					+{hiddenCount} more
				</Tag>
			)}
		</div>
	);
};

interface ThesisWithRelations extends Thesis {
	thesisRequiredSkills?: Array<{ id: string; name: string }>;
	semester?: { id: string; name: string; code: string };
}

const MyThesisSection: React.FC = () => {
	const [theses, setTheses] = useState<ThesisWithRelations[]>([]);
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [selectedSemester, setSelectedSemester] = useState<string>('all');
	const [loading, setLoading] = useState(true);
	const { session } = useSessionData();
	const { currentSemester } = useCurrentSemester();
	const router = useRouter();

	// Set default semester to current semester when available
	useEffect(() => {
		if (currentSemester?.id && selectedSemester === 'all') {
			setSelectedSemester(currentSemester.id);
		}
	}, [currentSemester?.id, selectedSemester]);

	// Fetch semesters for filter
	useEffect(() => {
		const fetchSemesters = async () => {
			try {
				const response = await semestersService.findAll();
				const result = handleApiResponse(response);
				if (result.success) {
					setSemesters(result.data || []);
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
			}
		};

		fetchSemesters();
	}, []);

	// Fetch lecturer theses
	useEffect(() => {
		const fetchTheses = async () => {
			if (!session?.user?.id) return;

			try {
				setLoading(true);
				const response = await thesesService.findByLecturerId(session.user.id);
				const result = handleApiResponse(response);
				if (result.success) {
					setTheses(result.data || []);
				}
			} catch (error) {
				console.error('Error fetching theses:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTheses();
	}, [session?.user?.id]);

	// Filter theses by semester
	const filteredTheses =
		selectedSemester === 'all'
			? theses
			: theses.filter((thesis) => thesis.semesterId === selectedSemester);

	const handleCreateThesis = () => {
		router.push('/lecturer/create-thesis');
	};

	const handleViewDetails = (thesisId: string) => {
		router.push(`/lecturer/thesis/${thesisId}`);
	};

	const handleEditThesis = (thesisId: string) => {
		router.push(`/lecturer/edit-thesis/${thesisId}`);
	};
	return (
		<Card>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<Col>
					<Typography.Title level={5} style={{ margin: 0 }}>
						My Thesis Topics
					</Typography.Title>
				</Col>
				<Col>
					<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
						{/* Semester Filter */}
						<Select
							value={selectedSemester}
							onChange={setSelectedSemester}
							style={{ width: 200 }}
							placeholder="Filter by semester"
							allowClear
							onClear={() => setSelectedSemester('all')}
						>
							<Select.Option value="all">All Semesters</Select.Option>
							{semesters.map((semester) => (
								<Select.Option key={semester.id} value={semester.id}>
									{semester.name}
								</Select.Option>
							))}
						</Select>

						{/* Create Button */}
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={handleCreateThesis}
						>
							Create New Thesis
						</Button>
					</div>
				</Col>
			</Row>

			{loading ? (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
				</div>
			) : filteredTheses.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
					{selectedSemester === 'all'
						? 'No thesis topics found'
						: 'No thesis topics found for selected semester'}
				</div>
			) : (
				<Row gutter={[16, 16]}>
					{filteredTheses.map((thesis) => {
						// Get semester name from semester relation or find in semesters list
						const semesterName =
							thesis.semester?.name ||
							semesters.find((s) => s.id === thesis.semesterId)?.name ||
							'Unknown Semester';

						// Determine status to display
						const displayStatus = thesis.isPublish
							? 'Published'
							: thesis.status;

						return (
							<Col xs={24} md={12} lg={8} key={thesis.id}>
								<Card
									hoverable
									title={
										<Row justify="space-between" align="middle">
											<Col>
												<Tag color="cyan">{semesterName}</Tag>
											</Col>
											<Col>
												<Tag
													color={
														thesis.isPublish
															? 'green'
															: statusColor[
																	thesis.status as keyof typeof statusColor
																] || 'default'
													}
												>
													{displayStatus}
												</Tag>
											</Col>
										</Row>
									}
									actions={[
										<button
											key="view"
											style={{
												color: '#000',
												cursor: 'pointer',
												transition: 'color 0.3s',
												background: 'none',
												border: 'none',
												padding: 0,
												font: 'inherit',
											}}
											onMouseEnter={(e) =>
												((e.currentTarget as HTMLElement).style.color =
													'#1890ff')
											}
											onMouseLeave={(e) =>
												((e.currentTarget as HTMLElement).style.color = '#000')
											}
											onClick={() => handleViewDetails(thesis.id)}
										>
											<EyeOutlined style={{ marginRight: 4 }} />
											View Details
										</button>,
										<button
											key="edit"
											style={{
												color: '#000',
												cursor: 'pointer',
												transition: 'color 0.3s',
												background: 'none',
												border: 'none',
												padding: 0,
												font: 'inherit',
											}}
											onMouseEnter={(e) =>
												((e.currentTarget as HTMLElement).style.color =
													'#1890ff')
											}
											onMouseLeave={(e) =>
												((e.currentTarget as HTMLElement).style.color = '#000')
											}
											onClick={() => handleEditThesis(thesis.id)}
										>
											<EditOutlined style={{ marginRight: 4 }} />
											Edit
										</button>,
									]}
									style={{ height: '100%' }}
								>
									<Flex vertical style={{ height: '100%' }}>
										{/* Domain Tag */}
										{thesis.domain && (
											<div style={{ marginBottom: 8 }}>
												<Tag color={DOMAIN_COLOR_MAP[thesis.domain] || 'blue'}>
													{thesis.domain}
												</Tag>
											</div>
										)}

										{/* English Name */}
										<div
											style={{
												fontSize: '16px',
												fontWeight: 600,
												color: '#1f2937',
												marginBottom: 12,
												lineHeight: '1.5',
												height: '48px', // 2 lines * 1.5 * 16px
												overflow: 'hidden',
												display: '-webkit-box',
												WebkitLineClamp: 2,
												WebkitBoxOrient: 'vertical',
												wordBreak: 'break-word',
											}}
										>
											{thesis.englishName}
										</div>

										{/* Description */}
										<div
											style={{
												color: '#6b7280',
												lineHeight: '1.5',
												marginBottom: 12,
												fontSize: '14px',
												height: '84px', // 4 lines * 1.5 * 14px = 84px
												overflow: 'hidden',
												display: '-webkit-box',
												WebkitLineClamp: 4,
												WebkitBoxOrient: 'vertical',
												wordBreak: 'break-word',
												textOverflow: 'ellipsis',
											}}
										>
											{thesis.description}
										</div>

										{/* Skills */}
										<div style={{ marginTop: 'auto' }}>
											<SkillsDisplay
												skills={thesis.thesisRequiredSkills || []}
											/>
										</div>
									</Flex>
								</Card>
							</Col>
						);
					})}
				</Row>
			)}
		</Card>
	);
};

export default MyThesisSection;
