import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRef } from "react";

export default function LinkAccountModal({ visible, onClose, onSuccess }: any) {
  const MONO_PUBLIC_KEY = "test_pk_tl7dpn4m0a4nrrlolcbk"; // Sandbox key
  const widgetUrl = `https://connect.mono.co/?key=${MONO_PUBLIC_KEY}&scope=auth,transactions&environment=sandbox`;

  const webViewRef = useRef<any>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Received message from WebView:", data);

      if (data.type === "mono.connect.success") {
        const code = data.code;
        console.log("Mono connect success, code:", code);
        if (!code) {
          console.warn("No code received from Mono connect");
          return;
        }
        onSuccess(code); // call API to exchange code
        onClose(); // close modal immediately
      } else if (data.type === "mono.connect.closed") {
        onClose(); // close modal if user cancels
      }
    } catch (err) {
      console.warn("Invalid message from WebView:", event.nativeEvent.data);
    }
  };

  const injectedJS = `
    document.addEventListener("message", function(event) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });
    true;
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          source={{ uri: widgetUrl }}
          onMessage={handleMessage}
          injectedJavaScript={injectedJS}
          javaScriptEnabled
          originWhitelist={["*"]}
        />
      </SafeAreaView>
    </Modal>
  );
}
