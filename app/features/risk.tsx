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

type RiskType = "diabetes" | "heart" | "obesity";

interface RiskResult {
  type: RiskType;
  score: number;
  level: "Low" | "Moderate" | "High";
  color: string;
  factors: string[];
  recommendations: string[];
}

const RISK_COLORS = { Low: Colors.success, Moderate: Colors.warning, High: Colors.danger };

function calcDiabetesRisk(age: number, bmi: number, bp: number, glucose: number, family: boolean, active: boolean): RiskResult {
  let score = 0;
  const factors: string[] = [];
  if (age >= 45) { score += 2; factors.push("Age 45+ increases diabetes risk"); }
  if (bmi >= 25) { score += bmi >= 30 ? 3 : 2; factors.push(`BMI ${bmi.toFixed(1)} - ${bmi >= 30 ? "Obese" : "Overweight"}`); }
  if (bp >= 140) { score += 2; factors.push("High blood pressure detected"); }
  if (glucose >= 100) { score += glucose >= 126 ? 4 : 2; factors.push(`Fasting glucose ${glucose} mg/dL - Elevated`); }
  if (family) { score += 2; factors.push("Family history of diabetes"); }
  if (!active) { score += 1; factors.push("Sedentary lifestyle"); }

  const level: "Low" | "Moderate" | "High" = score <= 3 ? "Low" : score <= 6 ? "Moderate" : "High";
  return {
    type: "diabetes", score, level, color: RISK_COLORS[level], factors,
    recommendations: level === "Low"
      ? ["Maintain healthy weight", "Stay physically active", "Regular glucose checkups"]
      : level === "Moderate"
      ? ["Reduce sugar intake", "Exercise 150 min/week", "Annual HbA1c test", "Consult your doctor"]
      : ["See a doctor immediately", "Monitor blood glucose daily", "Follow diabetic diet plan", "Take prescribed medication"],
  };
}

function calcHeartRisk(age: number, cholesterol: number, bp: number, smoker: boolean, diabetes: boolean, bmi: number): RiskResult {
  let score = 0;
  const factors: string[] = [];
  if (age >= 55) { score += 2; factors.push("Age is a major heart risk factor"); }
  if (cholesterol >= 200) { score += cholesterol >= 240 ? 3 : 2; factors.push(`Cholesterol ${cholesterol} mg/dL - Elevated`); }
  if (bp >= 140) { score += 2; factors.push("High blood pressure strains the heart"); }
  if (smoker) { score += 3; factors.push("Smoking significantly increases heart risk"); }
  if (diabetes) { score += 2; factors.push("Diabetes doubles heart disease risk"); }
  if (bmi >= 30) { score += 1; factors.push("Obesity puts strain on the heart"); }

  const level: "Low" | "Moderate" | "High" = score <= 3 ? "Low" : score <= 7 ? "Moderate" : "High";
  return {
    type: "heart", score, level, color: RISK_COLORS[level], factors,
    recommendations: level === "Low"
      ? ["Continue healthy habits", "Annual cholesterol check", "Stay active"]
      : level === "Moderate"
      ? ["Reduce saturated fat", "Control blood pressure", "Stop smoking", "Cardiology checkup"]
      : ["Seek immediate cardiac evaluation", "Take prescribed medications", "Quit smoking urgently", "Follow heart-healthy diet"],
  };
}

function calcObesityRisk(bmi: number, waist: number, activity: string, diet: string): RiskResult {
  let score = 0;
  const factors: string[] = [];
  if (bmi >= 25) { score += bmi >= 30 ? 4 : 2; factors.push(`BMI ${bmi.toFixed(1)} - ${bmi >= 30 ? "Obese" : "Overweight"}`); }
  if (waist >= 80) { score += waist >= 88 ? 3 : 1; factors.push(`Waist ${waist}cm - ${waist >= 88 ? "High" : "Borderline"} abdominal fat`); }
  if (activity === "sedentary") { score += 2; factors.push("Sedentary lifestyle contributes to weight gain"); }
  if (diet === "poor") { score += 2; factors.push("Poor diet quality"); }

  const level: "Low" | "Moderate" | "High" = score <= 2 ? "Low" : score <= 5 ? "Moderate" : "High";
  return {
    type: "obesity", score, level, color: RISK_COLORS[level], factors,
    recommendations: level === "Low"
      ? ["Maintain current healthy habits", "Stay physically active"]
      : level === "Moderate"
      ? ["Reduce calorie intake by 500/day", "Increase physical activity", "Consult a nutritionist"]
      : ["Consult a doctor for a weight management plan", "Consider supervised diet program", "Aim for gradual 0.5-1kg/week loss"],
  };
}

