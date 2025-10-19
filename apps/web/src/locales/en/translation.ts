export default {
  welcome: "Welcome to our app",
  greeting: "Hello, {{name}}!",
  navbar: {
    home: "Home",
    dashboard: "Dashboard",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    loading: "Loading...",
  },
  hero: {
    title: "Master Any Subject with",
    titleHighlight: "Spaced Repetition",
    subtitle:
      "Transform your learning with scientifically-proven memory techniques. Create flashcards, organize them into decks, and let our smart algorithm optimize your review schedule.",
    getStarted: "Get Started",
    scienceBasedTitle: "Science-Based Learning",
    scienceBasedDesc:
      "Our spaced repetition algorithm is based on decades of cognitive science research to maximize retention.",
    organizedDecksTitle: "Organized Decks",
    organizedDecksDesc:
      "Create custom decks to organize your flashcards by subject, difficulty, or any system that works for you.",
    smartSchedulingTitle: "Smart Scheduling",
    smartSchedulingDesc:
      "Never forget what you've learned. Our algorithm schedules reviews at optimal intervals for long-term retention.",
    howItWorksTitle: "How It Works",
    howItWorksDesc:
      "The spaced repetition technique presents information at increasing intervals, strengthening memory pathways each time.",
    step1Title: "Create Cards",
    step1Desc: "Add questions and answers to build your knowledge base.",
    step2Title: "Review Regularly",
    step2Desc: "Study cards when they appear in your daily review queue.",
    step3Title: "Master Topics",
    step3Desc:
      "Watch your knowledge grow as the algorithm optimizes your learning.",
    readyTitle: "Ready to Transform Your Learning?",
    readyDesc:
      "Join thousands of learners who have already improved their memory and study efficiency with spaced repetition.",
    startLearning: "Start Learning Today",
  },
  dashboard: {
    loading: {
      title: "Preparing your dashboard",
      description: "Fetching the latest spacing data and review queue.",
    },
    yourDecks: "Your Decks",
    manageDecks: "Manage your study decks and their cards",
    noDecks: "No decks created yet.",
    createFirstCard: "Create your first card to get started!",
    cardsWithoutDeck: "Cards Without Deck",
    cardsCount: "({{count}} cards)",
  },
  modals: {
    createDeck: {
      title: "Create a deck",
      description: "Name your deck and add an optional description.",
      nameLabel: "Name",
      descriptionLabel: "Description",
      cancel: "Cancel",
      create: "Create New Deck",
    },
    createCard: {
      title: "Create a flashcard",
      description: "Enter the details of your flashcard",
      textQuestion: "Text Question",
      codeQuestion: "Code Question",
      imageQuestion: "Image Question",
      cancel: "Cancel",
      create: "Create Flashcard",
    },
    confirmation: {
      title: "Are you sure?",
      description:
        "Are you sure you want to delete this item? This action cannot be undone.",
      confirm: "Delete",
      cancel: "Cancel",
    },
  },
  flashcards: {
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      again: "Again",
      tomorrow: "Tomorrow",
      inDays: "{{days}} days",
      nextReview: "Next review",
    },
    showAnswer: "Show Answer",
    questionProgress: "Question {{current}} of {{total}}",
  },
  index: {
    loading: {
      title: "Preparing your dashboard",
      description: "Fetching the latest spacing data and review queue.",
    },
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    hero: {
      title: "Your spaced repetition control center",
      subtitle: {
        withReviews:
          "A focused session today keeps your memory curve in the sweet spot.",
        noReviews:
          "No reviews due right now — perfect moment to add fresh material.",
      },
      startReview: "Start Today's Review ({{count}} cards)",
      createFirstCard: "Create Your First Card",
    },
    buttons: {
      createFlashcard: "Create Flashcard",
      reviewByDeck: "Review by Deck",
      createDeck: "Create Deck",
    },
    stats: {
      today: "Today",
      todayWithReviews: "Cards waiting in your review queue.",
      todayNoReviews: "You are fully caught up—keep the streak alive.",
      totalCards: "{{count}} total cards",
      decks: "{{count}} decks",
      dueToday: "Due today",
      cards: "Cards",
      cardsDescription: "Cards help you learn and retain information.",
      decksTitle: "Decks",
      decksDescription:
        "Decks help organize your cards and help you organize your learning.",
    },
    reviewQueue: {
      title: "Today's review queue",
      descriptionWithReviews: "Focus on the cards below to stay on schedule.",
      descriptionNoReviews:
        "You are clear for today—schedule a mini refresh or add new cards.",
      withReviews:
        "Knock these reviews out to keep your memory curve optimized.",
      noReviews:
        "No reviews pending right now—use the time to preview new material.",
      unclassified: "unclassified",
      repetition: "repetition",
      repetitions: "repetitions",
      emptyState:
        "Add a few fresh prompts so you have something to review tomorrow.",
    },
  },
  buttons: {
    submit: "Submit",
    cancel: "Cancel",
  },
  new: {
    createDeck: {
      title: "Create your first deck",
      description: "Create a new deck to organize your cards.",
      button: "Create a new deck",
    },
    createQuestion: {
      title: "Create your first question",
      description: "Create a stand alone question",
      button: "Create a question",
    },
  },
  errors: {
    required: "This field is required",
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: October 15, 2025",
    introduction: {
      title: "Introduction",
      content:
        'Remembr ("we", "our", or "us") operates the website remembr.reda.sh. This Privacy Policy explains how we collect, use, and protect your personal information when you use our spaced repetition learning service.',
    },
    informationWeCollect: {
      title: "Information We Collect",
      googleAuth: {
        title: "Information from Google Authentication",
        description: "When you sign in with Google, we collect:",
        email: "Your email address",
        name: "Your name",
        picture: "Your Google profile picture (optional)",
      },
      youProvide: {
        title: "Information You Provide",
        flashcards: "Flashcards you create (questions and answers)",
        deckNames: "Deck names and organization",
        studyData: "Study session data and progress",
      },
    },
    howWeUse: {
      title: "How We Use Your Information",
      intro: "We use your information to:",
      authenticate:
        "Authenticate your account and provide access to our service",
      store: "Store and organize your flashcards and study materials",
      track: "Track your learning progress and schedule reviews",
      improve: "Improve our service and user experience",
    },
    dataSecurity: {
      title: "Data Storage and Security",
      storage: "Your data is stored securely using Convex database services",
      measures:
        "We use industry-standard security measures to protect your information",
      privacy: "Your flashcard content is private and only accessible to you",
    },
    dataSharing: {
      title: "Data Sharing",
      doNot: "We do NOT",
      doNotSell: "Sell your personal information to third parties",
      doNotShare: "Share your flashcard content with anyone",
      doNotAds: "Use your data for advertising purposes",
      onlyWhen: "We only share data when",
      byLaw: "Required by law or legal process",
      protect: "Necessary to protect our rights or safety",
    },
    googleData: {
      title: "Your Google Data",
      intro: "We access the following Google user data:",
      emailDesc: "Used for account creation and authentication",
      profileDesc: "Used to personalize your experience",
      note: "We do not access, use, process, or share any other Google user data.",
    },
    rights: {
      title: "Your Rights",
      intro: "You have the right to:",
      access: "Access your personal data",
      delete: "Delete your account and all associated data",
      export: "Export your flashcard data",
      optOut: "Opt out of communications",
    },
    retention: {
      title: "Data Retention and Deletion",
      retain: "We retain your data as long as your account is active",
      contact: "You can delete your account at any time by contacting us",
      deletion:
        "Upon account deletion, all your data will be permanently removed within 30 days",
    },
    childrenPrivacy: {
      title: "Children's Privacy",
      content:
        "Our service is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.",
    },
    changes: {
      title: "Changes to This Policy",
      content:
        'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date.',
    },
    contactUs: {
      title: "Contact Us",
      intro:
        "If you have questions about this Privacy Policy or want to exercise your data rights, please contact us at:",
      email: "Email",
    },
    compliance: {
      title: "Compliance",
      intro: "This privacy policy complies with:",
      google: "Google API Services User Data Policy",
      gdpr: "General Data Protection Regulation (GDPR)",
      ccpa: "California Consumer Privacy Act (CCPA)",
    },
  },
  settings: {
    title: "Settings",
    description: "Manage your account and API keys",
    apiKeys: {
      title: "API Keys",
      description: "Create and manage API keys for accessing your data",
      noKeys: "No API keys created yet",
      createNew: "Create New API Key",
      enterName: "Enter a name for this API key",
      createKey: "Create Key",
      cancel: "Cancel",
      copy: "Copy API key",
      show: "Show API key",
      hide: "Hide API key",
      delete: "Delete API key",
      created: "Created",
      lastUsed: "Last used",
    },
    reviewSettings: {
      title: "Review Settings",
      description: "Configure how spaced repetition works for your cards",
      askAgainThreshold: "Ask Again Threshold",
      askAgainDescription:
        "The minimum number of times a question must be answered before spaced repetition difficulty ratings are considered",
      example:
        "Example: If set to 5, a card won't be marked as Easy/Medium/Hard until it's been answered at least 5 times.",
      times: "times",
      saveChanges: "Save Changes",
      cancel: "Cancel",
    },
  },
  copyCodeBlock: {
    copied: "Code copied!",
  },
} as const;
