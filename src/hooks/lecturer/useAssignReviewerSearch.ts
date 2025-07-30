import { useMemo, useState } from 'react';

import { GroupTableProps } from '@/components/features/lecturer/AssignLecturerReview/GroupTable';

/**
 * Custom hook for managing group search and filtering
 */
export const useAssignReviewerSearch = (groups: GroupTableProps[]) => {
	const [search, setSearch] = useState('');

	// Filter groups based on search term
	const filteredGroups = useMemo(() => {
		if (!search.trim()) return groups;

		const term = search.toLowerCase();
		return groups.filter((group) => {
			return (
				group.name.toLowerCase().includes(term) ||
				group.code.toLowerCase().includes(term)
			);
		});
	}, [groups, search]);

	return {
		search,
		setSearch,
		filteredGroups,
	};
};
