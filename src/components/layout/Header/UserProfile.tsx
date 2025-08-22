"use client";

import {
	LogoutOutlined,
	QuestionCircleOutlined,
	SettingOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Modal } from "antd";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useSessionData } from "@/hooks/auth/useAuth";
import { useResponsiveLayout } from "@/hooks/ui";
import { AuthService } from "@/lib/services/auth";

const AccountSettingModal = dynamic(
	() => import("@/components/features/admin/AccountSetting"),
	{ ssr: false },
);

const UserProfile: React.FC = () => {
	const { session } = useSessionData();
	const router = useRouter();
	const { isMobile } = useResponsiveLayout();

	const userName = session?.user?.fullName ?? session?.user?.name ?? "User";
	const avatarSrc = session?.user?.image ?? "/images/user_avatar.png";

	// State for admin modal
	const [adminModalOpen, setAdminModalOpen] = useState(false);

	const handleLogoutClick = () => {
		Modal.confirm({
			title: "Confirm Logout",
			content: (
				<div>
					<p>Are you sure you want to logout?</p>
					<p className="text-sm text-gray-500 mt-2">
						All your session data will be cleared and you will be redirected to
						the login page.
					</p>
				</div>
			),
			okText: "Yes, Logout",
			cancelText: "Cancel",
			okType: "danger",
			icon: <LogoutOutlined />,
			maskClosable: true,
			closable: true,
			onOk: async () => {
				try {
					// Enhanced logout that clears everything and calls backend
					await AuthService.logout({ redirect: false });
					router.push("/login");
				} catch (error) {
					console.error("Logout error:", error);
					// Force redirect even if logout fails
					router.push("/login");
				}
			},
		});
	};

	// Dynamic settings URL based on user role
	const getSettingsUrl = () => {
		const userRole = session?.user?.role;
		switch (userRole) {
			case "student":
				return "/student/account-setting";
			case "lecturer":
			case "moderator":
				return "/lecturer/account-setting";
			case "admin":
				return null; // use modal
			default:
				return "/account-setting"; // fallback
		}
	};

	// Handle settings click
	const handleSettingsClick = (e: React.MouseEvent) => {
		if (session?.user?.role === "admin") {
			e.preventDefault();
			setAdminModalOpen(true);
		}
	};

	const menuItems: MenuProps["items"] = [
		{
			key: "settings",
			icon: <SettingOutlined />,
			label:
				session?.user?.role === "admin" ? (
					<button
						onClick={handleSettingsClick}
						type="button"
						style={{
							cursor: "pointer",
							background: "none",
							border: "none",
							padding: 0,
							font: "inherit",
						}}
					>
						Settings
					</button>
				) : (
					<Link href={getSettingsUrl() || "#"}>Settings</Link>
				),
		},
		...(isMobile
			? [
					{
						key: "user-guide",
						icon: <QuestionCircleOutlined />,
						label: "User's Guide",
						onClick: () =>
							window.open(
								"https://www.youtube.com/watch?v=rsklVACTVgU",
								"_blank",
							),
					},
				]
			: []),
		{
			type: "divider",
		},
		{
			key: "logout",
			icon: <LogoutOutlined />,
			label: "Logout",
			onClick: handleLogoutClick,
		},
	];

	return (
		<>
			<Dropdown
				menu={{ items: menuItems }}
				placement="bottomRight"
				trigger={["click"]}
				arrow
			>
				<div className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
					{session?.user?.image ? (
						<Image
							src={avatarSrc}
							alt={`${userName} Avatar`}
							width={32}
							height={32}
							className="w-8 h-8 rounded-full object-cover"
						/>
					) : (
						<Avatar icon={<UserOutlined />} size={32} />
					)}
					{!isMobile && (
						<div className="text-sm text-gray-700 ml-3">
							<p className="font-medium">{userName}</p>
						</div>
					)}
				</div>
			</Dropdown>
			{/* Admin Account Setting Modal */}
			{session?.user?.role === "admin" && (
				<AccountSettingModal
					open={adminModalOpen}
					onClose={() => setAdminModalOpen(false)}
					defaultEmail={session?.user?.email}
				/>
			)}
		</>
	);
};

export default UserProfile;
