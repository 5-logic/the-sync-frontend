"use client";

import { Space } from "antd";

import { Header } from "@/components/common/Header";
import ThesisApplicationTable from "@/components/features/student/RegisterThesis/ThesisApplicationTable";
import { useThesisApplications } from "@/hooks/student/useThesisApplications";

export default function StudentRegisterThesisPage() {
	const { applications, loading, refreshApplications } =
		useThesisApplications();

	return (
		<Space direction="vertical" size="large" style={{ width: "100%" }}>
			<Header
				title="Register Thesis"
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
