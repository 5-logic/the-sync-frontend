"use client";

import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";

import ThesisForm from "@/components/features/lecturer/CreateThesis/ThesisForm";
import { useThesisForm } from "@/hooks/thesis";
import thesisService from "@/lib/services/theses.service";
import { handleApiResponse } from "@/lib/utils/handleApi";
import { ThesisWithRelations } from "@/schemas/thesis";

interface Props {
	readonly visible: boolean;
	readonly thesisId: string;
	readonly onClose: () => void;
	readonly onSuccess?: () => void;
}

export default function StudentEditThesisModal({
	visible,
	thesisId,
	onClose,
	onSuccess,
}: Props) {
	const [thesis, setThesis] = useState<ThesisWithRelations | null>(null);
	const [loading, setLoading] = useState(false); // Start with false, only load when modal opens

	// Use the thesis form hook for form handling
	const {
		loading: updating,
		handleSubmit: handleUpdate,
		getFormInitialValues,
		getInitialFile,
	} = useThesisForm({ mode: "edit", thesisId, thesis });

	// Fetch thesis data when modal opens
	useEffect(() => {
		if (visible && thesisId) {
			fetchThesisData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible, thesisId]);

	const fetchThesisData = async () => {
		try {
			setLoading(true);
			const response = await thesisService.findOne(thesisId);
			const result = handleApiResponse(response, "Success");

			if (result.success && result.data) {
				// Convert to ThesisWithRelations format if needed
				const thesisData: ThesisWithRelations = {
					...result.data,
					lecturer: {
						userId: result.data.lecturerId,
						isModerator: false,
						user: {
							id: result.data.lecturerId,
							fullName: "",
							email: "",
						},
					},
					thesisVersions:
						((result.data as Record<string, unknown>)?.thesisVersions as Array<{
							id: string;
							version: number;
							supportingDocument: string;
						}>) || [],
				};
				setThesis(thesisData);
			}
		} catch (error) {
			console.error("Failed to fetch thesis:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitWithCallback = async (values: Record<string, unknown>) => {
		await handleUpdate(values);
		onSuccess?.();
		onClose();
	};

	const handleCancel = () => {
		onClose();
	};

	return (
		<Modal
			title="Edit Thesis"
			open={visible}
			onCancel={handleCancel}
			footer={null}
			width={1000}
			destroyOnClose
			style={{ top: 20 }}
			bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
		>
			{loading ? (
				<div className="flex justify-center items-center py-8">
					<Spin size="large" />
				</div>
			) : (
				<div style={{ maxWidth: "100%", overflow: "hidden" }}>
					<ThesisForm
						mode="edit"
						initialValues={getFormInitialValues()}
						initialFile={getInitialFile()}
						onSubmit={handleSubmitWithCallback}
						loading={updating}
						thesis={thesis}
					/>
				</div>
			)}
		</Modal>
	);
}
