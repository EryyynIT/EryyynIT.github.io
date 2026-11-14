/* =====================================================================
   Portfolio content — the single source of copy in English and Russian
   ---------------------------------------------------------------------
   CommonJS data module:

     const { en, ru, contacts } = require('./portfolio-content');

   Two language trees with identical shape. scripts/prototype-templates.js
   only renders this data; it holds no copy of its own.

   Tree shape (both languages):
     nav, hero, ui, home, work, experience, about, resume, contact,
     projects[], jobs[]

   Fields the generator depends on:
     nav[page]          — page label for titles and the header navigation
     [page].intro       — meta description (about falls back to paragraphs[0])
     about.paragraphs[] — SEO paragraph source

   EDITING NOTES
   - Facts only: dates, scope, stack, what was actually done.
   - ADNova: December 2025 – April 2026.
   - Confidential platform: November 2023 – December 2025; never
     publicly launched, so the client and the industry stay unnamed.
   - Projects are test assignments and are presented as such.
   - Headings that break across lines are arrays of lines; the renderer
     joins them with <br>. No other markup lives in this file.
   ===================================================================== */

'use strict';

/* Shared, language-independent facts. */
const contacts = {
  brand: 'EryyynIT',
  email: 'barkalovmisha@gmail.com',
  emailHref: 'mailto:barkalovmisha@gmail.com',
  telegramHandle: '@eprintln',
  telegramHref: 'https://t.me/eprintln',
  githubHandle: 'github.com/EryyynIT',
  githubHref: 'https://github.com/EryyynIT'
};

/* =====================================================================
   ENGLISH
   ===================================================================== */

