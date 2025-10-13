export default {
  welcome: "Bienvenue dans notre application",
  greeting: "Bonjour, {{name}}!",
  navbar: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    loading: "Chargement...",
  },
  hero: {
    title: "Maîtrisez n'importe quel sujet avec la",
    titleHighlight: "Spaced Repetition",
    subtitle:
      "Transformez votre apprentissage avec des techniques de mémorisation scientifiquement prouvées. Créez des cartes mémoire, organisez-les en paquets, et laissez notre algorithme intelligent optimiser votre programme de révision.",
    getStarted: "Commencer",
    scienceBasedTitle: "Apprentissage basé sur la science",
    scienceBasedDesc:
      "Notre algorithme de spaced repetition est basé sur des décennies de recherche en sciences cognitives pour maximiser la rétention.",
    organizedDecksTitle: "Paquets organisés",
    organizedDecksDesc:
      "Créez des paquets personnalisés pour organiser vos cartes mémoire par sujet, difficulté, ou tout système qui vous convient.",
    smartSchedulingTitle: "Planification intelligente",
    smartSchedulingDesc:
      "N'oubliez jamais ce que vous avez appris. Notre algorithme planifie les révisions à des intervalles optimaux pour une rétention à long terme.",
    howItWorksTitle: "Comment ça marche",
    howItWorksDesc:
      "La technique de spaced repetition présente l'information à des intervalles croissants, renforçant les voies de la mémoire à chaque fois.",
    step1Title: "Créer des cartes",
    step1Desc:
      "Ajoutez des questions et des réponses pour construire votre base de connaissances.",
    step2Title: "Révisez régulièrement",
    step2Desc:
      "Étudiez les cartes quand elles apparaissent dans votre file de révision quotidienne.",
    step3Title: "Maîtrisez les sujets",
    step3Desc:
      "Regardez vos connaissances grandir pendant que l'algorithme optimise votre apprentissage.",
    readyTitle: "Prêt à transformer votre apprentissage ?",
    readyDesc:
      "Rejoignez des milliers d'apprenants qui ont déjà amélioré leur mémoire et leur efficacité d'étude avec la spaced repetition.",
    startLearning: "Commencer à apprendre aujourd'hui",
  },
  dashboard: {
    loading: {
      title: "Préparation de votre tableau de bord",
      description:
        "Récupération des dernières données d'espacement et de la file de révision.",
    },
    yourDecks: "Vos paquets",
    manageDecks: "Gérez vos paquets d'étude et leurs cartes",
    noDecks: "Aucun paquet créé pour le moment.",
    createFirstCard: "Créez votre première carte pour commencer !",
    cardsWithoutDeck: "Cartes sans paquet",
    cardsCount: "({{count}} cartes)",
  },
  modals: {
    createDeck: {
      title: "Créer un paquet",
      description:
        "Nommez votre paquet et ajoutez une description optionnelle.",
      nameLabel: "Nom",
      descriptionLabel: "Description",
      cancel: "Annuler",
      create: "Créer un nouveau paquet",
    },
    createCard: {
      title: "Créer une carte mémoire",
      description: "Entrez les détails de votre carte mémoire",
      textQuestion: "Question texte",
      codeQuestion: "Question code",
      cancel: "Annuler",
      create: "Créer une carte mémoire",
    },
    confirmation: {
      title: "Êtes-vous sûr ?",
      description:
        "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action ne peut pas être annulée.",
      confirm: "Supprimer",
      cancel: "Annuler",
    },
  },
  flashcards: {
    difficulty: {
      easy: "Facile",
      medium: "Moyen",
      hard: "Difficile",
      again: "Encore",
      tomorrow: "Demain",
      inDays: "{{days}} jours",
      nextReview: "Prochaine révision:",
    },
    showAnswer: "Afficher la Réponse",
    questionProgress: "Question {{current}} sur {{total}}",
  },
  index: {
    loading: {
      title: "Préparation de votre tableau de bord",
      description:
        "Récupération des dernières données d'espacement et de la file de révision.",
    },
    greeting: {
      morning: "Bonjour",
      afternoon: "Bon après-midi",
      evening: "Bonsoir",
    },
    hero: {
      title: "Centre de contrôle spaced repetition",
      subtitle: {
        withReviews:
          "Une session concentrée aujourd'hui maintient votre courbe de mémoire dans la zone optimale.",
        noReviews:
          "Aucune révision due en ce moment — moment parfait pour ajouter du nouveau matériel.",
      },
      startReview: "Commencer la Révision d'Aujourd'hui ({{count}} cartes)",
      createFirstCard: "Créer Votre Première Carte",
    },
    buttons: {
      createFlashcard: "Créer une Carte",
      reviewByDeck: "Réviser par Paquet",
      createDeck: "Créer un Paquet",
    },
    stats: {
      today: "Aujourd'hui",
      todayWithReviews: "Cartes en attente dans votre file de révision.",
      todayNoReviews: "Vous êtes à jour — continuez cette série.",
      totalCards: "{{count}} cartes au total",
      decks: "{{count}} paquets",
      dueToday: "Dues aujourd'hui",
      cards: "Cartes",
      cardsDescription:
        "Les cartes vous aident à apprendre et retenir l'information.",
      decksTitle: "Paquets",
      decksDescription:
        "Les paquets aident à organiser vos cartes et votre apprentissage.",
    },
    reviewQueue: {
      title: "File de révision d'aujourd'hui",
      descriptionWithReviews:
        "Concentrez-vous sur les cartes ci-dessous pour rester dans les temps.",
      descriptionNoReviews:
        "Vous êtes libre aujourd'hui — planifiez un mini rafraîchissement ou ajoutez de nouvelles cartes.",
      withReviews:
        "Terminez ces révisions pour garder votre courbe de mémoire optimisée.",
      noReviews:
        "Aucune révision en attente en ce moment — utilisez ce temps pour prévisualiser du nouveau matériel.",
      unclassified: "non classifié",
      repetition: "répétition",
      repetitions: "répétitions",
      emptyState:
        "Ajoutez quelques nouvelles questions pour avoir quelque chose à réviser demain.",
    },
  },
  buttons: {
    submit: "Soumettre",
    cancel: "Annuler",
  },
  new: {
    createDeck: {
      title: "Créez votre premier paquet",
      description: "Créez un nouveau paquet pour organiser vos cartes.",
      button: "Créer un nouveau paquet",
    },
    createQuestion: {
      title: "Créez votre première question",
      description: "Créez une question autonome",
      button: "Créer une question",
    },
  },
  errors: {
    required: "Ce champ est requis",
  },
} as const;
