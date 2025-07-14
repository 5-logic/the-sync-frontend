import { useCallback, useEffect, useState } from 'react';

import groupService from '@/lib/services/groups.service';
import studentService from '@/lib/services/students.service';
import { GroupDashboard } from '@/schemas/group';
import { StudentProfile } from '@/schemas/student';

export const useStudentProfile = (studentId: string) => {
	const [data, setData] = useState<StudentProfile | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStudentProfile = useCallback(async () => {
		if (!studentId) return;

		setLoading(true);
		setError(null);
		try {
			const response = await studentService.findOne(studentId);
			if (response.success) {
				setData(response.data);
			} else {
				setError(response.error);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch student profile',
			);
		} finally {
			setLoading(false);
		}
	}, [studentId]);

	useEffect(() => {
		fetchStudentProfile();
	}, [fetchStudentProfile]);

	return { data, loading, error, refetch: fetchStudentProfile };
};

export const useStudentGroup = (studentId: string) => {
	const [data, setData] = useState<GroupDashboard | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchStudentGroup = useCallback(async () => {
		if (!studentId) return;

		setLoading(true);
		setError(null);
		try {
			const response = await groupService.getStudentGroupById(studentId);
			if (response.success) {
				setData(response.data[0] || null);
			} else {
				setError(response.error);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch student group',
			);
		} finally {
			setLoading(false);
		}
	}, [studentId]);

	useEffect(() => {
		fetchStudentGroup();
	}, [fetchStudentGroup]);

	return { data, loading, error, refetch: fetchStudentGroup };
};
