"use client";

import { useMemo, useState } from "react";
import { 
  Bot, 
  ChevronRight, 
  MessageCircleQuestion, 
  Sprout, 
  X, 
  ListPlus, 
  Recycle, 
  Store, 
  UserCircle,
  PhoneCall,
  ChevronDown
} from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type SupportedLocale = "en" | "hi" | "mr";

type ChatbotQuestion = {
  id: string;
  title: string;
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
  helperLabel: string;
  helperTitle: string;
  helperText: string;
  questionsTitle: string;
  callSupportLabel: string;
  questions: ChatbotQuestion[];
};

const chatbotContent: Record<SupportedLocale, ChatbotCopy> = {
  en: {
    launcher: "Open help assistant",
    title: "Agri Help Assistant",
    subtitle: "Simple guidance for your tasks.",
    helperLabel: "Need Help?",
    helperTitle: "What do you want to do?",
    helperText: "Tap on any option below to see easy steps.",
    questionsTitle: "Choose an option:",
    callSupportLabel: "Call Support Helpline",
    questions: [
      {
        id: "list-waste",
        title: "List My Waste",
        question: "How do I list my agricultural waste?",
        summary: "Create a farmer profile, open the list waste page, and submit complete waste details.",
        steps: [
          "Open the List Waste page.",
          "Select the waste type and product.",
          "Add quantity, price, and clear photos.",
          "Submit the form."
        ],
        linkLabel: "Go to List Waste",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        title: "Find Process",
        question: "How can I find the right waste management process?",
        summary: "Use the process page to choose your waste details and get a guided treatment plan.",
        steps: [
          "Open the Process page.",
          "Choose your waste type.",
          "Select your goal (compost, sell, etc.).",
          "View your custom process steps."
        ],
        linkLabel: "Go to Process Page",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        title: "Sell in Market",
        question: "How do I sell waste through the marketplace?",
        summary: "Publish a clear listing, monitor buyer interest, and manage orders from your profile.",
        steps: [
          "List your waste with a price.",
          "Respond to buyer requests.",
          "Track your sales from the dashboard."
        ],
        linkLabel: "Open Marketplace",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        title: "Create Account",
        question: "How do I create an account before using these features?",
        summary: "Sign up first, then choose the right account type for your role in the app.",
        steps: [
          "Open the sign-up page.",
          "Choose 'Farmer' or 'Buyer'.",
          "Fill in your details.",
          "Save your profile."
        ],
        linkLabel: "Create Account",
        linkHref: "/create-account",
      },
    ],
  },
  hi: {
    launcher: "सहायता सहायक खोलें",
    title: "एग्री हेल्प असिस्टेंट",
    subtitle: "आपके काम के लिए आसान मार्गदर्शन।",
    helperLabel: "मदद चाहिए?",
    helperTitle: "आप क्या करना चाहते हैं?",
    helperText: "आसान चरण देखने के लिए नीचे दिए गए किसी भी विकल्प पर टैप करें।",
    questionsTitle: "एक विकल्प चुनें:",
    callSupportLabel: "हेल्पलाइन पर कॉल करें",
    questions: [
      {
        id: "list-waste",
        title: "कचरा दर्ज करें",
        question: "मैं अपना कृषि अपशिष्ट कैसे सूचीबद्ध करूं?",
        summary: "किसान प्रोफाइल पूरा करें, लिस्ट वेस्ट पेज खोलें और पूरी जानकारी भरें।",
        steps: [
          "List Waste पेज खोलें।",
          "अपशिष्ट का प्रकार चुनें।",
          "मात्रा, मूल्य और फोटो जोड़ें।",
          "फॉर्म जमा करें।"
        ],
        linkLabel: "List Waste खोलें",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        title: "प्रक्रिया खोजें",
        question: "मैं सही अपशिष्ट प्रबंधन प्रक्रिया कैसे खोजूं?",
        summary: "प्रोसेस पेज पर अपशिष्ट जानकारी भरें और सही प्रक्रिया सुझाव पाएं।",
        steps: [
          "Process पेज खोलें।",
          "कचरे का प्रकार चुनें।",
          "अपना लक्ष्य चुनें (खाद, बेचना आदि)।",
          "सुझाए गए चरण देखें।"
        ],
        linkLabel: "Process पेज खोलें",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        title: "बाजार में बेचें",
        question: "मैं मार्केटप्लेस में अपशिष्ट कैसे बेचूं?",
        summary: "अच्छी लिस्टिंग बनाएं, खरीदारों की रुचि देखें और ऑर्डर संभालें।",
        steps: [
          "मूल्य के साथ कचरा सूचीबद्ध करें।",
          "खरीदारों के सवालों का जवाब दें।",
          "डैशबोर्ड से अपनी बिक्री ट्रैक करें।"
        ],
        linkLabel: "Marketplace खोलें",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        title: "खाता बनाएं",
        question: "इन फीचर्स को उपयोग करने से पहले अकाउंट कैसे बनाएं?",
        summary: "पहले साइन अप करें, फिर अपनी भूमिका के अनुसार सही अकाउंट चुनें।",
        steps: [
          "साइन-अप पेज खोलें।",
          "'Farmer' या 'Buyer' चुनें।",
          "अपनी जानकारी भरें।",
          "प्रोफाइल सेव करें।"
        ],
        linkLabel: "खाता बनाएं",
        linkHref: "/create-account",
      },
    ],
  },
  mr: {
    launcher: "मदत सहाय्यक उघडा",
    title: "अॅग्री हेल्प असिस्टंट",
    subtitle: "तुमच्या कामासाठी सोपे मार्गदर्शन.",
    helperLabel: "मदत हवी आहे?",
    helperTitle: "तुम्हाला काय करायचे आहे?",
    helperText: "सोप्या पायऱ्या पाहण्यासाठी खालील कोणत्याही पर्यायावर टॅप करा.",
    questionsTitle: "एक पर्याय निवडा:",
    callSupportLabel: "हेल्पलाइनला कॉल करा",
    questions: [
      {
        id: "list-waste",
        title: "कचरा नोंदवा",
        question: "मी माझा कृषी कचरा कसा लिस्ट करू?",
        summary: "शेतकरी प्रोफाइल पूर्ण करा, List Waste पेज उघडा आणि सर्व माहिती भरा.",
        steps: [
          "List Waste पेज उघडा.",
          "कचऱ्याचा प्रकार निवडा.",
          "प्रमाण, किंमत आणि फोटो जोडा.",
          "फॉर्म सबमिट करा."
        ],
        linkLabel: "List Waste उघडा",
        linkHref: "/profile/farmer/list-waste",
      },
      {
        id: "find-process",
        title: "प्रक्रिया शोधा",
        question: "योग्य कचरा व्यवस्थापन प्रक्रिया कशी शोधू?",
        summary: "Process पेजवर माहिती भरून योग्य प्रक्रिया सूचना मिळवा.",
        steps: [
          "Process पेज उघडा.",
          "कचऱ्याचा प्रकार निवडा.",
          "तुमचे ध्येय निवडा (खत, विक्री इ.).",
          "प्रक्रियेच्या पायऱ्या पहा."
        ],
        linkLabel: "Process पेज उघडा",
        linkHref: "/process",
      },
      {
        id: "sell-marketplace",
        title: "बाजारात विका",
        question: "मी मार्केटप्लेसमधून कचरा कसा विकू?",
        summary: "चांगली लिस्टिंग तयार करा, खरेदीदारांची रुची पाहा आणि ऑर्डर हाताळा.",
        steps: [
          "किमतीसह कचरा लिस्ट करा.",
          "खरेदीदारांना उत्तर द्या.",
          "तुमच्या विक्रीचा मागोवा घ्या."
        ],
        linkLabel: "Marketplace उघडा",
        linkHref: "/marketplace",
      },
      {
        id: "create-account",
        title: "खाते तयार करा",
        question: "ही फीचर्स वापरण्याआधी अकाउंट कसे तयार करायचे?",
        summary: "साइन अप करा आणि तुमच्या भूमिकेनुसार योग्य अकाउंट निवडा.",
        steps: [
          "साइन-अप पेज उघडा.",
          "'Farmer' किंवा 'Buyer' निवडा.",
          "तुमची माहिती भरा.",
          "प्रोफाइल सेव्ह करा."
        ],
        linkLabel: "खाते तयार करा",
        linkHref: "/create-account",
      },
    ],
  },
};

