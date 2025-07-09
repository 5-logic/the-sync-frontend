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
import { SkillSet } from '@/schemas/skill';
import { StudentProfile, StudentSelfUpdate } from '@/schemas/student';
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
	const [profileData, setProfileData] = useState<StudentProfile | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [skillLevels, setSkillLevels] = useState<{ [key: string]: number }>({});

	// Use Student Store for update profile and fetch profile
	const { updateProfile, updatingProfile, clearError, fetchProfile } =
		useStudentStore();

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
				const profile = await fetchProfile(session.user.id, true);

				if (profile) {
					setProfileData(profile);

					// Initialize skill levels state for real-time color updates
					const initialSkillLevels: { [key: string]: number } = {};
					profile.studentSkills.forEach((skill, index) => {
						initialSkillLevels[index.toString()] =
							LEVEL_TOOLTIPS.indexOf(skill.level) + 1 || 1;
					});
					setSkillLevels(initialSkillLevels);

					// Initialize form with profile data
					form.setFieldsValue({
						fullName: profile.fullName,
						email: profile.email,
						studentId: profile.studentCode,
						major: profile.majorId,
						phoneNumber: profile.phoneNumber,
						gender: profile.gender,
						responsibility: profile.studentExpectedResponsibilities.map(
							(r) => r.responsibilityId,
						),
						skills: profile.studentSkills.map((skill) => ({
							skillId: skill.skillId,
							level: LEVEL_TOOLTIPS.indexOf(skill.level) + 1 || 1,
						})),
					});
				}
			} catch (error) {
				console.error('Error loading profile:', error);
			} finally {
				setLoadingProfile(false);
			}
		};

		if (!sessionLoading) {
			loadProfile();
		}
	}, [session, isAuthenticated, sessionLoading, form, fetchProfile]);

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
			value: responsibility.id,
			label: responsibility.name,
		}));
	}, [responsibilities]);

	// Get the display value for major field
	const majorDisplayValue = React.useMemo(() => {
		if (!profileData?.majorId) return '';
		return getMajorName(profileData.majorId);
	}, [profileData?.majorId, getMajorName]);

	const handleFinish = React.useCallback(
		async (values: FormValues) => {
			// Clear any previous errors
			clearError();
			// Get selected skills and their levels from form
			const formSkills = values.skills || [];
			const studentSkills = formSkills.map((skill) => ({
				skillId: skill.skillId,
				level: LEVEL_TOOLTIPS[(skill.level || 1) - 1] || 'Beginner',
			}));

			// Get selected responsibilities
			const studentExpectedResponsibilities = (values.responsibility || []).map(
				(responsibilityId) => ({
					responsibilityId,
				}),
			);

			// Prepare update profile data using new API structure
			const profileUpdateData: StudentSelfUpdate = {
				fullName: values.fullName.trim(),
				gender: values.gender as 'Male' | 'Female',
				phoneNumber: values.phoneNumber.trim(),
				studentSkills,
				studentExpectedResponsibilities,
			};

			// Use store method to update profile
			const success = await updateProfile(profileUpdateData);

			if (success) {
				// Refresh profile data after successful update
				if (session?.user?.id) {
					await fetchProfile(session.user.id, true);
				}
			}
		},
		[updateProfile, clearError, fetchProfile, session],
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

	// Handler for real-time skill level changes
	const handleSkillLevelChange = React.useCallback(
		(fieldName: number, value: number) => {
			setSkillLevels((prev) => ({
				...prev,
				[fieldName]: value,
			}));
		},
		[],
	);

	// Handler for removing a skill
	const handleRemoveSkill = React.useCallback(
		(name: number, remove: (index: number) => void) => {
			remove(name);
			// Remove from skillLevels state
			setSkillLevels((prev) => {
				const newState = { ...prev };
				delete newState[name];
				return newState;
			});
		},
		[],
	);

	// Handler for adding a new skill
	const handleAddSkill = React.useCallback(
		(add: () => void, fieldsLength: number) => {
			add();
			// Initialize skill level for new skill
			setSkillLevels((prev) => ({
				...prev,
				[fieldsLength]: 1,
			}));
		},
		[],
	);

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

	// Check if we have all required data to render the form
	const hasRequiredData = React.useMemo(() => {
		return (
			profileData &&
			!isLoading &&
			majors.length > 0 &&
			skillSets.length > 0 &&
			responsibilities.length > 0
		);
	}, [profileData, isLoading, majors, skillSets, responsibilities]);

	// Don't render form until all data is loaded and available
	if (!hasRequiredData) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '500px',
					flexDirection: 'column',
				}}
			>
				<Spin size="large" />
				<div style={{ marginTop: 16, color: '#666' }}>
					Loading student profile...
				</div>
			</div>
		);
	}

	return (
		<Form
			requiredMark={false}
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			initialValues={{
				fullName: profileData?.fullName ?? '',
				email: profileData?.email ?? '',
				studentId: profileData?.studentCode ?? '',
				major: profileData?.majorId ?? '',
				phoneNumber: profileData?.phoneNumber ?? '',
				gender: profileData?.gender ?? '',
				responsibility:
					profileData?.studentExpectedResponsibilities?.map(
						(r) => r.responsibilityId,
					) ?? [],
				skills:
					profileData?.studentSkills?.map((skill) => ({
						skillId: skill.skillId,
						level: LEVEL_TOOLTIPS.indexOf(skill.level) + 1 || 1,
					})) ?? [],
			}}
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
						<Input disabled placeholder="Student ID" />
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
							placeholder="No major assigned"
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
					disabled={updatingProfile}
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
												disabled={updatingProfile}
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
													label={
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																gap: 8,
															}}
														>
															<FormLabel text="Skill Level" isBold />
															<span
																style={{
																	color:
																		LEVEL_COLORS[
																			(skillLevels[name] ||
																				form.getFieldValue([
																					'skills',
																					name,
																					'level',
																				]) ||
																				1) - 1
																		],
																	fontWeight: 'bold',
																	fontSize: '12px',
																}}
															>
																{
																	LEVEL_TOOLTIPS[
																		(skillLevels[name] ||
																			form.getFieldValue([
																				'skills',
																				name,
																				'level',
																			]) ||
																			1) - 1
																	]
																}
															</span>
														</div>
													}
													rules={[
														{ required: true, message: 'Select skill level' },
													]}
													style={{ marginBottom: 0, width: '100%' }}
												>
													<Slider
														min={1}
														max={5}
														step={1}
														disabled={updatingProfile}
														tooltip={{
															formatter: tooltipFormatter,
														}}
														onChange={(value) =>
															handleSkillLevelChange(name, value)
														}
														{...getSliderStyle(
															skillLevels[name] ||
																form.getFieldValue(['skills', name, 'level']) ||
																1,
														)}
													/>
												</Form.Item>
											</Col>
											<Col flex="none">
												<Button
													type="text"
													icon={<MinusCircleOutlined />}
													onClick={() => handleRemoveSkill(name, remove)}
													danger
													disabled={updatingProfile}
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
									onClick={() => handleAddSkill(add, fields.length)}
									icon={<PlusOutlined />}
									block
									disabled={updatingProfile}
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
							onClick={() => {
								form.resetFields();
								// Reset skill levels to original state
								if (profileData) {
									const originalSkillLevels: { [key: string]: number } = {};
									profileData.studentSkills.forEach((skill, index) => {
										originalSkillLevels[index.toString()] =
											LEVEL_TOOLTIPS.indexOf(skill.level) + 1 || 1;
									});
									setSkillLevels(originalSkillLevels);
								}
							}}
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
	);
};

export default StudentAccountForm;
