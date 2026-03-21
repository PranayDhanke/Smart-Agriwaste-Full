"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import {
  Bot,
  ChevronRight,
  X,
  ListPlus,
  Recycle,
  Store,
  UserCircle,
  PhoneCall,
  Send,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type SupportedLocale = "en" | "hi" | "mr";

type ChatbotQuestion = {
  id: string;
  title: string;
  emoji: string;
  question: string;
  summary: string;
  steps: string[];
  linkLabel: string;
  linkHref: string;
};

type ChatbotCopy = {
  launcher: string;
  title: string;
  subtitle: string;
  greeting: string;
  promptText: string;
  questionsTitle: string;
  callSupportLabel: string;
  backLabel: string;
  doneLabel: string;
  questions: ChatbotQuestion[];
};

const chatbotContent: Record<SupportedLocale, ChatbotCopy> = {
  en: {
    launcher: "Help",
    title: "Agri Assistant",
    subtitle: "Online · Ready to help",
    greeting: "👋 Hello! I'm here to help you. What would you like to do today?",
    promptText: "Choose an option below 👇",
    questionsTitle: "Choose an option:",
    callSupportLabel: "📞  Call Support Helpline",
    backLabel: "← Back",
    doneLabel: "Done",
    questions: [
      {
        id: "list-waste",
        emoji: "🌾",
        title: "List My Waste",
        question: "How do I list my agricultural waste?",
        summary: "Here's how to list your waste in easy steps:",
        steps: [
          "Open the List Waste page.",
          "Select the waste type and product.",
          "Add quantity, price, and clear photos.",
          "Submit the form.",
        ],
        linkLabel: "Go to List Waste →",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        emoji: "♻️",
        title: "Find a Process",
        question: "How do I find the right waste management process?",
        summary: "Follow these steps to find the right process:",
        steps: [
          "Open the Process page.",
          "Choose your waste type.",
          "Select your goal (compost, sell, etc.).",
          "View your custom process steps.",
        ],
        linkLabel: "Go to Process Page →",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        emoji: "🛒",
        title: "Sell in Marketplace",
        question: "How do I sell waste through the marketplace?",
        summary: "Selling is easy! Here's what to do:",
        steps: [
          "List your waste with a price.",
          "Respond to buyer requests.",
          "Track your sales from the dashboard.",
        ],
        linkLabel: "Open Marketplace →",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        emoji: "👤",
        title: "Create Account",
        question: "How do I create an account?",
        summary: "Get started with a new account:",
        steps: [
          "Open the sign-up page.",
          "Choose 'Farmer' or 'Buyer'.",
          "Fill in your details.",
          "Save your profile.",
        ],
        linkLabel: "Create Account →",
        linkHref: "/create-account",
      },
    ],
  },
  hi: {
    launcher: "मदद",
    title: "एग्री असिस्टेंट",
    subtitle: "ऑनलाइन · मदद के लिए तैयार",
    greeting: "👋 नमस्ते! मैं आपकी मदद के लिए यहाँ हूँ। आज आप क्या करना चाहते हैं?",
    promptText: "नीचे से कोई विकल्प चुनें 👇",
    questionsTitle: "एक विकल्प चुनें:",
    callSupportLabel: "📞 हेल्पलाइन पर कॉल करें",
    backLabel: "← वापस",
    doneLabel: "हो गया",
    questions: [
      {
        id: "list-waste",
        emoji: "🌾",
        title: "कचरा दर्ज करें",
        question: "मैं अपना कृषि अपशिष्ट कैसे सूचीबद्ध करूं?",
        summary: "अपना कचरा लिस्ट करने के आसान तरीके:",
        steps: [
          "List Waste पेज खोलें।",
          "अपशिष्ट का प्रकार चुनें।",
          "मात्रा, मूल्य और फोटो जोड़ें।",
          "फॉर्म जमा करें।",
        ],
        linkLabel: "List Waste खोलें →",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        emoji: "♻️",
        title: "प्रक्रिया खोजें",
        question: "सही प्रक्रिया कैसे खोजूं?",
        summary: "सही प्रक्रिया पाने के चरण:",
        steps: [
          "Process पेज खोलें।",
          "कचरे का प्रकार चुनें।",
          "अपना लक्ष्य चुनें।",
          "सुझाए गए चरण देखें।",
        ],
        linkLabel: "Process पेज खोलें →",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        emoji: "🛒",
        title: "बाजार में बेचें",
        question: "मैं मार्केटप्लेस में कैसे बेचूं?",
        summary: "बेचना आसान है! यह करें:",
        steps: [
          "मूल्य के साथ कचरा सूचीबद्ध करें।",
          "खरीदारों के सवालों का जवाब दें।",
          "डैशबोर्ड से बिक्री ट्रैक करें।",
        ],
        linkLabel: "Marketplace खोलें →",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        emoji: "👤",
        title: "खाता बनाएं",
        question: "अकाउंट कैसे बनाएं?",
        summary: "नया खाता बनाने के चरण:",
        steps: [
          "साइन-अप पेज खोलें।",
          "'Farmer' या 'Buyer' चुनें।",
          "अपनी जानकारी भरें।",
          "प्रोफाइल सेव करें।",
        ],
        linkLabel: "खाता बनाएं →",
        linkHref: "/create-account",
      },
    ],
  },
  mr: {
    launcher: "मदत",
    title: "अॅग्री असिस्टंट",
    subtitle: "ऑनलाइन · मदतीसाठी तयार",
    greeting: "👋 नमस्कार! मी तुमच्या मदतीसाठी इथे आहे. आज तुम्हाला काय करायचे आहे?",
    promptText: "खाली एक पर्याय निवडा 👇",
    questionsTitle: "एक पर्याय निवडा:",
    callSupportLabel: "📞 हेल्पलाइनला कॉल करा",
    backLabel: "← मागे",
    doneLabel: "झाले",
    questions: [
      {
        id: "list-waste",
        emoji: "🌾",
        title: "कचरा नोंदवा",
        question: "मी माझा कृषी कचरा कसा लिस्ट करू?",
        summary: "कचरा लिस्ट करण्याचे सोपे मार्ग:",
        steps: [
          "List Waste पेज उघडा.",
          "कचऱ्याचा प्रकार निवडा.",
          "प्रमाण, किंमत आणि फोटो जोडा.",
          "फॉर्म सबमिट करा.",
        ],
        linkLabel: "List Waste उघडा →",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        emoji: "♻️",
        title: "प्रक्रिया शोधा",
        question: "योग्य प्रक्रिया कशी शोधू?",
        summary: "योग्य प्रक्रिया मिळवण्यासाठी:",
        steps: [
          "Process पेज उघडा.",
          "कचऱ्याचा प्रकार निवडा.",
          "तुमचे ध्येय निवडा.",
          "प्रक्रियेच्या पायऱ्या पहा.",
        ],
        linkLabel: "Process पेज उघडा →",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        emoji: "🛒",
        title: "बाजारात विका",
        question: "मी मार्केटप्लेसमधून कसे विकू?",
        summary: "विकणे सोपे आहे! हे करा:",
        steps: [
          "किमतीसह कचरा लिस्ट करा.",
          "खरेदीदारांना उत्तर द्या.",
          "तुमच्या विक्रीचा मागोवा घ्या.",
        ],
        linkLabel: "Marketplace उघडा →",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        emoji: "👤",
        title: "खाते तयार करा",
        question: "अकाउंट कसे तयार करायचे?",
        summary: "नवीन खाते तयार करण्यासाठी:",
        steps: [
          "साइन-अप पेज उघडा.",
          "'Farmer' किंवा 'Buyer' निवडा.",
          "तुमची माहिती भरा.",
          "प्रोफाइल सेव्ह करा.",
        ],
        linkLabel: "खाते तयार करा →",
        linkHref: "/create-account",
      },
    ],
  },
};