export default function RiskScreen() {
  const insets = useSafeAreaInsets();
  const [activeRisk, setActiveRisk] = useState<RiskType>("diabetes");
  const [result, setResult] = useState<RiskResult | null>(null);

  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [bp, setBp] = useState("");
  const [glucose, setGlucose] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [waist, setWaist] = useState("");
  const [familyHistory, setFamilyHistory] = useState(false);
  const [smoker, setSmoker] = useState(false);
  const [diabetic, setDiabetic] = useState(false);
  const [activity, setActivity] = useState("moderate");
  const [diet, setDiet] = useState("average");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const calculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const a = parseFloat(age) || 30;
    const b = parseFloat(bmi) || 22;
    const bpVal = parseFloat(bp) || 120;
    const g = parseFloat(glucose) || 90;
    const chol = parseFloat(cholesterol) || 180;
    const w = parseFloat(waist) || 80;

    if (activeRisk === "diabetes") setResult(calcDiabetesRisk(a, b, bpVal, g, familyHistory, activity !== "sedentary"));
    else if (activeRisk === "heart") setResult(calcHeartRisk(a, chol, bpVal, smoker, diabetic, b));
    else setResult(calcObesityRisk(b, w, activity, diet));

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const BoolToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Health Risk Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#F06292", "#E91E63"]} style={styles.heroBanner}>
          <MaterialCommunityIcons name="heart-pulse" size={36} color="#fff" />
          <Text style={styles.heroTitle}>Health Risk Assessment</Text>
          <Text style={styles.heroDesc}>Calculate your risk for common conditions</Text>
        </LinearGradient>

        <View style={styles.riskTabs}>
          {(["diabetes", "heart", "obesity"] as RiskType[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => { setActiveRisk(r); setResult(null); }}
              style={[styles.riskTab, activeRisk === r && styles.riskTabActive]}
            >
              <Text style={[styles.riskTabText, activeRisk === r && styles.riskTabTextActive]}>
                {r === "diabetes" ? "Diabetes" : r === "heart" ? "Heart" : "Obesity"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Your Details</Text>

          {["diabetes", "heart", "obesity"].includes(activeRisk) && (
            <>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput style={styles.fieldInput} value={age} onChangeText={setAge} placeholder="Years" placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>BMI</Text>
                  <TextInput style={styles.fieldInput} value={bmi} onChangeText={setBmi} placeholder="kg/m²" placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                </View>
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Blood Pressure</Text>
                  <TextInput style={styles.fieldInput} value={bp} onChangeText={setBp} placeholder="mmHg sys." placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                </View>
                {activeRisk === "diabetes" && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Fasting Glucose</Text>
                    <TextInput style={styles.fieldInput} value={glucose} onChangeText={setGlucose} placeholder="mg/dL" placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                  </View>
                )}
                {activeRisk === "heart" && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Cholesterol</Text>
                    <TextInput style={styles.fieldInput} value={cholesterol} onChangeText={setCholesterol} placeholder="mg/dL" placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                  </View>
                )}
                {activeRisk === "obesity" && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Waist (cm)</Text>
                    <TextInput style={styles.fieldInput} value={waist} onChangeText={setWaist} placeholder="cm" placeholderTextColor={Colors.textSecondary} keyboardType="decimal-pad" />
                  </View>
                )}
              </View>
            </>
          )}

          {activeRisk === "diabetes" && (
            <>
              <BoolToggle label="Family history of diabetes" value={familyHistory} onChange={setFamilyHistory} />
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Activity Level</Text>
                <View style={styles.chipRow}>
                  {["sedentary", "moderate", "active"].map((a) => (
                    <Pressable key={a} onPress={() => setActivity(a)} style={[styles.chip, activity === a && styles.chipActive]}>
                      <Text style={[styles.chipText, activity === a && styles.chipTextActive]}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {activeRisk === "heart" && (
            <>
              <BoolToggle label="Smoker" value={smoker} onChange={setSmoker} />
              <BoolToggle label="Have diabetes" value={diabetic} onChange={setDiabetic} />
            </>
          )}

          {activeRisk === "obesity" && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Activity Level</Text>
                <View style={styles.chipRow}>
                  {["sedentary", "moderate", "active"].map((a) => (
                    <Pressable key={a} onPress={() => setActivity(a)} style={[styles.chip, activity === a && styles.chipActive]}>
                      <Text style={[styles.chipText, activity === a && styles.chipTextActive]}>
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Diet Quality</Text>
                <View style={styles.chipRow}>
                  {["good", "average", "poor"].map((d) => (
                    <Pressable key={d} onPress={() => setDiet(d)} style={[styles.chip, diet === d && styles.chipActive]}>
                      <Text style={[styles.chipText, diet === d && styles.chipTextActive]}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          <Pressable onPress={calculate} style={({ pressed }) => [styles.calcBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.calcBtnText}>Calculate Risk</Text>
          </Pressable>
        </View>

        {result && (
          <View style={[styles.resultCard, { borderTopWidth: 4, borderTopColor: result.color }]}>
            <View style={styles.resultTop}>
              <View style={[styles.riskGauge, { borderColor: result.color }]}>
                <Text style={[styles.riskLevel, { color: result.color }]}>{result.level}</Text>
                <Text style={styles.riskLabel}>Risk</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{
                  result.type === "diabetes" ? "Diabetes Risk" :
                  result.type === "heart" ? "Heart Disease Risk" : "Obesity Risk"
                }</Text>
                <View style={[styles.riskBadge, { backgroundColor: result.color + "20" }]}>
                  <Text style={[styles.riskBadgeText, { color: result.color }]}>{result.level} Risk</Text>
                </View>
              </View>
            </View>

            {result.factors.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Contributing Factors</Text>
                {result.factors.map((f, i) => (
                  <View key={i} style={styles.factorRow}>
                    <Ionicons name="alert-circle-outline" size={15} color={result.color} />
                    <Text style={styles.factorText}>{f}</Text>
                  </View>
                ))}
              </>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Recommendations</Text>
            {result.recommendations.map((r, i) => (
              <View key={i} style={styles.recRow}>
                <Ionicons name="checkmark-circle-outline" size={15} color={Colors.success} />
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}
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
  heroDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  riskTabs: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 4, marginBottom: 16, gap: 4 },
  riskTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  riskTabActive: { backgroundColor: Colors.teal },
  riskTabText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary },
  riskTabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary, marginBottom: 16 },
  row2: { flexDirection: "row", gap: 12, marginBottom: 12 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textPrimary, marginBottom: 5 },
  fieldInput: {
    height: 44, backgroundColor: Colors.offWhite, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 12, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textPrimary,
  },
  fieldGroup: { marginBottom: 12 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
  },
  chipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  toggleLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textPrimary },
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: "center", padding: 2 },
  toggleOn: { backgroundColor: Colors.teal },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: "flex-end" },
  calcBtn: {
    backgroundColor: "#F06292", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center", marginTop: 16,
  },
  calcBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  resultCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultTop: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  riskGauge: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 4,
    alignItems: "center", justifyContent: "center",
  },
  riskLevel: { fontFamily: "Inter_700Bold", fontSize: 13 },
  riskLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary },
  resultTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary, marginBottom: 6 },
  riskBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  factorRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  factorText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  recRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  recText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
});
