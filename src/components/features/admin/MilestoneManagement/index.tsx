'use client';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Divider,
	Input,
	Row,
	Select,
	Space,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import CreateMilestoneForm from '@/components/features/admin/MilestoneManagement/CreateMilestoneForm';
import MilestoneTable from '@/components/features/admin/MilestoneManagement/MilestoneTable';
import semesterService from '@/lib/services/semesters.service';
import { showNotification } from '@/lib/utils/notification';
import { MilestoneCreate } from '@/schemas/milestone';
import { Semester } from '@/schemas/semester';
import { useMilestoneStore } from '@/store';

const { Title, Paragraph } = Typography;

export default function MilestoneManagement() {
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [loadingSemesters, setLoadingSemesters] = useState(false);
	const {
		milestones,
		filteredMilestones,
		loading,
		creating,
		searchText,
		fetchMilestones,
		createMilestone,
		setSelectedSemesterId,
		setSearchText,
	} = useMilestoneStore();

	// Fetch semesters for dropdown
	useEffect(() => {
		const fetchSemesters = async () => {
			setLoadingSemesters(true);
			try {
				const response = await semesterService.findAll();
				if (response.success) {
					setSemesters(response.data || []);
				} else {
					showNotification.error('Error', 'Failed to fetch semesters');
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
				showNotification.error('Error', 'Failed to fetch semesters');
			} finally {
				setLoadingSemesters(false);
			}
		};

		fetchSemesters();
	}, []);

	// Fetch milestones on component mount
	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);
	// Handle search change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	// Handle semester filter change
	const handleSemesterChange = (semesterId: string | undefined) => {
		if (semesterId) {
			setSelectedSemesterId(semesterId);
		} else {
			setSelectedSemesterId(null);
		}
	};
	// Handle form submission
	const handleCreateMilestone = async (data: MilestoneCreate) => {
		const success = await createMilestone(data);
		if (success) {
			// Form reset is handled in CreateMilestoneForm component
		}
	};
	// Handle refresh
	const handleRefresh = async () => {
		try {
			await fetchMilestones(true); // Force refresh to bypass cache
			showNotification.success('Success', 'Milestones refreshed successfully');
		} catch (error) {
			// Error handling is already done in the fetchMilestones function
			console.error('Error refreshing milestones:', error);
		}
	};
	return (
		<Space direction="vertical" size="middle" style={{ width: '100%' }}>
			<Space direction="vertical" size="small">
				<Title level={2} style={{ marginBottom: 0 }}>
					Milestones Management
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Create and manage milestones for each semester.
				</Paragraph>
			</Space>
			<CreateMilestoneForm
				semesters={semesters}
				loadingSemesters={loadingSemesters}
				creating={creating}
				existingMilestones={milestones}
				onSubmit={handleCreateMilestone}
			/>
			<Divider /> {/* Search, Filter and Actions Section */}
			<Row gutter={[16, 16]} align="middle">
				<Col xs={24} sm={12} md={8} lg={6}>
					<Select
						placeholder="All Semesters"
						style={{ width: '100%' }}
						loading={loadingSemesters}
						onChange={handleSemesterChange}
						allowClear
						options={semesters.map((semester) => ({
							value: semester.id,
							label: semester.name,
						}))}
					/>
				</Col>
				<Col xs={24} sm={12} md={12} lg={15}>
					<Input
						placeholder="Search milestones..."
						prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
						allowClear
						value={searchText}
						onChange={handleSearchChange}
						style={{ width: '100%' }}
					/>
				</Col>
				<Col xs={24} sm={24} md={4} lg={3}>
					<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
						<Button
							icon={<ReloadOutlined />}
							onClick={handleRefresh}
							loading={loading}
							title="Refresh milestones"
							type="default"
						>
							Refresh
						</Button>
					</div>
				</Col>
			</Row>
			<MilestoneTable
				data={filteredMilestones}
				loading={loading}
				semesters={semesters}
			/>
		</Space>
	);
}
