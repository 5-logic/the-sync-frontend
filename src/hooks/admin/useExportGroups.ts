import { useCallback } from "react";

import { calculateRowSpansForExport } from "@/components/features/admin/CapstoneProjectManagement/calculateRowSpan";
import { exportToExcel } from "@/lib/utils/excelExporter";
import { showNotification } from "@/lib/utils/notification";
import { getCleanThesisNameForExport } from "@/lib/utils/thesisUtils";
import { type GroupTableData } from "@/store/useCapstoneManagementStore";

export const useExportGroups = () => {
	const handleExportExcel = useCallback(
		(
			selectedSemesterId: string,
			filteredData: GroupTableData[],
			selectedSemesterName?: string,
		) => {
			// Check if semester is selected
			if (!selectedSemesterId) {
				showNotification.error(
					"Export Not Allowed",
					"Please select a semester first",
				);
				return;
			}

			// Check if there's data to export
			if (filteredData.length === 0) {
				showNotification.error(
					"Export Not Allowed",
					"No data available to export",
				);
				return;
			}

			// Prepare export data without semester column and with proper rowSpans
			const mappedData = filteredData.map((item: GroupTableData) => ({
				groupId: item.groupId,
				studentId: item.studentId,
				name: item.name,
				major: item.major,
				thesisName: getCleanThesisNameForExport(item.thesisName),
				abbreviation: item.abbreviation || "",
				supervisor: item.supervisor || "",
			}));

			const exportData = calculateRowSpansForExport(mappedData);

			// Get semester display name
			const semesterDisplayName = selectedSemesterName || selectedSemesterId;

			exportToExcel({
				data: exportData,
				selectedSemester: selectedSemesterId,
				semesterDisplayName: semesterDisplayName,
				filename: `Groups_${semesterDisplayName}_${new Date().toISOString().split("T")[0]}.xlsx`,
			});

			showNotification.success(
				"Export Successful",
				"Data has been exported to Excel successfully",
			);
		},
		[],
	);

	return { handleExportExcel };
};
