import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRef, useEffect } from "react";

export default function LinkAccountModal({ visible, onClose, onSuccess }: any) {
  const MONO_PUBLIC_KEY = "test_pk_tl7dpn4m0a4nrrlolcbk"; // Sandbox key
  const widgetUrl = `https://connect.mono.co/?key=${MONO_PUBLIC_KEY}&scope=auth,transactions&environment=sandbox`;

  const webViewRef = useRef<any>(null);

  // Function to handle messages from Mono
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "mono.connect.success") {
        const code = data.code;
        onSuccess(code);
      } else if (data.type === "mono.connect.closed") {
        onClose();
      }
    } catch (err) {
      console.warn("Invalid message from WebView:", event.nativeEvent.data);
    }
  };

  // Inject JavaScript to enable postMessage from Mono
  const injectedJS = `
    window.addEventListener("message", function(event) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });
    true; // Required
  `;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Modal visible={visible} animationType="slide">
        <WebView
          ref={webViewRef}
          source={{ uri: widgetUrl }}
          onMessage={handleMessage}
          injectedJavaScript={injectedJS}
          javaScriptEnabled
          originWhitelist={["*"]}
        />
      </Modal>
    </SafeAreaView>
  );
}
