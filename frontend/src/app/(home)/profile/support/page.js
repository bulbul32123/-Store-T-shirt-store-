"use client";

import {
  MessageSquare,
  Clock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    question: "How long does it take to get a reply?",
    answer:
      "Our support team is active daily. For live chat, we typically reply within a few minutes. If we are offline, your message will be saved, and you will receive a notification as soon as we reply.",
  },
  {
    question: "Can I track my order here?",
    answer:
      "Yes! You can view all live updates, tracking details, and order history directly in your Orders tab. If you still have questions, feel free to open a support chat.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 14-day return policy on most items. Products must be unused and in their original packaging. Please message support to initiate a return request.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const handleOpenChat = () => {
    // Dispatches the global event that your ChatWidget listens to
    window.dispatchEvent(
      new CustomEvent("open-support-chat", {
        detail: { chatId: null },
      }),
    );
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header section */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-[#111] mb-2">
          Customer Support
        </h1>
        <p className="text-sm text-[#6F6F6F] max-w-md mx-auto">
          Have a question about an order, delivery, or product? We are here to
          help you 24/7.
        </p>
      </div>

      {/* Trust Badges / How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="flex flex-col items-center text-center p-5 bg-white border border-[#E5E5E5] rounded-xl">
          <MessageSquare className="text-[#FF5A1F] mb-3" size={24} />
          <h3 className="text-sm font-bold text-[#111] mb-1">
            Live Chat Support
          </h3>
          <p className="text-xs text-[#6F6F6F]">
            Direct, real-time messaging with our helpful human agents.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-5 bg-white border border-[#E5E5E5] rounded-xl">
          <Clock className="text-[#FF5A1F] mb-3" size={24} />
          <h3 className="text-sm font-bold text-[#111] mb-1">Fast Response</h3>
          <p className="text-xs text-[#6F6F6F]">
            We aim to reply to all active chats in under 10 minutes.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-5 bg-white border border-[#E5E5E5] rounded-xl">
          <ShieldCheck className="text-[#FF5A1F] mb-3" size={24} />
          <h3 className="text-sm font-bold text-[#111] mb-1">
            Secure & Private
          </h3>
          <p className="text-xs text-[#6F6F6F]">
            Your account security and personal details are always protected.
          </p>
        </div>
      </div>

      {/* Call to Action to open Chatbox */}
      <div className="bg-[#FF5A1F]/5 border border-[#FF5A1F]/20 rounded-2xl p-8 text-center mb-12">
        <h2 className="text-lg font-bold text-[#111] mb-2">
          Need immediate assistance?
        </h2>
        <p className="text-sm text-[#6F6F6F] mb-6 max-w-md mx-auto">
          Click the button below to open your secure personal chat window and
          start a conversation with our support team.
        </p>
        <button
          type="button"
          onClick={handleOpenChat}
          className="inline-flex items-center gap-2 bg-[#111] text-white hover:bg-[#FF5A1F] text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-sm"
        >
          <MessageSquare size={16} />
          Start Live Chat
        </button>
      </div>

      {/* FAQ Accordion Section */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-tight text-[#111] mb-6 flex items-center gap-2">
          <HelpCircle size={20} className="text-[#6F6F6F]" /> Frequently Asked
          Questions
        </h2>
        <div className="divide-y divide-[#E5E5E5] border-t border-b border-[#E5E5E5]">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-[#111] hover:text-[#FF5A1F] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#6F6F6F] transform transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-2"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-[#6F6F6F] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
