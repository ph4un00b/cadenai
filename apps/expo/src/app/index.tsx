import React from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import { api, type RouterOutputs } from "~/utils/api";

const Index = () => {
	return (
		<SafeAreaView className="bg-[#1F104A]">
			{/* Changes page title visible on the header */}
			<Stack.Screen options={{ title: "Home Page" }} />
			<View className="h-full w-full p-4">
				<Text className="mx-auto pb-2 text-5xl font-bold text-white">
					Create <Text className="text-pink-400">T3</Text> Turbo
				</Text>

				<View className="py-2">
					<Text className="font-semibold italic text-white">
						Press on a post
					</Text>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default Index;
