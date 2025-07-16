'use client';

import { Card, Layout, Space } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LoginErrorHandler } from '@/components/auth/LoginErrorHandler';
import LoginFooter from '@/components/auth/LoginFooter';
import { LoginValues } from '@/components/auth/LoginFormComponents';
import LoginHeader from '@/components/auth/LoginHeader';
import { LoginSuccessHandler } from '@/components/auth/LoginSuccessHandler';
import LoginTabs from '@/components/auth/LoginTabs';

const { Content } = Layout;

/**
 * Login Page
 * Enhanced with remember me functionality
 */
export default function SignInPage() {
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	/**
	 * Main login handler with remember me support
	 */
	const handleLogin = async (values: LoginValues, isAdmin = false) => {
		setLoading(true);
		try {
			const username = values.email ?? values.username;
			const remember = values.remember ?? false;

			const result = await signIn('credentials', {
				username,
				password: values.password,
				remember: remember.toString(), // Remember me preference
				redirect: false,
			});

			if (result?.error) {
				LoginErrorHandler.handleLoginError(result.error, isAdmin);
			} else {
				// Login successful - handle success with routing
				const successHandled =
					await LoginSuccessHandler.handleLoginSuccess(router);
				if (!successHandled) {
					// Fallback if session fetch fails
					LoginSuccessHandler.handleFallbackRedirect(router, isAdmin);
				}
			}
		} catch (error) {
			LoginErrorHandler.handleUnexpectedError(error, isAdmin);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * User login handler
	 */
	const handleUserLogin = (values: LoginValues) => handleLogin(values, false);

	/**
	 * Admin login handler
	 */
	const handleAdminLogin = (values: LoginValues) => handleLogin(values, true);

	return (
		<Layout style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
			<Content
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '48px 16px',
				}}
			>
				<div style={{ width: '100%', maxWidth: '448px' }}>
					<Space direction="vertical" size="large" style={{ width: '100%' }}>
						<LoginHeader />
						<Card style={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
							<LoginTabs
								loading={loading}
								onUserLogin={handleUserLogin}
								onAdminLogin={handleAdminLogin}
							/>
						</Card>
						<LoginFooter />
					</Space>
				</div>
			</Content>
		</Layout>
	);
}
