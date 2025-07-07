'use client';

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Form,
	Input,
	Radio,
	Row,
	Select,
	Slider,
	Space,
	Spin,
	TreeSelect,
	Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import { useOptimizedSession } from '@/hooks/auth/useAuth';
import {
	ProfileData,
	fetchUserProfile,
} from '@/lib/utils/auth/profile-fetcher';
import { SkillSet } from '@/schemas/skill';
import { StudentUpdate } from '@/schemas/student';
import {
	useMajorStore,
	useResponsibilityStore,
	useSkillSetStore,
	useStudentStore,
} from '@/store';

// TypeScript interfaces
interface FormValues {
	fullName: string;
	email: string;
	studentId: string;
	major: string;
	phoneNumber: string;
	gender: string;
	responsibility: string[];
	skills?: Array<{
		skillId: string;
		level: number;
	}>;
}

const { Title } = Typography;

// Constants moved outside component to prevent re-creation on each render
const LEVEL_TOOLTIPS = [
	'Beginner',
	'Intermediate',
	'Proficient',
	'Advanced',
	'Expert',
] as const;

const LEVEL_COLORS = [
	'#1890ff', // Blue - Beginner
	'#52c41a', // Green - Intermediate
	'#fadb14', // Yellow - Proficient
	'#fa8c16', // Orange - Advanced
	'#ff4d4f', // Red - Expert
] as const;

// Memoized skill tree data to prevent unnecessary re-computation
const buildSkillTreeData = (skillSets: SkillSet[]) =>
	skillSets.map((set) => ({
		value: set.id,
		title: set.name,
		selectable: false,
		children:
			set.skills?.map((skill) => ({
				value: skill.id,
				title: skill.name,
			})) ?? [],
	}));

