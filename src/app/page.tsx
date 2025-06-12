'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import Loading from '@/components/common/Loading';

const Home = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		// Đợi cho đến khi session status được xác định
		if (status === 'loading') return;

		if (status === 'unauthenticated') {
			// Chưa đăng nhập -> redirect về login
			console.log('🔄 Not authenticated, redirecting to login...');
			router.push('/login');
		} else if (status === 'authenticated' && session?.user) {
			// Đã đăng nhập -> redirect về dashboard tương ứng với role
			console.log(
				'🔄 Authenticated, redirecting to dashboard...',
				session.user,
			);

			const { role } = session.user;

			// Redirect dựa vào role
			if (role === 'admin') {
				router.push('/admin');
			} else if (role === 'lecturer') {
				// Kiểm tra xem có phải moderator không
				const isModerator = session.user.isModerator;
				console.log('👨‍🏫 Lecturer login, isModerator:', isModerator);
				router.push('/lecturer');
			} else if (role === 'student') {
				router.push('/student');
			} else {
				// Default fallback
				console.log('⚠️ Unknown role, defaulting to student dashboard');
				router.push('/student');
			}
		}
	}, [status, session, router]);

	// Hiển thị loading spinner trong khi đang check authentication
	return (
		<Loading
			message={
				status === 'loading' ? 'Checking authentication...' : 'Redirecting...'
			}
			description="Please wait while we redirect you"
		/>
	);
};

export default Home;
