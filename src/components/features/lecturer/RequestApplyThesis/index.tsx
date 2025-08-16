"use client";

import { Space } from "antd";
import { useEffect } from "react";

import { Header } from "@/components/common/Header";
import RequestApplyThesisTable from "@/components/features/lecturer/RequestApplyThesis/RequestApplyThesisTable";
import { useThesisRequests } from "@/hooks/lecturer/useThesisRequests";

export default function RequestApplyThesis() {
	const {
		thesesWithRequests,
		loading,
		fetchThesisRequests,
		updateApplicationStatus,
	} = useThesisRequests();

	// Fetch thesis requests when component mounts
	useEffect(() => {
		fetchThesisRequests();
	}, [fetchThesisRequests]);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Request Apply Thesis"
				description="Review and manage thesis application requests from student groups. Approve or reject applications to assign theses to groups."
			/>

			<RequestApplyThesisTable
				data={thesesWithRequests}
				loading={loading}
				onRefresh={fetchThesisRequests}
				updateApplicationStatus={updateApplicationStatus}
			/>
		</Space>
	);
}
