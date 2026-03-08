import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", desc: "Little or no exercise", factor: 1.2 },
  { id: "light", label: "Light", desc: "Exercise 1-3 days/week", factor: 1.375 },
  { id: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week", factor: 1.55 },
  { id: "active", label: "Active", desc: "Exercise 6-7 days/week", factor: 1.725 },
  { id: "very_active", label: "Very Active", desc: "Hard exercise, physical job", factor: 1.9 },
];

interface NutritionResult {
  bmi: number;
  bmiStatus: string;
  bmr: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmiColor: string;
}

export default function DietScreen() {
  const insets = useSafeAreaInsets();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("moderate");
  const [result, setResult] = useState<NutritionResult | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const calculate = () => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const bmi = w / Math.pow(h / 100, 2);
    let bmiStatus = "", bmiColor = "";
    if (bmi < 18.5) { bmiStatus = "Underweight"; bmiColor = Colors.warning; }
    else if (bmi < 25) { bmiStatus = "Normal Weight"; bmiColor = Colors.success; }
    else if (bmi < 30) { bmiStatus = "Overweight"; bmiColor = Colors.warning; }
    else { bmiStatus = "Obese"; bmiColor = Colors.danger; }

    const bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const factor = ACTIVITY_LEVELS.find((l) => l.id === activity)?.factor || 1.55;
    const calories = Math.round(bmr * factor);
    const protein = Math.round(w * 1.6);
    const fat = Math.round((calories * 0.3) / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

    setResult({ bmi: parseFloat(bmi.toFixed(1)), bmiStatus, bmr: Math.round(bmr), calories, protein, carbs, fat, bmiColor });
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Diet & Nutrition</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={["#27AE7A", "#2ECC71"]} style={styles.heroBanner}>
          <MaterialCommunityIcons name="food-apple" size={36} color="#fff" />
          <Text style={styles.heroTitle}>Personalized Nutrition</Text>
          <Text style={styles.heroDesc}>Get your BMI, calorie needs & nutrition plan</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Details</Text>

          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              >
                <Ionicons
                  name={g === "male" ? "male" : "female"}
                  size={18}
                  color={gender === g ? "#fff" : Colors.textSecondary}
                />
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </Pressable>
            ))}
          </View>

          {[
            { label: "Age", value: age, setter: setAge, placeholder: "Years", unit: "yrs" },
            { label: "Height", value: height, setter: setHeight, placeholder: "Centimeters", unit: "cm" },
            { label: "Weight", value: weight, setter: setWeight, placeholder: "Kilograms", unit: "kg" },
          ].map((f) => (
            <View style={styles.fieldGroup} key={f.label}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={styles.fieldRow}>
                <TextInput
                  style={styles.fieldInput}
                  value={f.value}
                  onChangeText={f.setter}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitText}>{f.unit}</Text>
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.fieldLabel}>Activity Level</Text>
          {ACTIVITY_LEVELS.map((level) => (
            <Pressable
              key={level.id}
              onPress={() => setActivity(level.id)}
              style={[styles.activityRow, activity === level.id && styles.activityRowActive]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityLabel, activity === level.id && styles.activityLabelActive]}>
                  {level.label}
                </Text>
                <Text style={styles.activityDesc}>{level.desc}</Text>
              </View>
              {activity === level.id && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              )}
            </Pressable>
          ))}

          <Pressable
            onPress={calculate}
            style={({ pressed }) => [styles.calcBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.calcBtnText}>Calculate</Text>
          </Pressable>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Your Results</Text>

            <View style={styles.bmiRow}>
              <View style={styles.bmiCircle}>
                <Text style={[styles.bmiValue, { color: result.bmiColor }]}>{result.bmi}</Text>
                <Text style={styles.bmiLabel}>BMI</Text>
              </View>
              <View style={styles.bmiInfo}>
                <View style={[styles.statusBadge, { backgroundColor: result.bmiColor + "20" }]}>
                  <Text style={[styles.statusText, { color: result.bmiColor }]}>{result.bmiStatus}</Text>
                </View>
                <Text style={styles.bmrText}>BMR: {result.bmr} kcal/day (base)</Text>
                <Text style={styles.caloriesText}>Daily Goal: {result.calories} kcal</Text>
              </View>
            </View>

            <View style={styles.macroRow}>
              {[
                { label: "Protein", value: result.protein, unit: "g", color: "#E74C3C" },
                { label: "Carbs", value: result.carbs, unit: "g", color: "#F39C12" },
                { label: "Fat", value: result.fat, unit: "g", color: "#27AE7A" },
              ].map((m) => (
                <View key={m.label} style={[styles.macroCard, { borderTopColor: m.color }]}>
                  <Text style={[styles.macroValue, { color: m.color }]}>{m.value}{m.unit}</Text>
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
              <Text style={styles.tipText}>
                {result.bmi < 18.5
                  ? "Focus on nutrient-dense foods. Increase protein and healthy calorie intake."
                  : result.bmi < 25
                  ? "Maintain your balanced diet. Stay consistent with exercise."
                  : result.bmi < 30
                  ? "Reduce processed foods. Increase fiber and lean protein intake."
                  : "Consult a doctor. Focus on sustainable lifestyle changes over crash diets."}
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
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary, marginBottom: 16 },
  genderRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  genderBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
  },
  genderBtnActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  genderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  genderTextActive: { color: "#fff" },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textPrimary, marginBottom: 6 },
  fieldRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  fieldInput: {
    flex: 1, height: 46, backgroundColor: Colors.offWhite, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14,
    fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary,
  },
  unitBadge: { paddingHorizontal: 14, height: 46, backgroundColor: Colors.tealPale, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  unitText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.teal },
  activityRow: {
    flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, marginBottom: 8, backgroundColor: Colors.offWhite,
  },
  activityRowActive: { borderColor: Colors.success, backgroundColor: "#F0FBF6" },
  activityLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textPrimary },
  activityLabelActive: { color: Colors.success },
  activityDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  calcBtn: {
    backgroundColor: "#27AE7A", borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  calcBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  resultCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary, marginBottom: 16 },
  bmiRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  bmiCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.tealPale, alignItems: "center", justifyContent: "center",
  },
  bmiValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  bmiLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  bmiInfo: { flex: 1, gap: 6 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bmrText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  caloriesText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.teal },
  macroRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  macroCard: {
    flex: 1, backgroundColor: Colors.offWhite, borderRadius: 12, padding: 14,
    alignItems: "center", borderTopWidth: 3,
  },
  macroValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  macroLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  tipBox: {
    flexDirection: "row", gap: 10, backgroundColor: "#FFF8E7",
    borderRadius: 12, padding: 14, alignItems: "flex-start",
  },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
});
