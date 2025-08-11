"use client";

import { Empty, Space, Spin } from "antd";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Header } from "@/components/common/Header";
import ActionButtons from "@/components/features/student/ViewThesisDetail/ActionButtons";
import AssignedGroupCard from "@/components/features/student/ViewThesisDetail/AssignedGroupCard";
import ThesisInfoCard from "@/components/features/student/ViewThesisDetail/ThesisInfoCard";
import groupsService from "@/lib/services/groups.service";
import lecturerService from "@/lib/services/lecturers.service";
import supervisionService from "@/lib/services/supervisions.service";
import thesesService from "@/lib/services/theses.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { GroupDashboard } from "@/schemas/group";
import { Lecturer } from "@/schemas/lecturer";
import { ThesisWithRelations } from "@/schemas/thesis";

interface SupervisorInfo {
	id: string;
	fullName: string;
	email: string;
}

interface EnhancedThesis extends ThesisWithRelations {
	lecturerInfo?: Lecturer;
	supervisors?: SupervisorInfo[];
}

export default function StudentThesisDetailPage() {
	const { id: thesisId } = useParams() as { id: string };

	const [thesis, setThesis] = useState<EnhancedThesis | null>(null);
	const [assignedGroup, setAssignedGroup] = useState<GroupDashboard | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	// Main fetch thesis details function with helper functions inside
	const fetchThesisDetails = useCallback(async () => {
		if (!thesisId) return;

		// Helper function to fetch lecturer info
		const fetchLecturerInfo = async (
			lecturerId: string,
		): Promise<Lecturer | undefined> => {
			try {
				const lecturerResponse = await lecturerService.findOne(lecturerId);
				const lecturerResult = handleApiResponse(lecturerResponse, "Success");

				return lecturerResult.success ? lecturerResult.data : undefined;
			} catch (error) {
				console.error("Error fetching lecturer details:", error);
				return undefined;
			}
		};

		// Helper function to fetch single supervisor info
		const fetchSupervisorInfo = async (
			lecturerId: string,
		): Promise<SupervisorInfo | null> => {
			try {
				const lecturerResponse = await lecturerService.findOne(lecturerId);
				const lecturerResult = handleApiResponse(lecturerResponse, "Success");

				if (lecturerResult.success && lecturerResult.data) {
					return {
						id: lecturerResult.data.id,
						fullName: lecturerResult.data.fullName,
						email: lecturerResult.data.email,
					};
				}
			} catch (error) {
				console.error(`Error fetching supervisor ${lecturerId}:`, error);
			}
			return null;
		};

		// Helper function to fetch all supervisors
		const fetchSupervisors = async (): Promise<SupervisorInfo[]> => {
			try {
				const supervisionResponse =
					await supervisionService.getByThesisId(thesisId);
				const supervisionResult = handleApiResponse(
					supervisionResponse,
					"Success",
				);

				if (!supervisionResult.success || !supervisionResult.data) {
					return [];
				}

				const supervisorPromises = supervisionResult.data.map((supervision) =>
					fetchSupervisorInfo(supervision.lecturerId),
				);

				const supervisorResults = await Promise.all(supervisorPromises);
				return supervisorResults.filter(
					(supervisor): supervisor is SupervisorInfo => supervisor !== null,
				);
			} catch (error) {
				console.error("Error fetching supervisors:", error);
				return [];
			}
		};

		// Helper function to fetch group details
		const fetchGroupDetails = async (
			groupId: string,
		): Promise<GroupDashboard | null> => {
			try {
				const groupResponse = await groupsService.findOne(groupId);
				const groupResult = handleApiResponse(groupResponse, "Success");

				return groupResult.success && groupResult.data
					? groupResult.data
					: null;
			} catch (error) {
				console.error("Error fetching group details:", error);
				return null;
			}
		};

		try {
			setLoading((prevLoading) => prevLoading || true);

			// Fetch thesis data with relations
			const thesisResponse = await thesesService.findOneWithRelations(thesisId);
			const thesisResult = handleApiResponse(thesisResponse, "Success");

			if (!thesisResult.success || !thesisResult.data) {
				return;
			}

			const thesisData = thesisResult.data;

			// Fetch additional data in parallel
			const [lecturerInfo, supervisors, groupData] = await Promise.all([
				thesisData.lecturerId
					? fetchLecturerInfo(thesisData.lecturerId)
					: Promise.resolve(undefined),
				fetchSupervisors(),
				thesisData.groupId
					? fetchGroupDetails(thesisData.groupId)
					: Promise.resolve(null),
			]);

			// Set enhanced thesis with all fetched data
			setThesis({
				...thesisData,
				lecturerInfo,
				supervisors,
			});

			// Set assigned group or clear it
			setAssignedGroup(groupData);
		} catch (error) {
			console.error("Error fetching thesis details:", error);
		} finally {
			setLoading(false);
		}
	}, [thesisId]);

	useEffect(() => {
		fetchThesisDetails();
	}, [fetchThesisDetails]);

	// Handle refresh with cache clearing
	const handleRefreshThesis = useCallback(async () => {
		setLoading(true); // Show loading immediately
		setThesis(null);
		setAssignedGroup(null);
		await fetchThesisDetails();
	}, [fetchThesisDetails]);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" tip="Loading thesis details..." />
			</div>
		);
	}

	if (!thesis) {
		return <Empty description="No thesis data available" />;
	}

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			{/* Header */}
			<Header
				title="Thesis Detail"
				description="View comprehensive thesis information, supervisor details, and group assignment status."
			/>

			{/* Thesis Information */}
			<ThesisInfoCard thesis={thesis} />

			{/* Group Assignment Card (if thesis is assigned to a group) */}
			{assignedGroup && <AssignedGroupCard assignedGroup={assignedGroup} />}

			{/* Action Buttons */}
			<ActionButtons thesis={thesis} onThesisUpdate={handleRefreshThesis} />
		</Space>
	);
}
