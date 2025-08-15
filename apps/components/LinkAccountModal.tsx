import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function LinkAccountModal({ visible, onClose, onSuccess }: any) {
  const MONO_PUBLIC_KEY = "test_pk_rqui347hfbx0rswd5z1u";
  const widgetUrl = `https://connect.mono.co/?key=${MONO_PUBLIC_KEY}&scope=auth,transactions`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Modal visible={visible} animationType="slide" className="mt-8">
        <WebView
          source={{ uri: widgetUrl }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes("code=")) {
              const code = navState.url.split("code=")[1];
              onSuccess(code);
              onClose();
            }
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}
