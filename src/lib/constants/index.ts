export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Re-export domain constants
export * from "@/lib/constants/domains";
export * from "@/lib/constants/excelImport";
export * from "@/lib/constants/semester";
export * from "@/lib/constants/team";
export * from "@/lib/constants/thesis";

// Thesis Template URLs
export const THESIS_TEMPLATE_URLS = {
	THESIS_REGISTER_DOCUMENT:
		"https://fwdhkdaywlcwzcblczdd.supabase.co/storage/v1/object/public/thesync/support-doc/Thesis%20Register%20Document%20Template.docx",
} as const;
