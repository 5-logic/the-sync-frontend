import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Semester } from "@/schemas/semester";
import { useSemesterStore } from "@/store";
import studentsService from "@/lib/services/students.service";
import { handleApiResponse } from "@/lib/utils/handleApi";

/**
 * Hook to get current semester with different logic based on user role:
 * - Student: Get semester from enrollment data
 * - Other roles (lecturer, moderator, admin): Priority order: Ongoing -> Picking -> Preparing
 */
export const useCurrentSemester = () => {
	const { data: session } = useSession();
	const {
		semesters,
		fetchSemesters,
		loading: semesterStoreLoading,
	} = useSemesterStore();
	const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
	const [preparingSemester, setPreparingSemester] = useState<Semester | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch semesters on mount
		fetchSemesters();
	}, [fetchSemesters]);

	useEffect(() => {
		const getCurrentSemester = async () => {
			if (!session?.user || semesterStoreLoading) {
				return;
			}

			setLoading(true);

			try {
				if (session.user.role === "student") {
					// For students: Get semester from enrollment
					const studentResponse = await studentsService.findOne(
						session.user.id,
					);
					const studentResult = handleApiResponse(studentResponse, "Success");

					if (studentResult.success && studentResult.data?.enrollments?.[0]) {
						const enrollmentSemester =
							studentResult.data.enrollments[0].semester;
						// Find the full semester object from store
						const fullSemester = semesters.find(
							(sem) => sem.id === enrollmentSemester.id,
						);
						setCurrentSemester(fullSemester || null);
					} else {
						setCurrentSemester(null);
					}
				} else {
					// For other roles: Priority order: Ongoing -> Picking -> Preparing
					const priorityOrder = ["Ongoing", "Picking", "Preparing"];

					for (const status of priorityOrder) {
						const semester = semesters.find((sem) => sem.status === status);
						if (semester) {
							setCurrentSemester(semester);
							break;
						}
					}

					// Also find preparing semester for special case handling
					const preparing = semesters.find((sem) => sem.status === "Preparing");
					setPreparingSemester(preparing || null);
				}
			} catch (error) {
				console.error("Error getting current semester:", error);
				setCurrentSemester(null);
			} finally {
				setLoading(false);
			}
		};

		getCurrentSemester();
	}, [semesters, session?.user, semesterStoreLoading]);

	// Check if we have special case: Ongoing semester with scope locked phase + Preparing semester
	const hasPreparingNext =
		currentSemester?.status === "Ongoing" &&
		currentSemester?.ongoingPhase === "ScopeLocked" &&
		preparingSemester &&
		session?.user?.role !== "student";

	return {
		currentSemester,
		preparingSemester: hasPreparingNext ? preparingSemester : null,
		loading,
		refetch: fetchSemesters,
	};
};