// Chat message types
type Message =
  | { type: "bot-greeting" }
  | { type: "bot-prompt" }
  | { type: "user-choice"; questionId: string; title: string; emoji: string }
  | { type: "bot-steps"; questionId: string }
  | { type: "bot-link"; questionId: string };

export default function HelpChatbot() {
  const locale = useLocale() as SupportedLocale;
  const copy = chatbotContent[locale] ?? chatbotContent.en;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot-greeting" },
    { type: "bot-prompt" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSelectQuestion = (question: ChatbotQuestion) => {
    if (selectedId) return; // Already selected
    setSelectedId(question.id);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user-choice",
        questionId: question.id,
        title: question.title,
        emoji: question.emoji,
      },
    ]);

    // Bot "typing" then responds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { type: "bot-steps", questionId: question.id },
        { type: "bot-link", questionId: question.id },
      ]);
    }, 1200);
  };

  const handleReset = () => {
    setSelectedId(null);
    setMessages([{ type: "bot-greeting" }, { type: "bot-prompt" }]);
  };

  const getQuestion = (id: string) => copy.questions.find((q) => q.id === id)!;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-4 z-[120] w-[calc(100vw-2rem)] max-w-[370px] sm:left-5">
          <div
            className="flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ height: "520px", border: "1.5px solid #d1fae5" }}
          >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 bg-green-700 px-4 py-3 text-white">
              {/* Avatar */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-6 w-6 text-white" />
                {/* Green "online" dot */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-green-700 bg-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold leading-tight">{copy.title}</p>
                <p className="text-xs text-green-200">{copy.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Chat Body ── */}
            <div
              className="flex-1 overflow-y-auto bg-[#f0fdf4] px-3 py-4"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #bbf7d0 1px, transparent 0)", backgroundSize: "24px 24px" }}
            >
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => {
                  /* BOT GREETING */
                  if (msg.type === "bot-greeting") {
                    return (
                      <BotBubble key={i}>
                        <p className="text-sm leading-relaxed text-slate-800">{copy.greeting}</p>
                      </BotBubble>
                    );
                  }

                  /* BOT PROMPT — show quick-reply option cards */
                  if (msg.type === "bot-prompt") {
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <BotBubble>
                          <p className="text-sm text-slate-700">{copy.promptText}</p>
                        </BotBubble>

                        {/* Option chips — only show if nothing selected yet */}
                        {!selectedId && (
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {copy.questions.map((q) => (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => handleSelectQuestion(q)}
                                className="flex flex-col items-center gap-1 rounded-2xl border-2 border-green-200 bg-white px-3 py-4 text-center shadow-sm transition-all active:scale-95 hover:border-green-500 hover:bg-green-50"
                              >
                                <span className="text-3xl">{q.emoji}</span>
                                <span className="text-sm font-bold leading-tight text-slate-700">{q.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  /* USER CHOICE bubble */
                  if (msg.type === "user-choice") {
                    return (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-green-600 px-4 py-2.5 text-white shadow-sm">
                          <span className="mr-2 text-lg">{msg.emoji}</span>
                          <span className="text-sm font-semibold">{msg.title}</span>
                        </div>
                      </div>
                    );
                  }

                  /* BOT STEPS */
                  if (msg.type === "bot-steps") {
                    const q = getQuestion(msg.questionId);
                    return (
                      <BotBubble key={i}>
                        <p className="mb-2 text-sm font-semibold text-slate-700">{q.summary}</p>
                        <ol className="space-y-2">
                          {q.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                {si + 1}
                              </span>
                              <span className="text-sm text-slate-700">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </BotBubble>
                    );
                  }

                  /* BOT LINK — CTA */
                  if (msg.type === "bot-link") {
                    const q = getQuestion(msg.questionId);
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <BotBubble>
                          <p className="text-sm text-slate-700">Tap the button below to get started! 👇</p>
                        </BotBubble>

                        <Link
                          href={q.linkHref}
                          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all hover:bg-green-700 active:scale-[0.97]"
                        >
                          {q.linkLabel}
                        </Link>

                        {/* Ask another question */}
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-1 text-center text-xs font-medium text-green-700 underline underline-offset-2 hover:text-green-900"
                        >
                          {copy.backLabel}
                        </button>
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <BotBubble>
                    <div className="flex items-center gap-1.5 py-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-green-500"
                          style={{
                            animation: "bounce 1.2s infinite",
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </BotBubble>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* ── Footer: Call support ── */}
            <div className="border-t border-green-100 bg-white px-3 py-2.5">
              <button
                type="button"
                onClick={() => (window.location.href = "tel:+918329123649")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <PhoneCall className="h-4 w-4 text-green-600" />
                {copy.callSupportLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Launcher Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-8 left-4 z-[110] flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 font-bold text-white shadow-2xl transition-all duration-300 hover:bg-green-700 sm:left-8",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open help assistant"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 opacity-40" style={{ animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }} />
        <Bot className="h-5 w-5" />
        <span className="text-base">{copy.launcher}</span>
      </button>

      {/* Bounce animation for typing dots */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </>
  );
}

/* ── Helper: Bot chat bubble ── */
function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      {/* Mini bot avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 shadow-sm">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
        {children}
      </div>
    </div>
  );
}