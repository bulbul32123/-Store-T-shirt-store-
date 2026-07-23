import ChatWidget from "@/components/chat/ChatWidget";
import AppLayer from "@/components/layout/AppLayer";

export default function HomeLayout({ children }) {
  return (
    <AppLayer>
      {children}
      <ChatWidget />
    </AppLayer>
  );
}
