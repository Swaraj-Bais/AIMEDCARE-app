import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
  route: string;
  gradient: [string, string];
}

const FEATURES: Feature[] = [
  {
    id: "chatbot",
    title: "AI Chatbot",
    subtitle: "Healthcare Assistant",
    icon: "chatbubbles",
    iconLib: "Ionicons",
    route: "/features/chatbot",
    gradient: ["#0A7B8E", "#12A0B8"],
  },
  {
    id: "diet",
    title: "Diet & Nutrition",
    subtitle: "Personalized Plan",
    icon: "nutrition",
    iconLib: "Ionicons",
    route: "/features/diet",
    gradient: ["#27AE7A", "#2ECC71"],
  },
  {
    id: "report",
    title: "Report Analysis",
    subtitle: "Upload & Analyze",
    icon: "document-text",
    iconLib: "Ionicons",
    route: "/features/report",
    gradient: ["#9B59B6", "#8E44AD"],
  },
  {
    id: "doctors",
    title: "Find Doctors",
    subtitle: "Nearby Specialists",
    icon: "stethoscope",
    iconLib: "FontAwesome5",
    route: "/features/doctors",
    gradient: ["#E67E22", "#F39C12"],
  },
  {
    id: "medicine",
    title: "Medicine Info",
    subtitle: "Search & Learn",
    icon: "pill",
    iconLib: "MaterialCommunityIcons",
    route: "/features/medicine",
    gradient: ["#3498DB", "#2980B9"],
  },
  {
    id: "reminder",
    title: "Rx Reminder",
    subtitle: "Manage Prescriptions",
    icon: "alarm",
    iconLib: "Ionicons",
    route: "/features/reminder",
    gradient: ["#E74C3C", "#C0392B"],
  },
  {
    id: "assessment",
    title: "Mental Health",
    subtitle: "Stress & Sleep",
    icon: "brain",
    iconLib: "FontAwesome5",
    route: "/features/assessment",
    gradient: ["#1ABC9C", "#16A085"],
  },
  {
    id: "risk",
    title: "Health Risk",
    subtitle: "Risk Calculator",
    icon: "heart-pulse",
    iconLib: "MaterialCommunityIcons",
    route: "/features/risk",
    gradient: ["#F06292", "#E91E63"],
  },
];

function FeatureIcon({ feature }: { feature: Feature }) {
  const size = 28;
  const color = "#fff";
  if (feature.iconLib === "Ionicons") {
    return <Ionicons name={feature.icon as any} size={size} color={color} />;
  }
  if (feature.iconLib === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={feature.icon as any} size={size} color={color} />;
  }
  return <FontAwesome5 name={feature.icon as any} size={size} color={color} />;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleFeature = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={["#0A7B8E", "#0D95AC"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name?.split(" ")[0] || "User"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/features/chatbot")}
            style={({ pressed }) => [styles.chatFab, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.teal} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.tealLight} />
            <Text style={styles.statLabel}>AI-Powered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Ionicons name="lock-closed" size={20} color={Colors.tealLight} />
            <Text style={styles.statLabel}>Secure</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Ionicons name="medical" size={20} color={Colors.tealLight} />
            <Text style={styles.statLabel}>Health First</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.sectionTitle}>Healthcare Features</Text>

        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <Pressable
              key={feature.id}
              style={({ pressed }) => [
                styles.card,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
              ]}
              onPress={() => handleFeature(feature.route)}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIconBg}>
                  <FeatureIcon feature={feature} />
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.8)" },
  userName: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#fff", marginTop: 2 },
  chatFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statCard: { alignItems: "center", gap: 4, flex: 1 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.85)" },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 18,
    minHeight: 130,
    justifyContent: "flex-end",
  },
  cardIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#fff",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.78)",
  },
});
