import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { Image } from "expo-image";

const SAMPLE_RESULTS = [
  { name: "Hemoglobin", value: "13.5 g/dL", normal: "12-16 g/dL", status: "normal" },
  { name: "Blood Glucose", value: "105 mg/dL", normal: "70-100 mg/dL", status: "high" },
  { name: "Cholesterol", value: "185 mg/dL", normal: "< 200 mg/dL", status: "normal" },
  { name: "Creatinine", value: "0.9 mg/dL", normal: "0.7-1.3 mg/dL", status: "normal" },
  { name: "WBC Count", value: "7.2 K/uL", normal: "4.5-11.0 K/uL", status: "normal" },
];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setAnalyzed(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setAnalyzed(false);
    }
  };

  const analyzeReport = async () => {
    if (!image) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2200));
    setAnalyzing(false);
    setAnalyzed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Report Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#9B59B6", "#8E44AD"]} style={styles.heroBanner}>
          <Ionicons name="document-text" size={36} color="#fff" />
          <Text style={styles.heroTitle}>Medical Report Analysis</Text>
          <Text style={styles.heroDesc}>Upload your report for AI-powered analysis</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Report</Text>
          <Text style={styles.cardDesc}>
            Take a photo or upload an image of your medical report for simplified analysis.
          </Text>

          <View style={styles.uploadRow}>
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient colors={["#9B59B6", "#8E44AD"]} style={styles.uploadBtnGrad}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.uploadBtnOutline}>
                <Ionicons name="images" size={24} color="#9B59B6" />
                <Text style={[styles.uploadBtnText, { color: "#9B59B6" }]}>Gallery</Text>
              </View>
            </Pressable>
          </View>

          {image && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImg} contentFit="cover" />
              <Pressable
                onPress={() => { setImage(null); setAnalyzed(false); }}
                style={styles.removeImg}
              >
                <Ionicons name="close-circle" size={28} color={Colors.danger} />
              </Pressable>
            </View>
          )}

          {image && !analyzed && (
            <Pressable
              onPress={analyzeReport}
              disabled={analyzing}
              style={({ pressed }) => [styles.analyzeBtn, pressed && { opacity: 0.85 }]}
            >
              {analyzing ? (
                <View style={styles.analyzingRow}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyzeBtnText}>Analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.analyzeBtnText}>Analyze Report</Text>
              )}
            </Pressable>
          )}
        </View>

        {analyzed && (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              <Text style={styles.resultsTitle}>Analysis Complete</Text>
            </View>
            <Text style={styles.resultsDesc}>
              AI has extracted and simplified your report values. Always consult your doctor for medical advice.
            </Text>

            {SAMPLE_RESULTS.map((item) => (
              <View key={item.name} style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultNormal}>Normal: {item.normal}</Text>
                </View>
                <View style={[styles.resultValueBadge, { backgroundColor: item.status === "normal" ? Colors.success + "15" : Colors.warning + "15" }]}>
                  <Text style={[styles.resultValue, { color: item.status === "normal" ? Colors.success : Colors.warning }]}>
                    {item.value}
                  </Text>
                  <Ionicons
                    name={item.status === "normal" ? "checkmark-circle" : "warning"}
                    size={14}
                    color={item.status === "normal" ? Colors.success : Colors.warning}
                  />
                </View>
              </View>
            ))}

            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.disclaimerText}>
                This is a demo analysis. For accurate results, consult a qualified healthcare provider.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: "#fff",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: Colors.textPrimary },
  content: { padding: 20, paddingBottom: 60 },
  heroBanner: { borderRadius: 18, padding: 24, alignItems: "center", gap: 8, marginBottom: 20 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
  heroDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary, marginBottom: 6 },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 20 },
  uploadRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  uploadBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  uploadBtnGrad: { height: 80, alignItems: "center", justifyContent: "center", gap: 6 },
  uploadBtnOutline: {
    height: 80, alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 2, borderColor: "#9B59B6", borderRadius: 14, borderStyle: "dashed",
  },
  uploadBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  imagePreview: { borderRadius: 12, overflow: "hidden", marginBottom: 16, position: "relative" },
  previewImg: { width: "100%", height: 200 },
  removeImg: { position: "absolute", top: 8, right: 8 },
  analyzeBtn: {
    backgroundColor: "#9B59B6", borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center",
  },
  analyzingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  analyzeBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  resultsCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  resultsTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary },
  resultsDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  resultRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  resultLeft: { flex: 1 },
  resultName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  resultNormal: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resultValueBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  resultValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  disclaimerBox: {
    flexDirection: "row", gap: 8, backgroundColor: Colors.lightBlue,
    borderRadius: 10, padding: 12, marginTop: 12, alignItems: "flex-start",
  },
  disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
