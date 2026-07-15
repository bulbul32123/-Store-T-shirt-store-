"use client";

export default function SupportBtn({ text }) {
  const handleOpenChat = () => {
    // Dispatches the global event that your ChatWidget listens to
    window.dispatchEvent(
      new CustomEvent("open-support-chat", {
        detail: { chatId: null },
      }),
    );
  };
  return (
    <button className="underline px-1" onClick={() => handleOpenChat()}>
      {text}
    </button>
  );
}
