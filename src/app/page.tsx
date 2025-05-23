import { Button } from 'antd';

const Home = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold underline">Five Logic</h1>
			<Button
				type="primary"
				className="mt-4 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-lg w-48 h-12"
			>
				Nhót
			</Button>
		</div>
	);
};

export default Home;