const StudentAccountForm: React.FC = () => {
	const [form] = Form.useForm();
	const [skillLevels, setSkillLevels] = React.useState<{
		[key: number]: number;
	}>({});
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	// Use Student Store for update profile
	const { updateProfile, updatingProfile, clearError } = useStudentStore();

	// Use Major Store to get major names
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

	// Use Skill Set Store to get skill sets data
	const {
		skillSets,
		loading: skillSetsLoading,
		fetchSkillSets,
	} = useSkillSetStore();

	// Use Responsibility Store to get responsibilities data
	const {
		responsibilities,
		loading: responsibilitiesLoading,
		fetchResponsibilities,
	} = useResponsibilityStore();

	// Get current user session
	const {
		session,
		isAuthenticated,
		isLoading: sessionLoading,
	} = useOptimizedSession();

	// Clear errors when component mounts
	useEffect(() => {
		clearError();
	}, [clearError]);

	// Fetch majors for display
	useEffect(() => {
		fetchMajors();
	}, [fetchMajors]);

	// Fetch skill sets for display
	useEffect(() => {
		fetchSkillSets();
	}, [fetchSkillSets]);

	// Fetch responsibilities for display
	useEffect(() => {
		fetchResponsibilities();
	}, [fetchResponsibilities]);

	// Fetch user profile data
	useEffect(() => {
		const loadProfile = async () => {
			const hasValidSession = isAuthenticated && session?.user;
			if (!hasValidSession) {
				setLoadingProfile(false);
				return;
			}

			try {
				setLoadingProfile(true);
				const profile = await fetchUserProfile({
					id: session.user.id,
					role: session.user.role,
					accessToken: session.accessToken ?? '',
				});

				if (profile) {
					setProfileData(profile);
					// Set form values with real data
					form.setFieldsValue({
						fullName: profile.fullName ?? '',
						email: profile.email ?? '',
						studentId: profile.studentCode ?? '',
						major: profile.majorId ?? '', // Keep as ID for now, will display name separately
						phoneNumber: profile.phoneNumber ?? '',
						gender: profile.gender ?? '',
						responsibility: [], // Start with empty array, user can select
					});
				}
			} catch (error) {
				console.error('Error loading profile:', error);
			} finally {
				setLoadingProfile(false);
			}
		};

		if (!sessionLoading && isAuthenticated) {
			loadProfile();
		}
	}, [session, isAuthenticated, sessionLoading, form]);

	// Get major name from ID
	const getMajorName = React.useCallback(
		(majorId: string) => {
			const major = majors.find((m) => m.id === majorId);
			return major?.name ?? majorId; // Fallback to ID if name not found
		},
		[majors],
	);

	// Build skill tree data from skill sets
	const skillTreeData = React.useMemo(() => {
		return buildSkillTreeData(skillSets);
	}, [skillSets]);

	// Build responsibility options from responsibilities data
	const responsibilityOptions = React.useMemo(() => {
		return responsibilities.map((responsibility) => ({
			value: responsibility.name,
			label: responsibility.name,
		}));
	}, [responsibilities]);

	// Get the display value for major field
	const majorDisplayValue = React.useMemo(() => {
		if (!profileData?.majorId) return '';
		return getMajorName(profileData.majorId);
	}, [profileData?.majorId, getMajorName]);

	// Use real profile data for initial values
	const initialValues = React.useMemo(
		() => ({
			fullName: profileData?.fullName ?? '',
			email: profileData?.email ?? '',
			studentId: profileData?.studentCode ?? '',
			major: profileData?.majorId ?? '',
			phoneNumber: profileData?.phoneNumber ?? '',
			gender: profileData?.gender ?? '',
			responsibility: [],
		}),
		[profileData],
	);

	const handleFinish = React.useCallback(
		async (values: FormValues) => {
			// Clear any previous errors
			clearError();

			// Prepare update profile data (only the fields that can be updated)
			const profileUpdateData: StudentUpdate = {
				fullName: values.fullName.trim(),
				gender: values.gender as 'Male' | 'Female',
				phoneNumber: values.phoneNumber.trim(),
			};

			// Use store method to update profile
			const success = await updateProfile(profileUpdateData);

			if (success) {
				// Success notification is handled in store
				// Form will keep current values as they are now updated
			}
			// Error notification is handled in store
		},
		[updateProfile, clearError],
	);

	const handleSkillLevelChange = React.useCallback(
		(name: number, value: number) => {
			setSkillLevels((prev) => ({
				...prev,
				[name]: value,
			}));
		},
		[],
	);

	const tooltipFormatter = React.useCallback(
		(value: number | undefined) =>
			value ? (LEVEL_TOOLTIPS[value - 1] ?? '') : '',
		[],
	);

	const getSliderStyle = React.useCallback((skillLevel: number) => {
		const color = LEVEL_COLORS[skillLevel - 1] ?? LEVEL_COLORS[0];
		return {
			trackStyle: { backgroundColor: color },
			handleStyle: { borderColor: color, backgroundColor: color },
		};
	}, []);

	// Check if any loading is in progress
	const isLoading = React.useMemo(() => {
		const states = [
			loadingProfile,
			sessionLoading,
			majorsLoading,
			skillSetsLoading,
			responsibilitiesLoading,
		];
		return states.some(Boolean);
	}, [
		loadingProfile,
		sessionLoading,
		majorsLoading,
		skillSetsLoading,
		responsibilitiesLoading,
	]);

	return (
		<Spin spinning={isLoading} tip="Loading profile...">
			<Form
				requiredMark={false}
				form={form}
				layout="vertical"
				onFinish={handleFinish}
				initialValues={initialValues}
			>
				<Title level={5} style={{ marginBottom: 24 }}>
					Personal Information
				</Title>
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item
							name="studentId"
							label={<FormLabel text="Student ID" isBold />}
							rules={[
								{ required: true, message: 'Please enter your student ID' },
							]}
						>
							<Input disabled placeholder="SE150123" />
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item
							name="email"
							label={<FormLabel text="Email" isBold />}
							rules={[
								{
									required: true,
									type: 'email',
									message: 'Please enter a valid email',
								},
							]}
						>
							<Input disabled placeholder="john.smith@fpt.edu.vn" />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item
							name="fullName"
							label={<FormLabel text="Full Name" isBold />}
							rules={[
								{ required: true, message: 'Please enter your full name' },
								{ min: 2, message: 'Full name must be at least 2 characters' },
								{
									max: 100,
									message: 'Full name must be less than 100 characters',
								},
							]}
						>
							<Input placeholder="John Smith" disabled={updatingProfile} />
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item label={<FormLabel text="Major" isBold />}>
							<Input
								disabled
								value={majorDisplayValue}
								placeholder={
									majorsLoading ? 'Loading major...' : 'No major assigned'
								}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col xs={24} md={12}>
						<Form.Item
							name="phoneNumber"
							label={<FormLabel text="Phone Number" isBold />}
							rules={[
								{ required: true, message: 'Please enter your phone number' },
								{
									pattern:
										/^(?:\+84|0084|84|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-5]|9[0-4|6-9])\d{7}$/,
									message: 'Please enter a valid Vietnamese phone number',
								},
							]}
						>
							<Input
								placeholder="Enter phone number"
								disabled={updatingProfile}
							/>
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item
							name="gender"
							label={<FormLabel text="Gender" isBold />}
							rules={[{ required: true, message: 'Please select gender' }]}
						>
							<Radio.Group disabled={updatingProfile}>
								<Radio value="Male">Male</Radio>
								<Radio value="Female">Female</Radio>
							</Radio.Group>
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					name="responsibility"
					label={<FormLabel text="Responsibility" isBold />}
				>
					<Select
						mode="multiple"
						options={responsibilityOptions}
						placeholder="Select responsibility"
					/>
				</Form.Item>

				<Form.Item
					label={<FormLabel text="Skills" isBold />}
					required
					style={{ marginBottom: 0 }}
				>
					<Form.List name="skills" key="skills">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Row
										key={key}
										gutter={[8, 0]}
										align="top"
										style={{
											marginBottom: 0,
											minHeight: 40,
											flexWrap: 'wrap',
										}}
									>
										<Col xs={24} md={24} style={{ marginBottom: 8 }}>
											<Form.Item
												{...restField}
												name={[name, 'skillId']}
												rules={[{ required: true, message: 'Select skill' }]}
												style={{ marginBottom: 0, width: '100%' }}
											>
												<TreeSelect
													showSearch
													style={{ width: '100%' }}
													placeholder="Select skill"
													treeData={skillTreeData}
													treeDefaultExpandAll={false}
													allowClear
													filterTreeNode={(input, treeNode) =>
														String(treeNode.title)
															.toLowerCase()
															.includes(input.toLowerCase())
													}
													dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
												/>
											</Form.Item>
										</Col>
										<Col xs={24} md={24} style={{ marginBottom: 8 }}>
											<Row align="middle" gutter={8}>
												<Col flex="auto">
													<Form.Item
														{...restField}
														name={[name, 'level']}
														label={<FormLabel text="Skill Level" isBold />}
														rules={[
															{ required: true, message: 'Select skill level' },
														]}
														style={{ marginBottom: 0, width: '100%' }}
													>
														<Slider
															min={1}
															max={5}
															step={1}
															tooltip={{
																formatter: tooltipFormatter,
															}}
															onChange={(value) =>
																handleSkillLevelChange(name, value)
															}
															{...getSliderStyle(skillLevels[name] ?? 1)}
														/>
													</Form.Item>
												</Col>
												<Col flex="none">
													<Button
														type="text"
														icon={<MinusCircleOutlined />}
														onClick={() => remove(name)}
														danger
														aria-label="Remove skill"
													/>
												</Col>
											</Row>
										</Col>
									</Row>
								))}
								<Form.Item style={{ marginBottom: 0 }}>
									<Button
										type="dashed"
										onClick={() => add()}
										icon={<PlusOutlined />}
										block
										aria-label="Add new skill"
									>
										Add Skill
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Form.Item>

				<Form.Item>
					<Row justify="end" style={{ marginTop: 24 }}>
						<Space>
							<Button
								htmlType="button"
								aria-label="Cancel form changes"
								disabled={updatingProfile}
								onClick={() => form.resetFields()}
							>
								Cancel
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								aria-label="Save profile changes"
								loading={updatingProfile}
							>
								Save Changes
							</Button>
						</Space>
					</Row>
				</Form.Item>
			</Form>
		</Spin>
	);
};

export default StudentAccountForm;
