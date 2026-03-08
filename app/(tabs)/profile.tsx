import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/auth";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  const [age, setAge] = useState(user?.age || "");
  const [height, setHeight] = useState(user?.height || "");
  const [weight, setWeight] = useState(user?.weight || "");
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || "");
  const [conditions, setConditions] = useState(user?.conditions || "");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ age, height, weight, bloodGroup, conditions });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const bmi =
    user?.height && user?.weight
      ? (
          parseFloat(user.weight) /
          Math.pow(parseFloat(user.height) / 100, 2)
        ).toFixed(1)
      : null;

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: Colors.warning };
    if (bmi < 25) return { label: "Normal", color: Colors.success };
    if (bmi < 30) return { label: "Overweight", color: Colors.warning };
    return { label: "Obese", color: Colors.danger };
  };

  return (
    <View style={[styles.root, { paddingBottom: bottomPad }]}>
      <LinearGradient
        colors={["#0A7B8E", "#0D95AC"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            onPress={() => (editing ? handleSave() : setEditing(true))}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={editing ? (saving ? "hourglass-outline" : "checkmark") : "create-outline"}
              size={20}
              color={Colors.teal}
            />
          </Pressable>
        </View>

        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {bmi && (
          <View style={styles.bmiCard}>
            <View style={styles.bmiLeft}>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={styles.bmiLabel}>BMI</Text>
            </View>
            <View style={styles.bmiRight}>
              <View style={[styles.bmiStatus, { backgroundColor: getBmiStatus(parseFloat(bmi)).color + "20" }]}>
                <Text style={[styles.bmiStatusText, { color: getBmiStatus(parseFloat(bmi)).color }]}>
                  {getBmiStatus(parseFloat(bmi)).label}
                </Text>
              </View>
              <Text style={styles.bmiDesc}>
                {user?.height}cm · {user?.weight}kg
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>

          {[
            { label: "Age", value: age, setter: setAge, placeholder: "Years", kbd: "numeric", icon: "calendar-outline" },
            { label: "Height (cm)", value: height, setter: setHeight, placeholder: "e.g. 170", kbd: "decimal-pad", icon: "resize-outline" },
            { label: "Weight (kg)", value: weight, setter: setWeight, placeholder: "e.g. 65", kbd: "decimal-pad", icon: "barbell-outline" },
          ].map((field) => (
            <View style={styles.fieldRow} key={field.label}>
              <View style={styles.fieldIcon}>
                <Ionicons name={field.icon as any} size={18} color={Colors.teal} />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType={field.kbd as any}
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {field.value || "Not set"}
                  </Text>
                )}
              </View>
            </View>
          ))}

          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <Ionicons name="water-outline" size={18} color={Colors.teal} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Blood Group</Text>
              {editing ? (
                <View style={styles.bloodGroupRow}>
                  {BLOOD_GROUPS.map((bg) => (
                    <Pressable
                      key={bg}
                      onPress={() => setBloodGroup(bg)}
                      style={[
                        styles.bgChip,
                        bloodGroup === bg && styles.bgChipActive,
                      ]}
                    >
                      <Text style={[styles.bgChipText, bloodGroup === bg && styles.bgChipTextActive]}>
                        {bg}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.fieldValue}>{bloodGroup || "Not set"}</Text>
              )}
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldIcon}>
              <Ionicons name="medkit-outline" size={18} color={Colors.teal} />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Medical Conditions</Text>
              {editing ? (
                <TextInput
                  style={[styles.fieldInput, styles.textArea]}
                  value={conditions}
                  onChangeText={setConditions}
                  placeholder="Diabetes, hypertension..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>{conditions || "None noted"}</Text>
              )}
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.75 }]}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offWhite },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: "#fff" },
  editBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#fff" },
  userName: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  content: { padding: 20, paddingBottom: 120 },
  bmiCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  bmiLeft: { alignItems: "center" },
  bmiValue: { fontFamily: "Inter_700Bold", fontSize: 36, color: Colors.teal },
  bmiLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  bmiRight: { flex: 1, gap: 6 },
  bmiStatus: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bmiStatusText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bmiDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.textSecondary,
    padding: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  fieldIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.tealPale, alignItems: "center", justifyContent: "center", marginTop: 2 },
  fieldContent: { flex: 1 },
  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  fieldValue: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textPrimary },
  fieldInput: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.teal,
    paddingBottom: 4,
    paddingTop: 0,
  },
  textArea: { height: 60, textAlignVertical: "top" },
  bloodGroupRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  bgChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  bgChipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  bgChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  bgChipTextActive: { color: "#fff" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.danger },
});
