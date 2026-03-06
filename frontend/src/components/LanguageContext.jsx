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
      tagline: "Your Journey Begins Here",
      taglineHighlight: "Bright Future Inspiration",
      title: "Transform Your Future With",
      titleHighlight: "VisaMate",
      subtitle: "Empowering individuals through expert guidance on education and migration. Whether seeking quality education abroad or navigating complex visa processes, we support you every step of the way.",
      cta: "GET STARTED TODAY",
      secondaryCta: "Explore Programs"
    },
    services: {
      title: "Our Services",
      subtitle: "Comprehensive support for your international education and migration journey",
      items: [
        {
          title: "Study Abroad Guidance",
          description: "Expert help to find the best courses and universities matching your goals and academic profile."
        },
        {
          title: "Visa Application Support",
          description: "Step-by-step, reliable assistance through the complex visa application process."
        },
        {
          title: "Migration Pathways",
          description: "Tailored migration solutions for your career and life goals in your dream destination."
        },
        {
          title: "Settlement & Pre-Departure",
          description: "Essential tips and support for accommodation, jobs, and essentials to succeed from day one."
        }
      ]
    },
    destinations: {
      title: "Popular Destinations",
      subtitle: "Discover opportunities in the world's leading education hubs",
      countries: [
        { name: "United States", universities: "4,000+ Universities" },
        { name: "United Kingdom", universities: "160+ Universities" },
        { name: "Canada", universities: "100+ Universities" },
        { name: "Australia", universities: "40+ Universities" },
        { name: "Germany", universities: "400+ Universities" },
        { name: "Japan", universities: "780+ Universities" }
      ],
      explore: "Explore"
    },
    testimonials: {
      title: "Success Stories",
      subtitle: "Hear from students who achieved their dreams",
      items: [
        {
          name: "Yuki Tanaka",
          school: "Harvard University",
          quote: "The team guided me through every step. I couldn't have done it without their expertise and dedication."
        },
        {
          name: "Kenji Yamamoto",
          school: "University of Oxford",
          quote: "Professional, caring, and incredibly knowledgeable. They made my dream of studying in the UK a reality."
        },
        {
          name: "Sakura Ito",
          school: "University of Toronto",
          quote: "From application to arrival, they were with me the whole way. Highly recommend their services!"
        }
      ]
    },
    contact: {
      title: "Start Your Journey",
      subtitle: "Book a free consultation and take the first step toward your international education",
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
      tagline: "Empowering students to achieve their global education dreams since 2010.",
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
      globalNetworkDesc: "Access to 5,000+ universities across the USA, UK, Canada, Australia, Germany, Japan, and more.",
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
        "USA (F-1, J-1)",
        "UK (Tier 4)",
        "Canada (Study Permit)",
        "Australia (Student Visa)",
        "Germany (Student Visa)",
        "Japan (Student Visa)"
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
      destinations: "留学先",
      about: "会社概要",
      contact: "お問い合わせ",
      getStarted: "相談予約"
    },
    hero: {
      tagline: "あなたの旅はここから始まる",
      title: "グローバル教育で",
      titleHighlight: "未来を変える",
      subtitle: "留学のエキスパートがあなたの夢を全力でサポート。世界トップクラスの大学への架け橋となります。",
      cta: "無料相談を予約",
      secondaryCta: "プログラムを見る"
    },
    services: {
      title: "サービス内容",
      subtitle: "留学のすべてのステップを包括的にサポートします",
      items: [
        {
          title: "大学選定",
          description: "学業成績、キャリア目標、ご希望に基づいたパーソナライズされた提案。"
        },
        {
          title: "出願サポート",
          description: "出願書類、エッセイ、必要書類の準備まで一貫してサポート。"
        },
        {
          title: "ビザ申請支援",
          description: "高い成功率を誇るビザ申請プロセスの専門サポート。"
        },
        {
          title: "渡航前準備",
          description: "住居、保険、文化適応など、新生活の準備をお手伝い。"
        }
      ]
    },
    destinations: {
      title: "人気の留学先",
      subtitle: "世界をリードする教育拠点で機会を見つけよう",
      countries: [
        { name: "アメリカ", universities: "4,000以上の大学" },
        { name: "イギリス", universities: "160以上の大学" },
        { name: "カナダ", universities: "100以上の大学" },
        { name: "オーストラリア", universities: "40以上の大学" },
        { name: "ドイツ", universities: "400以上の大学" },
        { name: "日本", universities: "780以上の大学" }
      ],
      explore: "詳しく見る"
    },
    testimonials: {
      title: "合格実績",
      subtitle: "夢を実現した先輩たちの声",
      items: [
        {
          name: "田中 優希",
          school: "ハーバード大学",
          quote: "すべてのステップで丁寧にサポートしていただきました。専門知識と献身的なサポートなしでは実現できませんでした。"
        },
        {
          name: "山本 健二",
          school: "オックスフォード大学",
          quote: "プロフェッショナルで、思いやりがあり、知識も豊富。イギリス留学の夢を実現してくれました。"
        },
        {
          name: "伊藤 さくら",
          school: "トロント大学",
          quote: "出願から渡航まで、ずっと寄り添ってくれました。心からおすすめします！"
        }
      ]
    },
    contact: {
      title: "留学相談を始める",
      subtitle: "無料相談を予約して、国際教育への第一歩を踏み出しましょう",
      form: {
        name: "お名前",
        email: "メールアドレス",
        phone: "電話番号",
        destination: "希望留学先",
        message: "ご相談内容・目標をお聞かせください",
        submit: "送信する",
        selectDestination: "留学先を選択"
      }
    },
    footer: {
      tagline: "2010年より、学生の皆様のグローバル教育の夢を支援しています。",
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
      globalNetworkDesc: "アメリカ、イギリス、カナダ、オーストラリア、ドイツ、日本など、5,000以上の大学にアクセス可能。",
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
        "アメリカ（F-1、J-1）",
        "イギリス（Tier 4）",
        "カナダ（学生ビザ）",
        "オーストラリア（学生ビザ）",
        "ドイツ（学生ビザ）",
        "日本（学生ビザ）"
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