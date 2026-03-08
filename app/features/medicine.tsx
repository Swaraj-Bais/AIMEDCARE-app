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
import Colors from "@/constants/colors";

const MEDICINES_DB = [
  {
    id: "1",
    name: "Paracetamol",
    generic: "Acetaminophen",
    category: "Analgesic / Antipyretic",
    uses: "Pain relief, fever reduction, headaches, muscle aches.",
    dosage: "Adults: 500-1000mg every 4-6 hours. Max 4g/day. Children: based on weight.",
    sideEffects: "Rare at normal doses. Overdose can cause liver damage.",
    precautions: "Avoid alcohol. Do not exceed recommended dose. Monitor liver function with long-term use.",
  },
  {
    id: "2",
    name: "Ibuprofen",
    generic: "Ibuprofen",
    category: "NSAID / Anti-inflammatory",
    uses: "Pain, inflammation, fever, arthritis, menstrual cramps.",
    dosage: "Adults: 200-400mg every 4-6 hours. Max 1200mg/day OTC.",
    sideEffects: "Stomach upset, heartburn, nausea. Rarely: kidney issues, ulcers.",
    precautions: "Take with food. Avoid if you have kidney disease or stomach ulcers.",
  },
  {
    id: "3",
    name: "Amoxicillin",
    generic: "Amoxicillin",
    category: "Antibiotic (Penicillin)",
    uses: "Bacterial infections: ear, throat, lung, urinary tract.",
    dosage: "Adults: 250-500mg every 8 hours or 500-875mg every 12 hours.",
    sideEffects: "Nausea, diarrhea, skin rash, allergic reactions.",
    precautions: "Complete full course. Inform doctor of penicillin allergy.",
  },
  {
    id: "4",
    name: "Metformin",
    generic: "Metformin HCl",
    category: "Antidiabetic (Biguanide)",
    uses: "Type 2 diabetes management, insulin sensitizer.",
    dosage: "Usually 500-1000mg twice daily with meals. Up to 2550mg/day.",
    sideEffects: "Nausea, diarrhea, stomach upset. Rare: lactic acidosis.",
    precautions: "Take with meals. Avoid in kidney failure. Monitor B12 levels.",
  },
  {
    id: "5",
    name: "Atorvastatin",
    generic: "Atorvastatin Calcium",
    category: "Statin / Cholesterol",
    uses: "Lower LDL cholesterol, prevent heart disease and stroke.",
    dosage: "10-80mg once daily. Usually taken in the evening.",
    sideEffects: "Muscle pain, liver enzyme changes, digestive issues.",
    precautions: "Avoid grapefruit. Monitor liver function. Report muscle pain immediately.",
  },
  {
    id: "6",
    name: "Omeprazole",
    generic: "Omeprazole",
    category: "Proton Pump Inhibitor",
    uses: "Acid reflux, GERD, stomach ulcers, H. pylori treatment.",
    dosage: "20-40mg once daily before meals. Usually for 4-8 weeks.",
    sideEffects: "Headache, nausea, diarrhea, abdominal pain.",
    precautions: "Long-term use may reduce magnesium and B12. Not for immediate acid relief.",
  },
];

export default function MedicineScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof MEDICINES_DB[0] | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = MEDICINES_DB.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.generic.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => setSelected(null)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{selected.name}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#3498DB", "#2980B9"]} style={styles.medicineHero}>
            <MaterialCommunityIcons name="pill" size={44} color="#fff" />
            <Text style={styles.medicineName}>{selected.name}</Text>
            <Text style={styles.medicineGeneric}>{selected.generic}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{selected.category}</Text>
            </View>
          </LinearGradient>

          {[
            { title: "Uses & Indications", content: selected.uses, icon: "medkit-outline", color: Colors.teal },
            { title: "Dosage", content: selected.dosage, icon: "timer-outline", color: Colors.success },
            { title: "Side Effects", content: selected.sideEffects, icon: "warning-outline", color: Colors.warning },
            { title: "Precautions", content: selected.precautions, icon: "shield-outline", color: "#9B59B6" },
          ].map((section) => (
            <View key={section.title} style={styles.infoCard}>
              <View style={[styles.infoIconBg, { backgroundColor: section.color + "15" }]}>
                <Ionicons name={section.icon as any} size={20} color={section.color} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{section.title}</Text>
                <Text style={styles.infoText}>{section.content}</Text>
              </View>
            </View>
          ))}

          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              Always follow your doctor's prescription. This is for informational purposes only.
            </Text>
          </View>
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
        <Text style={styles.headerTitle}>Medicine Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <LinearGradient colors={["#3498DB", "#2980B9"]} style={styles.searchBanner}>
        <Text style={styles.bannerTitle}>Medicine Database</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search medicine name or category..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{filtered.length} medicines found</Text>
        {filtered.map((med) => (
          <Pressable
            key={med.id}
            onPress={() => setSelected(med)}
            style={({ pressed }) => [styles.medCard, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.medIconBg}>
              <MaterialCommunityIcons name="pill" size={24} color="#3498DB" />
            </View>
            <View style={styles.medInfo}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medGeneric}>{med.generic}</Text>
              <Text style={styles.medCategory}>{med.category}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={40} color={Colors.border} />
            <Text style={styles.emptyTitle}>No medicines found</Text>
            <Text style={styles.emptyDesc}>Try a different search term</Text>
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
  searchBanner: { padding: 20, gap: 12 },
  bannerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 60 },
  countText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  medCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  medIconBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#EBF5FB", alignItems: "center", justifyContent: "center" },
  medInfo: { flex: 1 },
  medName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary },
  medGeneric: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  medCategory: { fontFamily: "Inter_500Medium", fontSize: 11, color: "#3498DB", marginTop: 3 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textPrimary },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  medicineHero: { borderRadius: 18, padding: 28, alignItems: "center", gap: 6, marginBottom: 16 },
  medicineName: { fontFamily: "Inter_700Bold", fontSize: 24, color: "#fff" },
  medicineGeneric: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.8)" },
  categoryBadge: { marginTop: 6, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  categoryText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#fff" },
  infoCard: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, padding: 16,
    marginBottom: 10, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  infoIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  infoTitle: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.textPrimary, marginBottom: 6 },
  infoText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  disclaimerBox: {
    flexDirection: "row", gap: 8, backgroundColor: Colors.lightBlue,
    borderRadius: 10, padding: 12, marginBottom: 20, alignItems: "flex-start",
  },
  disclaimerText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
