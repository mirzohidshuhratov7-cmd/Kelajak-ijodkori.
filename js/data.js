/**
 * Kelajak ijodkori - Ma'lumotlar bazasi va Bulutli Sinxronlash tizimi
 * 
 * Yangilanishlar:
 * 1. Barcha maktablar umumiy o'rta ta'lim maktablari ("15-umumiy o'rta ta'lim maktabi").
 * 2. Yo'nalishlar umuman yo'q, faqat tumanlar bo'yicha.
 * 3. O'quvchilar o'z rasmini yuklaydi va istalgan payt profilini tahrirlay oladi (xatolarni tuzatish, video silkasini o'zgartirish, yangi rasm qo'yish).
 * 4. Maxfiylik: O'quvchilar raqami xodim va adminga, xodimlar raqami FAQAT adminga ko'rinadi.
 * 5. Chellenjlar (Muddatli Video Rolik Vazifalari):
 *    - Muddat (kunlar) belgilanadi, muddat o'tsa qabul qilinmaydi.
 *    - O'quvchilar video rolik yuklaydi va pastiga kimlar qatnashganini yozadi.
 *    - Admin ko'rib chiqib tanga taqdim etadi.
 * 6. Oylik qiziqib boruvchilar (tashriflar) statistikasi adminga ko'rsatiladi.
 * 7. Bulutli multi-device sinxronlash (Netlify, telefon va kompyuter).
 */

const STORAGE_KEY_CREATORS = 'ijodkor_creators_data';
const STORAGE_KEY_CONTESTS = 'ijodkor_contests_data';
const STORAGE_KEY_CHALLENGES = 'ijodkor_challenges_data';
const STORAGE_KEY_CHALLENGE_SUBMISSIONS = 'ijodkor_challenge_submissions';
const STORAGE_KEY_SESSION = 'ijodkor_current_session';
const STORAGE_KEY_ADMIN_PIN = 'ijodkor_admin_pin';
const STORAGE_KEY_ADMIN_NAME = 'ijodkor_admin_name';
const STORAGE_KEY_ADMIN_INBOX = 'ijodkor_admin_inbox';
const STORAGE_KEY_STAFF = 'ijodkor_staff_data';
const STORAGE_KEY_CLOUD_ID = 'ijodkor_cloud_id';
const STORAGE_KEY_VISITORS = 'ijodkor_visitors_stats';
const STORAGE_KEY_ADMIN_PHONE = 'ijodkor_admin_phone';
const STORAGE_KEY_PROPOSALS = 'ijodkor_staff_proposals';
const STORAGE_KEY_ADMINS = 'ijodkor_admins_data';
const STORAGE_KEY_REGION_ADMINS = 'ijodkor_region_admins_data';
const STORAGE_KEY_REPUBLIC_ADMIN = 'ijodkor_republic_admin_data';
const STORAGE_KEY_COMPLAINTS = 'ijodkor_student_complaints';
const STORAGE_KEY_SEASON_REPORTS = 'ijodkor_season_reports';

// Bosh koordinatorning rasmiy telefon raqami
const COORDINATOR_PHONE = '+998 99 674 14 40';

// VILOYATLAR RÖYXATI (ÖZBEKISTON RESPUBLIKASI HUDUDLARI — YANGI ÖZBEK ALIFBOSIDA)
const VILOYATLAR = [
  { id: 'buxoro_vil', name: 'Buxoro viloyati', icon: '🕌' },
  { id: 'samarqand_vil', name: 'Samarqand viloyati', icon: '🏛️' },
  { id: 'toshkent_sh', name: 'Toşkent şahri', icon: '🏢' },
  { id: 'toshkent_vil', name: 'Toşkent viloyati', icon: '⛰️' },
  { id: 'fargona_vil', name: 'Farğona viloyati', icon: '🌿' },
  { id: 'andijon_vil', name: 'Andijon viloyati', icon: '🌸' },
  { id: 'namangan_vil', name: 'Namangan viloyati', icon: '🌹' },
  { id: 'xorazm_vil', name: 'Xorazm viloyati', icon: '🧱' },
  { id: 'qashqadaryo_vil', name: 'Qaşqadaryo viloyati', icon: '☀️' },
  { id: 'surxondaryo_vil', name: 'Surxondaryo viloyati', icon: '🌴' },
  { id: 'navoiy_vil', name: 'Navoiy viloyati', icon: '⚡' },
  { id: 'jizzax_vil', name: 'Jizzax viloyati', icon: '🌾' },
  { id: 'sirdaryo_vil', name: 'Sirdaryo viloyati', icon: '🌱' },
  { id: 'qoraqalpogiston', name: 'Qoraqalpoğiston Respublikasi', icon: '🏜️' }
];

