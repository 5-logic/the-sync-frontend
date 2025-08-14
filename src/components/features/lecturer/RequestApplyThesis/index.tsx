"use client";

import { Space } from "antd";
import { useEffect } from "react";

import { Header } from "@/components/common/Header";
import RequestApplyThesisTable from "@/components/features/lecturer/RequestApplyThesis/RequestApplyThesisTable";
import { useRequestApplyThesis } from "@/hooks/lecturer/useRequestApplyThesis";

export default function RequestApplyThesis() {
	const { applications, loading, fetchApplications } = useRequestApplyThesis();

	// Fetch applications when component mounts
	useEffect(() => {
		fetchApplications();
	}, [fetchApplications]);

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Request Apply Thesis"
				description="Review and manage thesis application requests from student groups. Approve or reject applications to assign theses to groups."
			/>

			<RequestApplyThesisTable
				data={applications}
				loading={loading}
				onRefresh={fetchApplications}
			/>
		</Space>
	);
}
