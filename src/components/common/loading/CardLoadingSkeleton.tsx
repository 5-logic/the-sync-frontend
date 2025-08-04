"use client";

import { Card, Skeleton } from "antd";

/**
 * Card Loading Skeleton
 */
export default function CardLoadingSkeleton() {
	return (
		<Card size="small">
			<Skeleton active avatar paragraph={{ rows: 2 }} />
		</Card>
	);
}
