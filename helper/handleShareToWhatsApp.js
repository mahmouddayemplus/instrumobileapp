  import { Linking } from "react-native";

  export const handleShareToWhatsApp = (item) => {
    const message = `Check out this spare part:\n\nCode: ${item.code}\nTitle: ${item.title}\n`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .then(() => console.log("WhatsApp opened"))
      .catch(() => {
        alert("WhatsApp not installed on your device");
      });
  };