const en = {

  nav: {
    home: "Home",
    work: "Work",
    experience: "Experience",
    about: "About",
    resume: "Resume",
    contact: "Contact"
  },

  hero: {
    identity: "Michael · also known as EryyynIT",
    heading: ["Engineering, with", "the product in mind."],
    intro:
      "Backend systems, technical ownership, and public projects. The work, and the person behind it.",
    primary: { label: "Explore Work", page: "work" },
    secondary: { label: "Professional Experience", page: "experience" },
    tertiary: { label: "Résumé", page: "resume" },
    noteTitle: "An open workbench",
    note: "Selected examples. Clear context. Evidence where it can be shared."
  },

  /* Labels used by the rendered pages and by the site shell. */
  ui: {
    context: "Context",
    evidence: "Evidence",
    repository: "View repository",
    detailsInResume: "Details in résumé",
    privateRoleEvidence: "Responsibilities described here. No public source offered.",
    email: "Email",
    telegram: "Telegram",
    github: "GitHub",

    /* Shell: accessibility labels, controls and metadata. */
    skip: "Skip to content",
    mainNavigation: "Main navigation",
    language: "Language",
    theme: "Theme",
    darkTheme: "Dark theme",
    menu: "Menu",
    close: "Close",
    footerRole: "Backend engineering",
    personName: "Michael",
    homeTitle: "Michael Barkalov — backend developer | EryyynIT",
    homeDescription:
      "Backend engineering, technical ownership and product thinking. Projects and experience " +
      "of Michael Barkalov."
  },

  home: {
    workTitle: "Selected public work",
    workLink: "All work",
    experienceTitle: "Professional experience",
    experienceCopy: "Two different settings. Substantial technical responsibility in each.",
    experienceLink: "Professional Experience",
    aboutHeading: ["The person", "behind the work."],
    aboutText:
      "EryyynIT is my public development identity. I’m Michael. This is a place for the work I " +
      "can share, the ideas I explore, and a little context about me.",
    aboutLink: "About Michael"
  },

  work: {
    title: "Work, in context.",
    intro:
      "Public projects you can inspect. Professional experience I can describe within its " +
      "disclosure limits.",
    projectsTitle: "Selected Projects",
    projectsLink: "Selected Projects",
    experienceTitle: "Professional Experience",
    experienceLink: "Professional Experience",
    experienceContext: "Two engagements",
    experienceEvidence: "Full descriptions on the Experience page.",
    experienceSummary:
      "Two engagements since 2023: a confidential product platform in Python and FastAPI — " +
      "accounts, balances, bonuses, OAuth 2.0 and TOTP — and ADNova in Go, with partner " +
      "integrations, webhooks and postbacks, and Ozon ORD.",
    experienceMore: "Read the full experience"
  },

  experience: {
    identity: "Experience",
    title: "Professional experience",
    intro: "Two different settings. Substantial technical responsibility in each.",
    rolesTitle: "Roles and responsibilities"
  },

  about: {
    identity: "About",
    intro:
      "Backend developer in Go and Python: technical ownership, integrations and the products " +
      "they belong to.",
    heading: ["Michael.", "Also EryyynIT."],
    asideBrand: "EryyynIT",
    asideText: "My public development identity.",
    paragraphs: [
      "I’m Michael, a backend developer; online I go by EryyynIT. I write mostly Go and Python.",

      "I work on backend systems and the products around them: technical ownership in an " +
      "early-stage venture and sustained development on a confidential platform.",

      "My public repositories offer a closer look at engineering details: message delivery, " +
      "idempotency, concurrency and the shape of an HTTP API. The examples here began as test assignments.",

      "My professional work has also meant taking responsibility beyond code: working with " +
      "existing systems, coordinating development and discussing priorities with a founder."
    ],
    storyTitle: "A place for the context.",
    storyParagraphs: [
      "Repositories show the code. A résumé records roles and dates. Here, I connect them with " +
      "the context I can share."
    ],
    cta: "Explore Work"
  },

  resume: {
    identity: "Résumé",
    title: "Michael Barkalov",
    intro: "Backend development · Technical ownership · Product engineering",
    printLabel: "Print / Save PDF",
    indexLabel: "Résumé sections",
    index: [
      { label: "Summary", href: "#summary" },
      { label: "Experience", href: "#experience" },
      { label: "Technologies", href: "#skills" }
    ],
    summaryTitle: "Professional summary",
    summary:
      "Backend development across Go and Python, with experience in technical direction, " +
      "integrations, product collaboration and coordination of backend and frontend development.",
    experienceTitle: "Professional experience",
    skillsTitle: "Technologies in context",
    skillGroups: [
      { term: "ADNova", value: "Go · Frontend · Webhooks · Postbacks · Ozon ORD" },
      {
        term: "Confidential platform",
        value: "Python · FastAPI · PostgreSQL · OAuth2 · TOTP · HTTP"
      },
      { term: "Test assignments", value: "Go · FastAPI · RabbitMQ" }
    ],
    skills: [
      "Go",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "REST APIs",
      "OAuth 2.0",
      "TOTP",
      "webhooks / postbacks",
      "partner integrations",
      "Docker",
      "Git",
      "CI/CD",
      "Linux",
      "English — C1",
      "Russian — native"
    ]
  },

  contact: {
    title: "Contact",
    intro:
      "For work, questions or just a hello. Email and Telegram are fastest; GitHub if you’d " +
      "rather read code first.",
    sectionTitle: "Get in touch",
    sectionText:
      "A professional question, a possible collaboration, or a conversation about the work here."
  },

  /* --- Test assignments -----------------------------------------------
     Named as test assignments on purpose. Honest scope, no product claim.
     ------------------------------------------------------------------- */
  projects: [
    {
      id: "async-payment",
      name: "Async Payment Processing Service",
      kind: "Test assignment · FastAPI, RabbitMQ",
      description:
        "An event-driven payment service on FastAPI and RabbitMQ: the outbox pattern for " +
        "reliable event publishing, a dead-letter queue for messages that cannot be processed, " +
        "idempotency keys against repeated requests, webhook notifications, PostgreSQL and Docker.",
      stack: ["FastAPI", "RabbitMQ", "PostgreSQL", "Docker"],
      rail: {
        context: "Test assignment",
        evidence: "Public repository. Not presented as a production payment system."
      },
      url: "https://github.com/EryyynIT/async-payment-processing-service"
    },
    {
      id: "queue",
      name: "queue",
      kind: "Test assignment · Go, standard library",
      description:
        "A small in-memory queue broker in Go, standard library only, served over an HTTP API " +
        "with two endpoints. The assignment is about FIFO ordering and concurrency without a " +
        "framework.",
      stack: ["Go", "stdlib", "HTTP API"],
      rail: {
        context: "Test assignment",
        evidence: "Public repository. Deliberately small scope, not a general-purpose broker."
      },
      url: "https://github.com/EryyynIT/queue"
    }
  ],

  /* --- Engagement history ---------------------------------------------
     Facts only. Titles are exactly the titles held.
     ------------------------------------------------------------------- */
  jobs: [
    {
      id: "adnova",
      name: "ADNova",
      homeName: "ADNova",
      dates: "December 2025 — April 2026",
      role: "Backend Developer (Go)",
      roleLine: "Early-stage CPA/AdTech venture · Technical ownership · Go",
      context: "Early-stage venture",
      blurb:
        "Technical ownership in an early-stage venture. Go backend, frontend, integrations, " +
        "and close collaboration with the founder.",
      paragraphs: [
        "For most of my involvement, I was the sole engineer working on the early-stage " +
        "CPA/AdTech venture ADNova and took responsibility for its technical development. " +
        "Building on an existing backend foundation, I worked across the Go backend and " +
        "frontend, implementing partner integrations, webhook and postback processing, and an " +
        "Ozon ORD integration.",

        "Beyond implementation, I worked closely with the founder on product and business " +
        "decisions: discussing ideas, translating business needs into technical priorities, " +
        "shaping the technical direction, and taking responsibility for engineering processes."
      ],
      resumePoints: [
        "Sole engineer for most of my involvement, continuing an existing backend foundation " +
        "across Go backend and frontend development.",
        "Partner integrations, webhook and postback processing, and Ozon ORD integration.",
        "Founder collaboration on product and business needs, technical priorities, direction " +
        "and engineering processes."
      ],
      stack: ["Go", "webhooks / postbacks", "Ozon ORD", "partner integrations", "frontend"]
    },
    {
      id: "platform",
      name: "Confidential platform",
      homeName: "Account and bonus platform",
      dates: "November 2023 — December 2025",
      role: "Technical Lead / Python Developer",
      roleLine: "Confidential product development · Technical Lead / Python",
      context: "Confidential product development",
      blurb:
        "Sustained Python/FastAPI development, technical leadership and coordination across " +
        "backend and frontend engineering.",
      paragraphs: [
        "I spent approximately two years developing a confidential platform featuring user " +
        "accounts, internal balances, and a bonus system. I worked as a Technical Lead and " +
        "Python developer, developing the Python/FastAPI backend and implementing authentication " +
        "and authorization with OAuth2 and TOTP, as well as account, balance, bonus and " +
        "promo-code functionality.",

        "In addition to development, I was responsible for technical direction and coordinated " +
        "backend and frontend engineering. The platform used a modular architecture built around " +
        "HTTP services sharing a PostgreSQL database."
      ],
      resumePoints: [
        "Python/FastAPI development and coordination of backend and frontend engineering.",
        "Authentication and authorization with OAuth2 and TOTP; accounts, balances, bonuses " +
        "and promo codes.",
        "Modular architecture built around HTTP services sharing a PostgreSQL database."
      ],
      status: "The product remained in development and did not reach a public release.",
      stack: ["Python", "FastAPI", "PostgreSQL", "OAuth 2.0", "TOTP"]
    }
  ]
};

