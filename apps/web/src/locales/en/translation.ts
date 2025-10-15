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
} as const;
