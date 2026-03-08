import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface Reminder {
  id: string;
  medicine: string;
  dosage: string;
  times: string[];
  notes: string;
  active: boolean;
}

const STORAGE_KEY = "aimedcare_reminders";
const PRESET_TIMES = ["06:00", "08:00", "12:00", "14:00", "18:00", "20:00", "22:00"];

export default function ReminderScreen() {
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [adding, setAdding] = useState(false);
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v) setReminders(JSON.parse(v));
    });
  }, []);

  const save = async (data: Reminder[]) => {
    setReminders(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addReminder = async () => {
    if (!medicine.trim()) return;
    const r: Reminder = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      medicine: medicine.trim(),
      dosage: dosage.trim() || "As prescribed",
      times: selectedTimes.length > 0 ? selectedTimes : ["08:00"],
      notes: notes.trim(),
      active: true,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await save([...reminders, r]);
    setAdding(false);
    setMedicine("");
    setDosage("");
    setSelectedTimes([]);
    setNotes("");
  };

  const toggleActive = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await save(reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  const deleteReminder = (id: string) => {
    Alert.alert("Delete Reminder", "Remove this prescription reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await save(reminders.filter((r) => r.id !== id));
        },
      },
    ]);
  };

  const toggleTime = (t: string) => {
    setSelectedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Rx Reminder</Text>
        <Pressable onPress={() => setAdding(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.teal} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {adding && (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>New Reminder</Text>

            <Text style={styles.fieldLabel}>Medicine Name *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="medical" size={16} color={Colors.teal} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={medicine}
                onChangeText={setMedicine}
                placeholder="e.g. Metformin 500mg"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <Text style={styles.fieldLabel}>Dosage</Text>
            <View style={styles.inputRow}>
              <Ionicons name="eyedrop-outline" size={16} color={Colors.teal} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 1 tablet with water"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <Text style={styles.fieldLabel}>Reminder Times</Text>
            <View style={styles.timesGrid}>
              {PRESET_TIMES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => toggleTime(t)}
                  style={[styles.timeChip, selectedTimes.includes(t) && styles.timeChipActive]}
                >
                  <Text style={[styles.timeChipText, selectedTimes.includes(t) && styles.timeChipTextActive]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="document-text-outline" size={16} color={Colors.teal} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Take with food..."
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <View style={styles.addActionsRow}>
              <Pressable
                onPress={() => { setAdding(false); setMedicine(""); setDosage(""); setSelectedTimes([]); setNotes(""); }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={addReminder}
                disabled={!medicine.trim()}
                style={[styles.saveBtn, !medicine.trim() && { opacity: 0.5 }]}
              >
                <Text style={styles.saveBtnText}>Save Reminder</Text>
              </Pressable>
            </View>
          </View>
        )}

        {!adding && (
          <LinearGradient colors={["#E74C3C", "#C0392B"]} style={styles.heroBanner}>
            <Ionicons name="alarm" size={36} color="#fff" />
            <Text style={styles.heroTitle}>Prescription Reminders</Text>
            <Text style={styles.heroDesc}>Never miss a dose again</Text>
          </LinearGradient>
        )}

        {reminders.length === 0 && !adding ? (
          <View style={styles.emptyState}>
            <Ionicons name="alarm-outline" size={56} color={Colors.border} />
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyDesc}>Tap the + button to add a prescription reminder</Text>
            <Pressable onPress={() => setAdding(true)} style={styles.addFirstBtn}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addFirstBtnText}>Add Reminder</Text>
            </Pressable>
          </View>
        ) : (
          reminders.map((r) => (
            <View key={r.id} style={[styles.reminderCard, !r.active && styles.reminderCardInactive]}>
              <View style={[styles.reminderIconBg, !r.active && styles.reminderIconBgInactive]}>
                <Ionicons name="medical" size={22} color={r.active ? "#E74C3C" : Colors.textSecondary} />
              </View>
              <View style={styles.reminderContent}>
                <Text style={[styles.reminderName, !r.active && styles.reminderNameInactive]}>{r.medicine}</Text>
                <Text style={styles.reminderDosage}>{r.dosage}</Text>
                <View style={styles.timesRow}>
                  {r.times.map((t) => (
                    <View key={t} style={styles.timePill}>
                      <Ionicons name="time-outline" size={11} color={Colors.teal} />
                      <Text style={styles.timePillText}>{t}</Text>
                    </View>
                  ))}
                </View>
                {!!r.notes && <Text style={styles.reminderNotes}>{r.notes}</Text>}
              </View>
              <View style={styles.reminderActions}>
                <Pressable onPress={() => toggleActive(r.id)} style={styles.actionBtn}>
                  <Ionicons
                    name={r.active ? "pause-circle-outline" : "play-circle-outline"}
                    size={22}
                    color={r.active ? Colors.warning : Colors.success}
                  />
                </Pressable>
                <Pressable onPress={() => deleteReminder(r.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                </Pressable>
              </View>
            </View>
          ))
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
  addBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 60 },
  heroBanner: { borderRadius: 18, padding: 24, alignItems: "center", gap: 8, marginBottom: 20 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
  heroDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  addCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  addTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.textPrimary, marginBottom: 16 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.offWhite, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 12,
  },
  input: { flex: 1, height: 44, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary },
  timesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite,
  },
  timeChipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  timeChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  timeChipTextActive: { color: "#fff" },
  addActionsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.border,
  },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary },
  saveBtn: {
    flex: 2, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: "#E74C3C",
  },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.textPrimary },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  addFirstBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E74C3C", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
  },
  addFirstBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  reminderCard: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginBottom: 12, gap: 12, alignItems: "flex-start",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  reminderCardInactive: { opacity: 0.6 },
  reminderIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#FBEAEA", alignItems: "center", justifyContent: "center" },
  reminderIconBgInactive: { backgroundColor: Colors.offWhite },
  reminderContent: { flex: 1 },
  reminderName: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textPrimary },
  reminderNameInactive: { color: Colors.textSecondary },
  reminderDosage: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  timesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  timePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.tealPale,
  },
  timePillText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.teal },
  reminderNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontStyle: "italic" },
  reminderActions: { gap: 4 },
  actionBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