// TUMANLAR VA ŞAHARLAR RÖYXATI (VILOYATLARGA BIRIKTIRILGAN)
const TUMANLAR = [
  { id: 'all', name: 'Barça tumanlar', icon: '📍', regionId: 'all', regionName: 'Barça viloyatlar' },
  // Buxoro viloyati (14 ta tuman va şaharlari)
  { id: 'jondor', name: 'Jondor tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'qorakol', name: 'Qoraköl tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'buxoro', name: 'Buxoro şahri', icon: '🕌', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'buxoro-tumani', name: 'Buxoro tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'gijduvon', name: 'Ğijduvon tumani', icon: '🏺', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'olot', name: 'Olot tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'vobkent', name: 'Vobkent tumani', icon: '🗼', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'romitan', name: 'Romitan tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'shofirkon', name: 'Şofirkon tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'peshku', name: 'Peşku tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'kogon', name: 'Kogon tumani', icon: '🚂', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'kogon-shahri', name: 'Kogon şahri', icon: '🏢', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'qorovulbozor', name: 'Qorovulbozor tumani', icon: '🏛️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  { id: 'gazli', name: 'Gazli şahri', icon: '🏙️', regionId: 'buxoro_vil', regionName: 'Buxoro viloyati' },
  // Toşkent şahri tumanlari
  { id: 'chilonzor', name: 'Çilonzor tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'yunusobod', name: 'Yunusobod tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'mirzo-ulugbek', name: 'Mirzo Uluğbek tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'shayxontohur', name: 'Şayxontohur tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'yakkasaroy', name: 'Yakkasaroy tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'yashnobod', name: 'Yaşnobod tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'olmazor', name: 'Olmazor tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'uchtepa', name: 'Uçtepa tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'sergeli', name: 'Sergeli tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'yangihayot', name: 'Yangihayot tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'mirobod', name: 'Mirobod tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  { id: 'bektemir', name: 'Bektemir tumani', icon: '🏢', regionId: 'toshkent_sh', regionName: 'Toşkent şahri' },
  // Toşkent viloyati
  { id: 'chirchiq', name: 'Çirçiq şahri', icon: '⛰️', regionId: 'toshkent_vil', regionName: 'Toşkent viloyati' },
  { id: 'olmaliq', name: 'Olmaliq şahri', icon: '⛰️', regionId: 'toshkent_vil', regionName: 'Toşkent viloyati' },
  { id: 'zangiota', name: 'Zangiota tumani', icon: '⛰️', regionId: 'toshkent_vil', regionName: 'Toşkent viloyati' },
  { id: 'qibray', name: 'Qibray tumani', icon: '⛰️', regionId: 'toshkent_vil', regionName: 'Toşkent viloyati' },
  // Samarqand viloyati
  { id: 'samarqand', name: 'Samarqand şahri', icon: '🏛️', regionId: 'samarqand_vil', regionName: 'Samarqand viloyati' },
  { id: 'urgut', name: 'Urgut tumani', icon: '⛰️', regionId: 'samarqand_vil', regionName: 'Samarqand viloyati' },
  { id: 'kattaqorgon', name: 'Kattaqörğon şahri', icon: '🏛️', regionId: 'samarqand_vil', regionName: 'Samarqand viloyati' },
  // Farğona viloyati
  { id: 'fargona', name: 'Farğona şahri', icon: '🌿', regionId: 'fargona_vil', regionName: 'Farğona viloyati' },
  { id: 'qoqon', name: 'Qöqon şahri', icon: '🏰', regionId: 'fargona_vil', regionName: 'Farğona viloyati' },
  { id: 'margilon', name: 'Marğilon şahri', icon: '🧵', regionId: 'fargona_vil', regionName: 'Farğona viloyati' },
  // Andijon viloyati
  { id: 'andijon', name: 'Andijon şahri', icon: '🌸', regionId: 'andijon_vil', regionName: 'Andijon viloyati' },
  { id: 'asaka', name: 'Asaka tumani', icon: '🏭', regionId: 'andijon_vil', regionName: 'Andijon viloyati' },
  // Namangan viloyati
  { id: 'namangan', name: 'Namangan şahri', icon: '🌹', regionId: 'namangan_vil', regionName: 'Namangan viloyati' },
  { id: 'chust', name: 'Çust tumani', icon: '🔪', regionId: 'namangan_vil', regionName: 'Namangan viloyati' },
  // Xorazm viloyati
  { id: 'urganch', name: 'Urganç şahri', icon: '🌊', regionId: 'xorazm_vil', regionName: 'Xorazm viloyati' },
  { id: 'xiva', name: 'Xiva şahri', icon: '🧱', regionId: 'xorazm_vil', regionName: 'Xorazm viloyati' },
  // Qaşqadaryo viloyati
  { id: 'qarshi', name: 'Qarşi şahri', icon: '☀️', regionId: 'qashqadaryo_vil', regionName: 'Qaşqadaryo viloyati' },
  { id: 'shahrisabz', name: 'Şahrisabz şahri', icon: '🌲', regionId: 'qashqadaryo_vil', regionName: 'Qaşqadaryo viloyati' },
  // Surxondaryo viloyati
  { id: 'termiz', name: 'Termiz şahri', icon: '🌴', regionId: 'surxondaryo_vil', regionName: 'Surxondaryo viloyati' },
  { id: 'denov', name: 'Denov tumani', icon: '🍇', regionId: 'surxondaryo_vil', regionName: 'Surxondaryo viloyati' },
  // Qoraqalpoğiston Respublikasi
  { id: 'nukus', name: 'Nukus şahri', icon: '🏜️', regionId: 'qoraqalpogiston', regionName: 'Qoraqalpoğiston Respublikasi' },
  // Jizzax, Sirdaryo, Navoiy
  { id: 'jizzax', name: 'Jizzax şahri', icon: '🌾', regionId: 'jizzax_vil', regionName: 'Jizzax viloyati' },
  { id: 'guliston', name: 'Guliston şahri', icon: '🌱', regionId: 'sirdaryo_vil', regionName: 'Sirdaryo viloyati' },
  { id: 'navoiy', name: 'Navoiy şahri', icon: '⚡', regionId: 'navoiy_vil', regionName: 'Navoiy viloyati' },
  { id: 'karmana', name: 'Karmana tumani', icon: '⚡', regionId: 'navoiy_vil', regionName: 'Navoiy viloyati' }
];

// Dastlabki namunaviy umumiy o'rta ta'lim maktab o'quvchilari
const INITIAL_CREATORS = [];

// Har bir tuman admini o'z tumani uchun tanlov va chellenjlarni alohida e'lon qiladi
const INITIAL_CONTESTS = [];
const INITIAL_CHALLENGES = [];

// Chellenjlarga topshirilgan dastlabki namunaviy video roliklar
// Namunaviy video roliklar tozalandi
const INITIAL_SUBMISSIONS = [];

// ==========================================================================
// GOOGLE FIREBASE REALTIME MASTER CLOUD DATABASE
// ==========================================================================

const FIREBASE_DB_URL = 'https://ijodkor-d22cd-default-rtdb.asia-southeast1.firebasedatabase.app';

const CloudSync = {
  dbUrl: FIREBASE_DB_URL,
  db: null,
  isOnline: true,
  lastSyncTime: null,
  statusListeners: [],

  onStatusChange(fn) {
    this.statusListeners.push(fn);
  },

  notify(statusObj) {
    this.statusListeners.forEach(fn => {
      try { fn(statusObj); } catch (e) { console.error(e); }
    });
  },

  init() {
    this.notify({ status: 'syncing', text: 'Google Firebase ulanmoqda...', mode: 'Firebase' });

    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp({
            apiKey: "AIzaSyDummyKeyForOpenRulesTestMode",
            projectId: "ijodkor-d22cd",
            databaseURL: this.dbUrl
          });
        }
        try {
          this.db = firebase.app().database(this.dbUrl);
        } catch (e1) {
          try {
            this.db = firebase.database(firebase.app(), this.dbUrl);
          } catch (e2) {
            this.db = firebase.database();
          }
        }
        this.notify({ status: 'connected', text: 'Server: Google Firebase (Ulangan)', mode: 'Firebase Cloud' });

        // 1. O'quvchilarni real vaqtda eshitish
        this.db.ref('creators').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_CREATORS, val);
            if (this.setIfChanged(STORAGE_KEY_CREATORS, JSON.stringify(list)) && window.App && typeof window.App.renderCreators === 'function') {
              window.App.renderCreators();
              window.App.renderLeaderboard();
              window.App.renderAdminSection();
            }
          }
        });

        // 2. Video rolik (chellenj)larni real vaqtda eshitish
        this.db.ref('submissions').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_CHALLENGE_SUBMISSIONS, val);
            if (this.setIfChanged(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(list)) && window.App && typeof window.App.renderChallenges === 'function') {
              window.App.renderChallenges();
              window.App.renderAdminSection();
            }
          }
        });

        // 3. Madaniyat xodimlarini real vaqtda eshitish
        this.db.ref('staff').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_STAFF, val);
            if (this.setIfChanged(STORAGE_KEY_STAFF, JSON.stringify(list)) && window.App && typeof window.App.renderStaffSection === 'function') {
              window.App.renderStaffSection();
              window.App.renderAdminSection();
            }
          }
        });

        // 4. Tanlovlarni eshitish
        this.db.ref('contests').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_CONTESTS, val).filter(c => c && c.id !== 'cnt-1' && c.id !== 'cnt-2');
            if (this.setIfChanged(STORAGE_KEY_CONTESTS, JSON.stringify(list)) && window.App && typeof window.App.renderContests === 'function') {
              window.App.renderContests();
            }
          }
        });

        // 5. Chellenjlarni eshitish
        this.db.ref('challenges').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_CHALLENGES, val).filter(c => c && c.id !== 'chl-1' && c.id !== 'chl-2');
            if (this.setIfChanged(STORAGE_KEY_CHALLENGES, JSON.stringify(list)) && window.App && typeof window.App.renderChallenges === 'function') {
              window.App.renderChallenges();
            }
          }
        });

        // 5b. Tuman Adminlarini eshitish
        this.db.ref('admins').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_ADMINS, val);
            if (this.setIfChanged(STORAGE_KEY_ADMINS, JSON.stringify(list)) && window.App && !this.isTypingInCoordinatorInput()) {
              if (typeof window.App.renderRegionAdminSection === 'function') window.App.renderRegionAdminSection();
              if (typeof window.App.updateDistrictCoordinatorPreview === 'function') window.App.updateDistrictCoordinatorPreview();
            }
          }
        });

        // 5c. Viloyat Adminlarini eshitish
        this.db.ref('regionAdmins').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_REGION_ADMINS, val);
            if (this.setIfChanged(STORAGE_KEY_REGION_ADMINS, JSON.stringify(list)) && window.App && !this.isTypingInCoordinatorInput()) {
              if (typeof window.App.renderRepublicAdminSection === 'function') window.App.renderRepublicAdminSection();
              if (typeof window.App.updateRegionCoordinatorPreview === 'function') window.App.updateRegionCoordinatorPreview();
            }
          }
        });

        // 5d. Respublika Adminini eshitish
        this.db.ref('republicAdmin').on('value', snapshot => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            this.setIfChanged(STORAGE_KEY_REPUBLIC_ADMIN, JSON.stringify(val));
          }
        });

        // 5e. O'quvchilar Shikoyatlarini eshitish
        this.db.ref('complaints').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_COMPLAINTS, val);
            if (this.setIfChanged(STORAGE_KEY_COMPLAINTS, JSON.stringify(list)) && window.App && typeof window.App.renderAdminSection === 'function') {
              window.App.renderAdminSection();
            }
          }
        });

        // 5f. Mavsumiy Hisobotlarni eshitish
        this.db.ref('seasonReports').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_SEASON_REPORTS, val);
            if (this.setIfChanged(STORAGE_KEY_SEASON_REPORTS, JSON.stringify(list)) && window.App && !this.isTypingInCoordinatorInput() && typeof window.App.renderRegionAdminSection === 'function') {
              window.App.renderRegionAdminSection();
              window.App.renderRepublicAdminSection();
            }
          }
        });

        // 6. Qiziqishlar va ko'rishlar soni
        this.db.ref('visitors').on('value', snapshot => {
          const val = snapshot.val();
          if (val && typeof val.total === 'number') {
            if (this.setIfChanged(STORAGE_KEY_VISITORS, JSON.stringify(val)) && window.App && typeof window.App.renderStats === 'function') {
              window.App.renderStats();
            }
          }
        });

        // 7. Admin Inbox (SMS tasdiqlash kodlari)
        this.db.ref('adminInbox').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            if (this.setIfChanged(STORAGE_KEY_ADMIN_INBOX, JSON.stringify(Object.values(val))) && window.App && typeof window.App.updateInboxBadge === 'function') {
              window.App.updateInboxBadge();
            }
          }
        });

        // 8. Madaniyat xodimlari taklif va tashabbuslarini eshitish
        this.db.ref('proposals').on('value', snapshot => {
          const val = snapshot.val();
          if (val) {
            const list = this.mergeListWithLocal(STORAGE_KEY_PROPOSALS, val);
            if (this.setIfChanged(STORAGE_KEY_PROPOSALS, JSON.stringify(list))) {
              if (window.App && typeof window.App.renderStaffProposals === 'function') {
                window.App.renderStaffProposals();
              }
              if (window.App && typeof window.App.renderStaffSection === 'function') {
                window.App.renderStaffSection();
              }
              if (window.App && typeof window.App.checkStaffApprovedProposals === 'function') {
                window.App.checkStaffApprovedProposals();
              }
            }
          }
        });

        // Dastlabki sinxronlash
        setTimeout(() => {
          this.pullAndSync();
        }, 1200);

        // Har 12 soniyada fonda REST orqali yangilab turish
        setInterval(() => {
          this.pullFromRest();
        }, 12000);

      } catch (err) {
        console.warn('Firebase SDK xatosi, REST rejimga o\'tildi:', err);
        this.initRestFallback();
      }
    } else {
      this.initRestFallback();
    }
  },

  initRestFallback() {
    this.notify({ status: 'connected', text: 'Server: Google Firebase (REST)', mode: 'REST' });
    this.pullFromRest();
    setInterval(() => {
      this.pullFromRest();
    }, 12000);
  },

  setIfChanged(key, newJsonStr) {
    const prev = localStorage.getItem(key);
    if (prev === newJsonStr) return false;
    localStorage.setItem(key, newJsonStr);
    return true;
  },

  isTypingInCoordinatorInput() {
    if (typeof document === 'undefined' || !document.activeElement) return false;
    const el = document.activeElement;
    const id = el.id || '';
    return id.startsWith('dist-coord-') || id.startsWith('reg-coord-') || id.startsWith('rep-self-edit-') || id.startsWith('edit-coord-');
  },

  mergeListWithLocal(localKey, remoteObj) {
    const remoteList = Object.values(remoteObj || {}).filter(item => item && !item._deleted);
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem(localKey) || '[]');
      if (!Array.isArray(localList)) localList = [];
    } catch (e) {
      localList = [];
    }

    const mergedMap = new Map();
    remoteList.forEach(item => {
      if (item && item.id) mergedMap.set(item.id, item);
    });

    const now = Date.now();
    localList.forEach(localItem => {
      if (!localItem || !localItem.id || localItem._deleted) return;
      const remoteItem = mergedMap.get(localItem.id);
      if (!remoteItem) {
        // Agar lokal element oxirgi 30 soniya ichida yaratilgan/yangilangan bo'lsa (hali serverga yetib bormagan bo'lsa), uni saqlab qolamiz
        const localTime = new Date(localItem.updatedAt || localItem.createdAt || localItem.registeredAt || 0).getTime();
        if (now - localTime < 30000) {
          mergedMap.set(localItem.id, localItem);
        }
      } else {
        const localTime = new Date(localItem.updatedAt || 0).getTime();
        const remoteTime = new Date(remoteItem.updatedAt || 0).getTime();
        if (localTime > remoteTime) {
          mergedMap.set(localItem.id, { ...remoteItem, ...localItem });
        }
      }
    });

    return Array.from(mergedMap.values());
  },

  applyRemoteRoot(root) {
    if (!root) return false;
    let changed = false;
    if (root.creators && this.setIfChanged(STORAGE_KEY_CREATORS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_CREATORS, root.creators)))) changed = true;
    if (root.submissions && this.setIfChanged(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_CHALLENGE_SUBMISSIONS, root.submissions)))) changed = true;
    if (root.staff && this.setIfChanged(STORAGE_KEY_STAFF, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_STAFF, root.staff)))) changed = true;
    if (root.contests && this.setIfChanged(STORAGE_KEY_CONTESTS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_CONTESTS, root.contests).filter(c => c && c.id !== 'cnt-1' && c.id !== 'cnt-2')))) changed = true;
    if (root.challenges && this.setIfChanged(STORAGE_KEY_CHALLENGES, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_CHALLENGES, root.challenges).filter(c => c && c.id !== 'chl-1' && c.id !== 'chl-2')))) changed = true;
    if (root.admins && this.setIfChanged(STORAGE_KEY_ADMINS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_ADMINS, root.admins)))) changed = true;
    if (root.regionAdmins && this.setIfChanged(STORAGE_KEY_REGION_ADMINS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_REGION_ADMINS, root.regionAdmins)))) changed = true;
    if (root.republicAdmin && this.setIfChanged(STORAGE_KEY_REPUBLIC_ADMIN, JSON.stringify(root.republicAdmin))) changed = true;
    if (root.complaints && this.setIfChanged(STORAGE_KEY_COMPLAINTS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_COMPLAINTS, root.complaints)))) changed = true;
    if (root.seasonReports && this.setIfChanged(STORAGE_KEY_SEASON_REPORTS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_SEASON_REPORTS, root.seasonReports)))) changed = true;
    if (root.visitors) this.setIfChanged(STORAGE_KEY_VISITORS, JSON.stringify(root.visitors));
    if (root.adminInbox && this.setIfChanged(STORAGE_KEY_ADMIN_INBOX, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_ADMIN_INBOX, root.adminInbox)))) changed = true;
    if (root.proposals && this.setIfChanged(STORAGE_KEY_PROPOSALS, JSON.stringify(this.mergeListWithLocal(STORAGE_KEY_PROPOSALS, root.proposals)))) changed = true;
    if (root.settings) {
      if (root.settings.adminPhone && this.setIfChanged(STORAGE_KEY_ADMIN_PHONE, root.settings.adminPhone)) changed = true;
      if (root.settings.adminName && this.setIfChanged(STORAGE_KEY_ADMIN_NAME, root.settings.adminName)) changed = true;
    }
    return changed;
  },

  async pullFromRest() {
    try {
      const res = await fetch(`${this.dbUrl}/.json`);
      if (res.ok) {
        const root = await res.json();
        if (root) {
          const changed = this.applyRemoteRoot(root);
          if (changed && window.App && typeof window.App.refreshAllUI === 'function' && !this.isTypingInCoordinatorInput()) {
            window.App.refreshAllUI();
          }
        }
      }
    } catch (e) {
      console.warn('REST pull xatosi:', e);
    }
  },

  async pullAndSync() {
    if (this.db) {
      try {
        const snap = await this.db.ref('/').once('value');
        const root = snap.val();
        if (root) {
          const changed = this.applyRemoteRoot(root);
          if (changed && window.App && typeof window.App.refreshAllUI === 'function' && !this.isTypingInCoordinatorInput()) {
            window.App.refreshAllUI();
          }
        } else {
          // Baza bo'sh bo'lsa boshlang'ich tanlov va chellenjlarni saqlash
          this.pushAllToCloud();
        }
      } catch (e) {
        console.warn(e);
      }
    }
  },

  push() {
    this.pushAllToCloud();
  },

  pushAllToCloud() {
    try {
      const creators = DataStore.getCreators();
      const submissions = DataStore.getChallengeSubmissions();
      const staff = DataStore.getStaffList();
      const contests = DataStore.getContests();
      const challenges = DataStore.getChallenges();
      const visitors = DataStore.getVisitorStats();
      const adminInbox = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMIN_INBOX) || '[]');

      const creatorsObj = {};
      creators.forEach(c => { if (c && c.id) creatorsObj[c.id] = c; });

      const submissionsObj = {};
      submissions.forEach(s => { if (s && s.id) submissionsObj[s.id] = s; });

      const staffObj = {};
      staff.forEach(st => { if (st && st.id) staffObj[st.id] = st; });

      const contestsObj = {};
      contests.forEach(cn => { if (cn && cn.id) contestsObj[cn.id] = cn; });

      const challengesObj = {};
      challenges.forEach(ch => { if (ch && ch.id) challengesObj[ch.id] = ch; });

      const inboxObj = {};
      adminInbox.forEach(m => { if (m && m.id) inboxObj[m.id] = m; });

      const proposals = DataStore.getStaffProposals();
      const proposalsObj = {};
      proposals.forEach(p => { if (p && p.id) proposalsObj[p.id] = p; });

      const admins = DataStore.getDistrictAdmins();
      const adminsObj = {};
      admins.forEach(a => { if (a && a.id) adminsObj[a.id] = a; });

      const regionAdmins = DataStore.getRegionAdmins();
      const regionAdminsObj = {};
      regionAdmins.forEach(ra => { if (ra && ra.id) regionAdminsObj[ra.id] = ra; });

      const republicAdmin = DataStore.getRepublicAdmin();

      const complaints = DataStore.getComplaints();
      const complaintsObj = {};
      complaints.forEach(cm => { if (cm && cm.id) complaintsObj[cm.id] = cm; });

      const seasonReports = DataStore.getSeasonReports();
      const seasonReportsObj = {};
      seasonReports.forEach(sr => { if (sr && sr.id) seasonReportsObj[sr.id] = sr; });

      if (this.db) {
        if (Object.keys(creatorsObj).length > 0) this.db.ref('creators').update(creatorsObj);
        if (Object.keys(submissionsObj).length > 0) this.db.ref('submissions').update(submissionsObj);
        if (Object.keys(staffObj).length > 0) this.db.ref('staff').update(staffObj);
        if (Object.keys(contestsObj).length > 0) this.db.ref('contests').update(contestsObj);
        if (Object.keys(challengesObj).length > 0) this.db.ref('challenges').update(challengesObj);
        if (Object.keys(proposalsObj).length > 0) this.db.ref('proposals').update(proposalsObj);
        if (Object.keys(adminsObj).length > 0) this.db.ref('admins').update(adminsObj);
        if (Object.keys(regionAdminsObj).length > 0) this.db.ref('regionAdmins').update(regionAdminsObj);
        if (republicAdmin && republicAdmin.pin) this.db.ref('republicAdmin').set(republicAdmin);
        if (Object.keys(complaintsObj).length > 0) this.db.ref('complaints').update(complaintsObj);
        if (Object.keys(seasonReportsObj).length > 0) this.db.ref('seasonReports').update(seasonReportsObj);
        if (visitors && visitors.total) this.db.ref('visitors').set(visitors);
        if (Object.keys(inboxObj).length > 0) this.db.ref('adminInbox').update(inboxObj);
      }

      // REST orqali ham kafolatli yuborish (barcha qurilmalarda sinxron bo'lishi uchun)
      fetch(`${this.dbUrl}/.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creators: creatorsObj,
          submissions: submissionsObj,
          staff: staffObj,
          contests: contestsObj,
          challenges: challengesObj,
          proposals: proposalsObj,
          admins: adminsObj,
          regionAdmins: regionAdminsObj,
          republicAdmin: republicAdmin,
          complaints: complaintsObj,
          seasonReports: seasonReportsObj,
          visitors: visitors,
          adminInbox: inboxObj
        })
      }).catch(console.warn);
    } catch (e) {
      console.warn('Firebase push xatosi:', e);
    }
  },

  broadcastCreator(creator) {
    if (!creator || !creator.id) return;
    try {
      creator.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('creators/' + creator.id).set(creator);
      }
      fetch(`${this.dbUrl}/creators/${creator.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creator)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteCreator(creatorId) {
    if (!creatorId) return;
    try {
      if (this.db) {
        this.db.ref('creators/' + creatorId).remove();
      }
      fetch(`${this.dbUrl}/creators/${creatorId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastSubmission(sub) {
    if (!sub || !sub.id) return;
    try {
      sub.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('submissions/' + sub.id).set(sub);
      }
      fetch(`${this.dbUrl}/submissions/${sub.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteSubmission(subId) {
    if (!subId) return;
    try {
      if (this.db) {
        this.db.ref('submissions/' + subId).remove();
      }
      fetch(`${this.dbUrl}/submissions/${subId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastStaff(staff) {
    if (!staff || !staff.id) return;
    try {
      staff.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('staff/' + staff.id).set(staff);
      }
      fetch(`${this.dbUrl}/staff/${staff.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteStaff(staffId) {
    if (!staffId) return;
    try {
      if (this.db) {
        this.db.ref('staff/' + staffId).remove();
      }
      fetch(`${this.dbUrl}/staff/${staffId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastContest(contest) {
    if (!contest || !contest.id) return;
    try {
      contest.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('contests/' + contest.id).set(contest);
      }
      fetch(`${this.dbUrl}/contests/${contest.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contest)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteContest(contestId) {
    if (!contestId) return;
    try {
      if (this.db) {
        this.db.ref('contests/' + contestId).remove();
      }
      fetch(`${this.dbUrl}/contests/${contestId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastProposal(proposal) {
    if (!proposal || !proposal.id) return;
    try {
      proposal.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('proposals/' + proposal.id).set(proposal);
      }
      fetch(`${this.dbUrl}/proposals/${proposal.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteProposal(proposalId) {
    if (!proposalId) return;
    try {
      if (this.db) {
        this.db.ref('proposals/' + proposalId).remove();
      }
      fetch(`${this.dbUrl}/proposals/${proposalId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastChallenge(challenge) {
    if (!challenge || !challenge.id) return;
    try {
      challenge.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('challenges/' + challenge.id).set(challenge);
      }
      fetch(`${this.dbUrl}/challenges/${challenge.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challenge)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastDeleteChallenge(challengeId) {
    if (!challengeId) return;
    try {
      if (this.db) {
        this.db.ref('challenges/' + challengeId).remove();
      }
      fetch(`${this.dbUrl}/challenges/${challengeId}.json`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}
  },

  broadcastInbox(smsItem) {
    if (!smsItem || !smsItem.id) return;
    try {
      if (this.db) {
        this.db.ref('adminInbox/' + smsItem.id).set(smsItem);
      }
      fetch(`${this.dbUrl}/adminInbox/${smsItem.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsItem)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastAdmin(adminObj) {
    if (!adminObj || !adminObj.id) return;
    try {
      adminObj.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('admins/' + adminObj.id).set(adminObj);
      }
      fetch(`${this.dbUrl}/admins/${adminObj.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminObj)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastRegionAdmin(adminObj) {
    if (!adminObj || !adminObj.id) return;
    try {
      adminObj.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('regionAdmins/' + adminObj.id).set(adminObj);
      }
      fetch(`${this.dbUrl}/regionAdmins/${adminObj.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminObj)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastRepublicAdmin(repObj) {
    if (!repObj) return;
    try {
      repObj.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('republicAdmin').set(repObj);
      }
      fetch(`${this.dbUrl}/republicAdmin.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repObj)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastComplaint(complaintObj) {
    if (!complaintObj || !complaintObj.id) return;
    try {
      complaintObj.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('complaints/' + complaintObj.id).set(complaintObj);
      }
      fetch(`${this.dbUrl}/complaints/${complaintObj.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintObj)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastSeasonReport(reportObj) {
    if (!reportObj || !reportObj.id) return;
    try {
      reportObj.updatedAt = new Date().toISOString();
      if (this.db) {
        this.db.ref('seasonReports/' + reportObj.id).set(reportObj);
      }
      fetch(`${this.dbUrl}/seasonReports/${reportObj.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportObj)
      }).catch(console.warn);
    } catch (e) {}
  },

  broadcastVisitorVisit() {
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    try {
      if (this.db) {
        this.db.ref('visitors').transaction(current => {
          current = current || { total: 0, monthly: {} };
          if (!current.monthly) current.monthly = {};
          current.monthly[currentMonthKey] = (current.monthly[currentMonthKey] || 0) + 1;
          current.total = (current.total || 0) + 1;
          current.lastVisit = new Date().toISOString();
          return current;
        });
      } else {
        fetch(`${this.dbUrl}/visitors.json`).then(r => r.json()).then(data => {
          data = data || { total: 0, monthly: {} };
          if (!data.monthly) data.monthly = {};
          data.monthly[currentMonthKey] = (data.monthly[currentMonthKey] || 0) + 1;
          data.total = (data.total || 0) + 1;
          fetch(`${this.dbUrl}/visitors.json`, { method: 'PUT', body: JSON.stringify(data) });
        }).catch(console.warn);
      }
    } catch (e) {}
  },

  async pull() {
    this.notify({ status: 'syncing', text: 'Firebase bazasidan yangilanmoqda...' });
    await this.pullAndSync();
    setTimeout(() => {
      this.notify({ status: 'connected', text: 'Server: Google Firebase (Faol)', mode: 'Firebase Cloud' });
      if (window.App && typeof window.App.refreshAllUI === 'function') {
        window.App.refreshAllUI();
      }
    }, 500);
  },

  getShareUrl() {
    return window.location.origin + window.location.pathname;
  }
};

// Data Layer funksiyalari
const DataStore = {
  _initialized: false,
  _visitRecorded: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // 0. To'liq tozalash migratsiyasi: eski namuna ma'lumotlar va hisoblagichlarni batamom tozalash
    try {
      if (localStorage.getItem('ijodkor_clean_v3_fresh') !== 'done') {
        localStorage.removeItem(STORAGE_KEY_VISITORS);
        localStorage.removeItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS);
        let rawCreators = localStorage.getItem(STORAGE_KEY_CREATORS);
        if (rawCreators) {
          let creators = JSON.parse(rawCreators);
          if (Array.isArray(creators)) {
            const demoIds = ['cre-1', 'cre-2', 'cre-3', 'cre-4', 'cre-5', 'cre-6', 'cre-7', 'cre-8', 'cre-9', 'cre-10'];
            creators = creators.filter(c => c && !demoIds.includes(c.id));
            localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(creators));
          }
        }
        localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify([]));
        localStorage.setItem('ijodkor_clean_v3_fresh', 'done');
      }
    } catch (e) {
      console.warn('Migratsiya xatosi:', e);
    }

    // 1. Dastlabki namuna o'quvchilarni (cre-1...cre-10) avtomatik tozalash
    try {
      let rawCreators = localStorage.getItem(STORAGE_KEY_CREATORS);
      if (rawCreators) {
        let creators = JSON.parse(rawCreators);
        if (Array.isArray(creators)) {
          const demoIds = ['cre-1', 'cre-2', 'cre-3', 'cre-4', 'cre-5', 'cre-6', 'cre-7', 'cre-8', 'cre-9', 'cre-10'];
          const filtered = creators.filter(c => c && !demoIds.includes(c.id));
          if (filtered.length !== creators.length) {
            localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(filtered));
          }
        }
      } else {
        localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify([]));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify([]));
    }

    // 2. Namuna chellenj videosini (sub-1) avtomatik tozalash
    try {
      let rawSubs = localStorage.getItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS);
      if (rawSubs) {
        let subs = JSON.parse(rawSubs);
        if (Array.isArray(subs)) {
          const filteredSubs = subs.filter(s => s && s.id !== 'sub-1' && s.creatorName !== 'Jasurbek Rahimov');
          if (filteredSubs.length !== subs.length) {
            localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(filteredSubs));
          }
        }
      } else {
        localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify([]));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_CONTESTS)) {
      localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(INITIAL_CONTESTS));
    } else {
      try {
        const cList = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTESTS) || '[]');
        if (Array.isArray(cList)) {
          const filteredC = cList.filter(c => c && c.id !== 'cnt-1' && c.id !== 'cnt-2');
          if (filteredC.length !== cList.length) localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(filteredC));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEY_CHALLENGES)) {
      localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
    } else {
      try {
        const chList = JSON.parse(localStorage.getItem(STORAGE_KEY_CHALLENGES) || '[]');
        if (Array.isArray(chList)) {
          const filteredCh = chList.filter(c => c && c.id !== 'chl-1' && c.id !== 'chl-2');
          if (filteredCh.length !== chList.length) localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(filteredCh));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS)) {
      localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_ADMIN_PIN)) {
      localStorage.setItem(STORAGE_KEY_ADMIN_PIN, '7777');
    }
    if (!localStorage.getItem(STORAGE_KEY_ADMIN_NAME)) {
      localStorage.setItem(STORAGE_KEY_ADMIN_NAME, 'Madaniyat Bosh Koordinatori');
    }
    if (!localStorage.getItem(STORAGE_KEY_STAFF)) {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_ADMINS) || localStorage.getItem(STORAGE_KEY_ADMINS) === '[]') {
      const defaultDistAdmins = [
        { id: 'adm-jondor', district: 'jondor', districtLabel: 'Jondor tumani', regionId: 'buxoro_vil', regionLabel: 'Buxoro viloyati', fullName: 'Şuhrat Mehroj', phone: COORDINATOR_PHONE, pin: '12345' },
        { id: 'adm-qorakol', district: 'qorakol', districtLabel: 'Qoraköl tumani', regionId: 'buxoro_vil', regionLabel: 'Buxoro viloyati', fullName: 'Şuhrat Mirzoqulov', phone: COORDINATOR_PHONE, pin: '12345' }
      ];
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(defaultDistAdmins));
    }
    if (!localStorage.getItem(STORAGE_KEY_REGION_ADMINS) || localStorage.getItem(STORAGE_KEY_REGION_ADMINS) === '[]') {
      const defaultRegAdmins = VILOYATLAR.map(v => ({
        id: 'regadm-' + v.id,
        regionId: v.id,
        regionLabel: v.name,
        fullName: v.id === 'buxoro_vil' ? 'Şuhrat Mirzohid' : `${v.name} Koordinatori`,
        phone: COORDINATOR_PHONE,
        pin: '12345'
      }));
      localStorage.setItem(STORAGE_KEY_REGION_ADMINS, JSON.stringify(defaultRegAdmins));
    }
    if (!localStorage.getItem(STORAGE_KEY_COMPLAINTS)) {
      localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEY_SEASON_REPORTS)) {
      localStorage.setItem(STORAGE_KEY_SEASON_REPORTS, JSON.stringify([]));
    }
    if (!this._visitRecorded) {
      this._visitRecorded = true;
      this.recordVisit();
    }
  },

  // Har ikkala alifbo (eski va yangi: ö/o', ğ/g', ş/sh, ç/ch) böyiça yagona soliştiiruv matni
  toCanonicalUzbek(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .toLowerCase()
      .replace(/ö/g, "o'")
      .replace(/ğ/g, "g'")
      .replace(/ş/g, 'sh')
      .replace(/ç/g, 'ch')
      .replace(/['`‘’ʻʼ]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  },

  // VILOYAT NOMINI STANDART ID VA NOMGA KELTIRISH (masalan: "Buxoro", "Buxoro viloyati" -> { id: 'buxoro_vil', label: 'Buxoro viloyati' })
  normalizeRegion(rawRegion) {
    if (!rawRegion || typeof rawRegion !== 'string') {
      return { id: '', label: '' };
    }
    const clean = rawRegion.trim();
    if (!clean || clean.toLowerCase() === 'all') {
      return { id: 'all', label: 'Barça viloyatlar' };
    }
    const lower = this.toCanonicalUzbek(clean);

    const baseReg = lower
      .replace(/\b(viloyati|viloyat|respublikasi|respublika|shahri|shahar)\b/g, '')
      .trim();

    for (const v of VILOYATLAR) {
      const vNameLower = this.toCanonicalUzbek(v.name);
      const vBase = vNameLower.replace(/\b(viloyati|viloyat|respublikasi|respublika|shahri|shahar)\b/g, '').trim();
      if (v.id === lower || vNameLower === lower || (baseReg && vBase === baseReg)) {
        return { id: v.id, label: v.name };
      }
    }

    const slug = (baseReg || lower)
      .replace(/[^a-z0-9\u0400-\u04FF']/g, '_')
      .replace(/'/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    let formattedLabel = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!/\b(viloyati|viloyat|respublikasi|shahri|şahri)\b/i.test(formattedLabel)) {
      formattedLabel += ' viloyati';
    }
    return { id: slug || lower, label: formattedLabel };
  },

  regionsMatch(regA, regB) {
    if (!regA || !regB) return false;
    const normA = this.normalizeRegion(regA);
    const normB = this.normalizeRegion(regB);
    if (!normA.id || !normB.id) return false;
    if (normA.id === 'all' || normB.id === 'all') return true;
    return normA.id === normB.id;
  },

  // TUMAN NOMINI STANDART ID, NOM VA VILOYATGA KELTIRISH
  normalizeDistrict(rawInput, rawRegionInput = '') {
    const explicitReg = rawRegionInput ? this.normalizeRegion(rawRegionInput) : { id: '', label: '' };

    if (!rawInput || typeof rawInput !== 'string') {
      return { id: '', label: '', regionId: explicitReg.id || 'buxoro_vil', regionLabel: explicitReg.label || 'Buxoro viloyati' };
    }
    let clean = rawInput.trim();
    if (!clean || clean.toLowerCase() === 'all') {
      return { id: 'all', label: 'Barça tumanlar', regionId: explicitReg.id || 'all', regionLabel: explicitReg.label || 'Barça viloyatlar' };
    }

    // Agar "Jondor tumani, Buxoro viloyati" kabi vergul bilan yozilgan bo'lsa, viloyatni ajratib olamiz
    let inferredReg = explicitReg;
    if (clean.includes(',')) {
      const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        clean = parts[0];
        if (!inferredReg.id) {
          inferredReg = this.normalizeRegion(parts.slice(1).join(' '));
        }
      }
    }

    const lower = this.toCanonicalUzbek(clean);

    // 1. TUMANLAR ro'yxatidan aniq yoki qisman moslikni qidirish
    const baseInput = lower
      .replace(/\b(tumani|tuman|shahri|shahar|sh\.)\b/g, '')
      .trim();

    for (const t of TUMANLAR) {
      if (t.id === 'all') continue;
      const tNameLower = this.toCanonicalUzbek(t.name);
      const tBase = tNameLower.replace(/\b(tumani|tuman|shahri|shahar)\b/g, '').trim();
      if (t.id === lower || tNameLower === lower || (baseInput && tBase === baseInput)) {
        return {
          id: t.id,
          label: t.name,
          regionId: inferredReg.id || t.regionId || 'buxoro_vil',
          regionLabel: inferredReg.label || t.regionName || 'Buxoro viloyati'
        };
      }
    }

    // 2. Agar ro'yxatda yo'q yangi tuman kiritilgan bo'lsa, uni ham chiroyli standart holatga keltiramiz
    const slug = (baseInput || lower)
      .replace(/[^a-z0-9\u0400-\u04FF']/g, '-')
      .replace(/'/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let formattedLabel = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!/\b(tumani|tuman|shahri|shahar|şahri|şahar)\b/i.test(formattedLabel)) {
      formattedLabel += ' tumani';
    }
    return {
      id: slug || lower,
      label: formattedLabel,
      regionId: inferredReg.id || 'buxoro_vil',
      regionLabel: inferredReg.label || 'Buxoro viloyati'
    };
  },

  districtsMatch(distA, distB) {
    if (!distA || !distB) return false;
    const normA = this.normalizeDistrict(distA);
    const normB = this.normalizeDistrict(distB);
    if (!normA.id || !normB.id) return false;
    if (normA.id === 'all' || normB.id === 'all') return true;
    return normA.id === normB.id;
  },

  // Viloyatga tegishli barcha tumanlarni olish (TUMANLAR ro'yxatidan + ro'yxatdan o'tgan o'quvchi/admin tumanlaridan)
  getDistrictsByRegion(regionInput) {
    const normReg = this.normalizeRegion(regionInput);
    if (!normReg.id || normReg.id === 'all') {
      return TUMANLAR.filter(t => t.id !== 'all');
    }
    const map = new Map();
    TUMANLAR.forEach(t => {
      if (t.id !== 'all' && t.regionId === normReg.id) {
        map.set(t.id, { id: t.id, name: t.name, icon: t.icon || '🏛️', regionId: normReg.id, regionName: normReg.label });
      }
    });
    // Bazadagi o'quvchi va tuman adminlaridan ham shu viloyatga tegishli yangi tumanlarni qo'shamiz
    this.getCreators().forEach(c => {
      if (!c || !c.district) return;
      const cReg = c.regionId ? { id: c.regionId, label: c.regionLabel } : this.normalizeDistrict(c.districtLabel || c.district);
      const rId = cReg.id || cReg.regionId;
      if (rId === normReg.id && !map.has(c.district)) {
        map.set(c.district, { id: c.district, name: c.districtLabel || c.district, icon: '🏛️', regionId: normReg.id, regionName: normReg.label });
      }
    });
    this.getDistrictAdmins().forEach(a => {
      if (!a || !a.district) return;
      const aRegId = a.regionId || this.normalizeDistrict(a.districtLabel || a.district).regionId;
      if (aRegId === normReg.id && !map.has(a.district)) {
        map.set(a.district, { id: a.district, name: a.districtLabel || a.district, icon: '🏛️', regionId: normReg.id, regionName: normReg.label });
      }
    });
    return Array.from(map.values());
  },

  // 1. OYLIK TASHRIF VA QIZIQIB BORUVCHILAR STATISTIKASI (HAQIQIY HISOB)
  recordVisit() {
    const currentMonthKey = new Date().toISOString().slice(0, 7); // e.g. "2026-10"
    let stats = {};
    try {
      stats = JSON.parse(localStorage.getItem(STORAGE_KEY_VISITORS)) || {};
    } catch (e) {
      stats = {};
    }

    if (!stats.monthly) stats.monthly = {};
    if (!stats.monthly[currentMonthKey]) {
      stats.monthly[currentMonthKey] = 0;
    }

    stats.monthly[currentMonthKey] += 1;
    stats.total = (stats.total || 0) + 1;
    stats.lastVisit = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(stats));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastVisitorVisit) {
        CloudSync.broadcastVisitorVisit();
      }
    } catch (e) {}
    return stats;
  },

  getVisitorStats() {
    try {
      const stats = JSON.parse(localStorage.getItem(STORAGE_KEY_VISITORS));
      if (stats && typeof stats.total === 'number') {
        return stats;
      }
      return { total: 0, monthly: {} };
    } catch (e) {
      return { total: 0, monthly: {} };
    }
  },

  // 2. TUMAN ADMINLARI VA SOZLAMALARI (HAR BIR TUMAN UCHUN ALOHIDA ADMIN)
  getDistrictAdmins() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  getDistrictAdmin(districtInput) {
    if (!districtInput) return null;
    const norm = this.normalizeDistrict(districtInput);
    if (!norm.id || norm.id === 'all') return null;
    const admins = this.getDistrictAdmins();
    const found = admins.find(a => a && (a.district === norm.id || this.districtsMatch(a.district || a.districtLabel, norm.id)));
    if (found) return found;
    return {
      id: 'adm-' + norm.id,
      district: norm.id,
      districtLabel: norm.label,
      regionId: norm.regionId || 'buxoro_vil',
      regionLabel: norm.regionLabel || 'Buxoro viloyati',
      fullName: norm.id === 'jondor' ? 'Şuhrat Mehroj' : (norm.id === 'qorakol' ? 'Şuhrat Mirzoqulov' : `${norm.label} Koordinatori`),
      phone: COORDINATOR_PHONE,
      pin: '12345'
    };
  },

  saveDistrictAdmin(adminData) {
    const norm = this.normalizeDistrict(adminData.district || adminData.districtLabel, adminData.region || adminData.regionId || adminData.regionLabel || '');
    if (!norm.id || norm.id === 'all') return null;

    const admins = this.getDistrictAdmins();
    const existingIdx = admins.findIndex(a => a && (a.district === norm.id || this.districtsMatch(a.district || a.districtLabel, norm.id)));
    const nowIso = new Date().toISOString();

    const adminRecord = {
      id: 'adm-' + norm.id,
      district: norm.id,
      districtLabel: norm.label,
      regionId: norm.regionId || (existingIdx >= 0 ? admins[existingIdx].regionId : 'buxoro_vil'),
      regionLabel: norm.regionLabel || (existingIdx >= 0 ? admins[existingIdx].regionLabel : 'Buxoro viloyati'),
      fullName: (adminData.fullName || (existingIdx >= 0 ? admins[existingIdx].fullName : '') || `${norm.label} Koordinatori`).trim(),
      phone: (adminData.phone || (existingIdx >= 0 ? admins[existingIdx].phone : '') || COORDINATOR_PHONE).trim(),
      pin: (adminData.pin || (existingIdx >= 0 ? admins[existingIdx].pin : '') || '12345').trim(),
      updatedAt: nowIso
    };

    if (existingIdx >= 0) {
      admins[existingIdx] = { ...admins[existingIdx], ...adminRecord };
    } else {
      admins.unshift(adminRecord);
    }

    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastAdmin) {
        CloudSync.broadcastAdmin(adminRecord);
      }
    } catch (e) {}
    CloudSync.push();
    return adminRecord;
  },

  verifyDistrictAdminPin(districtInput, enteredPin) {
    if (!enteredPin) return false;
    const cleanPin = enteredPin.trim();
    const dAdmin = this.getDistrictAdmin(districtInput);
    if (dAdmin && dAdmin.pin) {
      return dAdmin.pin.trim() === cleanPin;
    }
    return cleanPin === '12345';
  },

  // 2B. VILOYAT KOORDINATORLARI (VILOYAT ADMINLARI — MASALAN: BUXORO VILOYATI KOORDINATORI)
  getRegionAdmins() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_REGION_ADMINS));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  getRegionAdmin(regionInput) {
    if (!regionInput) return null;
    const norm = this.normalizeRegion(regionInput);
    if (!norm.id || norm.id === 'all') return null;
    const rAdmins = this.getRegionAdmins();
    const found = rAdmins.find(a => a && (a.regionId === norm.id || this.regionsMatch(a.regionId || a.regionLabel, norm.id)));
    if (found) return found;
    return {
      id: 'regadm-' + norm.id,
      regionId: norm.id,
      regionLabel: norm.label,
      fullName: norm.id === 'buxoro_vil' ? 'Şuhrat Mirzohid' : `${norm.label} Koordinatori`,
      phone: COORDINATOR_PHONE,
      pin: '12345'
    };
  },

  saveRegionAdmin(adminData) {
    const norm = this.normalizeRegion(adminData.region || adminData.regionId || adminData.regionLabel);
    if (!norm.id || norm.id === 'all') return null;

    const rAdmins = this.getRegionAdmins();
    const existingIdx = rAdmins.findIndex(a => a && (a.regionId === norm.id || this.regionsMatch(a.regionId || a.regionLabel, norm.id)));
    const nowIso = new Date().toISOString();

    const adminRecord = {
      id: 'regadm-' + norm.id,
      regionId: norm.id,
      regionLabel: norm.label,
      fullName: (adminData.fullName || (existingIdx >= 0 ? rAdmins[existingIdx].fullName : '') || `${norm.label} Koordinatori`).trim(),
      phone: (adminData.phone || (existingIdx >= 0 ? rAdmins[existingIdx].phone : '') || COORDINATOR_PHONE).trim(),
      pin: (adminData.pin || (existingIdx >= 0 ? rAdmins[existingIdx].pin : '') || '12345').trim(),
      updatedAt: nowIso
    };

    if (existingIdx >= 0) {
      rAdmins[existingIdx] = { ...rAdmins[existingIdx], ...adminRecord };
    } else {
      rAdmins.unshift(adminRecord);
    }

    localStorage.setItem(STORAGE_KEY_REGION_ADMINS, JSON.stringify(rAdmins));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastRegionAdmin) {
        CloudSync.broadcastRegionAdmin(adminRecord);
      }
    } catch (e) {}
    CloudSync.push();
    return adminRecord;
  },

  verifyRegionAdminPin(regionInput, enteredPin) {
    if (!enteredPin) return false;
    const cleanPin = enteredPin.trim();
    const rAdmin = this.getRegionAdmin(regionInput);
    if (rAdmin && rAdmin.pin) {
      return rAdmin.pin.trim() === cleanPin;
    }
    return cleanPin === '12345';
  },

  // 2C. RESPUBLIKA KOORDINATORI (RESPUBLIKA ADMINI)
  getRepublicAdmin() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_REPUBLIC_ADMIN));
      if (data && typeof data === 'object' && data.pin) {
        return data;
      }
    } catch (e) {}
    return {
      id: 'rep-admin-main',
      fullName: 'Şuhratov Mirzohid (Respublika Boş Koordinatori)',
      phone: COORDINATOR_PHONE,
      pin: '12345'
    };
  },

  saveRepublicAdmin(adminData) {
    const current = this.getRepublicAdmin();
    const updated = {
      id: 'rep-admin-main',
      fullName: (adminData.fullName || current.fullName || 'Respublika Boş Koordinatori').trim(),
      phone: (adminData.phone || current.phone || COORDINATOR_PHONE).trim(),
      pin: (adminData.pin || current.pin || '12345').trim(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_REPUBLIC_ADMIN, JSON.stringify(updated));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastRepublicAdmin) {
        CloudSync.broadcastRepublicAdmin(updated);
      }
    } catch (e) {}
    CloudSync.push();
    return updated;
  },

  verifyRepublicAdminPin(enteredPin) {
    if (!enteredPin) return false;
    const cleanPin = enteredPin.trim();
    const rep = this.getRepublicAdmin();
    return (rep.pin || '12345').trim() === cleanPin;
  },

  // 2D. O'QUVCHILAR SHIKOYATLARI (TANGA BERISHDA XATOLIK YUZASIDAN MUROJAATLAR)
  getComplaints() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLAINTS));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  addComplaint(complaintData) {
    const complaints = this.getComplaints();
    const normDist = this.normalizeDistrict(
      complaintData.districtLabel || complaintData.district || 'jondor',
      complaintData.regionLabel || complaintData.regionId || ''
    );
    const nowIso = new Date().toISOString();
    const reasonText = (complaintData.reason || complaintData.reasonTitle || "Videorolikda qatnashdim, lekin tanga berilmadi").trim();

    const newComplaint = {
      id: 'cmp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      creatorId: complaintData.creatorId || '',
      creatorName: (complaintData.creatorName || "O'quvchi").trim(),
      creatorSchool: (complaintData.creatorSchool || '').trim(),
      creatorPhone: (complaintData.creatorPhone || '').trim(),
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      reasonCategory: complaintData.reasonCategory || 'missing_coins_video',
      reason: reasonText,
      reasonTitle: reasonText,
      eventOrChallengeName: (complaintData.eventOrChallengeName || '').trim(),
      videoUrl: (complaintData.videoUrl || '').trim(),
      description: (complaintData.description || '').trim(),
      requestedCoins: parseInt(complaintData.requestedCoins) || 30,
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      coinsAwarded: 0,
      awardedCoins: 0,
      adminNote: '',
      createdAt: nowIso.split('T')[0],
      updatedAt: nowIso
    };

    complaints.unshift(newComplaint);
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastComplaint) {
        CloudSync.broadcastComplaint(newComplaint);
      }
    } catch (e) {}
    CloudSync.push();
    return newComplaint;
  },

  resolveComplaint(complaintId, status, coinsAmount, adminNote) {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c && c.id === complaintId);
    if (idx === -1) return { success: false, message: "Shikoyat topilmadi!" };

    const comp = complaints[idx];
    const coinsNum = status === 'approved' ? (parseInt(coinsAmount) || comp.requestedCoins || 30) : 0;

    comp.status = status; // 'approved' yoki 'rejected'
    comp.coinsAwarded = coinsNum;
    comp.awardedCoins = coinsNum;
    comp.adminNote = (adminNote || '').trim() || (status === 'approved'
      ? `Shikoyatingiz o'rinli deb topildi va +${coinsNum} tanga taqdim etildi!`
      : "Murojaatingiz ko'rib chiqildi.");
    comp.updatedAt = new Date().toISOString();

    complaints[idx] = comp;
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastComplaint) {
        CloudSync.broadcastComplaint(comp);
      }
    } catch (e) {}

    // Agar shikoyat o'rinli deb topilib ma'qullangan bo'lsa, o'quvchiga tanga taqdim etiladi!
    if (status === 'approved' && coinsNum > 0) {
      let targetCreatorId = comp.creatorId;
      if (!targetCreatorId || !this.getCreatorById(targetCreatorId)) {
        const found = this.getCreators().find(c =>
          c && (
            (comp.creatorName && c.fullName && c.fullName.toLowerCase().trim() === comp.creatorName.toLowerCase().trim()) ||
            (comp.creatorPhone && c.phone && c.phone.replace(/\D/g, '') === comp.creatorPhone.replace(/\D/g, ''))
          )
        );
        if (found) targetCreatorId = found.id;
      }
      if (targetCreatorId) {
        this.awardCoins(
          targetCreatorId,
          `Shikoyat bo'yicha tanga tiklandi: ${comp.eventOrChallengeName || comp.reason || comp.reasonTitle}`,
          coinsNum,
          comp.adminNote
        );
      }
    }

    CloudSync.push();
    return { success: true, complaint: comp };
  },

  deleteComplaint(complaintId) {
    let complaints = this.getComplaints().filter(c => c && c.id !== complaintId);
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
    CloudSync.push();
    return true;
  },

  // 2E. MAVSUMIY HISOBOTLAR (TUMAN -> VILOYAT VA VILOYAT -> RESPUBLIKA)
  getSeasonReports() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_SEASON_REPORTS));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  addSeasonReport(reportData) {
    const reports = this.getSeasonReports();
    const nowIso = new Date().toISOString();
    const newReport = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      level: reportData.level || 'district_to_region', // 'district_to_region' yoki 'region_to_republic'
      district: reportData.district || '',
      districtLabel: reportData.districtLabel || '',
      regionId: reportData.regionId || 'buxoro_vil',
      regionLabel: reportData.regionLabel || 'Buxoro viloyati',
      coordinatorName: (reportData.coordinatorName || 'Koordinator').trim(),
      coordinatorPhone: (reportData.coordinatorPhone || '').trim(),
      seasonTitle: (reportData.seasonTitle || '2026-yil Mavsumiy Hisoboti').trim(),
      studentsCount: parseInt(reportData.studentsCount) || 0,
      eventsCount: parseInt(reportData.eventsCount) || 0,
      totalCoins: parseInt(reportData.totalCoins) || 0,
      districtsCount: parseInt(reportData.districtsCount) || 1,
      summary: (reportData.summary || '').trim(),
      status: 'submitted', // 'submitted' | 'approved'
      reviewerNote: '',
      submittedAt: nowIso.split('T')[0],
      updatedAt: nowIso
    };

    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEY_SEASON_REPORTS, JSON.stringify(reports));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSeasonReport) {
        CloudSync.broadcastSeasonReport(newReport);
      }
    } catch (e) {}
    CloudSync.push();
    return newReport;
  },

  approveSeasonReport(reportId, reviewerNote = '') {
    const reports = this.getSeasonReports();
    const idx = reports.findIndex(r => r && r.id === reportId);
    if (idx === -1) return null;
    reports[idx].status = 'approved';
    reports[idx].reviewerNote = reviewerNote || "Mavsumiy hisobot qabul qilindi va tasdiqlandi!";
    reports[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_SEASON_REPORTS, JSON.stringify(reports));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSeasonReport) {
        CloudSync.broadcastSeasonReport(reports[idx]);
      }
    } catch (e) {}
    CloudSync.push();
    return reports[idx];
  },

  getAdminPin(districtInput) {
    this.init();
    if (districtInput) {
      const dAdmin = this.getDistrictAdmin(districtInput);
      if (dAdmin && dAdmin.pin) return dAdmin.pin;
    }
    return localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || '7777';
  },

  setAdminPin(newPin, districtInput) {
    if (!newPin || newPin.trim().length < 4) return false;
    if (districtInput) {
      this.saveDistrictAdmin({ district: districtInput, pin: newPin.trim() });
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, newPin.trim());
    return true;
  },

  verifyAdminPin(enteredPin, districtInput) {
    if (!enteredPin) return false;
    if (districtInput) {
      return this.verifyDistrictAdminPin(districtInput, enteredPin);
    }
    return this.getAdminPin() === enteredPin.trim();
  },

  getAdminName(districtInput) {
    this.init();
    if (districtInput) {
      const dAdmin = this.getDistrictAdmin(districtInput);
      if (dAdmin && dAdmin.fullName) return dAdmin.fullName;
      const norm = this.normalizeDistrict(districtInput);
      if (norm.label && norm.id !== 'all') return `${norm.label} Madaniyat Koordinatori`;
    }
    return localStorage.getItem(STORAGE_KEY_ADMIN_NAME) || 'Madaniyat Bosh Koordinatori';
  },

  setAdminName(newName, districtInput) {
    if (!newName || !newName.trim()) return false;
    if (districtInput) {
      this.saveDistrictAdmin({ district: districtInput, fullName: newName.trim() });
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_NAME, newName.trim());
    return true;
  },

  getAdminPhone(districtInput) {
    this.init();
    if (districtInput) {
      const dAdmin = this.getDistrictAdmin(districtInput);
      if (dAdmin && dAdmin.phone) return dAdmin.phone;
    }
    return localStorage.getItem(STORAGE_KEY_ADMIN_PHONE) || COORDINATOR_PHONE;
  },

  setAdminPhone(newPhone, districtInput) {
    if (!newPhone || !newPhone.trim()) return false;
    const clean = newPhone.trim();
    if (districtInput) {
      this.saveDistrictAdmin({ district: districtInput, phone: clean });
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_PHONE, clean);
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.db) {
        CloudSync.db.ref('settings/adminPhone').set(clean);
      }
      fetch(`${FIREBASE_DB_URL}/settings/adminPhone.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clean)
      }).catch(console.warn);
    } catch (e) {}
    return true;
  },

    // ================= MASTER SERVER INTEGRATSIYASI =================
  mergeRemoteCreator(remoteCreator) {
    if (!remoteCreator || !remoteCreator.id) return;
    const demoIds = ['cre-1', 'cre-2', 'cre-3', 'cre-4', 'cre-5', 'cre-6', 'cre-7', 'cre-8', 'cre-9', 'cre-10'];
    if (demoIds.includes(remoteCreator.id)) return;
    if (remoteCreator._deleted) {
      let creators = this.getCreators().filter(c => c.id !== remoteCreator.id);
      localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(creators));
      if (window.App && typeof window.App.refreshAllUI === 'function') {
        window.App.refreshAllUI();
      }
      return;
    }

    const creator = deserializeFromGun(remoteCreator);
    let creators = this.getCreators();
    const idx = creators.findIndex(c => c.id === creator.id);

    let changed = false;
    if (idx >= 0) {
      const local = creators[idx];
      const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime();
      const remoteTime = new Date(creator.updatedAt || creator.createdAt || 0).getTime();
      if (remoteTime > localTime || (creator.coins || 0) > (local.coins || 0) || (creator.eventsCount || 0) > (local.eventsCount || 0)) {
        creators[idx] = { ...local, ...creator };
        changed = true;
      }
    } else {
      creators.unshift(creator);
      changed = true;
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(creators));
      if (window.App && typeof window.App.refreshAllUI === 'function') {
        window.App.refreshAllUI();
      }
    }
  },

  mergeRemoteSubmission(remoteSub) {
    if (!remoteSub || !remoteSub.id || remoteSub._deleted) return;
    if (remoteSub.id === 'sub-1' || remoteSub.creatorName === 'Jasurbek Rahimov') return;
    let subs = this.getChallengeSubmissions();
    const idx = subs.findIndex(s => s.id === remoteSub.id);
    let changed = false;
    if (idx >= 0) {
      const local = subs[idx];
      const localTime = new Date(local.updatedAt || 0).getTime();
      const remoteTime = new Date(remoteSub.updatedAt || 0).getTime();
      if (
        remoteTime > localTime ||
        (remoteSub.status === 'approved' && local.status !== 'approved') ||
        (remoteSub.promotedToRegion && !local.promotedToRegion) ||
        (remoteSub.promotedToRepublic && !local.promotedToRepublic) ||
        (remoteSub.isRepublicWinner && !local.isRepublicWinner)
      ) {
        subs[idx] = { ...local, ...remoteSub };
        changed = true;
      }
    } else {
      subs.unshift(remoteSub);
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(subs));
      if (window.App && typeof window.App.refreshAllUI === 'function') {
        window.App.refreshAllUI();
      }
    }
  },

  mergeRemoteStaff(remoteStaff) {
    if (!remoteStaff || !remoteStaff.id || remoteStaff._deleted) return;
    let staff = this.getStaffList();
    const idx = staff.findIndex(s => s.id === remoteStaff.id || (s.phone && s.phone === remoteStaff.phone));
    if (idx < 0) {
      staff.unshift(remoteStaff);
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
      if (window.App && typeof window.App.renderStaffSection === 'function') {
        window.App.renderStaffSection();
        window.App.renderAdminSection();
      }
    }
  },

  // 3. O'QUVCHILAR BAZASI
  getCreators() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_CREATORS));
      return Array.isArray(data) ? data : INITIAL_CREATORS;
    } catch (e) {
      return INITIAL_CREATORS;
    }
  },

  saveCreators(creators) {
    localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(creators));
    CloudSync.push();
  },

  getCreatorById(id) {
    const creators = this.getCreators();
    return creators.find(c => c.id === id);
  },

  getDistrictLabel(districtId) {
    if (!districtId) return "Noma'lum tuman";
    const norm = this.normalizeDistrict(districtId);
    return norm.label || districtId;
  },

  // Yangi o'quvchi qo'shish
  addCreator(creatorData) {
    const creators = this.getCreators();
    
    let rawVideoUrl = (creatorData.videoUrl || '').trim();
    if (rawVideoUrl && !rawVideoUrl.startsWith('http://') && !rawVideoUrl.startsWith('https://')) {
      if (rawVideoUrl.startsWith('t.me/') || rawVideoUrl.startsWith('telegram.me/')) {
        rawVideoUrl = 'https://' + rawVideoUrl;
      } else if (rawVideoUrl.includes('youtube.com') || rawVideoUrl.includes('youtu.be')) {
        rawVideoUrl = 'https://' + rawVideoUrl;
      } else if (rawVideoUrl.startsWith('@')) {
        rawVideoUrl = 'https://t.me/' + rawVideoUrl.substring(1);
      }
    }

    let videoType = creatorData.videoType || 'youtube';
    if (rawVideoUrl.includes('t.me') || rawVideoUrl.includes('telegram')) {
      videoType = 'telegram';
    }

    const normDist = this.normalizeDistrict(
      creatorData.districtLabel || creatorData.district || 'jondor',
      creatorData.regionLabel || creatorData.region || ''
    );
    const distId = normDist.id || 'jondor';
    const distLabel = normDist.label || 'Jondor tumani';
    const regId = normDist.regionId || 'buxoro_vil';
    const regLabel = normDist.regionLabel || 'Buxoro viloyati';

    const userPhoto = (creatorData.avatarUrl && creatorData.avatarUrl.trim().length > 20)
      ? creatorData.avatarUrl.trim()
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

    const nick = (creatorData.nickname || '').trim() || (creatorData.fullName || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'ijodkor';
    const pin = (creatorData.pin || '').trim() || '1234';

    const newCreator = {
      id: 'cre-' + Date.now(),
      fullName: (creatorData.fullName || '').trim() || "Yangi O'quvchi",
      nickname: nick,
      pin: pin,
      age: parseInt(creatorData.age) || 16,
      district: distId,
      districtLabel: distLabel,
      regionId: regId,
      regionLabel: regLabel,
      school: (creatorData.school || '').trim() || "Umumiy o'rta ta'lim maktabi",
      bio: (creatorData.bio || '').trim() || "Maktabning iqtidorli o'quvchisi.",
      phone: (creatorData.phone || '').trim() || "+998 90 000 00 00",
      videoType: videoType,
      videoUrl: rawVideoUrl,
      videoEmbedUrl: this.convertVideoEmbed(rawVideoUrl),
      avatarUrl: userPhoto,
      coins: parseInt(creatorData.initialCoins) || 10,
      eventsCount: 1,
      eventsHistory: [
        {
          id: 'ev-' + Date.now(),
          eventName: "Kelajak ijodkori saralash bonusi",
          coinsAwarded: parseInt(creatorData.initialCoins) || 10,
          date: new Date().toISOString().split('T')[0],
          note: "Tizimda o'zini ro'yxatdan o'tkazgani va ijodiy portfoliosi uchun"
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    creators.unshift(newCreator);
    this.saveCreators(creators);
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastCreator) {
        CloudSync.broadcastCreator(newCreator);
      }
    } catch (e) {}
    return newCreator;
  },

  // O'QUVCHI O'Z PROFILIDAGI XATOLARNI VA VIDEO SILKASINI TAHRIRLASHI
  updateCreator(id, updatedData) {
    const creators = this.getCreators();
    const index = creators.findIndex(c => c.id === id);
    if (index === -1) return null;

    let target = creators[index];

    if (updatedData.fullName) target.fullName = updatedData.fullName.trim();
    if (updatedData.nickname !== undefined) target.nickname = updatedData.nickname.trim();
    if (updatedData.phone !== undefined && updatedData.phone.trim()) target.phone = updatedData.phone.trim();
    if (updatedData.pin !== undefined && updatedData.pin.trim().length >= 4) target.pin = updatedData.pin.trim();
    if (updatedData.age) target.age = parseInt(updatedData.age);
    if (updatedData.district || updatedData.districtLabel || updatedData.region || updatedData.regionLabel) {
      const normDist = this.normalizeDistrict(
        updatedData.districtLabel || updatedData.district || target.districtLabel || target.district,
        updatedData.regionLabel || updatedData.region || target.regionLabel || target.regionId
      );
      target.district = normDist.id || target.district;
      target.districtLabel = normDist.label || target.districtLabel;
      target.regionId = normDist.regionId || target.regionId || 'buxoro_vil';
      target.regionLabel = normDist.regionLabel || target.regionLabel || 'Buxoro viloyati';
    }
    if (updatedData.school) target.school = updatedData.school.trim();
    if (updatedData.bio !== undefined) target.bio = updatedData.bio.trim();
    if (updatedData.avatarUrl && updatedData.avatarUrl.length > 20) {
      target.avatarUrl = updatedData.avatarUrl.trim();
    }

    // Jonli ijro video silkasini o'zgartirish
    if (updatedData.videoUrl !== undefined) {
      let rawV = updatedData.videoUrl.trim();
      if (rawV && !rawV.startsWith('http://') && !rawV.startsWith('https://')) {
        if (rawV.startsWith('t.me/') || rawV.startsWith('telegram.me/')) {
          rawV = 'https://' + rawV;
        } else if (rawV.includes('youtube.com') || rawV.includes('youtu.be')) {
          rawV = 'https://' + rawV;
        } else if (rawV.startsWith('@')) {
          rawV = 'https://t.me/' + rawV.substring(1);
        }
      }

      target.videoUrl = rawV;
      target.videoEmbedUrl = this.convertVideoEmbed(rawV);
      if (rawV.includes('t.me') || rawV.includes('telegram')) {
        target.videoType = 'telegram';
      } else {
        target.videoType = 'youtube';
      }
    }

    creators[index] = target;
    this.saveCreators(creators);
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastCreator) {
        CloudSync.broadcastCreator(target);
      }
    } catch (e) {}
    return target;
  },

  deleteCreator(id) {
    let creators = this.getCreators();
    creators = creators.filter(c => c.id !== id);
    this.saveCreators(creators);
    return true;
  },

  clearDemoCreators() {
    const demoIds = ['cre-1', 'cre-2', 'cre-3', 'cre-4', 'cre-5', 'cre-6', 'cre-7', 'cre-8', 'cre-9', 'cre-10'];
    let creators = this.getCreators();
    creators = creators.filter(c => !demoIds.includes(c.id));
    localStorage.setItem('ijodkor_demo_cleared', 'true');
    this.saveCreators(creators);
    return true;
  },

  // Tanga taqdim etish (Admin)
  awardCoins(creatorId, eventName, coinsAmount, note) {
    const creators = this.getCreators();
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return { success: false, message: "O'quvchi topilmadi!" };

    const coinsNum = parseInt(coinsAmount);
    if (isNaN(coinsNum) || coinsNum <= 0) {
      return { success: false, message: "Tanga miqdori musbat son bo'lishi kerak!" };
    }

    creator.coins = (creator.coins || 0) + coinsNum;
    creator.eventsCount = (creator.eventsCount || 0) + 1;
    
    if (!creator.eventsHistory) creator.eventsHistory = [];
    creator.eventsHistory.unshift({
      id: 'ev-' + Date.now(),
      eventName: eventName.trim() || "Madaniy tadbir",
      coinsAwarded: coinsNum,
      date: new Date().toISOString().split('T')[0],
      note: (note || '').trim() || "Faol ijodiy chiqish uchun"
    });

    this.saveCreators(creators);
    return { success: true, creator };
  },

  // 4. MUDDATLI IJODIY CHELLENJLAR (VIDEO VAZIFALAR)
  getChallenges() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_CHALLENGES));
      return Array.isArray(data) ? data : INITIAL_CHALLENGES;
    } catch (e) {
      return INITIAL_CHALLENGES;
    }
  },

  addChallenge(challengeData) {
    const challenges = this.getChallenges();
    const isRepublic = challengeData.scope === 'republic' || challengeData.isRepublic === true || challengeData.district === 'all';
    const normDist = isRepublic
      ? { id: 'all', label: 'Respublika Umumiy Vazifasi (Barça tumanlar)', regionId: 'all', regionLabel: 'Özbekiston Respublikasi' }
      : this.normalizeDistrict(challengeData.districtLabel || challengeData.district || '');
    const nowIso = new Date().toISOString();
    const newChallenge = {
      id: 'chl-' + Date.now(),
      title: challengeData.title.trim(),
      description: challengeData.description.trim(),
      awardCoins: parseInt(challengeData.awardCoins || challengeData.coins) || 50,
      deadline: challengeData.deadline, // e.g. "2026-11-04"
      startDate: challengeData.startDate || nowIso.split('T')[0],
      scope: isRepublic ? 'republic' : 'district',
      isRepublic: isRepublic,
      district: isRepublic ? 'all' : (normDist.id || ''),
      districtLabel: isRepublic ? 'Respublika Umumiy Vazifasi (Barça tumanlar)' : (normDist.label || ''),
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      status: 'active',
      createdAt: nowIso.split('T')[0],
      updatedAt: nowIso
    };
    challenges.unshift(newChallenge);
    localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastChallenge) {
        CloudSync.broadcastChallenge(newChallenge);
      }
    } catch (e) {}
    CloudSync.push();
    return newChallenge;
  },

  archiveChallenge(id) {
    const challenges = this.getChallenges();
    const idx = challenges.findIndex(c => c && c.id === id);
    if (idx === -1) return null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    challenges[idx].status = 'archived';
    if (!this.isChallengeExpired(challenges[idx].deadline)) {
      challenges[idx].deadline = yesterday;
    }
    challenges[idx].archivedAt = new Date().toISOString().split('T')[0];
    challenges[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastChallenge) {
        CloudSync.broadcastChallenge(challenges[idx]);
      }
    } catch (e) {}
    CloudSync.push();
    return challenges[idx];
  },

  deleteChallenge(id) {
    let challenges = this.getChallenges();
    challenges = challenges.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastDeleteChallenge) {
        CloudSync.broadcastDeleteChallenge(id);
      }
    } catch (e) {}
    CloudSync.push();
    return true;
  },

  // Chellenj muddati tugaganligini tekshirish
  isChallengeExpired(deadlineStr, statusStr = '') {
    if (statusStr === 'archived') return true;
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    deadline.setHours(23, 59, 59, 999);
    return new Date() > deadline;
  },

  getDaysLeft(deadlineStr) {
    if (!deadlineStr) return 0;
    const deadline = new Date(deadlineStr);
    deadline.setHours(23, 59, 59, 999);
    const now = new Date();
    const diffTime = deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // 5. CHELLENJGA VIDEO ROLIK TOPSHIRISH VA BAHOLASH
  getChallengeSubmissions() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS));
      return Array.isArray(data) ? data : INITIAL_SUBMISSIONS;
    } catch (e) {
      return INITIAL_SUBMISSIONS;
    }
  },

  submitChallengeVideo(subData) {
    const submissions = this.getChallengeSubmissions();

    let rawV = (subData.videoUrl || '').trim();
    if (rawV && !rawV.startsWith('http://') && !rawV.startsWith('https://')) {
      if (rawV.startsWith('t.me/') || rawV.startsWith('telegram.me/')) {
        rawV = 'https://' + rawV;
      } else if (rawV.includes('youtube.com') || rawV.includes('youtu.be')) {
        rawV = 'https://' + rawV;
      }
    }

    const normDist = this.normalizeDistrict(subData.district || subData.creatorDistrict || '', subData.regionLabel || subData.regionId || '');
    const nowIso = new Date().toISOString();

    const newSub = {
      id: 'sub-' + Date.now(),
      challengeId: subData.challengeId,
      challengeTitle: subData.challengeTitle,
      creatorId: subData.creatorId || '',
      creatorName: subData.creatorName.trim(),
      creatorSchool: subData.creatorSchool.trim(),
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || (subData.creatorDistrict || 'Jondor tumani'),
      creatorDistrict: normDist.label || (subData.creatorDistrict || 'Jondor tumani'),
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      creatorPhone: subData.creatorPhone || '',
      videoUrl: rawV,
      videoType: (rawV.includes('t.me') || rawV.includes('telegram')) ? 'telegram' : 'youtube',
      participants: (subData.participants || '').trim(), // Rolikda kimlar qatnashgani!
      note: (subData.note || '').trim(),
      submittedAt: nowIso.split('T')[0],
      updatedAt: nowIso,
      status: 'pending', // 'pending' yoki 'approved'
      coinsAwarded: 0,
      promotedToRegion: false,
      districtBonusCoins: 0,
      promotedToRepublic: false,
      regionBonusCoins: 0,
      isRepublicWinner: false,
      republicBonusCoins: 0,
      adminNote: ''
    };

    submissions.unshift(newSub);
    localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(submissions));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSubmission) {
        CloudSync.broadcastSubmission(newSub);
      }
    } catch (e) {}
    CloudSync.push();
    return newSub;
  },

  // Admin chellenj videosini ko'rib chiqib tanga taqdim etishi
  approveChallengeSubmission(submissionId, coinsAmount, adminNote) {
    const submissions = this.getChallengeSubmissions();
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return { success: false, message: "Topshiriq topilmadi!" };

    const chl = this.getChallenges().find(c => c.id === sub.challengeId);
    const coinsNum = parseInt(coinsAmount) || (chl ? chl.awardCoins : 50) || 50;
    const alreadyApproved = sub.status === 'approved';
    sub.status = 'approved';
    sub.coinsAwarded = coinsNum;
    sub.adminNote = (adminNote || '').trim() || "Chellenj video vazifasi a'lo darajada bajarildi!";
    sub.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(submissions));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSubmission) {
        CloudSync.broadcastSubmission(sub);
      }
    } catch (e) {}

    // Agar o'quvchi bazada bo'lsa tangasini oshirish
    let targetCreatorId = sub.creatorId;
    if (!targetCreatorId || !this.getCreatorById(targetCreatorId)) {
      const found = this.getCreators().find(c => c && c.fullName && sub.creatorName && c.fullName.toLowerCase().trim() === sub.creatorName.toLowerCase().trim());
      if (found) targetCreatorId = found.id;
    }
    if (targetCreatorId && !alreadyApproved) {
      this.awardCoins(targetCreatorId, `Chellenj: ${sub.challengeTitle}`, coinsNum, `Qatnashuvchilar: ${sub.participants}`);
    }

    CloudSync.push();
    return { success: true, submission: sub };
  },

  // 1-BOSQICH: TUMAN ADMINI ENG YAXSHI VIDEONI TANLAB VILOYAT KOORDINATORIGA YUBORADI (+5 QO'SHIMCHA TANGA)
  promoteSubmissionToRegion(submissionId) {
    const submissions = this.getChallengeSubmissions();
    const sub = submissions.find(s => s && s.id === submissionId);
    if (!sub) return { success: false, message: "Videorolik topilmadi!" };
    if (sub.promotedToRegion) {
      return { success: false, message: "Ushbu videorolik allaqachon Viloyat bosqichiga yuborilgan va +5 tanga berilgan!" };
    }

    const chl = this.getChallenges().find(c => c && c.id === sub.challengeId);
    const baseCoins = parseInt(sub.coinsAwarded) || (chl ? parseInt(chl.awardCoins) : 50) || 50;

    let targetCreatorId = sub.creatorId;
    if (!targetCreatorId || !this.getCreatorById(targetCreatorId)) {
      const found = this.getCreators().find(c => c && c.fullName && sub.creatorName && c.fullName.toLowerCase().trim() === sub.creatorName.toLowerCase().trim());
      if (found) targetCreatorId = found.id;
    }

    // Agar hali oddiy tangasi berilmagan bo'lsa, avval va'da qilingan asosiy tangani beramiz
    if (sub.status !== 'approved') {
      sub.status = 'approved';
      sub.coinsAwarded = baseCoins;
      if (targetCreatorId) {
        this.awardCoins(targetCreatorId, `Chellenj: ${sub.challengeTitle}`, baseCoins, `Asosiy chellenj tangasi (${sub.districtLabel || 'Tuman'})`);
      }
    }

    // Qo'shimcha +5 tanga (Tuman bosqichidan Viloyatga chiqqani uchun)
    sub.promotedToRegion = true;
    sub.promotedToRegionAt = new Date().toISOString().split('T')[0];
    sub.districtBonusCoins = 5;
    sub.coinsAwarded = (parseInt(sub.coinsAwarded) || baseCoins) + 5;
    sub.updatedAt = new Date().toISOString();

    if (targetCreatorId) {
      this.awardCoins(
        targetCreatorId,
        `🏅 Tuman Bosqichi G'olibi (Viloyatga yo'llanma): ${sub.challengeTitle}`,
        5,
        `${sub.districtLabel || 'Tuman'} koordinatori tomonidan eng yaxshi videorolik sifatida Viloyat koordinatoriga yuborildi (+5 qo'shimcha tanga)`
      );
    }

    localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(submissions));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSubmission) {
        CloudSync.broadcastSubmission(sub);
      }
    } catch (e) {}
    CloudSync.push();
    return { success: true, submission: sub };
  },

  // 2-BOSQICH: VILOYAT KOORDINATORI ENG YAXSHI VIDEONI TANLAB RESPUBLIKA KOORDINATORIGA YUBORADI (+10 QO'SHIMCHA TANGA)
  promoteSubmissionToRepublic(submissionId) {
    const submissions = this.getChallengeSubmissions();
    const sub = submissions.find(s => s && s.id === submissionId);
    if (!sub) return { success: false, message: "Videorolik topilmadi!" };
    if (sub.promotedToRepublic) {
      return { success: false, message: "Ushbu videorolik allaqachon Respublika bosqichiga yuborilgan va +10 tanga berilgan!" };
    }

    let targetCreatorId = sub.creatorId;
    if (!targetCreatorId || !this.getCreatorById(targetCreatorId)) {
      const found = this.getCreators().find(c => c && c.fullName && sub.creatorName && c.fullName.toLowerCase().trim() === sub.creatorName.toLowerCase().trim());
      if (found) targetCreatorId = found.id;
    }

    sub.promotedToRegion = true;
    sub.promotedToRepublic = true;
    sub.promotedToRepublicAt = new Date().toISOString().split('T')[0];
    sub.regionBonusCoins = 10;
    sub.coinsAwarded = (parseInt(sub.coinsAwarded) || 50) + 10;
    sub.updatedAt = new Date().toISOString();

    if (targetCreatorId) {
      this.awardCoins(
        targetCreatorId,
        `🌟 Viloyat Bosqichi G'olibi (Respublikaga yo'llanma): ${sub.challengeTitle}`,
        10,
        `${sub.regionLabel || 'Viloyat'} koordinatori tomonidan eng yaxshi videorolik sifatida Respublika koordinatoriga yuborildi (+10 qo'shimcha tanga)`
      );
    }

    localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(submissions));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSubmission) {
        CloudSync.broadcastSubmission(sub);
      }
    } catch (e) {}
    CloudSync.push();
    return { success: true, submission: sub };
  },

  // 3-BOSQICH: RESPUBLIKA KOORDINATORI 1-O'RIN G'OLIBI DEB TANLAYDI (+15 QO'SHIMCHA TANGA)
  awardRepublicSubmissionWinner(submissionId) {
    const submissions = this.getChallengeSubmissions();
    const sub = submissions.find(s => s && s.id === submissionId);
    if (!sub) return { success: false, message: "Videorolik topilmadi!" };
    if (sub.isRepublicWinner) {
      return { success: false, message: "Ushbu videorolikka allaqachon Respublika 1-o'rin (+15 tanga) mukofoti berilgan!" };
    }

    let targetCreatorId = sub.creatorId;
    if (!targetCreatorId || !this.getCreatorById(targetCreatorId)) {
      const found = this.getCreators().find(c => c && c.fullName && sub.creatorName && c.fullName.toLowerCase().trim() === sub.creatorName.toLowerCase().trim());
      if (found) targetCreatorId = found.id;
    }

    sub.promotedToRegion = true;
    sub.promotedToRepublic = true;
    sub.isRepublicWinner = true;
    sub.republicWinnerAt = new Date().toISOString().split('T')[0];
    sub.republicBonusCoins = 15;
    sub.coinsAwarded = (parseInt(sub.coinsAwarded) || 50) + 15;
    sub.updatedAt = new Date().toISOString();

    if (targetCreatorId) {
      this.awardCoins(
        targetCreatorId,
        `🏆 Respublika 1-O'rin G'olibi: ${sub.challengeTitle}`,
        15,
        `Respublika Bosh Koordinatori tomonidan 1-o'rin g'olibi sifatida tanlandi (+15 qo'shimcha tanga)`
      );
    }

    localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(submissions));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastSubmission) {
        CloudSync.broadcastSubmission(sub);
      }
    } catch (e) {}
    CloudSync.push();
    return { success: true, submission: sub };
  },

  // 6. TANLOVLAR
  getContests() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_CONTESTS));
      return Array.isArray(data) ? data : INITIAL_CONTESTS;
    } catch (e) {
      return INITIAL_CONTESTS;
    }
  },

  addContest(contestData) {
    const contests = this.getContests();
    const normDist = this.normalizeDistrict(contestData.districtLabel || contestData.district || '');
    const nowIso = new Date().toISOString();
    const newContest = {
      id: 'cnt-' + Date.now(),
      title: contestData.title.trim(),
      awardCoins: parseInt(contestData.awardCoins) || 50,
      eventDate: contestData.eventDate || nowIso.split('T')[0],
      location: (contestData.location || '').trim() || "Madaniyat saroyi",
      description: (contestData.description || '').trim() || "Madaniy tadbirda faol ishtirok eting.",
      district: normDist.id || '',
      districtLabel: normDist.label || '',
      status: 'active',
      createdAt: nowIso.split('T')[0],
      updatedAt: nowIso
    };
    contests.unshift(newContest);
    localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(contests));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastContest) {
        CloudSync.broadcastContest(newContest);
      }
    } catch (e) {}
    CloudSync.push();
    return newContest;
  },

  deleteContest(id) {
    let contests = this.getContests();
    contests = contests.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(contests));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastDeleteContest) {
        CloudSync.broadcastDeleteContest(id);
      }
    } catch (e) {}
    CloudSync.push();
    return true;
  },

  // 7. REYTING
  getLeaderboard() {
    const creators = this.getCreators();
    return [...creators].sort((a, b) => (b.coins || 0) - (a.coins || 0));
  },

  convertVideoEmbed(url) {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    return '';
  },

  normalizePhone9(phone) {
    if (!phone) return '';
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 9 ? digits.slice(-9) : '';
  },

  phonesMatch(phoneA, phoneB) {
    const a = this.normalizePhone9(phoneA);
    const b = this.normalizePhone9(phoneB);
    return Boolean(a && b && a === b);
  },

  isPhoneRegistered(phone) {
    const clean9 = this.normalizePhone9(phone);
    if (!clean9) return false;

    const creators = this.getCreators();
    return creators.some(c => this.phonesMatch(c.phone, phone));
  },

  findCreatorByPhone(phone) {
    const clean9 = this.normalizePhone9(phone);
    if (!clean9) return null;
    const creators = this.getCreators();
    return creators.find(c => this.phonesMatch(c.phone, phone)) || null;
  },

  findCreatorByCredentials(identifier, pin) {
    if (!identifier || !pin) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone9 = this.normalizePhone9(cleanId);
    const cleanPin = pin.trim();

    const creators = this.getCreators();
    return creators.find(c => {
      if (!c) return false;
      const cPin = (c.pin || '').trim();
      if (!cPin || cPin !== cleanPin) return false;

      // 1. Telefon raqam bo'yicha (kamida 9 ta raqam aniq mos kelsa)
      if (cleanPhone9 && this.phonesMatch(c.phone, cleanId)) {
        return true;
      }

      // 2. Nik bo'yicha
      const cleanNick = cleanId.replace(/^@/, '');
      if (c.nickname && c.nickname.trim().toLowerCase().replace(/^@/, '') === cleanNick) {
        return true;
      }

      // 3. To'liq ism bo'yicha
      const cName = (c.fullName || '').trim().toLowerCase();
      if (cName && cName === cleanId) {
        return true;
      }
      if (cName && cName.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) {
        return true;
      }

      // 4. Ism yoki familiya qismi bo'yicha (faqat shu parol va shu ismga ega yagona o'quvchi bo'lsagina)
      const nameParts = cName.split(/\s+/).filter(Boolean);
      if (nameParts.includes(cleanId)) {
        const sameMatches = creators.filter(other => {
          if (!other || (other.pin || '').trim() !== cleanPin) return false;
          const otherParts = (other.fullName || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
          return otherParts.includes(cleanId);
        });
        if (sameMatches.length === 1) {
          return true;
        }
      }

      return false;
    }) || null;
  },

  resetStudentPin(phone, newPin) {
    const creator = this.findCreatorByPhone(phone);
    if (!creator) {
      return { success: false, message: "Ushbu telefon raqami bilan profil topilmadi!" };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: "Yangi profil kodi kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const updated = this.updateCreator(creator.id, { pin: newPin.trim() });
    return { success: true, creator: updated };
  },

  // 8. MADANIYAT XODIMLARI (RAQAMLAR FAQAT ADMINGA KO'RINADI)
  getStaffList() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  addStaffMember(staffData) {
    const staffList = this.getStaffList();
    const cleanPhone = (staffData.phone || '').trim();
    const cleanName = (staffData.fullName || '').trim().toLowerCase();

    // Faqat aynan bir xil odam (ham telefoni, ham ism-familiyasi bir xil) qayta kirsa eski ID saqlanadi;
    // Boshqa ism-familiyali xodim hech qachon mavjud xodimning profilini ustidan yozib yubormaydi!
    const existingIndex = staffList.findIndex(s => {
      if (!s) return false;
      if (staffData.id && s.id === staffData.id) return true;
      const samePhone = this.phonesMatch(s.phone, cleanPhone);
      const sName = (s.fullName || '').trim().toLowerCase();
      return samePhone && sName && cleanName && sName === cleanName;
    });

    const uniqueId = 'stf-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const id = existingIndex >= 0 ? staffList[existingIndex].id : (staffData.id || uniqueId);
    const nowIso = new Date().toISOString();
    const normDist = this.normalizeDistrict(
      staffData.districtLabel ||
      staffData.district ||
      (existingIndex >= 0 ? (staffList[existingIndex].districtLabel || staffList[existingIndex].district) : '') ||
      'jondor',
      staffData.regionLabel ||
      staffData.region ||
      (existingIndex >= 0 ? (staffList[existingIndex].regionLabel || staffList[existingIndex].regionId) : '') ||
      ''
    );

    const newStaff = {
      id: id,
      fullName: (staffData.fullName || '').trim(),
      position: staffData.position ? staffData.position.trim() : 'Madaniyat Xodimi',
      organization: staffData.organization ? staffData.organization.trim() : 'Madaniyat Boshqarmasi',
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      phone: cleanPhone,
      pin: (staffData.pin || '').trim() || (existingIndex >= 0 && staffList[existingIndex].pin ? staffList[existingIndex].pin : '1234'),
      registeredAt: (existingIndex >= 0 && staffList[existingIndex].registeredAt) ? staffList[existingIndex].registeredAt : nowIso.split('T')[0],
      updatedAt: nowIso
    };

    if (existingIndex >= 0) {
      staffList[existingIndex] = { ...staffList[existingIndex], ...newStaff };
    } else {
      staffList.unshift(newStaff);
    }

    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastStaff) {
        CloudSync.broadcastStaff(newStaff);
      }
    } catch (e) {}
    CloudSync.push();
    return newStaff;
  },

  updateStaffMember(id, updatedData) {
    const staffList = this.getStaffList();
    const index = staffList.findIndex(s => s && s.id === id);
    if (index === -1) return null;

    let target = staffList[index];
    if (updatedData.fullName) target.fullName = updatedData.fullName.trim();
    if (updatedData.position) target.position = updatedData.position.trim();
    if (updatedData.organization) target.organization = updatedData.organization.trim();
    if (updatedData.district || updatedData.districtLabel || updatedData.region || updatedData.regionLabel) {
      const normDist = this.normalizeDistrict(
        updatedData.districtLabel || updatedData.district || target.districtLabel || target.district,
        updatedData.regionLabel || updatedData.region || target.regionLabel || target.regionId
      );
      target.district = normDist.id || target.district;
      target.districtLabel = normDist.label || target.districtLabel;
      target.regionId = normDist.regionId || target.regionId || 'buxoro_vil';
      target.regionLabel = normDist.regionLabel || target.regionLabel || 'Buxoro viloyati';
    }
    if (updatedData.phone && updatedData.phone.trim()) target.phone = updatedData.phone.trim();
    if (updatedData.pin && updatedData.pin.trim().length >= 4) target.pin = updatedData.pin.trim();
    target.updatedAt = new Date().toISOString();

    staffList[index] = target;
    localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastStaff) {
        CloudSync.broadcastStaff(target);
      }
    } catch (e) {}
    CloudSync.push();
    return target;
  },

  findStaffByPhone(phone) {
    const clean9 = this.normalizePhone9(phone);
    if (!clean9) return null;
    const staffList = this.getStaffList();
    return staffList.find(s => s && this.phonesMatch(s.phone, phone)) || null;
  },

  findStaffByCredentials(identifier, pin) {
    if (!identifier || !pin) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone9 = this.normalizePhone9(cleanId);
    const cleanPin = pin.trim();

    const staffList = this.getStaffList();
    return staffList.find(s => {
      if (!s) return false;
      const sPin = (s.pin || '').trim();
      if (!sPin || sPin !== cleanPin) return false;

      // 1. Telefon raqam bo'yicha (kamida 9 ta raqam aniq mos kelsa)
      if (cleanPhone9 && this.phonesMatch(s.phone, cleanId)) {
        return true;
      }

      // 2. To'liq ism-familiya bo'yicha
      const sName = (s.fullName || '').trim().toLowerCase();
      if (sName && sName === cleanId) {
        return true;
      }
      if (sName && sName.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) {
        return true;
      }

      // 3. Ism yoki familiya qismi bo'yicha (faqat shu parol va shu ismga ega yagona xodim bo'lsagina)
      const nameParts = sName.split(/\s+/).filter(Boolean);
      if (nameParts.includes(cleanId)) {
        const sameMatches = staffList.filter(other => {
          if (!other || (other.pin || '').trim() !== cleanPin) return false;
          const otherParts = (other.fullName || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
          return otherParts.includes(cleanId);
        });
        if (sameMatches.length === 1) {
          return true;
        }
      }

      return false;
    }) || null;
  },

  resetStaffPin(phone, newPin) {
    const staff = this.findStaffByPhone(phone);
    if (!staff) {
      return { success: false, message: "Ushbu telefon raqami bilan madaniyat xodimi topilmadi!" };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: "Yangi maxfiy kod kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }
    const updated = this.updateStaffMember(staff.id, { pin: newPin.trim() });
    return { success: true, staff: updated };
  },

  // 9. ADMIN INBOX
  sendToAdminInbox(item) {
    this.init();
    let inbox = [];
    try {
      inbox = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMIN_INBOX)) || [];
    } catch (e) {
      inbox = [];
    }

    const normDist = this.normalizeDistrict(item.districtLabel || item.district || '');

    const newItem = {
      id: 'inbox-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      type: item.type || 'staff',
      name: item.name || item.recipientName || item.title || 'Foydalanuvchi',
      phone: item.phone || '',
      position: item.position || item.title || '',
      organization: item.organization || '',
      district: normDist.id || '',
      districtLabel: normDist.label || '',
      code: item.code || 'Xabar',
      timestamp: item.createdAt || new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      isRead: false
    };

    inbox.unshift(newItem);
    localStorage.setItem(STORAGE_KEY_ADMIN_INBOX, JSON.stringify(inbox));
    if (typeof CloudSync !== 'undefined' && CloudSync.broadcastInbox) {
      CloudSync.broadcastInbox(newItem);
    }
    CloudSync.push();
    return newItem;
  },

  addAdminInboxItem(item) {
    return this.sendToAdminInbox(item);
  },

  getAdminInbox() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMIN_INBOX));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  deleteAdminInboxItem(id) {
    let inbox = this.getAdminInbox();
    inbox = inbox.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ADMIN_INBOX, JSON.stringify(inbox));
    CloudSync.push();
    return true;
  },

  // 10. MADANIYAT XODIMLARI TAKLIF VA TASHABBUSLARI
  getStaffProposals() {
    this.init();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_PROPOSALS));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  addStaffProposal(proposalData) {
    const proposals = this.getStaffProposals();
    const catId = proposalData.categoryId || proposalData.category || 'event';
    const studentId = proposalData.targetStudentId || proposalData.recommendedStudentId || '';
    const studentName = (proposalData.targetStudentName || proposalData.recommendedStudentName || '').trim();
    const studentSchool = (proposalData.targetStudentSchool || '').trim();
    const nowIso = new Date().toISOString();
    const dateStr = nowIso.split('T')[0];

    const normDist = this.normalizeDistrict(proposalData.districtLabel || proposalData.district || '');

    const newProposal = {
      id: 'prp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      staffId: (proposalData.staffId || '').trim(),
      staffName: (proposalData.staffName || 'Madaniyat Xodimi').trim(),
      staffPosition: (proposalData.staffPosition || '').trim(),
      staffOrg: (proposalData.staffOrg || '').trim(),
      staffPhone: (proposalData.staffPhone || '').trim(),
      district: normDist.id || '',
      districtLabel: normDist.label || '',
      category: catId,
      categoryId: catId,
      categoryLabel: proposalData.categoryLabel || 'Madaniy Tadbir',
      title: (proposalData.title || '').trim(),
      description: (proposalData.description || '').trim(),
      recommendedStudentId: studentId,
      recommendedStudentName: studentName,
      targetStudentId: studentId,
      targetStudentName: studentName,
      targetStudentSchool: studentSchool,
      status: 'pending', // 'pending', 'approved', 'rejected'
      adminNote: '',
      submittedAt: dateStr,
      createdAt: dateStr,
      updatedAt: nowIso
    };

    proposals.unshift(newProposal);
    localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(proposals));
    CloudSync.push();

    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastProposal) {
        CloudSync.broadcastProposal(newProposal);
      }
    } catch (e) {}

    return newProposal;
  },

  updateProposalStatus(id, newStatus, adminNote = '') {
    let proposals = this.getStaffProposals();
    const index = proposals.findIndex(p => p.id === id);
    if (index === -1) return null;

    proposals[index].status = newStatus;
    if (adminNote) proposals[index].adminNote = adminNote;
    proposals[index].updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(proposals));
    CloudSync.push();

    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastProposal) {
        CloudSync.broadcastProposal(proposals[index]);
      }
    } catch (e) {}

    return proposals[index];
  },

  deleteProposal(id) {
    let proposals = this.getStaffProposals();
    const target = proposals.find(p => p.id === id);
    proposals = proposals.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(proposals));
    CloudSync.push();
    try {
      if (typeof CloudSync !== 'undefined' && CloudSync.broadcastDeleteProposal) {
        CloudSync.broadcastDeleteProposal(id);
      }
    } catch (e) {}
    return true;
  },

  // 11. ZAXIRA EKSPORT / IMPORT
  exportFullBackup() {
    return JSON.stringify({
      version: '3.0',
      exportedAt: new Date().toISOString(),
      creators: this.getCreators(),
      contests: this.getContests(),
      challenges: this.getChallenges(),
      submissions: this.getChallengeSubmissions(),
      inbox: this.getAdminInbox(),
      proposals: this.getStaffProposals(),
      staff: this.getStaffList(),
      visitors: this.getVisitorStats()
    }, null, 2);
  },

  importFullBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.creators)) {
        localStorage.setItem(STORAGE_KEY_CREATORS, JSON.stringify(data.creators));
        if (Array.isArray(data.contests)) localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(data.contests));
        if (Array.isArray(data.challenges)) localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(data.challenges));
        if (Array.isArray(data.submissions)) localStorage.setItem(STORAGE_KEY_CHALLENGE_SUBMISSIONS, JSON.stringify(data.submissions));
        if (Array.isArray(data.inbox)) localStorage.setItem(STORAGE_KEY_ADMIN_INBOX, JSON.stringify(data.inbox));
        if (Array.isArray(data.proposals)) localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(data.proposals));
        if (Array.isArray(data.staff)) localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(data.staff));
        if (data.visitors) localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(data.visitors));
        CloudSync.push();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Zaxira tiklash xatosi:", e);
      return false;
    }
  }
};

DataStore.init();

if (typeof window !== 'undefined') {
  window.DataStore = DataStore;
  window.CloudSync = CloudSync;
  window.VILOYATLAR = VILOYATLAR;
  window.TUMANLAR = TUMANLAR;
  CloudSync.init();
}
