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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #F5FAFB; }
    #bp-web-widget-container {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 9999 !important;
    }
    .bpw-widget-btn { display: none !important; }
    .bpw-floating-button { display: none !important; }
  </style>
</head>
<body>
  <script src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"></script>
  <script src="https://files.bpcontent.cloud/2026/03/08/08/20260308080044-UVZ9TSBA.js" defer></script>
  <script>
    function tryOpen() {
      if (window.botpress && window.botpress.open) {
        window.botpress.open();
        clearInterval(openInterval);
      }
    }
    var openInterval = setInterval(tryOpen, 300);
    setTimeout(function() { clearInterval(openInterval); }, 10000);
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
        <View style={styles.webContainer}>
          <iframe
            src="https://cdn.botpress.cloud/webchat/v3.6/shareable.html?configUrl=https://files.bpcontent.cloud/2026/03/08/08/20260308080044-UVZ9TSBA.js"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="AI Healthcare Chat"
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
            onPress={() => { setError(false); setLoading(true); webviewRef.current?.reload(); }}
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
          onError={() => { setError(true); setLoading(false); }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          originWhitelist={["*"]}
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: Colors.textPrimary },
  webview: { flex: 1 },
  webContainer: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F5FAFB",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  errorTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.textPrimary },
  errorDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  retryBtn: {
    backgroundColor: Colors.teal, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, marginTop: 8,
  },
  retryText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});
