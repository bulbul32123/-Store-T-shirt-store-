"use client";

export default function SupportBtn({ text }) {
  const handleOpenChat = () => {
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
