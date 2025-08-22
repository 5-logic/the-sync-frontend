import {
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button, Layout, Tooltip } from "antd";
import React from "react";

import { HeaderSectionProps } from "@/components/layout/CollapsibleLayout/CollapsibleLayout.types";
import { CurrentSemesterTag } from "@/components/layout/Header/CurrentSemesterTag";
import UserProfile from "@/components/layout/Header/UserProfile";
import { useResponsiveLayout } from "@/hooks/ui";

const { Header } = Layout;

export const HeaderSection: React.FC<HeaderSectionProps> = ({
	collapsed,
	onToggle,
	colorBgContainer,
}) => {
	const { isMobile } = useResponsiveLayout();

	return (
		<Header
			style={{
				padding: 0,
				background: colorBgContainer,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				boxShadow: "0 1px 4px rgba(0,21,41,.08)",
				zIndex: 50,
				position: "sticky",
				top: 0,
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<Button
					type="text"
					icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
					onClick={onToggle}
					style={{
						fontSize: "16px",
						width: 64,
						height: 64,
					}}
				/>

				{/* Current Semester Tag */}
				<CurrentSemesterTag />

				{/* Page Title Area */}
				<div
					style={{
						fontSize: 16,
						fontWeight: 500,
						color: "#434343",
					}}
				></div>
			</div>
			{/* User Actions */}
			<div
				style={{
					paddingRight: 24,
					display: "flex",
					alignItems: "center",
					gap: 8,
				}}
			>
				{/* User's Guide Button - Only show on desktop */}
				{!isMobile && (
					<Tooltip title="User's Guide">
						<Button
							type="text"
							icon={<QuestionCircleOutlined />}
							onClick={() =>
								window.open(
									"https://www.youtube.com/watch?v=rsklVACTVgU",
									"_blank",
								)
							}
							style={{
								fontSize: "16px",
								color: "#434343",
								display: "flex",
								alignItems: "center",
								gap: 4,
							}}
						>
							User&apos;s Guide
						</Button>
					</Tooltip>
				)}

				<UserProfile />
			</div>
		</Header>
	);
};
