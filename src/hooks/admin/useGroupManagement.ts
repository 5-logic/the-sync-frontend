import { useState, useMemo, useEffect, useCallback } from "react";
import { useGroupsStore } from "@/store/useGroupsStore";
import { useMajorStore } from "@/store/useMajorStore";
import { useSemesterStore } from "@/store/useSemesterStore";
import { useStudentStore } from "@/store/useStudentStore";

/**
 * Shared hook for group management functionality
 * Used by both admin and lecturer group management components
 */
export const useGroupManagement = () => {
	const { students, fetchStudentsWithoutGroup, loading } = useStudentStore();
	const { majors, fetchMajors, loading: majorLoading } = useMajorStore();
	const { semesters, fetchSemesters } = useSemesterStore();
	const { refetch: refetchGroups } = useGroupsStore();

	const [studentSearch, setStudentSearch] = useState("");
	const [studentMajor, setStudentMajor] = useState("All");

	// Find preparing semester
	const preparingSemester = useMemo(() => {
		return semesters.find((semester) => semester.status === "Preparing");
	}, [semesters]);

	// Fetch data on component mount
	useEffect(() => {
		const initializeData = async () => {
			// Fetch semesters first to find preparing semester
			await fetchSemesters();
			// Fetch majors for filter
			await fetchMajors();
		};

		initializeData();
	}, [fetchSemesters, fetchMajors]);

	// Fetch students when preparing semester is found
	useEffect(() => {
		if (preparingSemester) {
			fetchStudentsWithoutGroup(preparingSemester.id);
		}
	}, [preparingSemester, fetchStudentsWithoutGroup]);

	// Refresh data when component mounts (handles browser back button)
	useEffect(() => {
		// Only refresh if we don't have groups data already
		const { groups } = useGroupsStore.getState();
		if (groups.length === 0) {
			refetchGroups();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	// Handle refresh
	const handleRefresh = useCallback(() => {
		if (preparingSemester) {
			fetchStudentsWithoutGroup(preparingSemester.id, true); // Force refresh
		}
	}, [preparingSemester, fetchStudentsWithoutGroup]);

	// Major options for filter (with names displayed)
	const majorOptions = useMemo(() => {
		const options = ["All"];
		majors.forEach((major) => {
			options.push(major.id);
		});
		return options;
	}, [majors]);

	// Create a mapping for major names
	const majorNamesMap = useMemo(() => {
		const map: Record<string, string> = { All: "All" };
		majors.forEach((major) => {
			map[major.id] = major.name;
		});
		return map;
	}, [majors]);

	// Filtered students
	const filteredStudents = useMemo(() => {
		return students.filter((student) => {
			const fullNameMatch = student.fullName
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const emailMatch = student.email
				.toLowerCase()
				.includes(studentSearch.toLowerCase());
			const matchSearch = fullNameMatch || emailMatch;
			const matchMajor =
				studentMajor === "All" || student.majorId === studentMajor;
			return matchSearch && matchMajor;
		});
	}, [students, studentSearch, studentMajor]);

	return {
		// Data
		students,
		majors,
		semesters,
		preparingSemester,
		filteredStudents,
		majorOptions,
		majorNamesMap,

		// Loading states
		loading,
		majorLoading,

		// Search and filter states
		studentSearch,
		setStudentSearch,
		studentMajor,
		setStudentMajor,

		// Actions
		handleRefresh,
		refetchGroups,
	};
};
