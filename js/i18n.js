/**
 * Kelajak ijodkori - Ko'p tillilik moduli (i18n)
 * Tillari: O'zbekcha (uz), Русский (ru), English (en)
 */

const I18n = {
  currentLang: localStorage.getItem('ijodkor_lang_v3') || 'uz',
  _observer: null,
  _isConverting: false,

  // Takomillaştirilgan yangi özbek alifbosiga ötkaziş (O'->Ö, G'->Ğ, Sh->Ş, Ch->Ç)
  toNewUzbek(text) {
    if (!text || typeof text !== 'string') return text;
    // Agar matnda kirill harflari bölsa (rus tilidagi matn), uni özgartirmaymiz
    if (/[\u0400-\u04FF]/.test(text)) return text;

    const protectedTokens = [];
    let s = text.replace(/(https?:\/\/[^\s"'<>]+|\b(?:English|Русский|Google|Firebase|Realtime|YouTube|Telegram)\b)/gi, (match) => {
      protectedTokens.push(match);
      return `__PROT_${protectedTokens.length - 1}__`;
    });

    // 1. O‘ / o‘ / O' / o' -> Ö / ö
    s = s.replace(/O['`‘’ʻʼ]/g, 'Ö').replace(/o['`‘’ʻʼ]/g, 'ö');
    // 2. G‘ / g‘ / G' / g' -> Ğ / ğ
    s = s.replace(/G['`‘’ʻʼ]/g, 'Ğ').replace(/g['`‘’ʻʼ]/g, 'ğ');
    // 3. Sh / sh / SH -> Ş / ş
    s = s.replace(/SH(?=[A-ZÖĞŞÇ\s.,!?:;\-\)]|$)/g, 'Ş')
         .replace(/Sh/g, 'Ş')
         .replace(/sh/g, 'ş');
    // 4. Ch / ch / CH -> Ç / ç
    s = s.replace(/CH(?=[A-ZÖĞŞÇ\s.,!?:;\-\)]|$)/g, 'Ç')
         .replace(/Ch/g, 'Ç')
         .replace(/ch/g, 'ç');

    s = s.replace(/__PROT_(\d+)__/g, (_, idx) => protectedTokens[Number(idx)] || '');
    return s;
  },

  translations: {
    uz: {
      // Boş sahifa va header
      app_title: "Kelajak",
      app_title_highlight: "ijodkori",
      app_subtitle: "Iqtidorli Yoşlar & Çellenjlar Portali",
      server_connected: "Server: Ulangan",
      server_sync: "Sinxronlaş",
      btn_exit: "Çiqiş",
      btn_edit: "Tahrirlaş",
      btn_proposal: "Taklif Yuboriş",
      role_admin: "Admin (Tuman koordinatori)",
      role_staff: "Xodim",
      role_student: "Öquvçi",

      // Gateway
      gateway_tagline: "Özbekiston Iqtidorli Maktab Öquvçilari Milliy Portali",
      gateway_desc: "Tuman va viloyat miqyosida maktab öquvçilarining ijodiy çiqişlari, umumiy çellenjlar va madaniyat xodimlari bilan hamkorlik platformasi",
      gateway_btn_student: "Öquvçi sifatida kiriş",
      gateway_btn_student_sub: "Özingizning tumaningizdan röyxatdan öting, video roliklar topşiring va tangalar yiğing",
      gateway_btn_staff: "Madaniyat xodimi sifatida kiriş",
      gateway_btn_staff_sub: "Öz tumaningiz öquvçilarini kuzatiş, tadbirlarga taklif etiş va taklif kiritiş",
      gateway_btn_admin: "Admin (Tuman koordinatorlari)",
      gateway_btn_admin_sub: "Tuman vazifalari, tangalar, videolarni baholaş va şikoyatlarni körib çiqiş",
      gateway_btn_region_admin: "Admin (Viloyat koordinatorlari)",
      gateway_btn_region_admin_sub: "Viloyatdagi tumanlar ösiş tendensiyasi va hisobotlar",
      gateway_btn_republic_admin: "Admin (Respublika koordinatori)",
      gateway_btn_republic_admin_sub: "Respublika böyiça viloyatlar tahlili va hisobotlari",
      gateway_footer: "© 2026 Kelajak ijodkori. Barça huquqlar himoyalangan.",

      // Navigatsiya
      nav_creators: "Öquvçilar",
      nav_challenges: "Çellenjlar",
      nav_contests: "Tanlovlar",
      nav_leaderboard: "Reyting",
      nav_staff: "Xodimlar",
      nav_admin: "Tuman Admin",

      // 1-Bölim: Öquvçilar
      creators_title: "Röyxatdan Ötgan Maktab Öquvçilari",
      creators_subtitle: "Umumta'lim maktab öquvçilari öz rasmi bilan kiritilgan va tumanlar böyiça saralangan",
      search_placeholder: "Ism, maktab yoki tuman...",
      all_districts: "Barça tumanlar",
      no_creators: "Heç qanday öquvçi topilmadi",
      no_creators_sub: "Boşqa tuman tanlang yoki qidiruv sözini özgartiring.",
      coins: "tanga",
      watch_video: "Videoni köriş",
      more_details: "Batafsil",

      // 2-Bölim: Çellenjlar
      challenges_title: "Umumiy Maktab Video Çellenjlari",
      challenges_subtitle: "Maktab öquvçilari turli ijodiy yönalişlarda video tayyorlab, Tuman Koordinatoridan tanga yutib olişadi",
      btn_submit_challenge: "Video Rolikni Topşiriş",
      btn_add_challenge: "Yangi Çellenj Qöşiş",
      active_challenges: "Faol Çellenjlar",
      submissions_gallery: "Topşirilgan Video Roliklar Galereyasi",
      submissions_gallery_sub: "Öquvçilar tomonidan yuklangan va tasdiqlangan videolar",
      status_approved: "Tasdiqlangan",
      status_pending: "Kutilmoqda",

      // 3-Bölim: Tanlovlar
      contests_title: "Rasmiy Tanlovlar & Madaniy Tadbirlar",
      contests_subtitle: "Barça umumta'lim maktab öquvçilari iştirok etişi mumkin bölgan dasturlar",
      btn_add_contest: "Yangi Tanlov E'loni Qöşiş",
      contest_active: "Faol Tanlov",
      contest_date: "Sanasi",
      contest_location: "Manzil",

      // 4-Bölim: Reyting
      leaderboard_title: "Iqtidorli Öquvçilar Milliy Reytingi",
      leaderboard_subtitle: "Çellenjlarda eng köp tanga töplagan eng faol öquvçilar",
      top_creators: "Top Ijodkorlar",

      // 5-Bölim: Xodimlar
      staff_title: "Madaniyat Xodimlari Xonasi",
      staff_subtitle: "Siz Navröz, Mustaqillik, Yoşlar kuni yoki boşqa tadbirlar uçun öquvçilarni tanlab, bevosita telefon orqali taklif qilişingiz mumkin.",
      staff_my_proposals_title: "Mening Tuman Koordinatoriga Yuborgan Takliflarim",
      staff_my_proposals_subtitle: "Siz tomoningizdan kiritilgan madaniy taşabbuslar va ularning joriy holati",
      btn_send_new_proposal: "Yangi Taklif Yuboriş",
      staff_contacts_title: "Madaniyat Xodimi uçun Öquvçilar Kontaktlari",
      staff_contacts_subtitle: "Öz tumaningiz böyiça",
      proposal_status_pending: "Taklif uçun rahmat, admin siz bilan boğlanadi",
      proposal_status_approved: "Tabriklaymiz, taklifingiz ma'qullandi!",
      staff_invite_btn: "Taklif qiliş",

      // 6-Bölim: Admin
      admin_title: "Admin Boşqaruvi: Tangalar, Çellenjlar & Server",
      admin_subtitle: "Çellenj roliklarini baholang, oylik taşriflar statistikasini köring, xodimlarga qönğiroq qiling va bulutli bazani boşqaring.",
      admin_proposals_title: "Madaniyat Xodimlaridan Kelgan Taklif va Taşabbuslar",
      admin_proposals_subtitle: "Madaniyat markazlari va soha yetakçilarining yangi tadbirlar, çellenjlar va iqtidorli öquvçilarni tavsiya etiş takliflari",
      admin_staff_title: "Röyxatdan Ötgan Madaniyat Xodimlari",
      admin_staff_subtitle: "Xodimlarning telefon raqamlari qonuniy talab böyiça FAQAT Adminga körinadi",
      admin_creators_title: "Bazada Mavjud Öquvçilar Röyxati",
      admin_creators_subtitle: "Öquvçilar rasmi, maktabi, videolari va tangalar nazorati",
      btn_approve: "Ma'qullaş",
      btn_convert_challenge: "Çellenj qiliş",
      btn_convert_contest: "Tadbir qiliş",
      btn_delete: "Öçiriş",

      // Toasts & Dialogs
      toast_proposal_sent: "Taklif uçun rahmat, admin siz bilan boğlanadi",
      toast_proposal_approved: "Tabriklaymiz, taklifingiz ma'qullandi!",
      toast_logged_out: "Profildan çiqildi. Boş ekranga qaytdingiz.",
      toast_sync_done: "Barça ma'lumotlar sinxronlandi!"
    },

    ru: {
      // Главная и хедер
      app_title: "Будущий",
      app_title_highlight: "творец",
      app_subtitle: "Портал талантливой молодежи и творческих челленджей",
      server_connected: "Сервер: Подключен",
      server_sync: "Синхронизация",
      btn_exit: "Выйти",
      btn_edit: "Изменить",
      btn_proposal: "Предложить",
      role_admin: "Главный координатор (Админ)",
      role_staff: "Сотрудник",
      role_student: "Учащийся",

      // Gateway
      gateway_tagline: "Национальный портал одаренных школьников",
      gateway_desc: "Платформа творческих выступлений школьников, масштабных челленджей и сотрудничества с работниками культуры",
      gateway_btn_student: "Войти как учащийся",
      gateway_btn_student_sub: "Сдавать видеоролики, собирать монеты и расти в рейтинге",
      gateway_btn_staff: "Сотрудник культуры",
      gateway_btn_staff_sub: "Просмотр контактов школьников, приглашение на мероприятия и подача предложений",
      gateway_btn_admin: "Админ (Районные координаторы)",
      gateway_btn_admin_sub: "Задания района, начисление монет, оценка видео и жалобы",
      gateway_btn_region_admin: "Админ (Областные координаторы)",
      gateway_btn_region_admin_sub: "Тенденция роста районов области и сезонные отчеты",
      gateway_btn_republic_admin: "Админ (Республиканский координатор)",
      gateway_btn_republic_admin_sub: "Анализ областей по республике и сезонные отчеты",
      gateway_footer: "© 2026 Будущий творец. Все права защищены.",

      // Навигация
      nav_creators: "Учащиеся",
      nav_challenges: "Челленджи",
      nav_contests: "Конкурсы",
      nav_leaderboard: "Рейтинг",
      nav_staff: "Сотрудники",
      nav_admin: "Админ",

      // 1-Раздел: Учащиеся
      creators_title: "Зарегистрированные школьники",
      creators_subtitle: "Учащиеся общеобразовательных школ с фото и сортировкой по районам",
      search_placeholder: "Имя, школа или район...",
      all_districts: "Все районы",
      no_creators: "Учащиеся не найдены",
      no_creators_sub: "Выберите другой район или измените поисковый запрос.",
      coins: "монет",
      watch_video: "Смотреть видео",
      more_details: "Подробнее",

      // 2-Раздел: Челленджи
      challenges_title: "Общешкольные видео-челленджи",
      challenges_subtitle: "Школьники готовят видеоролики по творческим направлениям и получают монеты от Главного координатора",
      btn_submit_challenge: "Сдать видеоролик",
      btn_add_challenge: "Добавить челлендж",
      active_challenges: "Активные челленджи",
      submissions_gallery: "Галерея сданных видеороликов",
      submissions_gallery_sub: "Видеоролики, загруженные школьниками и проверенные координатором",
      status_approved: "Одобрено",
      status_pending: "На проверке",

      // 3-Раздел: Конкурсы
      contests_title: "Официальные конкурсы и мероприятия",
      contests_subtitle: "Программы и фестивали, открытые для всех учащихся общеобразовательных школ",
      btn_add_contest: "Добавить конкурс",
      contest_active: "Активный конкурс",
      contest_date: "Дата",
      contest_location: "Место проведения",

      // 4-Раздел: Рейтинг
      leaderboard_title: "Национальный рейтинг одаренных школьников",
      leaderboard_subtitle: "Школьники, набравшие наибольшее количество монет в творческих челленджах",
      top_creators: "Топ исполнители",

      // 5-Раздел: Сотрудники
      staff_title: "Кабинет сотрудников культуры",
      staff_subtitle: "Вы можете отобрать школьников для праздничных концертов (Навруз, День независимости и др.) и пригласить по телефону.",
      staff_my_proposals_title: "Мои предложения Главному координатору",
      staff_my_proposals_subtitle: "Ваши инициативы по мероприятиям и челленджам и их текущий статус",
      btn_send_new_proposal: "Подать новое предложение",
      staff_contacts_title: "Контакты учащихся для сотрудников культуры",
      staff_contacts_subtitle: "По всем районам",
      proposal_status_pending: "Спасибо за предложение, администратор свяжется с вами",
      proposal_status_approved: "Поздравляем, ваше предложение одобрено!",
      staff_invite_btn: "Пригласить",

      // 6-Раздел: Админ
      admin_title: "Управление админа: Монеты, Челленджи и Сервер",
      admin_subtitle: "Оценивайте видеоролики, просматривайте статистику посещений, звоните сотрудникам и управляйте облачной базой.",
      admin_proposals_title: "Предложения и инициативы от сотрудников культуры",
      admin_proposals_subtitle: "Инициативы центров культуры по новым мероприятиям, челленджам и поощрению талантов",
      admin_staff_title: "Зарегистрированные сотрудники культуры",
      admin_staff_subtitle: "Номера телефонов сотрудников видны ТОЛЬКО Главному координатору",
      admin_creators_title: "Список учащихся в базе данных",
      admin_creators_subtitle: "Фотографии, школы, видео и баланс монет учащихся",
      btn_approve: "Одобрить",
      btn_convert_challenge: "Сделать челленджем",
      btn_convert_contest: "Сделать мероприятием",
      btn_delete: "Удалить",

      // Toasts & Dialogs
      toast_proposal_sent: "Спасибо за предложение, администратор свяжется с вами",
      toast_proposal_approved: "Поздравляем, ваше предложение одобрено!",
      toast_logged_out: "Вы вышли из профиля. Возврат на главный экран.",
      toast_sync_done: "Все данные успешно синхронизированы!"
    },

    en: {
      // Main & Header
      app_title: "Future",
      app_title_highlight: "Creator",
      app_subtitle: "Talented Youth & Challenges Portal",
      server_connected: "Server: Connected",
      server_sync: "Sync",
      btn_exit: "Logout",
      btn_edit: "Edit",
      btn_proposal: "Submit Proposal",
      role_admin: "Head Coordinator (Admin)",
      role_staff: "Staff",
      role_student: "Student",

      // Gateway
      gateway_tagline: "National Portal for Talented School Students",
      gateway_desc: "A creative platform connecting school students, creative challenges, and regional cultural leaders",
      gateway_btn_student: "Enter as Student",
      gateway_btn_student_sub: "Submit videos, collect coins, and climb the leaderboard",
      gateway_btn_staff: "Culture Staff",
      gateway_btn_staff_sub: "Access student contacts, invite to concerts, and submit initiatives",
      gateway_btn_admin: "Admin (District Coordinators)",
      gateway_btn_admin_sub: "District tasks, coins, video evaluation and complaints",
      gateway_btn_region_admin: "Admin (Regional Coordinators)",
      gateway_btn_region_admin_sub: "Regional district growth trends and seasonal reports",
      gateway_btn_republic_admin: "Admin (National Coordinator)",
      gateway_btn_republic_admin_sub: "Nationwide regional analytics and seasonal reports",
      gateway_footer: "© 2026 Future Creator. All rights reserved.",

      // Navigation
      nav_creators: "Students",
      nav_challenges: "Challenges",
      nav_contests: "Contests",
      nav_leaderboard: "Leaderboard",
      nav_staff: "Staff",
      nav_admin: "Admin",

      // Section 1: Creators
      creators_title: "Registered School Students",
      creators_subtitle: "Students from public schools listed with photos and categorized by district",
      search_placeholder: "Name, school or district...",
      all_districts: "All districts",
      no_creators: "No students found",
      no_creators_sub: "Select another district or modify your search term.",
      coins: "coins",
      watch_video: "Watch Video",
      more_details: "Details",

      // Section 2: Challenges
      challenges_title: "School Creative Video Challenges",
      challenges_subtitle: "School students produce creative videos and earn coins awarded by the Head Coordinator",
      btn_submit_challenge: "Submit Video Clip",
      btn_add_challenge: "Add New Challenge",
      active_challenges: "Active Challenges",
      submissions_gallery: "Submitted Video Clips Gallery",
      submissions_gallery_sub: "Videos uploaded by students and verified by coordinator",
      status_approved: "Approved",
      status_pending: "Pending",

      // Section 3: Contests
      contests_title: "Official Contests & Cultural Events",
      contests_subtitle: "Programs open to all public school students nationwide",
      btn_add_contest: "Post New Contest",
      contest_active: "Active Contest",
      contest_date: "Date",
      contest_location: "Location",

      // Section 4: Leaderboard
      leaderboard_title: "National Talent Leaderboard",
      leaderboard_subtitle: "Top students who earned the most coins in creative challenges",
      top_creators: "Top Performers",

      // Section 5: Staff
      staff_title: "Culture Staff Cabinet",
      staff_subtitle: "Select talented students for holiday concerts (Navruz, Independence Day) and invite them directly by phone.",
      staff_my_proposals_title: "My Proposals to Head Coordinator",
      staff_my_proposals_subtitle: "Your cultural initiatives and their live review status",
      btn_send_new_proposal: "Submit New Proposal",
      staff_contacts_title: "Student Contacts for Culture Staff",
      staff_contacts_subtitle: "Across all districts",
      proposal_status_pending: "Thank you for the proposal, admin will contact you",
      proposal_status_approved: "Congratulations, your proposal has been approved!",
      staff_invite_btn: "Invite",

      // Section 6: Admin
      admin_title: "Admin Control: Coins, Challenges & Cloud Server",
      admin_subtitle: "Grade challenge submissions, review visitor analytics, call staff, and manage cloud database.",
      admin_proposals_title: "Proposals and Initiatives from Culture Staff",
      admin_proposals_subtitle: "Initiatives from regional cultural centers for new events, challenges, and nominations",
      admin_staff_title: "Registered Culture Staff",
      admin_staff_subtitle: "Staff phone numbers are strictly visible ONLY to Head Coordinator",
      admin_creators_title: "Students Database",
      admin_creators_subtitle: "Student photos, schools, videos, and coin balance management",
      btn_approve: "Approve",
      btn_convert_challenge: "Make Challenge",
      btn_convert_contest: "Make Event",
      btn_delete: "Delete",

      // Toasts & Dialogs
      toast_proposal_sent: "Thank you for the proposal, admin will contact you",
      toast_proposal_approved: "Congratulations, your proposal has been approved!",
      toast_logged_out: "Logged out. Returned to welcome screen.",
      toast_sync_done: "All data successfully synced!"
    }
  },

  init() {
    this.currentLang = localStorage.getItem('ijodkor_lang_v3') || 'uz';
    this.applyTranslations();
    this.updateLanguageUI();
    this.setupDOMObserver();
  },

  setLanguage(lang) {
    if (!this.translations[lang]) lang = 'uz';
    this.currentLang = lang;
    localStorage.setItem('ijodkor_lang_v3', lang);
    this.applyTranslations();
    this.updateLanguageUI();
    if (window.App && typeof window.App.refreshAllUI === 'function') {
      window.App.refreshAllUI();
    }
  },

  t(key) {
    const dict = this.translations[this.currentLang] || this.translations.uz;
    const val = dict[key] || this.translations.uz[key] || key;
    return this.currentLang === 'uz' ? this.toNewUzbek(val) : val;
  },

  convertDOMToNewUzbek(root = document.body) {
    if (this.currentLang !== 'uz' || !root || this._isConverting) return;
    this._isConverting = true;
    if (this._observer) {
      this._observer.disconnect();
    }
    try {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let currentNode = walker.nextNode();
      while (currentNode) {
        const orig = currentNode.nodeValue;
        if (orig && orig.trim().length > 0) {
          const converted = this.toNewUzbek(orig);
          if (converted !== orig) {
            currentNode.nodeValue = converted;
          }
        }
        currentNode = walker.nextNode();
      }

      if (root.querySelectorAll) {
        root.querySelectorAll('[placeholder], [title], datalist option').forEach(el => {
          if (el.hasAttribute('placeholder')) {
            const p = el.getAttribute('placeholder');
            const cp = this.toNewUzbek(p);
            if (cp !== p) el.setAttribute('placeholder', cp);
          }
          if (el.hasAttribute('title')) {
            const t = el.getAttribute('title');
            const ct = this.toNewUzbek(t);
            if (ct !== t) el.setAttribute('title', ct);
          }
          if (el.tagName === 'OPTION' && el.parentElement && el.parentElement.tagName === 'DATALIST') {
            const v = el.getAttribute('value');
            if (v) {
              const cv = this.toNewUzbek(v);
              if (cv !== v) el.setAttribute('value', cv);
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this._isConverting = false;
      if (this._observer && document.body) {
        this._observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: false
        });
      }
    }
  },

  setupDOMObserver() {
    if (this._observer || typeof MutationObserver === 'undefined' || !document.body) return;
    this._observer = new MutationObserver(() => {
      if (this.currentLang !== 'uz' || this._isConverting) return;
      if (this._observerTimer) clearTimeout(this._observerTimer);
      this._observerTimer = setTimeout(() => {
        if (this.currentLang === 'uz' && !this._isConverting && document.body) {
          this.convertDOMToNewUzbek(document.body);
        }
      }, 120);
    });
    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = this.t(key);
      if (val) {
        el.innerHTML = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.t(key);
      if (val) {
        el.setAttribute('placeholder', val);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = this.t(key);
      if (val) {
        el.setAttribute('title', val);
      }
    });

    if (this.currentLang === 'uz') {
      this.convertDOMToNewUzbek(document.body);
    }
  },

  updateLanguageUI() {
    const flags = { uz: '🇺🇿', ru: '🇷🇺', en: '🇬🇧' };
    const codes = { uz: 'UZ', ru: 'RU', en: 'EN' };

    document.querySelectorAll('.current-lang-flag').forEach(el => {
      el.textContent = flags[this.currentLang] || '🇺🇿';
    });
    document.querySelectorAll('.current-lang-code').forEach(el => {
      el.textContent = codes[this.currentLang] || 'UZ';
    });
  }
};

window.I18n = I18n;
