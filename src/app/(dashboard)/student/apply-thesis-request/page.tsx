"use client";

import { Space } from "antd";

import { Header } from "@/components/common/Header";
import ThesisApplicationTable from "@/components/features/student/ApplyThesisRequest/ThesisApplicationTable";
import { useThesisApplications } from "@/hooks/student/useThesisApplications";

export default function StudentApplyThesisRequestPage() {
	const { applications, loading, refreshApplications } =
		useThesisApplications();

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Apply Thesis Request"
				description="Manage your thesis application requests"
			/>

			<ThesisApplicationTable
				data={applications}
				onRefresh={refreshApplications}
				loading={loading}
			/>
		</Space>
	);
}
