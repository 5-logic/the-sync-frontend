"use client";

import {
	Button,
	Col,
	Form,
	Input,
	Radio,
	Row,
	Select,
	Spin,
	Typography,
} from "antd";
import React, { useEffect, useState } from "react";

import { FormLabel } from "@/components/common/FormLabel";
import { useOptimizedSession } from "@/hooks/auth/useAuth";
import {
	isValidVietnamesePhone,
	normalizeVietnamesePhone,
} from "@/lib/utils/validations";
import { StudentProfile, StudentSelfUpdate } from "@/schemas/student";
import {
	useMajorStore,
	useResponsibilityStore,
	useStudentStore,
} from "@/store";

// TypeScript interfaces
interface FormValues {
	fullName: string;
	email: string;
	studentId: string;
	major: string;
	phoneNumber: string;
	gender: string;
	responsibility: string[];
}

const { Title } = Typography;

const StudentAccountForm: React.FC = () => {
	const [form] = Form.useForm();
	const [profileData, setProfileData] = useState<StudentProfile | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	// Use Student Store for update profile and fetch profile
	const { updateProfile, updatingProfile, clearError, fetchProfile } =
		useStudentStore();

	// Use Major Store to get major names
	const { majors, loading: majorsLoading, fetchMajors } = useMajorStore();

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
					});
				}
			} catch (error) {
				console.error("Error loading profile:", error);
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

	// Build responsibility options from responsibilities data
	const responsibilityOptions = React.useMemo(() => {
		return responsibilities.map((responsibility) => ({
			value: responsibility.id,
			label: responsibility.name,
		}));
	}, [responsibilities]);

	// Get the display value for major field
	const majorDisplayValue = React.useMemo(() => {
		if (!profileData?.majorId) return "";
		return getMajorName(profileData.majorId);
	}, [profileData?.majorId, getMajorName]);

	const handleFinish = React.useCallback(
		async (values: FormValues) => {
			// Clear any previous errors
			clearError();

			// Get selected responsibilities
			const studentExpectedResponsibilities = (values.responsibility || []).map(
				(responsibilityId) => ({
					responsibilityId,
				}),
			);

			// Prepare update profile data using new API structure
			const profileUpdateData: StudentSelfUpdate = {
				fullName: values.fullName.trim(),
				gender: values.gender as "Male" | "Female",
				phoneNumber: normalizeVietnamesePhone(values.phoneNumber.trim()),
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

	// Check if any loading is in progress
	const isLoading = React.useMemo(() => {
		const states = [
			loadingProfile,
			sessionLoading,
			majorsLoading,
			responsibilitiesLoading,
		];
		return states.some(Boolean);
	}, [loadingProfile, sessionLoading, majorsLoading, responsibilitiesLoading]);

	// Check if we have all required data to render the form
	const hasRequiredData = React.useMemo(() => {
		return (
			profileData &&
			!isLoading &&
			majors.length > 0 &&
			responsibilities.length > 0
		);
	}, [profileData, isLoading, majors, responsibilities]);

	// Don't render form until all data is loaded and available
	if (!hasRequiredData) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "500px",
					flexDirection: "column",
				}}
			>
				<Spin size="large" />
				<div style={{ marginTop: 16, color: "#666" }}>
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
				fullName: profileData?.fullName ?? "",
				email: profileData?.email ?? "",
				studentId: profileData?.studentCode ?? "",
				major: profileData?.majorId ?? "",
				phoneNumber: profileData?.phoneNumber ?? "",
				gender: profileData?.gender ?? "",
				responsibility:
					profileData?.studentExpectedResponsibilities?.map(
						(r) => r.responsibilityId,
					) ?? [],
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
							{ required: true, message: "Please enter your student ID" },
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
								type: "email",
								message: "Please enter a valid email",
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
							{ required: true, message: "Please enter your full name" },
							{ min: 2, message: "Full name must be at least 2 characters" },
							{
								max: 100,
								message: "Full name must be less than 100 characters",
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
							{ required: true, message: "Please enter your phone number" },
							{
								validator: (_, value) => {
									if (!value) return Promise.resolve();
									const normalized = normalizeVietnamesePhone(value);
									if (isValidVietnamesePhone(normalized)) {
										return Promise.resolve();
									}
									return Promise.reject(
										new Error("Please enter a valid Vietnamese phone number"),
									);
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
						label={<FormLabel text="Gender" isBold />}
						rules={[{ required: true, message: "Please select gender" }]}
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
					showSearch
					options={responsibilityOptions}
					placeholder="Select responsibility"
					disabled={updatingProfile}
					filterOption={(input, option) =>
						(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
					}
					allowClear
				/>
			</Form.Item>

			<Form.Item>
				<Row justify="end" style={{ marginTop: 24 }}>
					<Button
						type="primary"
						htmlType="submit"
						aria-label="Save profile changes"
						loading={updatingProfile}
					>
						Save Changes
					</Button>
				</Row>
			</Form.Item>
		</Form>
	);
};

export default StudentAccountForm;
