/* =====================================================================
   Portfolio content — static site copy in English and Russian
   ---------------------------------------------------------------------
   CommonJS data module:

     const { en, ru } = require('./portfolio-content');

   Two complete language trees with identical shape:
     nav, hero, home, work, experience, about, resume, contact,
     projects[], jobs[]

   EDITING NOTES
   - Facts only: dates, scope, stack, what was actually done.
   - ADNova: December 2025 – April 2026.
   - Confidential platform: November 2023 – December 2025; never
     publicly launched, so the client and the industry stay unnamed.
   - Projects are experiments and are presented as such.
   ===================================================================== */

'use strict';

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
    eyebrow: "Backend developer — Go / Python",
    title: "Systems where the details have to add up.",
    description:
      "I'm Michael, a backend developer working in Go and Python. I build the parts that have to " +
      "be right: accounts, balances, and the integrations between them.",
    primary: "See the work",
    secondary: "Get in touch"
  },

  home: {
    workTitle: "Selected work",
    workIntro: "Two public test assignments exploring backend design.",
    experienceTitle: "Experience",
    experienceIntro: "Two engagements: the work, the stack, and what I actually did.",
    aboutTitle: "About",
    aboutText:
      "Backend developer, Go and Python. I work on the parts that have to be right the first " +
      "time: accounts, balances, integrations and the events between them.",
    contactTitle: "Contact",
    contactText:
      "Email and Telegram are the fastest routes; both reach me directly. I'm open to backend " +
      "work in Go or Python."
  },

  work: {
    title: "Work",
    intro:
      "Only things you can open and read. The commercial work is described under Experience."
  },

  experience: {
    title: "Experience",
    intro: "Two engagements: the work, the stack, and what I actually did."
  },

  about: {
    title: "About",
    paragraphs: [
      "I'm Michael, a backend developer; online I go by EryyynIT. I write mostly Go and Python.",

      "The public repositories are a place to explore engineering details: message delivery, " +
      "idempotency, concurrency and the shape of an HTTP API.",

      "My professional work has also meant taking responsibility beyond code: working with " +
      "existing systems, coordinating development and discussing priorities with a founder."
    ]
  },

  resume: {
    title: "Resume",
    intro: "The same facts in one place, for printing or forwarding.",
    skillsTitle: "Skills",
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
    ],
    download: "Download PDF",
    print: "Print this page"
  },

  contact: {
    title: "Contact",
    intro:
      "For work, questions or just a hello. Email and Telegram are fastest; GitHub if you'd " +
      "rather read code first."
  },

  /* --- Experiments from the repositories ---------------------------------
     Named as experiments on purpose: they exist to answer a question.
     --------------------------------------------------------------------- */
  projects: [
    {
      name: "Async Payment Processing Service",
      kind: "Test assignment · FastAPI, RabbitMQ",
      description:
        "An event-driven payment service on FastAPI and RabbitMQ — outbox pattern, dead-letter " +
        "queue, idempotency keys and webhook notifications.",
      details:
        "A test assignment exploring how an outbox, a dead-letter queue and idempotency " +
        "can handle repeated or failed messages. It is not a commercial product.",
      stack: ["FastAPI", "RabbitMQ", "PostgreSQL", "Docker"],
      url: "https://github.com/EryyynIT/async-payment-processing-service"
    },
    {
      name: "queue",
      kind: "Test assignment · Go, standard library",
      description:
        "A small in-memory queue broker in Go, standard library only, exposed over an HTTP API " +
        "with two endpoints.",
      details:
        "A test assignment exploring FIFO semantics and concurrency without a framework. " +
        "Its deliberately small scope is not intended as a general-purpose broker.",
      stack: ["Go", "stdlib", "HTTP API"],
      url: "https://github.com/EryyynIT/queue"
    }
  ],

  /* --- Engagement history ------------------------------------------------
     Facts only. Titles are exactly the titles held.
     --------------------------------------------------------------------- */
  jobs: [
    {
      name: "ADNova",
      role: "Backend Developer (Go)",
      dates: "December 2025 — April 2026",
      summary:
        "Early-stage CPA/AdTech product. I joined a backend foundation that already existed and, " +
        "for most of the engagement, was the only engineer: Go backend, frontend work, partner " +
        "integrations, webhooks and postbacks, Ozon ORD.",
      details: [
        "Worked on an existing backend foundation — extending and integrating rather than " +
        "starting from scratch.",
        "Sole engineer for most of the engagement: backend in Go, plus frontend work.",
        "Partner integrations, with webhooks and postbacks between the platform and its partners.",
        "Worked with Ozon ORD.",
        "Discussed ideas and business needs with the founder, set technical priorities, and " +
        "organized the engineering work."
      ],
      stack: ["Go", "webhooks / postbacks", "Ozon ORD", "partner integrations", "frontend"]
    },
    {
      name: "Confidential platform",
      role: "Technical Lead / Python Developer",
      dates: "November 2023 — December 2025",
      summary:
        "A web platform: modular HTTP services on FastAPI sharing one database, accounts with " +
        "balances, bonuses and promo codes. The platform was never publicly launched, and its " +
        "client and industry stay unnamed.",
      details: [
        "Technical Lead and Python developer: architecture, code, and coordination between " +
        "frontend and backend.",
        "Modular HTTP services on FastAPI, all sharing a single database.",
        "Authentication with OAuth 2.0 and TOTP, on top of PostgreSQL.",
        "Account logic: balances, bonuses and promo codes.",
        "Coordinated frontend and backend work."
      ],
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
    eyebrow: "Backend-разработчик — Go / Python",
    title: "Системы, где детали должны сходиться.",
    description:
      "Я Михаил, backend-разработчик на Go и Python. Делаю то, что должно работать без " +
      "ошибок: аккаунты, балансы и интеграции между ними.",
    primary: "Смотреть проекты",
    secondary: "Связаться"
  },

  home: {
    workTitle: "Избранные проекты",
    workIntro: "Два открытых тестовых задания по backend-разработке.",
    experienceTitle: "Опыт",
    experienceIntro: "Два проекта: что за работа, стек и что именно я делал.",
    aboutTitle: "Обо мне",
    aboutText:
      "Backend-разработчик, Go и Python. Работаю над тем, что должно быть правильным с первого " +
      "раза: аккаунты, балансы, интеграции и события между ними.",
    contactTitle: "Контакты",
    contactText:
      "Быстрее всего — почта и Telegram, оба ведут прямо ко мне. Открыт к backend-работе на Go " +
      "или Python."
  },

  work: {
    title: "Проекты",
    intro: "Здесь только то, что можно открыть и прочитать. Коммерческая работа — в разделе «Опыт»."
  },

  experience: {
    title: "Опыт",
    intro: "Два проекта: что за работа, стек и что именно я делал."
  },

  about: {
    title: "Обо мне",
    paragraphs: [
      "Я Михаил, backend-разработчик; в сети — EryyynIT. Пишу в основном на Go и Python.",

      "В открытых репозиториях я исследую инженерные детали: доставку сообщений, " +
      "идемпотентность, конкурентность и устройство HTTP API.",

      "Профессиональная работа включает для меня не только код: развитие существующих систем, " +
      "координацию разработки и обсуждение приоритетов с фаундером."
    ]
  },

  resume: {
    title: "Резюме",
    intro: "Те же факты одной страницей — чтобы распечатать или переслать.",
    skillsTitle: "Навыки",
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
    ],
    download: "Скачать PDF",
    print: "Распечатать страницу"
  },

  contact: {
    title: "Контакты",
    intro:
      "По работе, по вопросам или просто поздороваться. Быстрее всего — почта и Telegram; " +
      "GitHub — если сначала хочется посмотреть код."
  },

  projects: [
    {
      name: "Async Payment Processing Service",
      kind: "Тестовое задание · FastAPI, RabbitMQ",
      description:
        "Событийный платёжный сервис на FastAPI и RabbitMQ — паттерн outbox, очередь мёртвых " +
        "писем, ключи идемпотентности и вебхук-уведомления.",
      details:
        "Тестовое задание об обработке повторных и неуспешных сообщений с помощью outbox, " +
        "очереди мёртвых писем и идемпотентности. Это не коммерческий продукт.",
      stack: ["FastAPI", "RabbitMQ", "PostgreSQL", "Docker"],
      url: "https://github.com/EryyynIT/async-payment-processing-service"
    },
    {
      name: "queue",
      kind: "Тестовое задание · Go, стандартная библиотека",
      description:
        "Небольшой in-memory брокер очередей на Go — только стандартная библиотека, HTTP API с " +
        "двумя эндпоинтами.",
      details:
        "Тестовое задание о семантике FIFO и конкурентности без фреймворка. Проект намеренно " +
        "невелик и не претендует на роль универсального брокера.",
      stack: ["Go", "stdlib", "HTTP API"],
      url: "https://github.com/EryyynIT/queue"
    }
  ],

  jobs: [
    {
      name: "ADNova",
      role: "Backend-разработчик (Go)",
      dates: "Декабрь 2025 — апрель 2026",
      summary:
        "Ранний продукт в CPA/AdTech. Пришёл в уже существующий backend-фундамент и большую " +
        "часть участия был единственным инженером: backend на Go, работа над фронтендом, " +
        "партнёрские интеграции, webhooks и postbacks, Ozon ORD.",
      details: [
        "Работал на готовом backend-фундаменте: развивал и интегрировал, а не начинал с нуля.",
        "Большую часть участия — единственный инженер: backend на Go плюс работа над фронтендом.",
        "Партнёрские интеграции: webhooks и postbacks между платформой и партнёрами.",
        "Работа с Ozon ORD.",
        "Обсуждал с фаундером идеи и бизнес-потребности, определял технические приоритеты и " +
        "организовывал инженерную работу."
      ],
      stack: ["Go", "webhooks / postbacks", "Ozon ORD", "партнёрские интеграции", "фронтенд"]
    },
    {
      name: "Конфиденциальная платформа",
      role: "Technical Lead / Python Developer",
      dates: "Ноябрь 2023 — декабрь 2025",
      summary:
        "Веб-платформа: модульные HTTP-сервисы на FastAPI с общей базой данных, аккаунты с " +
        "балансами, бонусами и промокодами. Публично не запускалась; клиент и отрасль не " +
        "называются.",
      details: [
        "Technical Lead и Python-разработчик: архитектура, код и координация между фронтендом и " +
        "backend.",
        "Модульные HTTP-сервисы на FastAPI, все — на одной общей базе данных.",
        "Аутентификация через OAuth 2.0 и TOTP, поверх PostgreSQL.",
        "Логика аккаунтов: балансы, бонусы и промокоды.",
        "Координировал работу фронтенда и backend."
      ],
      stack: ["Python", "FastAPI", "PostgreSQL", "OAuth 2.0", "TOTP"]
    }
  ]
};

module.exports = { en, ru };