import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    nav: {
      home: "Home",
      services: "Services",
      destinations: "Destinations",
      about: "About",
      contact: "Contact",
      getStarted: "Get Started"
    },
    hero: {
      tagline: "Your Gateway to Japan & Australia",
      taglineHighlight: "VisaMate Japan",
      title: "Your Dream Journey to",
      titleHighlight: "Japan & Australia",
      subtitle: "Helping Nepali students and professionals reach Japan, and Japanese individuals migrate to Australia. Expert guidance on education, visa processing, and settlement — every step of the way.",
      cta: "GET STARTED TODAY",
      ctaLoggedIn: "Book Appointment",
      secondaryCta: "Explore Programs",
      welcomeBack: "Welcome back",
      welcomeSubtitle: "Continue your journey — book an appointment or check your dashboard.",
      stats: [
        { value: "15+", label: "Years Experience" },
        { value: "3,000+", label: "Students Placed" },
        { value: "98%", label: "Success Rate" }
      ]
    },
    services: {
      title: "Our Services",
      subtitle: "Comprehensive support for your journey to Japan or Australia",
      learnMore: "Learn More",
      items: [
        {
          title: "Study Abroad Guidance",
          description: "Expert help to find the best courses and universities in Japan and Australia matching your goals."
        },
        {
          title: "Visa Application Support",
          description: "Step-by-step assistance through Japan Student Visa, Work Visa, and Australia Student/Migration Visa processes."
        },
        {
          title: "Migration Pathways",
          description: "Tailored migration solutions for your career and life goals in Japan or Australia."
        },
        {
          title: "Settlement & Pre-Departure",
          description: "Essential tips and support for accommodation, cultural adjustment, and settling in Japan or Australia."
        }
      ]
    },
    destinations: {
      title: "Our Destinations",
      subtitle: "We specialize in Japan and Australia — two incredible destinations for education and career growth",
      countries: [
        { name: "Japan", universities: "780+ Universities", description: "Study, work, and build your future in the Land of the Rising Sun" },
        { name: "Australia", universities: "40+ Universities", description: "World-class education and migration opportunities Down Under" }
      ],
      explore: "Explore"
    },
    testimonials: {
      title: "Success Stories",
      subtitle: "Hear from people who achieved their dreams with VisaMate",
      items: [
        {
          name: "Ramesh Adhikari",
          school: "University of Tokyo, Japan",
          quote: "VisaMate guided me from Nepal to Japan seamlessly. Their expertise with the Japanese student visa process was invaluable. I'm now studying engineering in Tokyo!"
        },
        {
          name: "Sita Sharma",
          school: "Osaka University, Japan",
          quote: "I was nervous about moving to Japan, but the team helped me with everything — from university selection to finding accommodation. Highly recommend!"
        },
        {
          name: "Yuki Tanaka",
          school: "University of Sydney, Australia",
          quote: "As a Japanese student, I wanted to study in Australia. VisaMate made the entire process smooth and stress-free. Now I'm living my dream in Sydney!"
        }
      ]
    },
    contact: {
      title: "Start Your Journey",
      subtitle: "Book a free consultation and take the first step toward Japan or Australia",
      form: {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        destination: "Preferred Destination",
        message: "Tell us about your goals",
        submit: "Send Inquiry",
        selectDestination: "Select a destination"
      }
    },
    footer: {
      tagline: "Connecting Nepal to Japan and Japan to Australia — your trusted partner in education and migration.",
      quickLinks: "Quick Links",
      contactUs: "Contact Us",
      followUs: "Follow Us",
      rights: "All rights reserved."
    },
    universitySelection: {
      backToHome: "Back to Home",
      title: "University Selection",
      subtitle: "Find the perfect university match for your academic goals and career aspirations",
      whatWeOffer: "What We Offer",
      personalizedAssessment: "Personalized Assessment",
      personalizedAssessmentDesc: "We evaluate your academic background, career goals, budget, and preferences to recommend universities that truly fit your profile.",
      globalNetwork: "Global Network",
      globalNetworkDesc: "Access to top universities across Japan and Australia, with strong partnerships and direct connections.",
      expertCounseling: "Expert Counseling",
      expertCounselingDesc: "One-on-one sessions with our experienced counselors who have helped thousands of students find their ideal universities.",
      ourProcess: "Our Process",
      step1Title: "Initial Consultation",
      step1Desc: "Discuss your goals, preferences, and academic background",
      step2Title: "Profile Analysis",
      step2Desc: "Comprehensive evaluation of your academic credentials and potential",
      step3Title: "University Shortlist",
      step3Desc: "Curated list of universities matching your profile",
      step4Title: "Final Selection",
      step4Desc: "Help you choose the best fit and prepare for applications",
      cta: "Schedule Free Consultation"
    },
    applicationSupport: {
      backToHome: "Back to Home",
      title: "Application Support",
      subtitle: "End-to-end assistance to ensure your applications stand out",
      completeAssistance: "Complete Application Assistance",
      documentPrep: "Document Preparation",
      documentPrepDesc: "Help with transcripts, recommendation letters, certificates, and all required documentation.",
      essayWriting: "Essay Writing Support",
      essayWritingDesc: "Professional guidance on crafting compelling personal statements and essays that showcase your unique story.",
      applicationReview: "Application Review",
      applicationReviewDesc: "Thorough review of all application materials before submission to ensure accuracy and completeness.",
      whatsIncluded: "What's Included",
      items: [
        "Application form completion",
        "Personal statement drafting",
        "Resume/CV preparation",
        "Letter of recommendation guidance",
        "Document verification",
        "Deadline management",
        "Multiple application support",
        "Follow-up assistance"
      ],
      cta: "Get Started Today"
    },
    visaGuidance: {
      backToHome: "Back to Home",
      title: "Visa Guidance",
      subtitle: "Expert support through the visa application process with 98% success rate",
      comprehensiveSupport: "Comprehensive Visa Support",
      documentation: "Documentation Assistance",
      documentationDesc: "Complete guidance on preparing all required documents for your visa application, ensuring nothing is missed.",
      interviewPrep: "Interview Preparation",
      interviewPrepDesc: "Mock interviews and coaching to help you confidently answer visa interview questions.",
      applicationReview: "Application Review",
      applicationReviewDesc: "Expert review of your entire visa application to maximize approval chances.",
      countriesWeSupport: "Countries We Support",
      countries: [
        "Japan (Student Visa, Work Visa, Specified Skilled Worker)",
        "Australia (Student Visa, Skilled Migration, Working Holiday)"
      ],
      successRate: "98% Success Rate",
      successRateDesc: "Over 3,000 successful visa applications processed",
      cta: "Book Visa Consultation"
    },
    preDeparture: {
      backToHome: "Back to Home",
      title: "Pre-Departure Preparation",
      subtitle: "Get ready for your new adventure with comprehensive pre-departure support",
      whatWeHelpWith: "What We Help With",
      accommodation: "Accommodation",
      accommodationDesc: "Help finding and securing safe, affordable housing near your university - from dormitories to shared apartments.",
      healthInsurance: "Health Insurance",
      healthInsuranceDesc: "Guidance on selecting the right health insurance plan that meets your university's requirements.",
      culturalOrientation: "Cultural Orientation",
      culturalOrientationDesc: "Prepare for cultural differences, academic expectations, and practical tips for living in your destination country.",
      checklist: "Pre-Departure Checklist",
      checklistItems: [
        "Travel arrangements and flight booking",
        "Accommodation confirmation",
        "Health insurance enrollment",
        "Bank account setup guidance",
        "Mobile phone and SIM card",
        "Airport pickup arrangements",
        "Packing checklist and tips",
        "Cultural adaptation workshop",
        "Emergency contacts list",
        "First week survival guide"
      ],
      orientationTitle: "Pre-Departure Orientation Session",
      orientationDesc: "Join our comprehensive orientation session where we cover everything you need to know before departure, including:",
      orientationItems: [
        "What to pack and what to leave behind",
        "Understanding your destination's culture and customs",
        "Academic system and expectations",
        "Safety tips and emergency procedures",
        "Making friends and building networks"
      ],
      cta: "Join Orientation Session"
    }
    },
  ja: {
    nav: {
      home: "ホーム",
      services: "サービス",
      destinations: "渡航先",
      about: "会社概要",
      contact: "お問い合わせ",
      getStarted: "相談予約"
    },
    hero: {
      tagline: "オーストラリアへの第一歩",
      taglineHighlight: "VisaMate Japan",
      title: "オーストラリアで",
      titleHighlight: "夢を叶える",
      subtitle: "留学・移住・ワーキングホリデーなど、オーストラリアへの渡航を全力でサポート。ビザ申請から現地での生活準備まで、専門スタッフがお手伝いします。",
      cta: "無料相談を予約",
      ctaLoggedIn: "予約する",
      secondaryCta: "プログラムを見る",
      welcomeBack: "おかえりなさい",
      welcomeSubtitle: "予約やダッシュボードの確認など、次のステップへ進みましょう。",
      stats: [
        { value: "15+", label: "年の実績" },
        { value: "3,000+", label: "渡航サポート実績" },
        { value: "98%", label: "ビザ取得率" }
      ]
    },
    services: {
      title: "サービス内容",
      subtitle: "オーストラリアへの留学・移住を包括的にサポートします",
      learnMore: "詳しく見る",
      items: [
        {
          title: "大学・学校選定",
          description: "オーストラリアの大学・専門学校から、あなたに最適なプログラムをご提案します。"
        },
        {
          title: "出願サポート",
          description: "出願書類からエッセイまで、オーストラリアの教育機関への出願を一貫サポート。"
        },
        {
          title: "ビザ申請支援",
          description: "学生ビザ、技術移民ビザ、ワーキングホリデービザなど、高い成功率のビザサポート。"
        },
        {
          title: "渡航前準備",
          description: "住居、保険、文化適応など、オーストラリアでの新生活の準備をお手伝い。"
        }
      ]
    },
    destinations: {
      title: "渡航先",
      subtitle: "教育・キャリアに最適な渡航先をご紹介します",
      countries: [
        { name: "オーストラリア", universities: "40以上の大学", description: "世界水準の教育と移住の機会が広がる国" },
        { name: "日本", universities: "780以上の大学", description: "ネパールの方向け — 日本での留学・就職をサポート" }
      ],
      explore: "詳しく見る"
    },
    testimonials: {
      title: "渡航者の声",
      subtitle: "VisaMateを通じて夢を実現した方々の体験談",
      items: [
        {
          name: "田中 優希",
          school: "シドニー大学（オーストラリア）",
          quote: "オーストラリアへの留学をずっと夢見ていました。VisaMateのおかげでビザ取得から入学手続きまでスムーズに進みました。"
        },
        {
          name: "山本 健二",
          school: "メルボルン大学（オーストラリア）",
          quote: "ビザ申請が不安でしたが、専門スタッフが丁寧にサポートしてくれました。今はメルボルンで充実した毎日を送っています。"
        },
        {
          name: "伊藤 さくら",
          school: "シドニー工科大学（オーストラリア）",
          quote: "出願から渡航準備まで、すべてのステップで寄り添ってくれました。オーストラリアでの生活を心から楽しんでいます！"
        }
      ]
    },
    contact: {
      title: "オーストラリア留学相談",
      subtitle: "無料相談を予約して、オーストラリアへの第一歩を踏み出しましょう",
      form: {
        name: "お名前",
        email: "メールアドレス",
        phone: "電話番号",
        destination: "希望渡航先",
        message: "ご相談内容・目標をお聞かせください",
        submit: "送信する",
        selectDestination: "渡航先を選択"
      }
    },
    footer: {
      tagline: "ネパールから日本へ、日本からオーストラリアへ — 教育と移住のパートナー。",
      quickLinks: "クイックリンク",
      contactUs: "お問い合わせ",
      followUs: "SNS",
      rights: "All rights reserved."
    },
    universitySelection: {
      backToHome: "ホームに戻る",
      title: "大学選定サービス",
      subtitle: "あなたの学業目標とキャリア志向に最適な大学を見つけましょう",
      whatWeOffer: "提供サービス",
      personalizedAssessment: "パーソナライズ評価",
      personalizedAssessmentDesc: "学歴、キャリア目標、予算、希望をもとに、あなたにぴったりの大学を推薦します。",
      globalNetwork: "グローバルネットワーク",
      globalNetworkDesc: "オーストラリアと日本のトップ大学と強力なパートナーシップを持ち、直接つながります。",
      expertCounseling: "専門カウンセリング",
      expertCounselingDesc: "何千人もの学生の理想的な大学探しをサポートしてきた経験豊富なカウンセラーとの個別相談。",
      ourProcess: "サービスの流れ",
      step1Title: "初回相談",
      step1Desc: "目標、希望、学歴についてお話しします",
      step2Title: "プロフィール分析",
      step2Desc: "学業成績と可能性を包括的に評価",
      step3Title: "大学リスト作成",
      step3Desc: "あなたのプロフィールに合った大学のリストを作成",
      step4Title: "最終選考",
      step4Desc: "最適な大学を選び、出願準備をサポート",
      cta: "無料相談を予約"
    },
    applicationSupport: {
      backToHome: "ホームに戻る",
      title: "出願サポート",
      subtitle: "出願書類が際立つよう、最初から最後までサポートします",
      completeAssistance: "完全出願サポート",
      documentPrep: "書類準備",
      documentPrepDesc: "成績証明書、推薦状、証明書など、必要な書類すべてのサポート。",
      essayWriting: "エッセイ作成支援",
      essayWritingDesc: "あなたの個性を引き出す説得力のある志望動機書やエッセイの作成を専門的にサポート。",
      applicationReview: "出願書類レビュー",
      applicationReviewDesc: "提出前にすべての出願書類を徹底的にレビューし、正確性と完全性を確保。",
      whatsIncluded: "含まれるサービス",
      items: [
        "出願フォームの記入",
        "志望動機書の作成",
        "履歴書・CV作成",
        "推薦状のガイダンス",
        "書類確認",
        "締切管理",
        "複数大学への出願サポート",
        "フォローアップ支援"
      ],
      cta: "今すぐ始める"
    },
    visaGuidance: {
      backToHome: "ホームに戻る",
      title: "ビザ申請支援",
      subtitle: "98%の成功率を誇るビザ申請プロセスの専門サポート",
      comprehensiveSupport: "包括的ビザサポート",
      documentation: "書類作成支援",
      documentationDesc: "ビザ申請に必要なすべての書類の準備を完全にガイドし、漏れがないようサポート。",
      interviewPrep: "面接準備",
      interviewPrepDesc: "模擬面接とコーチングで、自信を持ってビザ面接の質問に答えられるようサポート。",
      applicationReview: "申請書レビュー",
      applicationReviewDesc: "ビザ申請全体を専門家がレビューし、承認率を最大化。",
      countriesWeSupport: "対応国",
      countries: [
        "オーストラリア（学生ビザ、技術移民ビザ、ワーキングホリデー）",
        "日本（学生ビザ、就労ビザ、特定技能）"
      ],
      successRate: "98%の成功率",
      successRateDesc: "3,000件以上のビザ申請成功実績",
      cta: "ビザ相談を予約"
    },
    preDeparture: {
      backToHome: "ホームに戻る",
      title: "渡航前準備",
      subtitle: "包括的な渡航前サポートで新しい冒険の準備をしましょう",
      whatWeHelpWith: "サポート内容",
      accommodation: "住居",
      accommodationDesc: "大学の近くで安全で手頃な価格の住居を見つけ、確保するお手伝い - 寮からシェアアパートまで。",
      healthInsurance: "健康保険",
      healthInsuranceDesc: "大学の要件を満たす適切な健康保険プランの選択をガイド。",
      culturalOrientation: "文化適応",
      culturalOrientationDesc: "文化の違い、学業への期待、留学先での生活の実用的なヒントを準備。",
      checklist: "渡航前チェックリスト",
      checklistItems: [
        "旅行手配とフライト予約",
        "住居確認",
        "健康保険加入",
        "銀行口座開設ガイダンス",
        "携帯電話とSIMカード",
        "空港送迎手配",
        "荷造りチェックリストとヒント",
        "文化適応ワークショップ",
        "緊急連絡先リスト",
        "初週サバイバルガイド"
      ],
      orientationTitle: "渡航前オリエンテーション",
      orientationDesc: "出発前に知っておくべきすべてを網羅した包括的なオリエンテーションに参加してください：",
      orientationItems: [
        "持っていくもの・置いていくもの",
        "留学先の文化と習慣の理解",
        "教育システムと期待",
        "安全のヒントと緊急時の手順",
        "友達作りとネットワーク構築"
      ],
      cta: "オリエンテーションに参加"
    }
    }
    };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ja' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}