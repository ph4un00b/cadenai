import { SafeAreaView, Text, View } from "react-native";
import { Stack, useSearchParams } from "expo-router";

const Post: React.FC = () => {
	const { id } = useSearchParams();
	if (!id || typeof id !== "string") throw new Error("unreachable");
	// const { data } = api.post.byId.useQuery({ id });

	// if (!data) return <SplashScreen />;

	return (
		<SafeAreaView className="bg-[#1F104A]">
			{/* <Stack.Screen options={{ title: data.title }} /> */}
			<Stack.Screen options={{ title: "hola" }} />
			<View className="h-full w-full p-4">
				<Text className="py-2 text-3xl font-bold text-white">titulo!</Text>
				<Text className="py-4 text-white">contenido</Text>
			</View>
		</SafeAreaView>
	);
};

export default Post;