// Map IDs to specific visual icons for better recognition
const getIconForQuestion = (id: string) => {
  switch (id) {
    case "list-waste": return <ListPlus className="h-6 w-6 text-green-600" />;
    case "find-process": return <Recycle className="h-6 w-6 text-emerald-600" />;
    case "sell-marketplace": return <Store className="h-6 w-6 text-blue-600" />;
    case "create-account": return <UserCircle className="h-6 w-6 text-purple-600" />;
    default: return <Sprout className="h-6 w-6 text-green-600" />;
  }
};

export default function HelpChatbot() {
  const locale = useLocale() as SupportedLocale;
  const copy = chatbotContent[locale] ?? chatbotContent.en;
  
  const [isOpen, setIsOpen] = useState(false);
  // Start with no active question to show the simple menu first
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setActiveQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 left-4 z-[120] w-[calc(100vw-2rem)] max-w-sm sm:left-5">
          <Card className="overflow-hidden border-2 border-green-200 bg-slate-50 py-0 shadow-2xl backdrop-blur-sm">
            {/* Header Area */}
            <CardHeader className="bg-green-700 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-wide">
                    <Bot className="h-6 w-6" />
                    {copy.title}
                  </CardTitle>
                  <CardDescription className="text-green-100 text-sm">
                    {copy.subtitle}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[30rem]">
                <div className="space-y-4 p-4">
                  
                  {/* Friendly Greeting Banner */}
                  <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800">
                      {copy.helperTitle}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {copy.helperText}
                    </p>
                  </div>

                  {/* Expandable Options List */}
                  <div className="space-y-3">
                    {copy.questions.map((question) => {
                      const isActive = question.id === activeQuestionId;

                      return (
                        <div 
                          key={question.id} 
                          className={cn(
                            "overflow-hidden rounded-xl border-2 transition-all duration-200",
                            isActive 
                              ? "border-green-500 bg-green-50/50 shadow-md" 
                              : "border-slate-200 bg-white shadow-sm hover:border-green-300"
                          )}
                        >
                          {/* Big Tappable Area */}
                          <button
                            type="button"
                            onClick={() => toggleQuestion(question.id)}
                            className="flex w-full items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className="rounded-full bg-slate-100 p-3">
                                {getIconForQuestion(question.id)}
                              </div>
                              <span className="text-lg font-bold text-slate-800">
                                {question.title}
                              </span>
                            </div>
                            <ChevronDown 
                              className={cn(
                                "h-6 w-6 text-slate-400 transition-transform duration-200",
                                isActive && "rotate-180 text-green-600"
                              )} 
                            />
                          </button>

                          {/* Expanded Content Area */}
                          {isActive && (
                            <div className="border-t-2 border-green-100 p-4 pt-4">
                              <ol className="mb-5 space-y-4">
                                {question.steps.map((step, index) => (
                                  <li key={index} className="flex gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white shadow-sm">
                                      {index + 1}
                                    </div>
                                    <p className="pt-1 text-base font-medium text-slate-700">
                                      {step}
                                    </p>
                                  </li>
                                ))}
                              </ol>

                              {/* Massive Action Button */}
                              <Button asChild className="h-14 w-full bg-green-600 text-lg font-bold text-white shadow-lg hover:bg-green-700">
                                <Link href={question.linkHref}>
                                  {question.linkLabel}
                                  <ChevronRight className="ml-2 h-6 w-6" />
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Fallback Option: Call Support */}
                  <div className="pt-2 pb-4">
                    <Button 
                      variant="outline" 
                      className="h-14 w-full border-2 border-slate-300 bg-white text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                      onClick={() => window.location.href = "tel:+1234567890"} // Replace with real helpline
                    >
                      <PhoneCall className="mr-2 h-5 w-5 text-slate-600" />
                      {copy.callSupportLabel}
                    </Button>
                  </div>

                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button (Launcher) */}
      <Button
        type="button"
        size="lg"
        className={cn(
          "fixed bottom-8 left-4 z-110 h-12 rounded-full bg-green-600 px-6 font-bold text-white shadow-2xl transition-all duration-300 hover:bg-green-700 sm:left-8 sm:bottom-8 ",
          isOpen && "scale-0 opacity-0" // Hides smoothly when open
        )}
        onClick={() => setIsOpen(true)}
        aria-label={copy.launcher}
      >
        <MessageCircleQuestion className="mr-2 h-6 w-6" />
        <span className="text-base sm:text-lg">{copy.helperLabel}</span>
      </Button>
    </>
  );
}