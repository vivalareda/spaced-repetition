export default {
  welcome: "Bienvenue dans notre application",
  greeting: "Bonjour, {{name}}!",
  navbar: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    signOut: "Se déconnecter",
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
  privacy: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour : 15 octobre 2025",
    introduction: {
      title: "Introduction",
      content:
        "Remembr (« nous », « notre » ou « nous ») exploite le site web remembr.reda.sh. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre service d'apprentissage par répétition espacée.",
    },
    informationWeCollect: {
      title: "Informations que nous collectons",
      googleAuth: {
        title: "Informations provenant de l'authentification Google",
        description:
          "Lorsque vous vous connectez avec Google, nous collectons :",
        email: "Votre adresse e-mail",
        name: "Votre nom",
        picture: "Votre photo de profil Google (facultatif)",
      },
      youProvide: {
        title: "Informations que vous fournissez",
        flashcards: "Les cartes mémoire que vous créez (questions et réponses)",
        deckNames: "Les noms des paquets et leur organisation",
        studyData: "Les données de session d'étude et votre progression",
      },
    },
    howWeUse: {
      title: "Comment nous utilisons vos informations",
      intro: "Nous utilisons vos informations pour :",
      authenticate:
        "Authentifier votre compte et vous donner accès à notre service",
      store: "Stocker et organiser vos cartes mémoire et vos matériels d'étude",
      track:
        "Suivre votre progression d'apprentissage et planifier vos révisions",
      improve: "Améliorer notre service et votre expérience utilisateur",
    },
    dataSecurity: {
      title: "Stockage et sécurité des données",
      storage:
        "Vos données sont stockées de manière sécurisée à l'aide des services de base de données Convex",
      measures:
        "Nous utilisons des mesures de sécurité conformes aux normes de l'industrie pour protéger vos informations",
      privacy:
        "Le contenu de votre carte mémoire est privé et uniquement accessible par vous",
    },
    dataSharing: {
      title: "Partage des données",
      doNot: "Nous ne faisons PAS",
      doNotSell: "Vendre vos informations personnelles à des tiers",
      doNotShare: "Partager le contenu de votre carte mémoire avec quiconque",
      doNotAds: "Utiliser vos données à des fins publicitaires",
      onlyWhen: "Nous partageons les données uniquement lorsque",
      byLaw: "Requis par la loi ou un processus juridique",
      protect: "Nécessaire pour protéger nos droits ou notre sécurité",
    },
    googleData: {
      title: "Vos données Google",
      intro: "Nous accédons aux données utilisateur Google suivantes :",
      emailDesc: "Utilisée pour la création de compte et l'authentification",
      profileDesc: "Utilisée pour personnaliser votre expérience",
      note: "Nous n'accédons pas, n'utilisons pas, ne traitons pas et ne partageons aucune autre donnée utilisateur Google.",
    },
    rights: {
      title: "Vos droits",
      intro: "Vous avez le droit de :",
      access: "Accéder à vos données personnelles",
      delete: "Supprimer votre compte et toutes les données associées",
      export: "Exporter vos données de carte mémoire",
      optOut: "Vous désinscrire des communications",
    },
    retention: {
      title: "Conservation et suppression des données",
      retain: "Nous conservons vos données tant que votre compte est actif",
      contact:
        "Vous pouvez supprimer votre compte à tout moment en nous contactant",
      deletion:
        "Après suppression du compte, toutes vos données seront supprimées de manière permanente dans les 30 jours",
    },
    childrenPrivacy: {
      title: "Confidentialité des enfants",
      content:
        "Notre service n'est pas destiné aux utilisateurs de moins de 13 ans. Nous ne collectons pas délibérément d'informations auprès d'enfants de moins de 13 ans.",
    },
    changes: {
      title: "Modifications de cette politique",
      content:
        "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons des modifications importantes en publiant la nouvelle politique sur cette page et en mettant à jour la date de « Dernière mise à jour ».",
    },
    contactUs: {
      title: "Nous contacter",
      intro:
        "Si vous avez des questions sur cette politique de confidentialité ou si vous souhaitez exercer vos droits en matière de données, veuillez nous contacter à :",
      email: "E-mail",
    },
    compliance: {
      title: "Conformité",
      intro: "Cette politique de confidentialité est conforme à :",
      google: "Politique des données utilisateur des services API Google",
      gdpr: "Règlement général sur la protection des données (RGPD)",
      ccpa: "California Consumer Privacy Act (CCPA)",
    },
  },
  settings: {
    title: "Paramètres",
    description: "Gérez votre compte et vos clés API",
    apiKeys: {
      title: "Clés API",
      description: "Créez et gérez les clés API pour accéder à vos données",
      noKeys: "Aucune clé API créée pour le moment",
      createNew: "Créer une nouvelle clé API",
      enterName: "Entrez un nom pour cette clé API",
      createKey: "Créer la clé",
      cancel: "Annuler",
      copy: "Copier la clé API",
      show: "Afficher la clé API",
      hide: "Masquer la clé API",
      delete: "Supprimer la clé API",
      created: "Créée",
      lastUsed: "Dernièrement utilisée",
    },
    reviewSettings: {
      title: "Paramètres de révision",
      description:
        "Configurez le fonctionnement de la répétition espacée pour vos cartes",
      askAgainThreshold: "Seuil de demande à nouveau",
      askAgainDescription:
        "Le nombre minimum de fois qu'une question doit être répondue avant que les évaluations de difficulté de la spaced repetition soient prises en compte",
      example:
        "Exemple : si vous réglez sur 5, une carte ne sera pas marquée comme Facile/Moyen/Difficile jusqu'à ce qu'elle ait été répondue au moins 5 fois.",
      times: "fois",
      saveChanges: "Enregistrer les modifications",
      cancel: "Annuler",
    },
  },
} as const;
