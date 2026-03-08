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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const SPECIALIZATIONS = [
  "All", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "Psychiatrist", "General Physician"
];

const DOCTORS = [
  { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiologist", rating: 4.9, reviews: 312, location: "City Heart Center", distance: "1.2 km", available: true },
  { id: "2", name: "Dr. Michael Chen", specialty: "Neurologist", rating: 4.8, reviews: 245, location: "NeuroHealth Clinic", distance: "2.5 km", available: true },
  { id: "3", name: "Dr. Priya Sharma", specialty: "Dermatologist", rating: 4.7, reviews: 198, location: "SkinCare Institute", distance: "0.8 km", available: false },
  { id: "4", name: "Dr. James Wilson", specialty: "General Physician", rating: 4.6, reviews: 423, location: "MedCare Hospital", distance: "3.1 km", available: true },
  { id: "5", name: "Dr. Emma Rodriguez", specialty: "Pediatrician", rating: 4.9, reviews: 567, location: "Children's Health Clinic", distance: "1.7 km", available: true },
  { id: "6", name: "Dr. Ahmed Hassan", specialty: "Orthopedic", rating: 4.5, reviews: 189, location: "BoneJoint Center", distance: "4.2 km", available: false },
  { id: "7", name: "Dr. Lily Thompson", specialty: "Psychiatrist", rating: 4.8, reviews: 134, location: "MindWell Clinic", distance: "2.0 km", available: true },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? "star" : "star-outline"}
          size={12}
          color="#F5A623"
        />
      ))}
    </View>
  );
}

export default function DoctorsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = DOCTORS.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = selectedSpec === "All" || d.specialty === selectedSpec;
    return matchSearch && matchSpec;
  });

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Find Doctors</Text>
        <View style={{ width: 40 }} />
      </View>

      <LinearGradient colors={["#E67E22", "#F39C12"]} style={styles.heroBanner}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search doctors or specialization..."
            placeholderTextColor={Colors.textSecondary}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.specScroll}
        contentContainerStyle={styles.specContent}
      >
        {SPECIALIZATIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSelectedSpec(s)}
            style={[styles.specChip, selectedSpec === s && styles.specChipActive]}
          >
            <Text style={[styles.specText, selectedSpec === s && styles.specTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{filtered.length} doctors found</Text>
        {filtered.map((doc) => (
          <Pressable
            key={doc.id}
            style={({ pressed }) => [styles.doctorCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          >
            <View style={styles.doctorAvatar}>
              <Text style={styles.avatarInitial}>{doc.name.charAt(4)}</Text>
            </View>
            <View style={styles.doctorInfo}>
              <View style={styles.doctorNameRow}>
                <Text style={styles.doctorName}>{doc.name}</Text>
                {doc.available ? (
                  <View style={styles.availBadge}>
                    <Text style={styles.availText}>Available</Text>
                  </View>
                ) : (
                  <View style={[styles.availBadge, styles.unavailBadge]}>
                    <Text style={[styles.availText, styles.unavailText]}>Busy</Text>
                  </View>
                )}
              </View>
              <Text style={styles.doctorSpec}>{doc.specialty}</Text>
              <View style={styles.ratingRow}>
                <StarRating rating={doc.rating} />
                <Text style={styles.ratingText}>{doc.rating} ({doc.reviews})</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{doc.location} · {doc.distance}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome5 name="stethoscope" size={40} color={Colors.border} />
            <Text style={styles.emptyTitle}>No doctors found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search or filter</Text>
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
  heroBanner: { padding: 16 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary },
  specScroll: { maxHeight: 52, backgroundColor: "#fff" },
  specContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  specChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.offWhite, borderWidth: 1.5, borderColor: Colors.border,
  },
  specChipActive: { backgroundColor: "#E67E22", borderColor: "#E67E22" },
  specText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  specTextActive: { color: "#fff" },
  content: { padding: 16, paddingBottom: 60 },
  countText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  doctorCard: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 12, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  doctorAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.tealPale, alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.teal },
  doctorInfo: { flex: 1 },
  doctorNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  doctorName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary, flex: 1 },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.success + "20" },
  unavailBadge: { backgroundColor: Colors.border },
  availText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.success },
  unavailText: { color: Colors.textSecondary },
  doctorSpec: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.teal, marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  ratingText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textPrimary },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
});
