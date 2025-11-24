import { createHomeStyles } from "@/assets/styles/home.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import useTheme, { ColorScheme } from "@/hooks/useTheme";
import { StatusBar, TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { Link } from 'expo-router';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/app-example/constants/theme";
import Header from "../components/Header";

export default function Index() {
  const { toggleDarkMode, colors } = useTheme();

  const homeStyles = createHomeStyles(colors);

  return (
    <LinearGradient colors={colors.gradients.background} style={homeStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        <Text>Hello !</Text>
        <Header />
          <TouchableOpacity onPress={toggleDarkMode}>
            <Text>Toggle the mode</Text>
          </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}
