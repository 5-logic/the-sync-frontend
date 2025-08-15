import { formatDate } from "@/lib/utils/dateFormat";

// Column definition for Applied Date
export const createAppliedDateColumn = (width: string = "15%") => ({
	title: "Applied Date",
	dataIndex: "createdAt",
	key: "createdAt",
	width,
	align: "center" as const,
	sorter: (a: { createdAt: string }, b: { createdAt: string }) =>
		new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	render: (date: string) => formatDate(new Date(date)),
});
