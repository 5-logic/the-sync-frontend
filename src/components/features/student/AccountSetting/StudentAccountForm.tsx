'use client';

import { Button, Col, Form, Input, Radio, Row, Spin, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

import { FormLabel } from '@/components/common/FormLabel';
import {
	InteractiveRadarChart,
	ResponsibilityData,
} from '@/components/common/radar-chart';
import { useOptimizedSession } from '@/hooks/auth/useAuth';
import {
	isValidVietnamesePhone,
	normalizeVietnamesePhone,
} from '@/lib/utils/validations';
import { StudentProfile, StudentSelfUpdate } from '@/schemas/student';
import { useMajorStore, useStudentStore } from '@/store';

// TypeScript interfaces
interface FormValues {
	fullName: string;
	email: string;
	studentId: string;
	major: string;
	phoneNumber: string;
	gender: string;
}

const { Title } = Typography;

const StudentAccountForm: React.FC = () => {
	const [form] = Form.useForm();
	const [profileData, setProfileData] = useState<StudentProfile | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [responsibilityData, setResponsibilityData] = useState<
		ResponsibilityData[]
	>([]);
	const [originalData, setOriginalData] = useState<{
		formValues: FormValues | null;
		responsibilities: ResponsibilityData[];
	}>({
		formValues: null,
		responsibilities: [],
	});
	const [hasChanges, setHasChanges] = useState(false);

	// Use Student Store for update profile and fetch profile
	const { updateProfile, updatingProfile, clearError, fetchProfile } =
		useStudentStore();

	// Use Major Store to get major names
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

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

	// Get major name from ID
	const getMajorName = useCallback(
		(majorId: string) => {
			const major = majors.find((m) => m.id === majorId);
			return major?.name ?? majorId; // Fallback to ID if name not found
		},
		[majors],
	);

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

					// Set responsibility data for radar chart
					const responsibilities = profile.studentResponsibilities.map((r) => ({
						responsibilityId: r.responsibilityId,
						responsibilityName: r.responsibilityName,
						level: Number(r.level), // Ensure level is a number
					}));
					setResponsibilityData(responsibilities);

					// Initialize form with profile data
					const formValues = {
						fullName: profile.fullName,
						email: profile.email,
						studentId: profile.studentCode,
						major: getMajorName(profile.majorId),
						phoneNumber: profile.phoneNumber,
						gender: profile.gender,
					};

					form.setFieldsValue({
						...formValues,
						major: '', // Will be set by separate useEffect
					});

					// Store original data for comparison
					setOriginalData({
						formValues,
						responsibilities,
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
	}, [
		session,
		isAuthenticated,
		sessionLoading,
		form,
		fetchProfile,
		getMajorName,
	]);

	// Update form major field when majors are loaded
	useEffect(() => {
		if (profileData && majors.length > 0) {
			const majorName = getMajorName(profileData.majorId);
			form.setFieldValue('major', majorName);

			// Update original data with major name
			setOriginalData((prev) => ({
				...prev,
				formValues: prev.formValues
					? {
							...prev.formValues,
							major: majorName,
						}
					: null,
			}));
		}
	}, [profileData, majors, getMajorName, form]);

	// Check for changes in form values
	const checkFormChanges = useCallback(() => {
		if (!originalData.formValues) {
			return false;
		}

		const currentValues = form.getFieldsValue();
		const original = originalData.formValues;

		const hasChanges =
			currentValues.fullName !== original.fullName ||
			currentValues.phoneNumber !== original.phoneNumber ||
			currentValues.gender !== original.gender;

		return hasChanges;
	}, [form, originalData.formValues]);

	// Get changed responsibilities only
	const getChangedResponsibilities = useCallback(() => {
		if (originalData.responsibilities.length !== responsibilityData.length) {
			return responsibilityData.map((item) => ({
				responsibilityId: item.responsibilityId,
				level: item.level,
			}));
		}

		// Find only the responsibilities that have changed levels
		const changedResponsibilities: {
			responsibilityId: string;
			level: number;
		}[] = [];

		responsibilityData.forEach((current) => {
			const original = originalData.responsibilities.find(
				(orig) => orig.responsibilityId === current.responsibilityId,
			);

			// Convert both values to numbers for proper comparison
			if (original && Number(original.level) !== Number(current.level)) {
				changedResponsibilities.push({
					responsibilityId: current.responsibilityId,
					level: current.level,
				});
			}
		});

		return changedResponsibilities;
	}, [originalData.responsibilities, responsibilityData]);

	// Check for changes in responsibilities
	const checkResponsibilityChanges = useCallback(() => {
		const changes = getChangedResponsibilities();
		const hasChanges = changes.length > 0;
		return hasChanges;
	}, [getChangedResponsibilities]);

	// Update hasChanges when form or responsibilities change
	useEffect(() => {
		const formChanged = checkFormChanges();
		const responsibilityChanged = checkResponsibilityChanges();
		const totalHasChanges = formChanged || responsibilityChanged;

		setHasChanges(totalHasChanges);
	}, [checkFormChanges, checkResponsibilityChanges, responsibilityData]);

	// Handle responsibility data changes from radar chart
	const handleResponsibilityChange = useCallback(
		(updatedData: ResponsibilityData[]) => {
			setResponsibilityData(updatedData);
		},
		[],
	);

	// Handle form values change
	const handleFormValuesChange = useCallback(() => {
		// Use setTimeout to ensure form values are updated
		setTimeout(() => {
			const formChanged = checkFormChanges();
			const responsibilityChanged = checkResponsibilityChanges();
			setHasChanges(formChanged || responsibilityChanged);
		}, 0);
	}, [checkFormChanges, checkResponsibilityChanges]);

	// Get the display value for major field
	const majorDisplayValue = React.useMemo(() => {
		if (!profileData?.majorId) return '';
		return getMajorName(profileData.majorId);
	}, [profileData?.majorId, getMajorName]);

	const handleFinish = useCallback(
		async (values: FormValues) => {
			if (!originalData.formValues) return;

			// Clear any previous errors
			clearError();

			// Build update data with only changed fields
			const profileUpdateData: StudentSelfUpdate = {};

			// Check form field changes
			if (values.fullName.trim() !== originalData.formValues.fullName) {
				profileUpdateData.fullName = values.fullName.trim();
			}

			if (values.gender !== originalData.formValues.gender) {
				profileUpdateData.gender = values.gender as 'Male' | 'Female';
			}

			const normalizedPhone = normalizeVietnamesePhone(
				values.phoneNumber.trim(),
			);
			const originalPhone = normalizeVietnamesePhone(
				originalData.formValues.phoneNumber,
			);
			if (normalizedPhone !== originalPhone) {
				profileUpdateData.phoneNumber = normalizedPhone;
			}

			// Check responsibility changes
			const changedResponsibilities = getChangedResponsibilities();
			if (changedResponsibilities.length > 0) {
				profileUpdateData.studentResponsibilities = changedResponsibilities;
			}

			// Only update if there are changes
			if (Object.keys(profileUpdateData).length === 0) {
				return;
			}

			// Use store method to update profile
			const success = await updateProfile(profileUpdateData);

			if (success) {
				// Refresh the profile data to reflect updates
				if (session?.user) {
					const updatedProfile = await fetchProfile(session.user.id, true);
					if (updatedProfile) {
						// Update original data to new values
						const newResponsibilities =
							updatedProfile.studentResponsibilities.map((r) => ({
								responsibilityId: r.responsibilityId,
								responsibilityName: r.responsibilityName,
								level: Number(r.level), // Ensure level is a number
							}));

						const newFormValues = {
							fullName: updatedProfile.fullName,
							email: updatedProfile.email,
							studentId: updatedProfile.studentCode,
							major: getMajorName(updatedProfile.majorId),
							phoneNumber: updatedProfile.phoneNumber,
							gender: updatedProfile.gender,
						};

						setOriginalData({
							formValues: newFormValues,
							responsibilities: newResponsibilities,
						});

						setResponsibilityData(newResponsibilities);
						setHasChanges(false);
					}
				}
			}
		},
		[
			updateProfile,
			clearError,
			fetchProfile,
			session,
			originalData,
			getChangedResponsibilities,
			getMajorName,
		],
	);

	// Check if any loading is in progress
	const isLoading = React.useMemo(() => {
		const states = [loadingProfile, sessionLoading, majorsLoading];
		return states.some(Boolean);
	}, [loadingProfile, sessionLoading, majorsLoading]);

	// Check if we have all required data to render the form
	const hasRequiredData = React.useMemo(() => {
		return profileData && !isLoading && majors.length > 0;
	}, [profileData, isLoading, majors]);

	// Don't render form until all data is loaded and available
	if (!hasRequiredData) {
		return (
			<div style={{ textAlign: 'center', padding: '40px 0' }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<Form
			form={form}
			layout="vertical"
			onFinish={handleFinish}
			onValuesChange={handleFormValuesChange}
			disabled={updatingProfile}
			initialValues={{
				fullName: profileData?.fullName ?? '',
				email: profileData?.email ?? '',
				studentId: profileData?.studentCode ?? '',
				major: majorDisplayValue,
				phoneNumber: profileData?.phoneNumber ?? '',
				gender: profileData?.gender ?? '',
			}}
			requiredMark={false}
		>
			<Title level={5} style={{ marginBottom: 24 }}>
				Personal Information
			</Title>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="studentId"
						label={<FormLabel text="Student ID" isRequired isBold />}
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
						label={<FormLabel text="Email" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter your email' },
							{ type: 'email', message: 'Please enter a valid email' },
						]}
					>
						<Input disabled placeholder="Email address" />
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="fullName"
						label={<FormLabel text="Full Name" isRequired isBold />}
						rules={[{ required: true, message: 'Please enter your full name' }]}
					>
						<Input placeholder="Enter full name" disabled={updatingProfile} />
					</Form.Item>
				</Col>
				<Col xs={24} md={12}>
					<Form.Item
						name="major"
						label={<FormLabel text="Major" isRequired isBold />}
						rules={[{ required: true, message: 'Please select your major' }]}
					>
						<Input disabled placeholder="Major" />
					</Form.Item>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					<Form.Item
						name="phoneNumber"
						label={<FormLabel text="Phone Number" isRequired isBold />}
						rules={[
							{ required: true, message: 'Please enter your phone number' },
							{
								validator: async (_, value) => {
									if (!value) return;
									if (!isValidVietnamesePhone(value)) {
										throw new Error(
											'Please enter a valid Vietnamese phone number',
										);
									}
								},
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
						label={<FormLabel text="Gender" isRequired isBold />}
						rules={[{ required: true, message: 'Please select gender' }]}
					>
						<Radio.Group disabled={updatingProfile}>
							<Radio value="Male">Male</Radio>
							<Radio value="Female">Female</Radio>
						</Radio.Group>
					</Form.Item>
				</Col>
			</Row>

			{/* Responsibility Radar Chart */}
			<Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
				Responsibility Levels
			</Title>
			<InteractiveRadarChart
				data={responsibilityData}
				originalData={originalData.responsibilities}
				loading={updatingProfile}
				onChange={handleResponsibilityChange}
				title="My Responsibility Assessment"
				hasChanges={hasChanges}
			/>

			<Form.Item>
				<Row justify="end" style={{ marginTop: 24 }}>
					<Button
						type="primary"
						htmlType="submit"
						aria-label="Save profile changes"
						loading={updatingProfile}
						disabled={!hasChanges || updatingProfile}
					>
						Save Profile Changes
					</Button>
				</Row>
			</Form.Item>
		</Form>
	);
};

export default StudentAccountForm;