/* =====================================================================
   RUSSIAN
   ===================================================================== */

const ru = {

  nav: {
    home: "Главная",
    work: "Проекты",
    experience: "Опыт",
    about: "Обо мне",
    resume: "Резюме",
    contact: "Контакты"
  },

  hero: {
    identity: "Михаил · он же EryyynIT",
    heading: ["Разработка", "с пониманием продукта."],
    intro:
      "Backend-системы, техническая ответственность и публичные проекты. Работа и человек, " +
      "который за ней стоит.",
    primary: { label: "Смотреть работы", page: "work" },
    secondary: { label: "Профессиональный опыт", page: "experience" },
    tertiary: { label: "Резюме", page: "resume" },
    noteTitle: "Открытый верстак",
    note: "Избранные примеры, понятный контекст и доступные материалы."
  },

  ui: {
    context: "Контекст",
    evidence: "Материалы",
    repository: "Открыть репозиторий",
    detailsInResume: "Подробнее в резюме",
    privateRoleEvidence: "Описание ответственности. Публичный исходный код не предлагается.",
    email: "Почта",
    telegram: "Telegram",
    github: "GitHub",

    /* Оболочка сайта: подписи доступности, элементы управления и метаданные. */
    skip: "К содержанию",
    mainNavigation: "Основная навигация",
    language: "Язык",
    theme: "Тема",
    darkTheme: "Тёмная тема",
    menu: "Меню",
    close: "Закрыть",
    footerRole: "Backend-разработка",
    personName: "Михаил",
    homeTitle: "Михаил Баркалов — backend-разработчик | EryyynIT",
    homeDescription:
      "Backend-разработка, техническая ответственность и работа над продуктом. Проекты и опыт " +
      "Михаила Баркалова."
  },

  home: {
    workTitle: "Избранные публичные проекты",
    workLink: "Все работы",
    experienceTitle: "Профессиональный опыт",
    experienceCopy: "Два разных контекста. Существенная техническая ответственность в каждом.",
    experienceLink: "Профессиональный опыт",
    aboutHeading: ["Человек", "за этой работой."],
    aboutText:
      "EryyynIT — мой публичный псевдоним в разработке. Меня зовут Михаил. Здесь я собираю " +
      "работы, которыми могу поделиться, и немного контекста о себе.",
    aboutLink: "Обо мне"
  },

  work: {
    title: "Работа в контексте.",
    intro:
      "Публичные проекты, которые можно изучить. Профессиональный опыт, о котором я могу " +
      "рассказать в допустимых границах.",
    projectsTitle: "Публичные проекты",
    projectsLink: "Публичные проекты",
    experienceTitle: "Профессиональный опыт",
    experienceLink: "Профессиональный опыт",
    experienceContext: "Два проекта",
    experienceEvidence: "Полные описания — на странице «Опыт».",
    experienceSummary:
      "Два проекта с 2023 года: конфиденциальная платформа на Python и FastAPI — аккаунты, " +
      "балансы, бонусы, OAuth 2.0 и TOTP — и ADNova на Go: партнёрские интеграции, вебхуки и " +
      "постбэки, Ozon ORD.",
    experienceMore: "Полный опыт"
  },

  experience: {
    identity: "Опыт",
    title: "Опыт работы",
    intro: "Два разных контекста. Существенная техническая ответственность в каждом.",
    rolesTitle: "Моя работа"
  },

  about: {
    identity: "Обо мне",
    intro:
      "Backend-разработчик на Go и Python: техническая ответственность, интеграции и продукты, " +
      "частью которых они становятся.",
    heading: ["Михаил.", "Он же EryyynIT."],
    asideBrand: "EryyynIT",
    asideText: "Мой публичный псевдоним разработчика.",
    paragraphs: [
      "Я Михаил, backend-разработчик; в сети — EryyynIT. Пишу в основном на Go и Python.",

      "Работаю над backend-системами и продуктами, частью которых они становятся: техническая " +
      "ответственность в раннем проекте и длительная разработка конфиденциальной платформы.",

      "В открытых репозиториях можно подробнее рассмотреть инженерные детали: доставку сообщений, " +
      "идемпотентность, конкурентность и устройство HTTP API. Представленные здесь примеры начинались как тестовые задания.",

      "Профессиональная работа включает для меня не только код: развитие существующих систем, " +
      "координацию разработки и обсуждение приоритетов с фаундером."
    ],
    storyTitle: "Место для контекста.",
    storyParagraphs: [
      "Репозитории показывают код, а резюме — роли и даты. Здесь я связываю их с контекстом, " +
      "которым могу поделиться."
    ],
    cta: "Смотреть работы"
  },

  resume: {
    identity: "Резюме",
    title: "Михаил Баркалов",
    intro: "Backend-разработка · Техническая ответственность · Работа над продуктами",
    printLabel: "Печать / PDF",
    indexLabel: "Разделы резюме",
    index: [
      { label: "Кратко", href: "#summary" },
      { label: "Опыт", href: "#experience" },
      { label: "Технологии", href: "#skills" }
    ],
    summaryTitle: "Кратко об опыте",
    summary:
      "Backend-разработка на Go и Python. Опыт технического руководства, интеграций, работы с " +
      "продуктовыми задачами и координации backend- и frontend-разработки.",
    experienceTitle: "Профессиональный опыт",
    skillsTitle: "Технологии в контексте",
    skillGroups: [
      { term: "ADNova", value: "Go · Frontend · Webhooks · Postbacks · Ozon ORD" },
      {
        term: "Конфиденциальная платформа",
        value: "Python · FastAPI · PostgreSQL · OAuth2 · TOTP · HTTP"
      },
      { term: "Тестовые задания", value: "Go · FastAPI · RabbitMQ" }
    ],
    skills: [
      "Go",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "REST API",
      "OAuth 2.0",
      "TOTP",
      "webhooks / postbacks",
      "партнёрские интеграции",
      "Docker",
      "Git",
      "CI/CD",
      "Linux",
      "Английский — C1",
      "Русский — родной"
    ]
  },

  contact: {
    title: "Контакты",
    intro:
      "По работе, по вопросам или просто поздороваться. Быстрее всего — почта и Telegram; " +
      "GitHub — если сначала хочется посмотреть код.",
    sectionTitle: "Связаться",
    sectionText: "Профессиональный вопрос, совместная работа или разговор об одном из проектов."
  },

  projects: [
    {
      id: "async-payment",
      name: "Async Payment Processing Service",
      kind: "Тестовое задание · FastAPI, RabbitMQ",
      description:
        "Событийный платёжный сервис на FastAPI и RabbitMQ: паттерн outbox для надёжной " +
        "публикации событий, очередь мёртвых писем для сообщений, которые не удалось " +
        "обработать, ключи идемпотентности против повторных запросов, вебхук-уведомления, " +
        "PostgreSQL и Docker.",
      stack: ["FastAPI", "RabbitMQ", "PostgreSQL", "Docker"],
      rail: {
        context: "Тестовое задание",
        evidence: "Публичный репозиторий. Не представлен как платёжная система в эксплуатации."
      },
      url: "https://github.com/EryyynIT/async-payment-processing-service"
    },
    {
      id: "queue",
      name: "queue",
      kind: "Тестовое задание · Go, стандартная библиотека",
      description:
        "Небольшой брокер очередей в памяти на Go — только стандартная библиотека, HTTP API " +
        "с двумя эндпоинтами. Задание о порядке FIFO и конкурентности без фреймворка.",
      stack: ["Go", "stdlib", "HTTP API"],
      rail: {
        context: "Тестовое задание",
        evidence: "Публичный репозиторий. Намеренно небольшой объём, а не универсальный брокер."
      },
      url: "https://github.com/EryyynIT/queue"
    }
  ],

  jobs: [
    {
      id: "adnova",
      name: "ADNova",
      homeName: "ADNova",
      dates: "Декабрь 2025 — апрель 2026",
      role: "Backend-разработчик (Go)",
      roleLine: "Ранний CPA/AdTech-проект · Техническая ответственность · Go",
      context: "Ранний проект",
      blurb:
        "Техническая ответственность в раннем проекте. Go backend, frontend, интеграции и " +
        "тесная работа с фаундером.",
      paragraphs: [
        "В течение большей части моего участия я был единственным инженером раннего " +
        "CPA/AdTech-проекта ADNova и отвечал за его техническое развитие. Продолжая работу на " +
        "основе существовавшего backend-фундамента, я занимался backend-разработкой на Go и " +
        "frontend-разработкой, реализовывал партнёрские интеграции, обработку вебхуков и " +
        "постбэков, а также интеграцию с Ozon ORD.",

        "Помимо разработки, я тесно взаимодействовал с фаундером по продуктовым и " +
        "бизнес-вопросам: участвовал в обсуждении идей, переводил потребности бизнеса в " +
        "технические приоритеты, формировал техническое направление и отвечал за организацию " +
        "инженерной работы."
      ],
      resumePoints: [
        "Единственный инженер в течение большей части участия. Развитие существовавшей " +
        "backend-основы, backend на Go и frontend-разработка.",
        "Партнёрские интеграции, обработка вебхуков и постбэков, интеграция с Ozon ORD.",
        "Работа с фаундером над продуктовыми и бизнес-потребностями, техническими " +
        "приоритетами, направлением и организацией инженерной работы."
      ],
      stack: ["Go", "webhooks / postbacks", "Ozon ORD", "партнёрские интеграции", "фронтенд"]
    },
    {
      id: "platform",
      name: "Конфиденциальная платформа",
      homeName: "Платформа аккаунтов и бонусов",
      dates: "Ноябрь 2023 — декабрь 2025",
      role: "Technical Lead / Python Developer",
      roleLine: "Конфиденциальная разработка продукта · Technical Lead / Python",
      context: "Конфиденциальная разработка продукта",
      blurb:
        "Длительная разработка на Python/FastAPI, техническое руководство и координация " +
        "backend- и frontend-разработки.",
      paragraphs: [
        "Около двух лет я занимался разработкой конфиденциальной платформы с пользовательскими " +
        "аккаунтами, внутренними балансами и бонусной системой. Работал в роли Technical Lead " +
        "и Python-разработчика: развивал backend на Python и FastAPI, реализовывал " +
        "аутентификацию и авторизацию с использованием OAuth2 и TOTP, а также функциональность " +
        "аккаунтов, балансов, бонусов и промокодов.",

        "Помимо разработки, я отвечал за техническое направление и координировал работу " +
        "backend- и frontend-разработчиков. Платформа использовала модульную архитектуру на " +
        "основе HTTP-сервисов с общей базой данных PostgreSQL."
      ],
      resumePoints: [
        "Разработка на Python/FastAPI и координация backend- и frontend-разработки.",
        "Аутентификация и авторизация с OAuth2 и TOTP; аккаунты, балансы, бонусы и промокоды.",
        "Модульная архитектура на основе HTTP-сервисов с общей базой PostgreSQL."
      ],
      status: "Продукт остался на стадии разработки и не дошёл до публичного релиза.",
      stack: ["Python", "FastAPI", "PostgreSQL", "OAuth 2.0", "TOTP"]
    }
  ]
};

module.exports = { en, ru, contacts };