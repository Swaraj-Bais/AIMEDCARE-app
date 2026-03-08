import React, { useState } from "react";
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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

type AssessmentType = "stress" | "depression" | "sleep";

const ASSESSMENTS = {
  stress: {
    title: "Stress Assessment",
    icon: "stress" as const,
    color: "#E74C3C",
    description: "Evaluate your current stress levels",
    questions: [
      { q: "How often do you feel overwhelmed by your responsibilities?", options: ["Rarely", "Sometimes", "Often", "Always"] },
      { q: "How often do you feel irritable or short-tempered?", options: ["Rarely", "Sometimes", "Often", "Always"] },
      { q: "How often do you have trouble relaxing after work?", options: ["Rarely", "Sometimes", "Often", "Always"] },
      { q: "How often do you experience physical tension (headaches, muscle tension)?", options: ["Rarely", "Sometimes", "Often", "Always"] },
      { q: "How often do you feel anxious about the future?", options: ["Rarely", "Sometimes", "Often", "Always"] },
    ],
  },
  depression: {
    title: "Depression Screening",
    icon: "brain" as const,
    color: "#9B59B6",
    description: "PHQ-9 based depression screening",
    questions: [
      { q: "Little interest or pleasure in doing things?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { q: "Feeling down, depressed, or hopeless?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { q: "Trouble falling or staying asleep, or sleeping too much?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { q: "Feeling tired or having little energy?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
      { q: "Trouble concentrating on things, such as reading?", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    ],
  },
  sleep: {
    title: "Sleep Quality",
    icon: "moon",
    color: "#3498DB",
    description: "Assess your sleep patterns and quality",
    questions: [
      { q: "How many hours of sleep do you typically get per night?", options: ["Less than 5", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8"] },
      { q: "How long does it take you to fall asleep?", options: ["Under 15 min", "15-30 min", "30-60 min", "Over 60 min"] },
      { q: "How often do you wake up during the night?", options: ["Never", "Once", "2-3 times", "More than 3 times"] },
      { q: "How rested do you feel upon waking?", options: ["Very rested", "Fairly rested", "Slightly tired", "Very tired"] },
      { q: "How often do you feel sleepy during the day?", options: ["Rarely", "Sometimes", "Often", "Always"] },
    ],
  },
};

const RESULT_MESSAGES = {
  stress: [
    { range: [0, 4], label: "Low Stress", color: Colors.success, msg: "Your stress levels are well-managed. Keep up healthy habits." },
    { range: [5, 9], label: "Moderate Stress", color: Colors.warning, msg: "Some stress is present. Try relaxation techniques, exercise, or mindfulness." },
    { range: [10, 20], label: "High Stress", color: Colors.danger, msg: "High stress levels detected. Consider speaking with a professional." },
  ],
  depression: [
    { range: [0, 4], label: "Minimal Symptoms", color: Colors.success, msg: "Very few depressive symptoms. Maintain self-care routines." },
    { range: [5, 9], label: "Mild Symptoms", color: Colors.warning, msg: "Mild depressive symptoms present. Consider lifestyle changes and support." },
    { range: [10, 20], label: "Significant Symptoms", color: Colors.danger, msg: "Significant symptoms detected. Please consult a mental health professional." },
  ],
  sleep: [
    { range: [0, 4], label: "Good Sleep", color: Colors.success, msg: "Your sleep patterns look healthy. Maintain your routine." },
    { range: [5, 9], label: "Fair Sleep", color: Colors.warning, msg: "Sleep could be improved. Aim for consistent sleep/wake times." },
    { range: [10, 20], label: "Poor Sleep", color: Colors.danger, msg: "Poor sleep quality. Consider a sleep hygiene program or consult a doctor." },
  ],
};

export default function AssessmentScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<AssessmentType | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const assessment = selected ? ASSESSMENTS[selected] : null;
  const totalQ = assessment?.questions.length || 0;
  const score = answers.reduce((a, b) => a + b, 0);

  const getResult = () => {
    if (!selected) return null;
    const results = RESULT_MESSAGES[selected];
    return results.find((r) => score >= r.range[0] && score <= r.range[1]) || results[results.length - 1];
  };

  const handleAnswer = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentQ + 1 >= totalQ) {
      setCompleted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setSelected(null);
    setCurrentQ(0);
    setAnswers([]);
    setCompleted(false);
  };

  if (completed && assessment && selected) {
    const result = getResult();
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={reset} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{assessment.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={[assessment.color, assessment.color + "BB"]}
            style={styles.resultHero}
          >
            <Ionicons name="checkmark-circle" size={56} color="#fff" />
            <Text style={styles.resultHeroTitle}>Assessment Complete</Text>
            <Text style={styles.resultScore}>Score: {score}</Text>
          </LinearGradient>

          {result && (
            <View style={[styles.resultCard, { borderTopColor: result.color, borderTopWidth: 4 }]}>
              <View style={[styles.resultBadge, { backgroundColor: result.color + "20" }]}>
                <Text style={[styles.resultLabel, { color: result.color }]}>{result.label}</Text>
              </View>
              <Text style={styles.resultMessage}>{result.msg}</Text>
            </View>
          )}

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>General Recommendations</Text>
            {[
              "Regular physical exercise (30 min/day)",
              "Maintain consistent sleep schedule",
              "Practice deep breathing or meditation",
              "Stay connected with friends and family",
              "Limit caffeine and alcohol intake",
              "Talk to a professional if symptoms persist",
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={reset} style={styles.restartBtn}>
            <Text style={styles.restartBtnText}>Take Another Assessment</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (selected && assessment) {
    const q = assessment.questions[currentQ];
    const progress = (currentQ / totalQ) * 100;
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={reset} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{assessment.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: assessment.color }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.questionCounter}>Question {currentQ + 1} of {totalQ}</Text>
          <Text style={styles.questionText}>{q.q}</Text>

          {q.options.map((opt, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleAnswer(idx)}
              style={({ pressed }) => [
                styles.optionBtn,
                pressed && { borderColor: assessment.color, backgroundColor: assessment.color + "10" },
              ]}
            >
              <View style={[styles.optionDot, { borderColor: assessment.color }]} />
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mental Health</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#1ABC9C", "#16A085"]} style={styles.heroBanner}>
          <FontAwesome5 name="brain" size={36} color="#fff" />
          <Text style={styles.heroTitle}>Mental Health Assessment</Text>
          <Text style={styles.heroDesc}>Check your stress, mood & sleep quality</Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>Choose an Assessment</Text>

        {(Object.keys(ASSESSMENTS) as AssessmentType[]).map((type) => {
          const a = ASSESSMENTS[type];
          return (
            <Pressable
              key={type}
              onPress={() => { setSelected(type); setCurrentQ(0); setAnswers([]); setCompleted(false); }}
              style={({ pressed }) => [styles.assessCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
            >
              <LinearGradient
                colors={[a.color, a.color + "CC"]}
                style={styles.assessCardGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.assessIconBg}>
                  {type === "stress" ? (
                    <Ionicons name="pulse" size={24} color={a.color} />
                  ) : type === "depression" ? (
                    <FontAwesome5 name="brain" size={22} color={a.color} />
                  ) : (
                    <Ionicons name="moon" size={24} color={a.color} />
                  )}
                </View>
                <View style={styles.assessInfo}>
                  <Text style={styles.assessTitle}>{a.title}</Text>
                  <Text style={styles.assessDesc}>{a.description}</Text>
                  <Text style={styles.assessQCount}>{a.questions.length} questions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </Pressable>
          );
        })}

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.noteText}>
            These assessments are for informational purposes only and do not constitute a medical diagnosis.
          </Text>
        </View>
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
  progressBar: { height: 4, backgroundColor: Colors.border },
  progressFill: { height: 4, borderRadius: 2 },
  content: { padding: 20, paddingBottom: 60 },
  heroBanner: { borderRadius: 18, padding: 24, alignItems: "center", gap: 8, marginBottom: 20 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
  heroDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  sectionLabel: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.textPrimary, marginBottom: 12 },
  assessCard: { borderRadius: 18, overflow: "hidden", marginBottom: 14 },
  assessCardGrad: {
    flexDirection: "row", alignItems: "center", padding: 18, gap: 14,
  },
  assessIconBg: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  assessInfo: { flex: 1 },
  assessTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  assessDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  assessQCount: { fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  noteBox: {
    flexDirection: "row", gap: 8, backgroundColor: Colors.lightBlue,
    borderRadius: 10, padding: 12, alignItems: "flex-start",
  },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  questionCounter: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  questionText: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary, lineHeight: 28, marginBottom: 24 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 14, padding: 18, marginBottom: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  optionText: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  resultHero: { borderRadius: 18, padding: 32, alignItems: "center", gap: 8, marginBottom: 20 },
  resultHeroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#fff" },
  resultScore: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "rgba(255,255,255,0.85)" },
  resultCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  resultBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 12 },
  resultLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  resultMessage: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  tipsCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  tipsTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary, marginBottom: 14 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  tipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  restartBtn: {
    backgroundColor: "#1ABC9C", borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center",
  },
  restartBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
});
