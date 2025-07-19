'use client';

import ChecklistExcelImport from '@/components/features/lecturer/CreateChecklist/ChecklistExcelImport';
import { ChecklistItem } from '@/schemas/checklist';

interface Props {
	setChecklistItems: (items: ChecklistItem[]) => void;
	loading?: boolean;
}

const ChecklistDragger = ({ setChecklistItems, loading = false }: Props) => {
	const handleImport = (items: ChecklistItem[]) => {
		setChecklistItems(items);
		// Don't update fileList to prevent duplicate tables
		// The main form will handle displaying the imported items
	};

	return <ChecklistExcelImport onImport={handleImport} loading={loading} />;
};

export default ChecklistDragger;
