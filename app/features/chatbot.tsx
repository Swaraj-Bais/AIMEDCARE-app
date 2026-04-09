import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import Colors from "@/constants/colors";

const BOTPRESS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #F5FAFB;
    }

    #bp-web-widget-container {
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }

    .bpw-floating-button {
      display: none !important;
    }
  </style>
</head>

<body>
  <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>

  <script>
    window.botpress.init({
      botId: "8909d6ed-4139-4433-9a36-9393385f9abd",
      clientId: "adfee9fe-f10b-4cdd-adc1-a8e20390ed4d",

      configuration: {
        version: "v2",
        botName: "AIMEDCARE",
        themeMode: "light",
        color: "#199ff7",
        variant: "solid",
        headerVariant: "glass",
        fontFamily: "inter",
        radius: 4,
        soundEnabled: true,
        feedbackEnabled: true,
        proactiveMessageEnabled: false,
        footer: "⚡AIMEDCARE",
        additionalStylesheetUrl: "https://files.bpcontent.cloud/2025/12/08/13/20251208133457-VQ8L3GRE.css",

        stylesheet: \`
          .bpw-header {
            backdrop-filter: blur(10px);
          }
        \`
      }
    });

    // Auto open chatbot
    function tryOpen() {
      if (window.botpress && window.botpress.open) {
        window.botpress.open();
        clearInterval(openInterval);
      }
    }

    var openInterval = setInterval(tryOpen, 300);
    setTimeout(() => clearInterval(openInterval), 10000);
  </script>
</body>
</html>
`;

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>AI Healthcare Chat</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ flex: 1 }}>
          <iframe
            src="https://cdn.botpress.cloud/webchat/v3.6/shareable.html?botId=YOUR_BOT_ID&clientId=YOUR_CLIENT_ID"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Chatbot"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Healthcare Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={styles.loadingText}>Loading chatbot...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.errorTitle}>Connection Required</Text>
          <Text style={styles.errorDesc}>
            The AI chatbot requires an internet connection.
          </Text>
          <Pressable
            onPress={() => {
              setError(false);
              setLoading(true);
              webviewRef.current?.reload();
            }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webviewRef}
          source={{ html: BOTPRESS_HTML }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          mixedContentMode="always"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "#fff",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: Colors.textPrimary,
  },

  webview: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F5FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },

  loadingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },

  errorTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.textPrimary,
  },

  errorDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  retryBtn: {
    backgroundColor: Colors.teal,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },

  retryText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#fff",
  },
});