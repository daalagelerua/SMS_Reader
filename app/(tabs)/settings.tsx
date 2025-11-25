import { Colors } from '@/app-example/constants/theme'
import { createSettingsStyles } from '@/assets/styles/settings.styles'
import useTheme from '@/hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProgressStats from '../components/ProgressStats'
import Preferences from '../components/Preferences'
import DangerZone from '../components/DangerZone'

const SettingsScreen = () => {

  const { colors }=useTheme()

  const settingsStyles = createSettingsStyles(colors)
  return (

      <LinearGradient colors={colors.gradients.background} style={settingsStyles.container}>
        <SafeAreaView style={settingsStyles.safeArea}>
            {/* HEADER */}
          <View style={settingsStyles.header}>
            <View style={settingsStyles.titleContainer}>
              <LinearGradient colors={colors.gradients.primary} style={settingsStyles.iconContainer}>
                <Ionicons name="settings" size={28} color="#ffffff" />
              </LinearGradient>
              <Text style={settingsStyles.title}>Settings</Text>
            </View>
          </View>

          <ScrollView
            style={settingsStyles.scrollView}
            contentContainerStyle={settingsStyles.content}
            showsVerticalScrollIndicator={false}
          >
            <ProgressStats />

            {/* PREFERENCES */}
            <Preferences />

            <DangerZone />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
        
    
  )
}

export default SettingsScreen