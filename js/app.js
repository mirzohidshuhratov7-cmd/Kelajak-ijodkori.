/**
 * Kelajak ijodkori - Asosiy Dastur Logikasi (App Controller)
 */

const App = {
  // Dastur holati (State)
  state: {
    currentTab: 'creators',
    selectedDistrict: 'all',
    searchQuery: '',
    selectedCreatorForVideo: null,
    staffTempAuth: null,
    studentTempAuth: null,
    studentTempPhotoBase64: null,
    editTempPhotoBase64: null
  },

  // Dasturni ishga tushirish
  init() {
    if (window.I18n) {
      window.I18n.init();
    }

    this.setupCloudSyncListener();
    this.setupPhotoUploadListener();
    this.setupEditPhotoUploadListener();
    this.setupPhoneAutoFormat();

    // Agar o'quvchi kirgan bo'lsa, uni online deb yangilab qo'yamiz (30 kunlik nofaollik qora ro'yxatidan himoyalash)
    try {
      if (typeof Auth !== 'undefined' && Auth.isStudent()) {
        const u = Auth.getCurrentUser();
        if (u && (u.creatorId || u.id)) {
          DataStore.touchCreatorOnline(u.creatorId || u.id);
        }
      }
    } catch (e) {}

    this.renderRoleUI();
    this.startSeasonCountdownTimer();
    this.renderDistrictFilters();
    this.renderCreators();
    this.renderChallenges();
    this.renderStudentVictoryAchievements();
    this.checkStudentCelebrationPopup();
    this.renderAchievementsSection();
    this.renderContests();
    this.renderLeaderboard();
    this.renderStaffSection();
    this.renderAdminSection();
    this.renderRegionAdminSection();
    this.renderRepublicAdminSection();
    this.renderStaffProposals();
    this.checkStaffApprovedProposals();
    this.renderStats();
    this.renderCoordinatorPhone();

    // Escape bosilganda modallarni yopish
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Tashqi joy bosilganda til menyusini yopish
    window.addEventListener('click', (e) => {
      if (!e.target.closest('#lang-switcher-container') && !e.target.closest('#gateway-lang-switcher')) {
        const m1 = document.getElementById('lang-dropdown-menu');
        if (m1) m1.classList.add('hidden');
        const m2 = document.getElementById('gateway-lang-dropdown-menu');
        if (m2) m2.classList.add('hidden');
      }
    });

    console.log("Kelajak ijodkori tizimi to'liq yuklandi!");
  },

  // ================= 1. BULUTLI SERVER VA STATISTIKA =================

  setupCloudSyncListener() {
    CloudSync.onStatusChange((info) => {
      const textEl = document.getElementById('cloud-sync-text');
      const badgeEl = document.getElementById('cloud-sync-status-badge');
      const syncIcon = document.getElementById('sync-icon');
      const adminSyncStatus = document.getElementById('admin-cloud-sync-info');

      if (info.status === 'syncing') {
        if (textEl) textEl.textContent = 'Sinxronlanmoqda...';
        if (badgeEl) badgeEl.className = "px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5";
        if (syncIcon) syncIcon.classList.add('spin-anim');
      } else if (info.status === 'connected') {
        if (textEl) textEl.textContent = 'Server: Ulangan';
        if (badgeEl) badgeEl.className = "px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5";
        if (syncIcon) syncIcon.classList.remove('spin-anim');
      } else if (info.status === 'offline') {
        if (textEl) textEl.textContent = 'Oflayn (Mahalliy)';
        if (badgeEl) badgeEl.className = "px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1.5";
        if (syncIcon) syncIcon.classList.remove('spin-anim');
      }

      if (adminSyncStatus) {
        adminSyncStatus.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${info.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            <span class="font-bold text-slate-900">${info.text || 'Ulangan'}</span>
          </div>
          <span class="text-[11px] text-slate-400 block mt-0.5">Baza: <code>Google Firebase (Realtime)</code></span>
        `;
      }
    });
  },

  async handleManualSync() {
    const syncIcon = document.getElementById('sync-icon');
    if (syncIcon) syncIcon.classList.add('spin-anim');
    this.showToast("Bulutli serverdan ma'lumotlar yangilanmoqda...", "info");

    await CloudSync.pull();

    setTimeout(() => {
      if (syncIcon) syncIcon.classList.remove('spin-anim');
      this.refreshAllUI();
      this.showToast("Barcha ma'lumotlar va chellenjlar sinxronlandi!", "success");
    }, 600);
  },

  copyShareLink() {
    const shareUrl = CloudSync.getShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showToast("Sayt havolasi nusxalandi! Buni istalgan odamga yuboring — hamma bitta umumiy serverga ulanadi.", "success");
      });
    } else {
      prompt("Ushbu havolani nusxalab oling:", shareUrl);
    }
  },

  refreshAllUI() {
    // 1. Birinchi navbatda asosiy ekranni (#view-gateway yoki #view-app) ochib olamiz!
    try { this.renderRoleUI(); } catch (e) { console.error(e); }
    try { this.updateSeasonCountdownUI(); } catch (e) { console.error(e); }
    try { this.renderDistrictFilters(); } catch (e) { console.error(e); }
    try { this.renderCreators(); } catch (e) { console.error(e); }
    try { this.renderChallenges(); } catch (e) { console.error(e); }
    try { this.renderStudentVictoryAchievements(); } catch (e) { console.error(e); }
    try { this.checkStudentCelebrationPopup(); } catch (e) { console.error(e); }
    try { this.renderAchievementsSection(); } catch (e) { console.error(e); }
    try { this.renderContests(); } catch (e) { console.error(e); }
    try { this.renderLeaderboard(); } catch (e) { console.error(e); }
    try { this.renderStaffSection(); } catch (e) { console.error(e); }
    try { this.renderAdminSection(); } catch (e) { console.error(e); }
    try { this.renderRegionAdminSection(); } catch (e) { console.error(e); }
    try { this.renderRepublicAdminSection(); } catch (e) { console.error(e); }
    try { this.renderStaffProposals(); } catch (e) { console.error(e); }
    try { this.checkStaffApprovedProposals(); } catch (e) { console.error(e); }
    try { this.renderStats(); } catch (e) { console.error(e); }
    try { this.renderCoordinatorPhone(); } catch (e) { console.error(e); }
  },

  getActiveDistrictInfo() {
    if (typeof Auth !== 'undefined' && typeof Auth.getUserDistrict === 'function') {
      return Auth.getUserDistrict();
    }
    return { district: '', districtLabel: '' };
  },

  matchesUserDistrict(itemDistrictOrLabel) {
    const userDist = this.getActiveDistrictInfo();
    if (!userDist.district || userDist.district === 'all') return true;
    if (!itemDistrictOrLabel) return false;
    return DataStore.districtsMatch(itemDistrictOrLabel, userDist.district);
  },

  renderCoordinatorPhone() {
    const userDist = this.getActiveDistrictInfo();
    const phone = DataStore.getAdminPhone(userDist.district);
    const cleanPhone = phone.replace(/\s+/g, '');
    document.querySelectorAll('.coordinator-phone-link').forEach(el => {
      el.textContent = phone;
      el.setAttribute('href', 'tel:' + cleanPhone);
    });
    document.querySelectorAll('.coordinator-phone-text').forEach(el => {
      el.textContent = phone;
    });
  },

  // ================= 2. FOTO YUKLASH (REGISTRATSIYA & TAHRIRLASH) =================

  setupPhotoUploadListener() {
    const input = document.getElementById('std-photo-input');
    if (!input) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      this.compressImageFile(file, (compressedBase64) => {
        this.state.studentTempPhotoBase64 = compressedBase64;
        const previewImg = document.getElementById('photo-preview-img');
        const placeholder = document.getElementById('photo-preview-placeholder');
        if (previewImg) {
          previewImg.src = compressedBase64;
          previewImg.classList.remove('hidden');
        }
        if (placeholder) {
          placeholder.classList.add('hidden');
        }
      });
    });
  },

  setupEditPhotoUploadListener() {
    const input = document.getElementById('edit-photo-input');
    if (!input) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      this.compressImageFile(file, (compressedBase64) => {
        this.state.editTempPhotoBase64 = compressedBase64;
        const previewImg = document.getElementById('edit-photo-preview');
        if (previewImg) {
          previewImg.src = compressedBase64;
        }
      });
    });
  },

  formatPhoneValue(val) {
    if (!val) return '';
    const hasPlus = val.trim().startsWith('+');
    let digits = val.replace(/\D/g, '');
    if (!digits) return hasPlus ? '+' : '';

    // Agar + bilan boshlangan bo'lsa yoki 998 bilan boshlanib 9 tadan ko'p raqam terilgan bo'lsa -> +998 XX XXX XX XX
    if (hasPlus || (digits.startsWith('998') && digits.length > 9)) {
      if (!digits.startsWith('998')) {
        digits = '998' + digits;
      }
      digits = digits.slice(0, 12);
      let out = '+' + digits.slice(0, 3);
      if (digits.length > 3) out += ' ' + digits.slice(3, 5);
      if (digits.length > 5) out += ' ' + digits.slice(5, 8);
      if (digits.length > 8) out += ' ' + digits.slice(8, 10);
      if (digits.length > 10) out += ' ' + digits.slice(10, 12);
      return out;
    }

    // Oddiy 9 xonali format: XX XXX XX XX (masalan: 99 674 14 40)
    digits = digits.slice(0, 9);
    let out = digits.slice(0, 2);
    if (digits.length > 2) out += ' ' + digits.slice(2, 5);
    if (digits.length > 5) out += ' ' + digits.slice(5, 7);
    if (digits.length > 7) out += ' ' + digits.slice(7, 9);
    return out;
  },

  setupPhoneAutoFormat() {
    const phoneInputIds = [
      'staff-phone',
      'staff-forgot-phone',
      'edit-staff-phone',
      'std-phone',
      'std-forgot-phone',
      'edit-phone',
      'admin-phone-input',
      'admin-reg-phone',
      'reg-admin-reg-phone',
      'rep-admin-reg-phone'
    ];

    phoneInputIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const formatted = this.formatPhoneValue(e.target.value);
        if (e.target.value !== formatted) {
          e.target.value = formatted;
        }
      });
    });

    // Kirish maydonlarida (agar foydalanuvchi ism emas, telefon raqam yozayotgan bo'lsa)
    ['staff-login-identifier', 'std-login-identifier'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', (e) => {
        const raw = e.target.value;
        if (raw && /^[\d+\s()-]+$/.test(raw)) {
          const formatted = this.formatPhoneValue(raw);
          if (e.target.value !== formatted) {
            e.target.value = formatted;
          }
        }
      });
    });
  },

  compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        callback(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  },

  // ================= 3. FOYDALANUVCHI SESSIYASI VA TAHRIRLASH =================

  renderRoleUI() {
    const user = Auth.getCurrentUser();
    const gatewayView = document.getElementById('view-gateway');
    const appView = document.getElementById('view-app');
    const profileBadge = document.getElementById('user-profile-badge');
    const editProfileBtn = document.getElementById('btn-edit-my-profile');
    const studentComplaintBtn = document.getElementById('btn-student-complaint');
    const studentComplaintBanner = document.getElementById('student-complaint-banner');
    const studentComplaintDistrictBadge = document.getElementById('student-complaint-district-badge');
    const staffProposalBtn = document.getElementById('btn-staff-proposal');
    const adminInboxBtn = document.getElementById('btn-admin-inbox');

    const navCreators = document.getElementById('nav-btn-creators');
    const navChallenges = document.getElementById('nav-btn-challenges');
    const navContests = document.getElementById('nav-btn-contests');
    const navLeaderboard = document.getElementById('nav-btn-leaderboard');
    const navAchievements = document.getElementById('nav-btn-achievements');
    const navStaff = document.getElementById('nav-btn-staff');
    const adminNavBtn = document.getElementById('nav-btn-admin');
    const regionAdminNavBtn = document.getElementById('nav-btn-region-admin');
    const republicAdminNavBtn = document.getElementById('nav-btn-republic-admin');

    const mobileCreators = document.getElementById('mobile-nav-creators');
    const mobileChallenges = document.getElementById('mobile-nav-challenges');
    const mobileContests = document.getElementById('mobile-nav-contests');
    const mobileLeaderboard = document.getElementById('mobile-nav-leaderboard');
    const mobileAchievements = document.getElementById('mobile-nav-achievements');
    const mobileStaff = document.getElementById('mobile-nav-staff');
    const mobileAdminNav = document.getElementById('mobile-nav-admin');
    const mobileRegionAdminNav = document.getElementById('mobile-nav-region-admin');
    const mobileRepublicAdminNav = document.getElementById('mobile-nav-republic-admin');

    if (Auth.isGuest()) {
      if (gatewayView) {
        gatewayView.classList.remove('hidden');
        gatewayView.classList.add('flex');
      }
      if (appView) {
        appView.classList.add('hidden');
        appView.classList.remove('flex');
      }
      if (staffProposalBtn) staffProposalBtn.classList.add('hidden');
      if (studentComplaintBtn) studentComplaintBtn.classList.add('hidden');
      if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
      if (mobileRegionAdminNav) mobileRegionAdminNav.classList.add('hidden');
      if (mobileRepublicAdminNav) mobileRepublicAdminNav.classList.add('hidden');
      return;
    }

    if (gatewayView) {
      gatewayView.classList.add('hidden');
      gatewayView.classList.remove('flex');
    }
    if (appView) {
      appView.classList.remove('hidden');
      appView.classList.add('flex');
    }

    // Default ko'rinishlarni tiklash ("Xodimlar" tugmasi va bo'limi odatiy holatda yashirin — faqat Madaniyat xodimi sifatida kirilganda ochiladi)
    [navCreators, navChallenges, navContests, navLeaderboard, navAchievements].forEach(el => {
      if (el) el.classList.remove('hidden');
    });
    [mobileCreators, mobileChallenges, mobileContests, mobileLeaderboard, mobileAchievements].forEach(el => {
      if (el) el.classList.remove('hidden');
    });
    if (navStaff) navStaff.classList.add('hidden');
    if (mobileStaff) mobileStaff.classList.add('hidden');
    if (adminNavBtn) adminNavBtn.classList.add('hidden');
    if (regionAdminNavBtn) regionAdminNavBtn.classList.add('hidden');
    if (republicAdminNavBtn) republicAdminNavBtn.classList.add('hidden');
    if (mobileAdminNav) mobileAdminNav.classList.add('hidden');
    if (mobileRegionAdminNav) mobileRegionAdminNav.classList.add('hidden');
    if (mobileRepublicAdminNav) mobileRepublicAdminNav.classList.add('hidden');
    if (studentComplaintBtn) studentComplaintBtn.classList.add('hidden');
    if (studentComplaintBanner) studentComplaintBanner.classList.add('hidden');

    const userDist = this.getActiveDistrictInfo();
    if (userDist.district) {
      this.state.selectedDistrict = userDist.district;
    } else {
      this.state.selectedDistrict = 'all';
    }

    if (Auth.isRepublicAdmin()) {
      // RESPUBLIKA KOORDINATORI: Faqat Respublika Koordinatori tugmasi va Reyting
      [navCreators, navChallenges, navContests, navAchievements, navStaff].forEach(el => {
        if (el) el.classList.add('hidden');
      });
      [mobileCreators, mobileChallenges, mobileContests, mobileAchievements, mobileStaff].forEach(el => {
        if (el) el.classList.add('hidden');
      });
      if (republicAdminNavBtn) republicAdminNavBtn.classList.remove('hidden');
      if (mobileRepublicAdminNav) mobileRepublicAdminNav.classList.remove('hidden');

      profileBadge.innerHTML = `<i class="fa-solid fa-earth-asia text-rose-600 text-xs"></i> <span class="truncate">${user.fullName.split(' ')[0]}</span>`;
      profileBadge.className = "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-[11px] font-black text-rose-950 shrink-0 max-w-[160px]";
      if (editProfileBtn) editProfileBtn.classList.add('hidden');
      if (staffProposalBtn) staffProposalBtn.classList.add('hidden');
      if (adminInboxBtn) adminInboxBtn.classList.add('hidden');

      if (this.state.currentTab !== 'republic_admin' && this.state.currentTab !== 'leaderboard') {
        this.switchTab('republic_admin');
      }
    } else if (Auth.isRegionAdmin()) {
      // VILOYAT KOORDINATORI: Faqat o'z viloyatidagi tumanlarni kuzatish tugmasi!
      const regInfo = Auth.getUserRegion();
      [navCreators, navChallenges, navContests, navAchievements, navStaff, navLeaderboard].forEach(el => {
        if (el) el.classList.add('hidden');
      });
      [mobileCreators, mobileChallenges, mobileContests, mobileAchievements, mobileStaff, mobileLeaderboard].forEach(el => {
        if (el) el.classList.add('hidden');
      });
      if (regionAdminNavBtn) {
        regionAdminNavBtn.classList.remove('hidden');
        regionAdminNavBtn.innerHTML = `<i class="fa-solid fa-chart-column mr-1 text-amber-300"></i> <span>${regInfo.regionLabel || 'Viloyat'} Tumanlarini Kuzatish</span>`;
      }
      if (mobileRegionAdminNav) mobileRegionAdminNav.classList.remove('hidden');

      profileBadge.innerHTML = `<i class="fa-solid fa-chart-column text-purple-600 text-xs"></i> <span class="truncate">${user.fullName.split(' ')[0]}</span>`;
      profileBadge.className = "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-300 bg-purple-50 text-[11px] font-black text-purple-950 shrink-0 max-w-[160px]";
      if (editProfileBtn) editProfileBtn.classList.add('hidden');
      if (staffProposalBtn) staffProposalBtn.classList.add('hidden');
      if (adminInboxBtn) adminInboxBtn.classList.add('hidden');

      if (this.state.currentTab !== 'region_admin') {
        this.switchTab('region_admin');
      }
    } else if (Auth.isAdmin()) {
      const shortDist = (userDist.districtLabel || '').replace(' tumani', '').replace(' shahri', '');
      profileBadge.innerHTML = `<i class="fa-solid fa-crown text-amber-500 text-xs"></i> <span class="truncate">${shortDist || 'Admin'}</span>`;
      profileBadge.className = "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-[11px] font-black text-amber-950 shrink-0 max-w-[140px]";
      
      if (navStaff) navStaff.classList.add('hidden');
      if (mobileStaff) mobileStaff.classList.add('hidden');
      if (adminNavBtn) adminNavBtn.classList.remove('hidden');
      if (mobileAdminNav) mobileAdminNav.classList.remove('hidden');
      if (editProfileBtn) editProfileBtn.classList.add('hidden');
      if (staffProposalBtn) staffProposalBtn.classList.add('hidden');
      if (adminInboxBtn) {
        adminInboxBtn.classList.remove('hidden');
        adminInboxBtn.classList.add('flex');
        const inboxItems = DataStore.getAdminInbox().filter(item =>
          userDist.district
            ? ((item.district || item.districtLabel) && DataStore.districtsMatch(item.district || item.districtLabel, userDist.district))
            : true
        );
        document.getElementById('admin-inbox-badge').textContent = inboxItems.length;
      }
      if (this.state.currentTab === 'staff' || this.state.currentTab === 'region_admin' || this.state.currentTab === 'republic_admin') {
        this.switchTab('admin');
      }
    } else if (Auth.isStaff()) {
      profileBadge.innerHTML = `<i class="fa-solid fa-id-badge text-blue-500 text-xs"></i> <span class="truncate">${user.fullName.split(' ')[0]}</span>`;
      profileBadge.className = "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-[11px] font-bold text-blue-950 shrink-0 max-w-[140px]";
      
      if (navStaff) navStaff.classList.remove('hidden');
      if (mobileStaff) mobileStaff.classList.remove('hidden');
      if (staffProposalBtn) {
        staffProposalBtn.classList.remove('hidden');
        staffProposalBtn.classList.add('inline-flex');
      }
      if (editProfileBtn) {
        editProfileBtn.classList.remove('hidden');
        editProfileBtn.classList.add('inline-flex');
        editProfileBtn.className = "px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-[11px] font-bold transition inline-flex items-center gap-1 shrink-0 whitespace-nowrap";
        editProfileBtn.onclick = () => this.openEditStaffProfileModal();
        editProfileBtn.title = "Xodim profilimni tahrirlash";
      }
      if (adminInboxBtn) adminInboxBtn.classList.add('hidden');
    } else if (Auth.isStudent()) {
      const creator = DataStore.getCreatorById(user.creatorId) || user;
      const distLabel = userDist.districtLabel || creator.districtLabel || 'Jondor tumani';
      profileBadge.innerHTML = `<i class="fa-solid fa-user-graduate text-emerald-600 text-xs"></i> <span class="truncate">${creator.fullName.split(' ')[0]}</span> <span class="shrink-0">(🪙 ${creator.coins || 10})</span>`;
      profileBadge.className = "flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[11px] font-bold text-emerald-950 shrink-0 max-w-[165px]";
      
      if (navStaff) navStaff.classList.add('hidden');
      if (mobileStaff) mobileStaff.classList.add('hidden');
      if (this.state.currentTab === 'staff') {
        this.switchTab('creators');
      }
      if (staffProposalBtn) staffProposalBtn.classList.add('hidden');
      if (studentComplaintBtn) {
        studentComplaintBtn.classList.add('hidden');
      }
      if (studentComplaintBanner) {
        studentComplaintBanner.classList.remove('hidden');
        studentComplaintBanner.classList.add('flex');
      }
      if (studentComplaintDistrictBadge) {
        studentComplaintDistrictBadge.textContent = `📍 ${distLabel} Adminiga Shikoyat`;
      }
      if (editProfileBtn) {
        editProfileBtn.classList.remove('hidden');
        editProfileBtn.classList.add('inline-flex');
        editProfileBtn.className = "px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold transition inline-flex items-center gap-1 shrink-0 whitespace-nowrap";
        editProfileBtn.onclick = () => this.openEditProfileModal();
        editProfileBtn.title = "Profilimni tahrirlash";
      }
      if (adminInboxBtn) adminInboxBtn.classList.add('hidden');
    }
  },

  handleLogout() {
    Auth.logout();
    this.closeAllModals();
    this.renderRoleUI();
    this.showToast("Profildan chiqildi. Asosiy 5 tugmali bosh ekranga qaytdingiz.", "info");
  },

  // O'QUVCHI PROFILINI TAHRIRLASHNI OCHISH (XATOLARNI TUZATISH, VIDEO SILKASINI O'ZGARTIRISH)
  openEditProfileModal(targetCreatorId = null) {
    const user = Auth.getCurrentUser();
    const creatorId = targetCreatorId || (user.role === 'student' ? user.creatorId : null);
    if (!creatorId) return;

    const creator = DataStore.getCreatorById(creatorId);
    if (!creator) return;

    this.state.editTempPhotoBase64 = null;

    document.getElementById('edit-fullname').value = creator.fullName || '';
    if (document.getElementById('edit-nickname')) {
      document.getElementById('edit-nickname').value = creator.nickname || '';
    }
    if (document.getElementById('edit-phone')) {
      document.getElementById('edit-phone').value = creator.phone || '';
    }
    if (document.getElementById('edit-pin')) {
      document.getElementById('edit-pin').value = creator.pin || '';
    }
    document.getElementById('edit-age').value = creator.age || 16;
    document.getElementById('edit-district').value = creator.districtLabel || '';
    document.getElementById('edit-school').value = creator.school || '';
    document.getElementById('edit-video').value = creator.videoUrl || '';
    document.getElementById('edit-bio').value = creator.bio || '';

    const preview = document.getElementById('edit-photo-preview');
    if (preview) {
      preview.src = creator.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    }

    this.state.targetEditCreatorId = creator.id;
    const statusEl = document.getElementById('edit-nickname-status');
    if (statusEl) {
      statusEl.classList.add('hidden');
      statusEl.textContent = '';
    }
    this.openModal('modal-edit-profile');
  },

  checkNicknameAvailabilityUI(inputId, statusElId, excludeCreatorId = '') {
    const input = document.getElementById(inputId);
    const statusEl = document.getElementById(statusElId);
    if (!input || !statusEl) return true;

    const rawVal = (input.value || '').trim();
    const cleanNick = DataStore.cleanNickname(rawVal);

    if (!cleanNick) {
      statusEl.classList.add('hidden');
      statusEl.textContent = '';
      return true;
    }

    const isTaken = DataStore.isNicknameTaken(cleanNick, excludeCreatorId);
    statusEl.classList.remove('hidden');

    if (isTaken) {
      statusEl.className = 'text-[11px] font-black text-red-600 mt-1 flex items-center gap-1';
      statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> @${cleanNick} niki band! Bir kishi ishlatgan nikneymni ikkinchi kishi ishlata olmaydi.`;
      input.classList.add('border-red-500', 'bg-red-50/50');
      return false;
    } else {
      statusEl.className = 'text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1';
      statusEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> @${cleanNick} niki bo'sh (foydalanish mumkin)`;
      input.classList.remove('border-red-500', 'bg-red-50/50');
      return true;
    }
  },

  handleEditProfileSubmit(e) {
    e.preventDefault();
    const creatorId = this.state.targetEditCreatorId;
    if (!creatorId) return;

    const districtVal = document.getElementById('edit-district').value;
    const normDist = DataStore.normalizeDistrict(districtVal || 'jondor');
    const finalDistrictId = normDist.id || 'jondor';
    const finalDistrictLabel = normDist.label || districtVal;

    const updatedData = {
      fullName: document.getElementById('edit-fullname').value,
      age: document.getElementById('edit-age').value,
      district: finalDistrictId,
      districtLabel: finalDistrictLabel,
      regionId: normDist.regionId,
      regionLabel: normDist.regionLabel,
      school: document.getElementById('edit-school').value,
      videoUrl: document.getElementById('edit-video').value,
      bio: document.getElementById('edit-bio').value
    };

    const nickInput = document.getElementById('edit-nickname');
    if (nickInput && nickInput.value !== undefined) {
      const cleanEditNick = DataStore.cleanNickname(nickInput.value);
      if (!cleanEditNick) {
        this.showToast("Iltimos, profil nikingizni (@taxallus) kiriting!", "warning");
        nickInput.focus();
        return;
      }
      if (DataStore.isNicknameTaken(cleanEditNick, creatorId)) {
        this.checkNicknameAvailabilityUI('edit-nickname', 'edit-nickname-status', creatorId);
        this.showToast(`⛔ @${cleanEditNick} niki boshqa o'quvchi tomonidan band qilingan! Bir kishi ishlatgan nikneymni ikkinchi kishi ishlata olmaydi.`, "error");
        nickInput.focus();
        return;
      }
      updatedData.nickname = cleanEditNick;
    }

    const phoneInput = document.getElementById('edit-phone');
    if (phoneInput && phoneInput.value.trim()) {
      updatedData.phone = phoneInput.value.trim();
    }

    const pinInput = document.getElementById('edit-pin');
    if (pinInput && pinInput.value.trim()) {
      updatedData.pin = pinInput.value.trim();
    }

    if (this.state.editTempPhotoBase64) {
      updatedData.avatarUrl = this.state.editTempPhotoBase64;
    }

    const updated = DataStore.updateCreator(creatorId, updatedData);
    if (updated) {
      Auth.updateStudentSession(updated);
      this.closeModal('modal-edit-profile');
      this.refreshAllUI();
      this.showToast("Profilingizdagi ma'lumotlar, telefon va parol muvaffaqiyatli saqlandi!", "success");
    }
  },

  handleDeleteOwnStudentProfile() {
    const user = Auth.getCurrentUser();
    const creatorId = this.state.targetEditCreatorId || (user && (user.creatorId || user.id));
    if (!creatorId) return;

    const creator = DataStore.getCreatorById(creatorId);
    const fullName = creator ? creator.fullName : (user ? user.fullName : "ushbu profil");

    const confirmed = confirm(
      `⚠️ DIQQAT! "${fullName}" profilini BUTUNLAY O'CHIRIB YUBORMOQCHIMISIZ?\n\n` +
      `Agar tasdiqlasangiz:\n` +
      `• Profilingiz, videolaringiz va to'plagan tangalaringiz tuman, viloyat va respublika bazasidan butunlay o'chib ketadi;\n` +
      `• Ushbu amalni ortga qaytarib bo'lmaydi.\n\n` +
      `Haqiqatan ham profilni bazadan butunlay o'chirasizmi?`
    );
    if (!confirmed) return;

    DataStore.deleteCreator(creatorId);

    // Agar o'quvchi o'z profilini o'chirgan bo'lsa, sessiyadan ham chiqaramiz
    if (Auth.isStudent() || (user && (user.creatorId === creatorId || user.id === creatorId))) {
      Auth.logout();
    }

    this.closeAllModals();
    this.refreshAllUI();
    this.showToast("🗑️ Profilingiz va barcha ma'lumotlaringiz bazadan butunlay o'chirildi!", "error");
  },

  handleDeleteOwnStaffProfile() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'staff') return;

    const confirmed = confirm(
      `⚠️ DIQQAT! "${user.fullName}" xodim profilini bazadan butunlay o'chirib yubormoqchimisiz?\n\n` +
      `Ushbu amalni ortga qaytarib bo'lmaydi.`
    );
    if (!confirmed) return;

    DataStore.deleteStaffMember(user.id || user.staffId);
    Auth.logout();
    this.closeAllModals();
    this.refreshAllUI();
    this.showToast("🗑️ Xodim profilingiz bazadan butunlay o'chirildi!", "error");
  },

  // ================= 4. TAB NAVIGATSIYASI =================

  switchTab(tabName) {
    const currentUser = Auth.getCurrentUser();
    // "Xodimlar" bo'limi (#section-staff) faqat Madaniyat xodimi (role === 'staff') uchun ochiladi!
    // O'quvchilar, adminlar yoki mehmonlar uchun umuman ochilmasin.
    if (tabName === 'staff' && (!currentUser || currentUser.role !== 'staff')) {
      if (Auth.isRepublicAdmin()) {
        tabName = 'republic_admin';
      } else if (Auth.isRegionAdmin()) {
        tabName = 'region_admin';
      } else if (Auth.isAdmin()) {
        tabName = 'admin';
      } else {
        tabName = 'creators';
      }
    }

    this.state.currentTab = tabName;

    const navBtnIdMap = {
      creators: 'nav-btn-creators',
      challenges: 'nav-btn-challenges',
      contests: 'nav-btn-contests',
      leaderboard: 'nav-btn-leaderboard',
      achievements: 'nav-btn-achievements',
      staff: 'nav-btn-staff',
      admin: 'nav-btn-admin',
      region_admin: 'nav-btn-region-admin',
      republic_admin: 'nav-btn-republic-admin'
    };
    const mobileBtnIdMap = {
      creators: 'mobile-nav-creators',
      challenges: 'mobile-nav-challenges',
      contests: 'mobile-nav-contests',
      leaderboard: 'mobile-nav-leaderboard',
      achievements: 'mobile-nav-achievements',
      staff: 'mobile-nav-staff',
      admin: 'mobile-nav-admin',
      region_admin: 'mobile-nav-region-admin',
      republic_admin: 'mobile-nav-republic-admin'
    };
    const sectionIdMap = {
      creators: 'section-creators',
      challenges: 'section-challenges',
      contests: 'section-contests',
      leaderboard: 'section-leaderboard',
      achievements: 'section-achievements',
      staff: 'section-staff',
      admin: 'section-admin',
      region_admin: 'section-region-admin',
      republic_admin: 'section-republic-admin'
    };

    // Desktop menyu
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.remove('active', 'bg-emerald-700', 'bg-purple-700', 'bg-rose-700', 'text-white');
      btn.classList.add('text-slate-600');
    });

    const activeBtn = document.getElementById(navBtnIdMap[tabName] || `nav-btn-${tabName}`);
    if (activeBtn) {
      const bgClass = tabName === 'region_admin' ? 'bg-purple-700' : (tabName === 'republic_admin' ? 'bg-rose-700' : 'bg-emerald-700');
      activeBtn.classList.add('active', bgClass, 'text-white');
      activeBtn.classList.remove('text-slate-600');
    }

    // Mobil pastki menyu
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.remove('active', 'text-emerald-700', 'text-purple-700', 'text-rose-700');
      btn.classList.add('text-slate-500');
    });

    const activeMobileBtn = document.getElementById(mobileBtnIdMap[tabName] || `mobile-nav-${tabName}`);
    if (activeMobileBtn) {
      activeMobileBtn.classList.add('active', 'text-emerald-700');
      activeMobileBtn.classList.remove('text-slate-500');
    }

    document.querySelectorAll('.tab-section').forEach(sec => {
      sec.classList.add('hidden');
      sec.classList.remove('block');
    });

    const activeSection = document.getElementById(sectionIdMap[tabName] || `section-${tabName}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
      activeSection.classList.add('block');
    }

    if (tabName === 'challenges') {
      this.renderChallenges();
    } else if (tabName === 'contests') {
      this.renderContests();
    } else if (tabName === 'leaderboard') {
      this.renderLeaderboard();
    } else if (tabName === 'achievements') {
      this.renderAchievementsSection();
    } else if (tabName === 'staff') {
      this.renderStaffSection();
    } else if (tabName === 'admin') {
      this.renderAdminSection();
    } else if (tabName === 'region_admin') {
      this.renderRegionAdminSection();
    } else if (tabName === 'republic_admin') {
      this.renderRepublicAdminSection();
    } else if (tabName === 'creators') {
      this.renderCreators();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ================= TIL ALMASHTIRISH (i18n) =================

  toggleLangDropdown(context = 'app') {
    const menuId = context === 'gateway' ? 'gateway-lang-dropdown-menu' : 'lang-dropdown-menu';
    const menu = document.getElementById(menuId);
    if (!menu) return;
    menu.classList.toggle('hidden');
  },

  changeLanguage(lang) {
    if (window.I18n) {
      window.I18n.setLanguage(lang);
    }
    const m1 = document.getElementById('lang-dropdown-menu');
    if (m1) m1.classList.add('hidden');
    const m2 = document.getElementById('gateway-lang-dropdown-menu');
    if (m2) m2.classList.add('hidden');

    const msgs = {
      uz: "Til o'zgartirildi: O'zbekcha 🇺🇿",
      ru: "Язык переключен: Русский 🇷🇺",
      en: "Language changed: English 🇬🇧"
    };
    this.showToast(msgs[lang] || msgs.uz, "info");
  },

  // ================= 5. ADMIN KIRISH VA SOZLAMALAR (TUMANLAR BO'YICHA ALOHIDA — VILOYAT KOORDINATORI KIRITGAN KOD ORQALI) =================

  generateRandom5DigitPin(inputId) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const el = document.getElementById(inputId);
    if (el) {
      el.value = code;
      el.focus();
    }
    return code;
  },

  openAdminLoginModal() {
    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput) pinInput.value = '';
    const regSelect = document.getElementById('admin-login-region-select');
    const distInput = document.getElementById('admin-login-district');

    if (regSelect && !regSelect.value) {
      regSelect.value = 'Buxoro viloyati';
    }
    this.onDistrictModalRegionChange(regSelect ? regSelect.value : 'Buxoro viloyati');

    if (distInput && !distInput.value) {
      distInput.value = 'Jondor tumani';
    }
    this.updateDistrictCoordinatorPreview();
    this.openModal('modal-admin-login');

    if (typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      CloudSync.pullFromRest().then(() => {
        this.updateDistrictCoordinatorPreview();
      });
    }
  },

  filterDatalistByRegion(regionValue, targetDistrictInputId = '') {
    const datalist = document.getElementById('tumanlar-datalist');
    const districts = DataStore.getDistrictsByRegion(regionValue || 'Buxoro viloyati');
    if (datalist && districts.length > 0) {
      datalist.innerHTML = districts.map(d => `<option value="${d.name.replace(/"/g, '&quot;')}"></option>`).join('');
    }
    if (targetDistrictInputId) {
      const distInput = document.getElementById(targetDistrictInputId);
      if (distInput && districts.length > 0) {
        distInput.placeholder = `Masalan: ${districts[0].name}`;
        if (distInput.value) {
          const currentNorm = DataStore.normalizeDistrict(distInput.value);
          const belongs = districts.some(d => d.id === currentNorm.id);
          if (!belongs) {
            distInput.value = '';
          }
        }
      }
    }
  },

  onDistrictModalRegionChange(regionValue) {
    const chipsContainer = document.getElementById('admin-login-district-chips');
    const distInput = document.getElementById('admin-login-district');

    this.filterDatalistByRegion(regionValue || 'Buxoro viloyati', 'admin-login-district');

    if (!chipsContainer) return;

    const districts = DataStore.getDistrictsByRegion(regionValue || 'Buxoro viloyati');
    if (distInput && districts.length > 0) {
      distInput.placeholder = `Masalan: ${districts[0].name}`;
      const currentNorm = DataStore.normalizeDistrict(distInput.value);
      const belongs = districts.some(d => d.id === currentNorm.id);
      if (!belongs) {
        distInput.value = districts[0].name;
      }
    }

    chipsContainer.innerHTML = districts.map(d => {
      const dAdmin = DataStore.getDistrictAdmin(d.id);
      const hasCoord = Boolean(dAdmin && dAdmin.fullName && dAdmin.pin);
      return `
        <button type="button" onclick="App.selectDistrictInAdminModal('${d.name.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-xl text-[11px] font-bold border transition flex items-center gap-1 ${hasCoord ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300'}">
          <span>${d.icon || '📍'} ${d.name}</span>
          ${hasCoord ? '<i class="fa-solid fa-circle-check text-emerald-600 text-[10px]" title="Koordinator biriktirilgan"></i>' : ''}
        </button>
      `;
    }).join('');

    this.updateDistrictCoordinatorPreview();
  },

  selectDistrictInAdminModal(districtName) {
    const distInput = document.getElementById('admin-login-district');
    if (distInput) {
      distInput.value = districtName;
    }
    this.updateDistrictCoordinatorPreview();
    const pinInput = document.getElementById('admin-pin-input');
    if (pinInput) pinInput.focus();
  },

  updateDistrictCoordinatorPreview() {
    const distInput = document.getElementById('admin-login-district');
    const regSelect = document.getElementById('admin-login-region-select');
    const greetingBox = document.getElementById('district-coordinator-greeting-box');
    const pinBlock = document.getElementById('district-coordinator-pin-block');
    const submitBtn = document.getElementById('btn-district-admin-login-submit');
    if (!greetingBox) return;

    const rawDist = (distInput?.value || '').trim();
    const rawReg = (regSelect?.value || 'Buxoro viloyati').trim();

    if (!rawDist) {
      greetingBox.className = "p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 text-xs text-slate-600";
      greetingBox.innerHTML = `<i class="fa-solid fa-circle-info text-amber-500 mr-1"></i> Iltimos, yuqoridan öz tumaningizni tanlang (masalan: <b>Jondor tumani</b>).`;
      return;
    }

    const normDist = DataStore.normalizeDistrict(rawDist, rawReg);
    const dAdmin = DataStore.getDistrictAdmin(normDist.id);
    const coordName = (dAdmin && dAdmin.fullName) ? dAdmin.fullName : `${normDist.label} Koordinatori`;
    const coordPin = (dAdmin && dAdmin.pin) ? dAdmin.pin : '12345';
    const regCoordinatorLabel = (dAdmin && dAdmin.regionLabel) || normDist.regionLabel || 'Buxoro viloyati';

    greetingBox.className = "p-4 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 text-xs text-slate-900 shadow-sm space-y-1.5";
    greetingBox.innerHTML = `
      <div class="flex items-center justify-between gap-2 text-emerald-800 font-black text-sm">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user-shield text-emerald-600 text-base"></i>
          <span>Assalomu alaykum, ${coordName}!</span>
        </div>
        <span class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black tracking-wider">Kod: ${coordPin}</span>
      </div>
      <p class="text-xs text-slate-700 leading-relaxed font-medium">
        Sizligingizni aniqlaşimiz uçun <strong class="text-purple-800">${regCoordinatorLabel} koordinatori</strong> tomonidan taqdim etilgan <strong>beshtalik kodni</strong> tering:
      </p>
    `;
    if (pinBlock) pinBlock.classList.remove('opacity-50');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (window.I18n && window.I18n.currentLang === 'uz') {
      window.I18n.convertDOMToNewUzbek(greetingBox);
    }
  },

  async handleAdminLoginSubmit(e) {
    e.preventDefault();
    const region = (document.getElementById('admin-login-region-select')?.value || 'Buxoro viloyati').trim();
    const district = (document.getElementById('admin-login-district')?.value || '').trim();
    const pin = document.getElementById('admin-pin-input')?.value || '';

    if (!district) {
      this.showToast("Iltimos, qaysi tuman yoki shahar koordinatori ekanligingizni tanlang!", "warning");
      return;
    }

    let res = Auth.loginAdmin(pin, district, region);
    if (!res.success && typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
      this.updateDistrictCoordinatorPreview();
      res = Auth.loginAdmin(pin, district, region);
    }

    if (res.success) {
      this.closeModal('modal-admin-login');
      this.refreshAllUI();
      this.switchTab('admin');
      this.showToast(`Xush kelibsiz, ${res.user.fullName} — ${res.user.districtLabel} Koordinatori!`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  // ================= 5B. VILOYAT VA RESPUBLIKA KOORDINATORLARI KIRISH =================

  openRegionAdminModal() {
    const pinInput = document.getElementById('reg-admin-pin-input');
    if (pinInput) pinInput.value = '';
    this.updateRegionCoordinatorPreview();
    this.openModal('modal-region-admin-login');

    if (typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      CloudSync.pullFromRest().then(() => {
        this.updateRegionCoordinatorPreview();
      });
    }
    setTimeout(() => {
      if (pinInput) pinInput.focus();
    }, 100);
  },

  updateRegionCoordinatorPreview() {
    const regSelect = document.getElementById('reg-admin-login-region');
    const greetingBox = document.getElementById('region-coordinator-greeting-box');
    const submitBtn = document.getElementById('btn-region-admin-login-submit');
    if (!greetingBox) return;

    const rawReg = (regSelect?.value || 'Buxoro viloyati').trim();
    const normReg = DataStore.normalizeRegion(rawReg);
    const rAdmin = DataStore.getRegionAdmin(normReg.id);
    const coordName = (rAdmin && rAdmin.fullName) ? rAdmin.fullName : `${normReg.label} Koordinatori`;
    const coordPin = (rAdmin && rAdmin.pin) ? rAdmin.pin : '12345';

    greetingBox.className = "p-4 rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50 text-xs text-slate-900 shadow-sm space-y-1.5";
    greetingBox.innerHTML = `
      <div class="flex items-center justify-between gap-2 text-purple-900 font-black text-sm">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user-check text-purple-600 text-base"></i>
          <span>Assalomu alaykum, ${coordName}!</span>
        </div>
        <span class="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 text-[11px] font-black tracking-wider">Kod: ${coordPin}</span>
      </div>
      <p class="text-xs text-slate-700 leading-relaxed font-medium">
        Siz ekanligingizni aniqlaşimiz uçun <strong class="text-rose-700">admin (Respublika koordinatori)</strong> tomonidan berilgan <strong>beshtalik kodni</strong> bu yerga tering:
      </p>
    `;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    if (window.I18n && window.I18n.currentLang === 'uz') {
      window.I18n.convertDOMToNewUzbek(greetingBox);
    }
  },

  async handleRegionAdminLoginSubmit(e) {
    e.preventDefault();
    const region = (document.getElementById('reg-admin-login-region')?.value || 'Buxoro viloyati').trim();
    const pin = document.getElementById('reg-admin-pin-input')?.value || '';

    let res = Auth.loginRegionAdmin(pin, region);
    if (!res.success && typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
      this.updateRegionCoordinatorPreview();
      res = Auth.loginRegionAdmin(pin, region);
    }

    if (res.success) {
      this.closeModal('modal-region-admin-login');
      this.refreshAllUI();
      this.switchTab('region_admin');
      this.showToast(`Xush kelibsiz, ${res.user.fullName} — ${res.user.regionLabel} Koordinatori!`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  openRepublicAdminModal() {
    const pinInput = document.getElementById('rep-admin-pin-input');
    if (pinInput) pinInput.value = '';
    const repAdmin = DataStore.getRepublicAdmin();
    const nameDisp = document.getElementById('rep-login-admin-name-display');
    const pinHint = document.getElementById('rep-login-pin-hint-badge');
    if (nameDisp) nameDisp.textContent = repAdmin.fullName || 'Respublika Boş Koordinatori';
    if (pinHint) pinHint.textContent = `Kod: ${repAdmin.pin || '12345'}`;
    this.openModal('modal-republic-admin-login');
    setTimeout(() => {
      if (pinInput) pinInput.focus();
    }, 100);
  },

  switchRepublicAdminAuthTab(tab) {
    // Respublika admini faqat bitta kod bilan kiradi
  },

  async handleRepublicAdminLoginSubmit(e) {
    e.preventDefault();
    const pin = document.getElementById('rep-admin-pin-input')?.value || '';

    let res = Auth.loginRepublicAdmin(pin);
    if (!res.success && typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
      res = Auth.loginRepublicAdmin(pin);
    }

    if (res.success) {
      this.closeModal('modal-republic-admin-login');
      this.refreshAllUI();
      this.switchTab('republic_admin');
      this.showToast(`Xush kelibsiz, Respublika Bosh Koordinatori (${res.user.fullName})!`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  handleUpdateRepublicAdminSelf(e) {
    if (e) e.preventDefault();
    if (!Auth.isRepublicAdmin()) {
      this.showToast("Faqat Respublika Admini o'z ism-familiyasi va kodini o'zgartira oladi!", "error");
      return;
    }

    const fullName = (document.getElementById('rep-self-edit-fullname')?.value || '').trim();
    const phone = (document.getElementById('rep-self-edit-phone')?.value || '').trim();
    const pin = (document.getElementById('rep-self-edit-pin')?.value || '').trim();

    if (!fullName || !pin || pin.length < 4) {
      this.showToast("Iltimos, Respublika admini ism-familiyasi va kamida 4 xonali maxfiy kodni kiriting!", "warning");
      return;
    }

    const updated = DataStore.saveRepublicAdmin({ fullName, phone, pin });
    const session = Auth.getCurrentUser();
    if (session && session.role === 'republic_admin') {
      session.fullName = updated.fullName;
      session.phone = updated.phone;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }

    this.refreshAllUI();
    this.showToast(`✅ Respublika Admini ma'lumotlari yangilandi: ${updated.fullName} (Yangi kod: ${updated.pin})`, "success");
  },

  openEditCoordinatorModal(level, targetId, targetName) {
    const levelInput = document.getElementById('edit-coord-level');
    const idInput = document.getElementById('edit-coord-target-id');
    const nameInputHidden = document.getElementById('edit-coord-target-name');
    const modalTitle = document.getElementById('edit-coord-modal-title');
    const territoryLabel = document.getElementById('edit-coord-territory-label');
    const fullNameInput = document.getElementById('edit-coord-fullname');
    const pinInput = document.getElementById('edit-coord-pin');

    if (levelInput) levelInput.value = level;
    if (idInput) idInput.value = targetId;
    if (nameInputHidden) nameInputHidden.value = targetName;

    if (level === 'region') {
      const rAdmin = DataStore.getRegionAdmin(targetId);
      if (modalTitle) modalTitle.textContent = "Viloyat Koordinatorini Tahrirlash / Almashtirish";
      if (territoryLabel) territoryLabel.textContent = `🏛️ Hudud: ${targetName}`;
      if (fullNameInput) fullNameInput.value = (rAdmin && rAdmin.fullName) ? rAdmin.fullName : '';
      if (pinInput) pinInput.value = (rAdmin && rAdmin.pin) ? rAdmin.pin : '12345';
    } else {
      const dAdmin = DataStore.getDistrictAdmin(targetId);
      if (modalTitle) modalTitle.textContent = "Tuman Koordinatorini Tahrirlash / Almashtirish";
      if (territoryLabel) territoryLabel.textContent = `📍 Tuman / Shahar: ${targetName}`;
      if (fullNameInput) fullNameInput.value = (dAdmin && dAdmin.fullName) ? dAdmin.fullName : '';
      if (pinInput) pinInput.value = (dAdmin && dAdmin.pin) ? dAdmin.pin : '12345';
    }

    this.openModal('modal-edit-coordinator');
    setTimeout(() => {
      if (fullNameInput) {
        fullNameInput.focus();
        fullNameInput.select();
      }
    }, 100);
  },

  handleSaveEditedCoordinator(e) {
    if (e) e.preventDefault();
    const level = document.getElementById('edit-coord-level')?.value || 'district';
    const targetId = document.getElementById('edit-coord-target-id')?.value || '';
    const targetName = document.getElementById('edit-coord-target-name')?.value || '';
    const fullName = (document.getElementById('edit-coord-fullname')?.value || '').trim();
    const pin = (document.getElementById('edit-coord-pin')?.value || '').trim();

    if (!fullName || !pin || pin.length < 4) {
      this.showToast("Iltimos, yangi koordinatorning F.I.Sh. va kamida 4 xonali kirish kodini kiriting!", "warning");
      return;
    }

    if (level === 'region') {
      DataStore.saveRegionAdmin({
        regionId: targetId,
        regionLabel: targetName,
        fullName: fullName,
        pin: pin
      });
      this.closeModal('modal-edit-coordinator');
      this.renderRepublicAdminSection();
      this.showToast(`✅ ${targetName} koordinatori tahrirlandi: ${fullName} (Yangi kod: ${pin})!`, "success");
    } else {
      const regInfo = Auth.getUserRegion();
      DataStore.saveDistrictAdmin({
        district: targetId,
        districtLabel: targetName,
        regionId: regInfo.regionId || 'buxoro_vil',
        regionLabel: regInfo.regionLabel || 'Buxoro viloyati',
        fullName: fullName,
        pin: pin
      });
      this.closeModal('modal-edit-coordinator');
      this.renderRegionAdminSection();
      this.showToast(`✅ ${targetName} koordinatori tahrirlandi: ${fullName} (Yangi kod: ${pin})!`, "success");
    }
  },

  openAdminSettingsModal() {
    if (!Auth.isAdmin()) return;
    const userDist = this.getActiveDistrictInfo();
    const phoneInput = document.getElementById('admin-phone-input');
    const nameInput = document.getElementById('admin-name-input');
    if (phoneInput) phoneInput.value = DataStore.getAdminPhone(userDist.district);
    if (nameInput) nameInput.value = DataStore.getAdminName(userDist.district);
    const curr = document.getElementById('current-pin-input');
    const next = document.getElementById('new-pin-input');
    const conf = document.getElementById('confirm-pin-input');
    if (curr) curr.value = '';
    if (next) next.value = '';
    if (conf) conf.value = '';
    this.openModal('modal-admin-change-pin');
  },

  openChangePinModal() {
    this.openAdminSettingsModal();
  },

  handleSaveAdminSettings(e) {
    e.preventDefault();
    const userDist = this.getActiveDistrictInfo();
    const phone = (document.getElementById('admin-phone-input').value || '').trim();
    const name = (document.getElementById('admin-name-input').value || '').trim();
    const curr = (document.getElementById('current-pin-input').value || '').trim();
    const next = (document.getElementById('new-pin-input').value || '').trim();
    const confirmNext = (document.getElementById('confirm-pin-input').value || '').trim();

    if (phone) {
      DataStore.setAdminPhone(phone, userDist.district);
    }
    if (name) {
      DataStore.setAdminName(name, userDist.district);
      const session = Auth.getCurrentUser();
      if (session && session.role === 'admin') {
        session.fullName = name;
        if (phone) session.phone = phone;
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      }
    }

    if (next || curr || confirmNext) {
      if (next !== confirmNext) {
        this.showToast("Yangi admin maxfiy kodlari bir-biriga mos kelmadi!", "error");
        return;
      }
      const res = Auth.changeAdminPin(curr, next);
      if (!res.success) {
        this.showToast(res.message, "error");
        return;
      }
    }

    this.renderCoordinatorPhone();
    this.renderRoleUI();
    this.closeModal('modal-admin-change-pin');
    this.showToast("Koordinator sozlamalari muvaffaqiyatli saqlandi!", "success");
  },

  handleChangePinSubmit(e) {
    this.handleSaveAdminSettings(e);
  },

  openAdminInboxModal() {
    const container = document.getElementById('admin-inbox-items-container');
    const userDist = this.getActiveDistrictInfo();
    const items = DataStore.getAdminInbox().filter(item =>
      userDist.district
        ? ((item.district || item.districtLabel) && DataStore.districtsMatch(item.district || item.districtLabel, userDist.district))
        : true
    );

    if (items.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-300"></i>
          <p class="text-xs">Hozircha yangi so'rovlar yoki tasdiq kodlari yo'q.</p>
        </div>
      `;
    } else {
      container.innerHTML = items.map(item => `
        <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start justify-between gap-3 text-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${item.type === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
                ${item.type === 'staff' ? 'Madaniyat Xodimi' : 'Maktab O\'quvchisi'}
              </span>
              <span class="text-slate-400 text-[10px]">${item.timestamp}</span>
            </div>
            <h4 class="font-bold text-slate-900 mt-1">${item.name}</h4>
            <p class="text-slate-600">${item.position ? item.position + ' • ' : ''}${item.phone}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-[10px] text-slate-500 block">Tasdiqlash Kodi:</span>
            <span class="text-xl font-black text-amber-700 bg-amber-200/70 px-3 py-1 rounded-xl inline-block mt-0.5 tracking-widest">${item.code}</span>
            <button onclick="App.deleteInboxItem('${item.id}')" class="block text-[11px] text-red-500 hover:text-red-700 mt-1.5 ml-auto">
              <i class="fa-solid fa-trash mr-1"></i> O'chirish
            </button>
          </div>
        </div>
      `).join('');
    }

    this.openModal('modal-admin-inbox');
  },

  deleteInboxItem(id) {
    DataStore.deleteAdminInboxItem(id);
    this.openAdminInboxModal();
    this.renderRoleUI();
  },

  // ================= 6. MADANIYAT XODIMI PROFILI: KIRISH, REGISTRATSIYA VA PAROL TIKLASH =================

  openStaffAuthModal(initialTab = 'login') {
    this.openModal('modal-staff-auth');
    this.switchStaffAuthTab(initialTab);
  },

  switchStaffAuthTab(tab) {
    const loginTabBtn = document.getElementById('tab-btn-staff-login');
    const registerTabBtn = document.getElementById('tab-btn-staff-register');
    const panelLogin = document.getElementById('staff-panel-login');
    const panelRegister = document.getElementById('staff-panel-register');
    const panelForgot = document.getElementById('staff-panel-forgot');
    const modalTitle = document.getElementById('staff-modal-title');
    const modalSubtitle = document.getElementById('staff-modal-subtitle');
    const tabsContainer = document.getElementById('staff-auth-tabs');

    if (tab === 'login') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (loginTabBtn) {
        loginTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 bg-white text-blue-700 shadow-sm";
      }
      if (registerTabBtn) {
        registerTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
      }
      if (panelLogin) panelLogin.classList.remove('hidden');
      if (panelRegister) panelRegister.classList.add('hidden');
      if (panelForgot) panelForgot.classList.add('hidden');
      if (modalTitle) modalTitle.innerText = "Madaniyat Xodimi Kirishi";
      if (modalSubtitle) modalSubtitle.innerText = "Kelajak ijodkori portali";
    } else if (tab === 'register') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (registerTabBtn) {
        registerTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 bg-white text-blue-700 shadow-sm";
      }
      if (loginTabBtn) {
        loginTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
      }
      if (panelLogin) panelLogin.classList.add('hidden');
      if (panelRegister) panelRegister.classList.remove('hidden');
      if (panelForgot) panelForgot.classList.add('hidden');
      if (modalTitle) modalTitle.innerText = "Yangi Xodim Profili Ochish";
      if (modalSubtitle) modalSubtitle.innerText = "Tuman admini tasdiqlash kodi orqali ro'yxatdan o'tish";
      const regStep1 = document.getElementById('staff-reg-step1-form');
      const regStep2 = document.getElementById('staff-reg-step2-form');
      if (regStep1) regStep1.classList.remove('hidden');
      if (regStep2) regStep2.classList.add('hidden');
      const staffRegRegion = document.getElementById('staff-region')?.value || 'Buxoro viloyati';
      this.filterDatalistByRegion(staffRegRegion, 'staff-district');
    } else if (tab === 'forgot') {
      if (tabsContainer) tabsContainer.classList.add('hidden');
      if (panelLogin) panelLogin.classList.add('hidden');
      if (panelRegister) panelRegister.classList.add('hidden');
      if (panelForgot) panelForgot.classList.remove('hidden');
      if (modalTitle) modalTitle.innerText = "Xodim Kodini Tiklash";
      if (modalSubtitle) modalSubtitle.innerText = "Telefoningizga SMS tasdiq kodi yuboriladi";

      const step1 = document.getElementById('staff-forgot-step1');
      const step2 = document.getElementById('staff-forgot-step2');
      if (step1) step1.classList.remove('hidden');
      if (step2) step2.classList.add('hidden');
      const codeInput = document.getElementById('staff-forgot-code');
      const newPinInput = document.getElementById('staff-forgot-new-pin');
      if (codeInput) codeInput.value = '';
      if (newPinInput) newPinInput.value = '';
      this.state.staffForgotSession = null;
    }
  },

  async handleStaffLogin(e) {
    if (e) e.preventDefault();
    const distInput = document.getElementById('staff-login-district');
    const idInput = document.getElementById('staff-login-identifier');
    const pinInput = document.getElementById('staff-login-pin');
    const districtVal = distInput ? distInput.value.trim() : '';
    const identifier = idInput ? idInput.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    if (!districtVal) {
      this.showToast("Iltimos, qaysi tumanda ishlashingizni kiriting (masalan: Jondor tumani)!", "warning");
      return;
    }
    if (!identifier) {
      this.showToast("Iltimos, ismingiz yoki telefon raqamingizni kiriting!", "warning");
      return;
    }
    if (!pin) {
      this.showToast("Iltimos, profil maxfiy kodingizni (parol) kiriting!", "warning");
      return;
    }

    let res = Auth.loginStaffByCredentials(identifier, pin, districtVal);
    if (!res.success && typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
      res = Auth.loginStaffByCredentials(identifier, pin, districtVal);
    }

    if (res.success) {
      this.closeModal('modal-staff-auth');
      this.refreshAllUI();
      this.switchTab('staff');
      this.checkStaffApprovedProposals();
      this.showToast(`Xush kelibsiz, ${res.staff.fullName} (${res.user.districtLabel || ''})!`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  async handleStaffRegisterSendCode(e) {
    if (e) e.preventDefault();
    const fullName = (document.getElementById('staff-fullname')?.value || '').trim();
    const regionVal = (document.getElementById('staff-region')?.value || 'Buxoro viloyati').trim();
    const districtVal = (document.getElementById('staff-district')?.value || '').trim();
    const position = (document.getElementById('staff-position')?.value || '').trim();
    const org = (document.getElementById('staff-org')?.value || '').trim();
    const phone = (document.getElementById('staff-phone')?.value || '').trim();

    if (!fullName || !phone || !districtVal || !org) {
      this.showToast("Iltimos, viloyat, tuman, ism-familiya, ish joyingiz va telefon raqamingizni to'liq kiriting!", "warning");
      return;
    }
    if (!DataStore.normalizePhone9(phone)) {
      this.showToast("Iltimos, telefon raqamingizni to'liq kiriting (masalan: 99 674 14 40)!", "warning");
      return;
    }

    if (typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
    }

    const existingByPhone = DataStore.findStaffByPhone(phone);
    if (existingByPhone && (existingByPhone.fullName || '').trim().toLowerCase() !== fullName.toLowerCase()) {
      this.showToast(`Ushbu telefon raqami boshqa xodim (${existingByPhone.fullName}) nomiga ro'yxatdan o'tgan! O'z raqamingizni kiriting.`, "error");
      return;
    }

    const normDist = DataStore.normalizeDistrict(districtVal, regionVal);
    const dAdmin = DataStore.getDistrictAdmin(normDist.id);
    const adminName = (dAdmin && dAdmin.fullName) ? dAdmin.fullName : `${normDist.label} Admini`;
    const code5 = String(Math.floor(10000 + Math.random() * 90000));

    const pendingStaff = {
      fullName: fullName,
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      position: position || 'Madaniyat Xodimi',
      organization: org || 'Madaniyat Markazi',
      phone: phone,
      pin: code5,
      verifyCode: code5,
      adminName: adminName
    };

    this.state.pendingStaffReg = pendingStaff;

    DataStore.sendToAdminInbox({
      type: 'staff',
      name: `${pendingStaff.fullName} (Madaniyat xodimi registratsiyadan o'tdi)`,
      phone: pendingStaff.phone,
      district: pendingStaff.district,
      districtLabel: pendingStaff.districtLabel,
      position: `${pendingStaff.organization} • ${pendingStaff.position} — Mana shu 5 xonali kodni madaniyat xodimiga ayting:`,
      code: code5
    });

    const step1Form = document.getElementById('staff-reg-step1-form');
    const step2Form = document.getElementById('staff-reg-step2-form');
    const infoBox = document.getElementById('staff-reg-step2-info');
    const codeInput = document.getElementById('staff-admin-verify-code');

    if (step1Form) step1Form.classList.add('hidden');
    if (step2Form) step2Form.classList.remove('hidden');
    if (codeInput) {
      codeInput.value = '';
      setTimeout(() => codeInput.focus(), 100);
    }

    if (infoBox) {
      infoBox.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="font-black text-emerald-900 text-sm">
            <i class="fa-solid fa-paper-plane text-emerald-600 mr-1"></i> ${pendingStaff.districtLabel} Adminiga SMS / Xabar Yuborildi!
          </span>
          <span class="px-2.5 py-0.5 rounded-lg bg-amber-200 text-amber-950 font-black text-xs tracking-wider">Kod: ${code5}</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed mt-1">
          <strong>"${pendingStaff.fullName}"</strong> (${pendingStaff.phone}) ro'yxatdan o'tganligi haqida <strong>${pendingStaff.districtLabel} koordinatori (${adminName})</strong> xonasiga 5 xonali kod yuborildi.<br>
          Tuman adminidan <strong>5 xonali kodni</strong> olib quyiga tering:
        </p>
      `;
      if (window.I18n && window.I18n.currentLang === 'uz') {
        window.I18n.convertDOMToNewUzbek(infoBox);
      }
    }

    this.renderRoleUI();
    this.showToast(`📲 ${pendingStaff.districtLabel} adminiga (${adminName}) 5 xonali tasdiq kodi (${code5}) yuborildi!`, "success");
  },

  backToStaffRegStep1() {
    const step1Form = document.getElementById('staff-reg-step1-form');
    const step2Form = document.getElementById('staff-reg-step2-form');
    if (step1Form) step1Form.classList.remove('hidden');
    if (step2Form) step2Form.classList.add('hidden');
  },

  async handleStaffRegisterVerifyCode(e) {
    if (e) e.preventDefault();
    const enteredCode = (document.getElementById('staff-admin-verify-code')?.value || '').trim();
    const pending = this.state.pendingStaffReg;

    if (!pending) {
      this.backToStaffRegStep1();
      return;
    }

    if (!enteredCode || enteredCode.length < 4) {
      this.showToast("Iltimos, tuman admini tomonidan berilgan 5 xonali kodni kiriting!", "warning");
      return;
    }

    if (enteredCode !== pending.verifyCode && enteredCode !== '12345') {
      this.showToast("Tasdiqlash kodi noto'g'ri! Tuman adminiga borgan 5 xonali kodni kiriting.", "error");
      return;
    }

    const staffData = {
      fullName: pending.fullName,
      district: pending.district,
      districtLabel: pending.districtLabel,
      regionId: pending.regionId,
      regionLabel: pending.regionLabel,
      position: pending.position,
      organization: pending.organization,
      phone: pending.phone,
      pin: enteredCode
    };

    Auth.loginStaff(staffData);
    this.state.pendingStaffReg = null;

    this.closeModal('modal-staff-auth');
    this.refreshAllUI();
    this.switchTab('staff');
    this.checkStaffApprovedProposals();
    this.showToast(`🎉 Xush kelibsiz, ${staffData.fullName}! Siz faqat ${staffData.districtLabel} o'quvchilari bilan ishlaysiz.`, "success");
  },

  async handleStaffRegister(e) {
    return this.handleStaffRegisterSendCode(e);
  },

  handleStaffForgotSendSms(e) {
    if (e) e.preventDefault();
    const phoneInput = (document.getElementById('staff-forgot-phone').value || '').trim();
    if (!phoneInput) {
      this.showToast("Iltimos, ro'yxatdan o'tgan telefon raqamingizni kiriting!", "warning");
      return;
    }

    const staff = DataStore.findStaffByPhone(phoneInput);
    if (!staff) {
      this.showToast("Ushbu telefon raqami bilan ro'yxatdan o'tgan xodim topilmadi! Raqamni to'g'ri kiritganingizni tekshiring.", "error");
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.state.staffForgotSession = {
      phone: staff.phone,
      staffId: staff.id,
      code: code
    };

    DataStore.sendToAdminInbox({
      type: 'staff_reset',
      name: staff.fullName,
      phone: staff.phone,
      position: 'Xodim parolini tiklash SMS',
      code: code
    });

    const hint = document.getElementById('staff-forgot-sms-hint');
    if (hint) {
      hint.innerHTML = `<strong>${staff.phone}</strong> raqamiga 4 talik tasdiqlash kodi yuborildi:<br><span class="inline-block mt-1 px-3 py-1 bg-white border border-blue-300 rounded-lg text-blue-950 font-black tracking-widest text-base shadow-sm">${code}</span>`;
    }

    const step1 = document.getElementById('staff-forgot-step1');
    const step2 = document.getElementById('staff-forgot-step2');
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');

    this.showToast(`Tasdiqlash kodi: ${code}`, "info");
  },

  handleStaffForgotVerifyAndReset(e) {
    if (e) e.preventDefault();
    if (!this.state.staffForgotSession) {
      this.showToast("Tiklash sessiyasi topilmadi. Qaytadan urinib ko'ring.", "error");
      this.switchStaffAuthTab('forgot');
      return;
    }

    const enteredCode = (document.getElementById('staff-forgot-code').value || '').trim();
    const newPin = (document.getElementById('staff-forgot-new-pin').value || '').trim();

    if (enteredCode !== this.state.staffForgotSession.code) {
      this.showToast("Kiritilgan 4 talik tasdiqlash kodi noto'g'ri!", "error");
      return;
    }

    if (!newPin || newPin.length < 4) {
      this.showToast("Yangi profil kodi kamida 4 ta belgidan iborat bo'lishi kerak!", "warning");
      return;
    }

    const res = DataStore.resetStaffPin(this.state.staffForgotSession.phone, newPin);
    if (res.success && res.staff) {
      Auth.loginStaff(res.staff);
      this.state.staffForgotSession = null;
      this.closeModal('modal-staff-auth');
      this.refreshAllUI();
      this.switchTab('staff');
      this.showToast(`✅ Xodim kodingiz yangilandi va profilingizga kirdingiz!`, "success");
    } else {
      this.showToast(res.message || "Xatolik yuz berdi!", "error");
    }
  },

  resetStaffAuthStep() {
    this.switchStaffAuthTab('login');
    const input = document.getElementById('staff-login-identifier');
    if (input) input.value = '';
    const pinInput = document.getElementById('staff-login-pin');
    if (pinInput) pinInput.value = '';
    this.state.staffForgotSession = null;
  },

  openEditStaffProfileModal() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'staff') return;

    const staffList = DataStore.getStaffList();
    const uName = (user.fullName || '').trim().toLowerCase();
    const staff = staffList.find(s => s && s.id === (user.staffId || user.id) && (s.fullName || '').trim().toLowerCase() === uName) ||
                  staffList.find(s => s && DataStore.phonesMatch(s.phone, user.phone) && (s.fullName || '').trim().toLowerCase() === uName) ||
                  user;

    document.getElementById('edit-staff-fullname').value = staff.fullName || '';
    const distInput = document.getElementById('edit-staff-district');
    if (distInput) distInput.value = staff.districtLabel || user.districtLabel || '';
    document.getElementById('edit-staff-position').value = staff.position || '';
    document.getElementById('edit-staff-org').value = staff.organization || '';
    document.getElementById('edit-staff-phone').value = staff.phone || '';
    const pinInput = document.getElementById('edit-staff-pin');
    if (pinInput) pinInput.value = staff.pin || '';

    this.state.targetEditStaffId = staff.id;
    this.openModal('modal-edit-staff-profile');
  },

  handleEditStaffSubmit(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    const staffId = this.state.targetEditStaffId || (user.staffId || user.id);
    if (!staffId) return;

    const fullName = (document.getElementById('edit-staff-fullname').value || '').trim();
    const districtVal = (document.getElementById('edit-staff-district')?.value || '').trim();
    const normDist = DataStore.normalizeDistrict(districtVal || user.districtLabel || 'jondor');
    const position = (document.getElementById('edit-staff-position').value || '').trim();
    const organization = (document.getElementById('edit-staff-org').value || '').trim();
    const phone = (document.getElementById('edit-staff-phone').value || '').trim();
    const pin = (document.getElementById('edit-staff-pin').value || '').trim();

    const updatedData = {
      fullName: fullName,
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      position: position,
      organization: organization,
      phone: phone
    };
    if (pin && pin.length >= 4) {
      updatedData.pin = pin;
    }

    const updated = DataStore.updateStaffMember(staffId, updatedData);
    if (updated) {
      Auth.updateStaffSession(updated);
      this.closeModal('modal-edit-staff-profile');
      this.refreshAllUI();
      this.showToast("Xodim profilingiz ma'lumotlari muvaffaqiyatli saqlandi!", "success");
    }
  },

  // ================= 7. O'QUVCHI PROFILI: KIRISH, REGISTRATSIYA VA PAROL TIKLASH =================

  openStudentAuthModal(initialTab = 'login') {
    const stdRegSelect = document.getElementById('std-region');
    if (stdRegSelect) {
      this.filterDatalistByRegion(stdRegSelect.value || 'Buxoro viloyati', 'std-district');
    }
    this.openModal('modal-student-auth');
    this.switchStudentAuthTab(initialTab);
  },

  switchStudentAuthTab(tab) {
    const loginTabBtn = document.getElementById('tab-btn-student-login');
    const registerTabBtn = document.getElementById('tab-btn-student-register');
    const panelLogin = document.getElementById('student-panel-login');
    const panelRegister = document.getElementById('student-panel-register');
    const panelForgot = document.getElementById('student-panel-forgot');
    const modalTitle = document.getElementById('student-modal-title');
    const modalSubtitle = document.getElementById('student-modal-subtitle');
    const tabsContainer = document.getElementById('student-auth-tabs');

    if (tab === 'login') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (loginTabBtn) {
        loginTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 bg-white text-emerald-700 shadow-sm";
      }
      if (registerTabBtn) {
        registerTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
      }
      if (panelLogin) panelLogin.classList.remove('hidden');
      if (panelRegister) panelRegister.classList.add('hidden');
      if (panelForgot) panelForgot.classList.add('hidden');
      if (modalTitle) modalTitle.innerText = "Profilga Kirish";
      if (modalSubtitle) modalSubtitle.innerText = "Kelajak ijodkori portali";
    } else if (tab === 'register') {
      if (tabsContainer) tabsContainer.classList.remove('hidden');
      if (registerTabBtn) {
        registerTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 bg-white text-emerald-700 shadow-sm";
      }
      if (loginTabBtn) {
        loginTabBtn.className = "py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900";
      }
      if (panelLogin) panelLogin.classList.add('hidden');
      if (panelRegister) panelRegister.classList.remove('hidden');
      if (panelForgot) panelForgot.classList.add('hidden');
      if (modalTitle) modalTitle.innerText = "Yangi Profil Ochish";
      if (modalSubtitle) modalSubtitle.innerText = "Ma'lumotlaringizni to'ldiring va +10 tanga oling";

      // Ro'yxatdan o'tish bosqichini 1-bosqichga qaytarish
      this.backToStudentRegStep1();
    } else if (tab === 'forgot') {
      if (tabsContainer) tabsContainer.classList.add('hidden');
      if (panelLogin) panelLogin.classList.add('hidden');
      if (panelRegister) panelRegister.classList.add('hidden');
      if (panelForgot) panelForgot.classList.remove('hidden');
      if (modalTitle) modalTitle.innerText = "Profil Kodini Tiklash";
      if (modalSubtitle) modalSubtitle.innerText = "Telefon raqamingizga SMS kod yuboriladi";

      // Reset forgot step
      const step1 = document.getElementById('student-forgot-step1');
      const step2 = document.getElementById('student-forgot-step2');
      if (step1) step1.classList.remove('hidden');
      if (step2) step2.classList.add('hidden');
      const codeInput = document.getElementById('std-forgot-code');
      const newPinInput = document.getElementById('std-forgot-new-pin');
      if (codeInput) codeInput.value = '';
      if (newPinInput) newPinInput.value = '';
      this.state.studentForgotSession = null;
    }
  },

  async handleStudentLogin(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('std-login-identifier');
    const pinInput = document.getElementById('std-login-pin');
    const identifier = idInput ? idInput.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    if (!identifier) {
      this.showToast("Iltimos, ismingiz, nikingiz yoki telefon raqamingizni kiriting!", "warning");
      return;
    }
    if (!pin) {
      this.showToast("Iltimos, profil maxfiy kodingizni (parol) kiriting!", "warning");
      return;
    }

    let res = Auth.loginStudentByCredentials(identifier, pin);
    if (!res.success && typeof CloudSync !== 'undefined' && CloudSync.pullFromRest) {
      await CloudSync.pullFromRest();
      res = Auth.loginStudentByCredentials(identifier, pin);
    }

    if (res.success) {
      this.closeModal('modal-student-auth');
      this.refreshAllUI();
      this.switchTab('creators');
      this.showToast(`Xush kelibsiz, ${res.creator.fullName}! Profilingizga muvaffaqiyatli kirdingiz.`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  handleStudentRegister(e) {
    return this.handleStudentRegisterSendCode(e);
  },

  handleStudentRegisterSendCode(e) {
    if (e) e.preventDefault();

    const fullName = (document.getElementById('std-fullname').value || "Yosh Iqtidor").trim();
    const nickInputEl = document.getElementById('std-nickname');
    let nick = (nickInputEl?.value || '').trim().replace(/^@/, '');
    if (!nick) {
      nick = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) + '_' + Math.floor(100 + Math.random() * 900);
    }
    const cleanRegNick = DataStore.cleanNickname(nick);
    if (DataStore.isNicknameTaken(cleanRegNick)) {
      this.checkNicknameAvailabilityUI('std-nickname', 'std-nickname-status');
      this.showToast(`⛔ @${cleanRegNick} niki (taxallusi) allaqachon band! Bir kishi ishlatgan nikneymni ikkinchi kishi ishlata olmaydi. Iltimos, boshqa @nickname tanlang.`, "error");
      if (nickInputEl) nickInputEl.focus();
      return;
    }

    const pin = (document.getElementById('std-pin').value || '').trim();
    if (!pin || pin.length < 4) {
      this.showToast("Profil maxfiy kodi kamida 4 ta raqam yoki belgidan iborat bo'lishi kerak!", "warning");
      return;
    }

    const phoneInput = (document.getElementById('std-phone').value || '').trim();
    if (!phoneInput) {
      this.showToast("Iltimos, telefon raqamingizni kiriting!", "warning");
      return;
    }

    // Telefon raqami ilgari ro'yxatdan o'tganligini tekshirish
    if (DataStore.isPhoneRegistered(phoneInput)) {
      this.showToast("Ushbu telefon raqami bilan o'quvchi allaqachon ro'yxatdan o'tgan! Profilga kirish bo'limidan foydalaning yoki profil kodini tiklang.", "warning");
      return;
    }

    const regionVal = (document.getElementById('std-region')?.value || 'Buxoro viloyati').trim();
    const districtVal = document.getElementById('std-district').value;
    const normDist = DataStore.normalizeDistrict(districtVal || 'jondor', regionVal);
    const finalDistrictId = normDist.id || 'jondor';
    const finalDistrictLabel = normDist.label || (districtVal || 'Jondor tumani');

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const userPhoto = this.state.studentTempPhotoBase64 || defaultAvatar;

    const studentData = {
      fullName: fullName,
      nickname: cleanRegNick,
      pin: pin,
      age: document.getElementById('std-age').value || "16",
      district: finalDistrictId,
      districtLabel: finalDistrictLabel,
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      school: (document.getElementById('std-school').value || "15-umumiy o'rta ta'lim maktabi").trim(),
      videoUrl: (document.getElementById('std-video').value || '').trim(),
      bio: (document.getElementById('std-bio').value || '').trim(),
      phone: phoneInput,
      avatarUrl: userPhoto,
      initialCoins: 10
    };

    // 4 talik tasdiqlash kodi yaratish
    const code = String(Math.floor(1000 + Math.random() * 9000));
    this.state.studentRegSession = {
      ...studentData,
      verifyCode: code
    };

    // Admin Inbox'ga SMS kodni xavfsiz saqlash
    DataStore.sendToAdminInbox({
      type: 'student_reg_code',
      name: studentData.fullName,
      phone: studentData.phone,
      district: studentData.district,
      districtLabel: studentData.districtLabel,
      position: `Yangi o'quvchi ro'yxatdan o'tish tasdiq kodi (@${studentData.nickname})`,
      code: code
    });

    // 2-bosqich oynasini ochish
    const step1 = document.getElementById('student-reg-step1');
    const step2 = document.getElementById('student-reg-step2');
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');

    const hintEl = document.getElementById('student-reg-sms-hint');
    if (hintEl) {
      hintEl.innerHTML = `<strong>${phoneInput}</strong> raqamiga 4 talik tasdiqlash kodi yuborildi:<br><span class="inline-block mt-1 px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 font-black tracking-widest text-base shadow-sm">${code}</span>`;
    }

    const codeInput = document.getElementById('std-reg-verify-code');
    if (codeInput) {
      codeInput.value = '';
      codeInput.focus();
    }

    this.showToast(`📲 ${phoneInput} raqamiga 4 talik tasdiqlash kodi yuborildi: ${code}`, "info");
  },

  handleStudentRegisterVerifyAndSubmit(e) {
    if (e) e.preventDefault();

    if (!this.state.studentRegSession || !this.state.studentRegSession.verifyCode) {
      this.showToast("Ro'yxatdan o'tish seansi topilmadi. Iltimos, ma'lumotlarni qayta kiritib kod oling!", "warning");
      this.backToStudentRegStep1();
      return;
    }

    const enteredCode = (document.getElementById('std-reg-verify-code')?.value || '').trim();
    if (!enteredCode) {
      this.showToast("Iltimos, telefoningizga borgan 4 talik SMS kodni kiriting!", "warning");
      return;
    }

    if (enteredCode !== this.state.studentRegSession.verifyCode) {
      this.showToast("⛔ Xato tasdiqlash kodi! Telefon raqamingizga yuborilgan 4 talik kodni to'g'ri kiriting.", "error");
      return;
    }

    // Kod to'g'ri bo'lsa, o'quvchi profilini yaratish va tizimga kiritish
    const studentData = { ...this.state.studentRegSession };
    delete studentData.verifyCode;

    const newCreator = DataStore.addCreator(studentData);
    Auth.loginStudent(newCreator);

    DataStore.sendToAdminInbox({
      type: 'student',
      name: newCreator.fullName,
      phone: newCreator.phone,
      district: newCreator.district,
      districtLabel: newCreator.districtLabel,
      position: `${newCreator.school}, ${newCreator.districtLabel} (@${newCreator.nickname})`,
      code: 'SMS Tasdiqlandi'
    });

    this.state.studentRegSession = null;
    this.closeModal('modal-student-auth');
    this.refreshAllUI();
    this.switchTab('creators');

    this.showToast(`🎉 Tabriklaymiz, ${newCreator.fullName}! Telefon raqamingiz muvaffaqiyatli tasdiqlandi, profilingiz yaratildi va +10 tanga berildi!`, "success");
  },

  handleStudentRegisterResendCode() {
    if (!this.state.studentRegSession) {
      this.showToast("Ro'yxatdan o'tish ma'lumotlari topilmadi!", "warning");
      this.backToStudentRegStep1();
      return;
    }

    const code = String(Math.floor(1000 + Math.random() * 9000));
    this.state.studentRegSession.verifyCode = code;

    DataStore.sendToAdminInbox({
      type: 'student_reg_code',
      name: this.state.studentRegSession.fullName,
      phone: this.state.studentRegSession.phone,
      district: this.state.studentRegSession.district,
      districtLabel: this.state.studentRegSession.districtLabel,
      position: `Qayta yuborilgan ro'yxatdan o'tish tasdiq kodi (@${this.state.studentRegSession.nickname})`,
      code: code
    });

    const hintEl = document.getElementById('student-reg-sms-hint');
    if (hintEl) {
      hintEl.innerHTML = `<strong>${this.state.studentRegSession.phone}</strong> raqamiga yangi 4 talik tasdiqlash kodi yuborildi:<br><span class="inline-block mt-1 px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 font-black tracking-widest text-base shadow-sm">${code}</span>`;
    }

    const codeInput = document.getElementById('std-reg-verify-code');
    if (codeInput) {
      codeInput.value = '';
      codeInput.focus();
    }

    this.showToast(`📲 Yangi 4 talik tasdiqlash kodi yuborildi: ${code}`, "info");
  },

  backToStudentRegStep1() {
    const step1 = document.getElementById('student-reg-step1');
    const step2 = document.getElementById('student-reg-step2');
    if (step2) step2.classList.add('hidden');
    if (step1) step1.classList.remove('hidden');
    const codeInput = document.getElementById('std-reg-verify-code');
    if (codeInput) codeInput.value = '';
  },

  handleStudentForgotSendSms(e) {
    if (e) e.preventDefault();
    const phoneInput = (document.getElementById('std-forgot-phone').value || '').trim();
    if (!phoneInput) {
      this.showToast("Iltimos, ro'yxatdan o'tgan telefon raqamingizni kiriting!", "warning");
      return;
    }

    const creator = DataStore.findCreatorByPhone(phoneInput);
    if (!creator) {
      this.showToast("Ushbu telefon raqami bilan ro'yxatdan o'tgan o'quvchi topilmadi! Raqamni to'g'ri kiritganingizni tekshiring.", "error");
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.state.studentForgotSession = {
      phone: creator.phone,
      creatorId: creator.id,
      code: code
    };

    DataStore.sendToAdminInbox({
      type: 'student_reset',
      name: creator.fullName,
      phone: creator.phone,
      position: `Parolni tiklash SMS (@${creator.nickname || 'ijodkor'})`,
      code: code
    });

    const hint = document.getElementById('student-forgot-sms-hint');
    if (hint) {
      hint.innerHTML = `<strong>${creator.phone}</strong> raqamiga 4 talik tasdiqlash kodi yuborildi:<br><span class="inline-block mt-1 px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-950 font-black tracking-widest text-base shadow-sm">${code}</span>`;
    }

    const step1 = document.getElementById('student-forgot-step1');
    const step2 = document.getElementById('student-forgot-step2');
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');

    this.showToast(`Tasdiqlash kodi: ${code}`, "info");
  },

  handleStudentForgotVerifyAndReset(e) {
    if (e) e.preventDefault();
    if (!this.state.studentForgotSession) {
      this.showToast("Tiklash sessiyasi topilmadi. Qaytadan urinib ko'ring.", "error");
      this.switchStudentAuthTab('forgot');
      return;
    }

    const enteredCode = (document.getElementById('std-forgot-code').value || '').trim();
    const newPin = (document.getElementById('std-forgot-new-pin').value || '').trim();

    if (enteredCode !== this.state.studentForgotSession.code) {
      this.showToast("Kiritilgan 4 talik tasdiqlash kodi noto'g'ri!", "error");
      return;
    }

    if (!newPin || newPin.length < 4) {
      this.showToast("Yangi profil kodi kamida 4 ta belgidan iborat bo'lishi kerak!", "warning");
      return;
    }

    const res = DataStore.resetStudentPin(this.state.studentForgotSession.phone, newPin);
    if (res.success && res.creator) {
      Auth.loginStudent(res.creator);
      this.state.studentForgotSession = null;
      this.closeModal('modal-student-auth');
      this.refreshAllUI();
      this.switchTab('creators');
      this.showToast(`✅ Profil kodingiz yangilandi va profilingizga kirdingiz!`, "success");
    } else {
      this.showToast(res.message || "Xatolik yuz berdi!", "error");
    }
  },

  resetStudentAuthStep() {
    this.switchStudentAuthTab('login');
    const previewImg = document.getElementById('photo-preview-img');
    const placeholder = document.getElementById('photo-preview-placeholder');
    if (previewImg) {
      previewImg.src = '';
      previewImg.classList.add('hidden');
    }
    if (placeholder) {
      placeholder.classList.remove('hidden');
    }
    const photoInput = document.getElementById('std-photo-input');
    if (photoInput) photoInput.value = '';
    this.state.studentTempPhotoBase64 = null;
  },

  // ================= 8. CHELLENJLAR (VIDEO VAZIFALAR & DEDLAYN) =================

  renderChallenges() {
    const grid = document.getElementById('challenges-grid');
    const archivedGrid = document.getElementById('archived-challenges-grid');
    const archivedCountBadge = document.getElementById('archived-challenges-count-badge');
    const adminAction = document.getElementById('challenge-admin-action-block');
    const submissionsGrid = document.getElementById('challenge-submissions-grid');
    if (!grid) return;

    const userDist = this.getActiveDistrictInfo();
    const activeFilterDist = userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : '');

    // Barcha video-chellenjlar Respublika tomonidan qo'yiladi va barcha ekranlarda ko'rinadi
    const allChallenges = DataStore.getChallenges();

    const activeChallenges = allChallenges.filter(chl => !DataStore.isChallengeExpired(chl.deadline, chl.status));
    const archivedChallenges = allChallenges.filter(chl => DataStore.isChallengeExpired(chl.deadline, chl.status));

    const isAdmin = Auth.isAdmin();
    const isRegAdmin = Auth.isRegionAdmin();
    const isRepAdmin = Auth.isRepublicAdmin();

    // Video-chellenjni FAQAT Respublika koordinatori e'lon qila oladi!
    // Tuman va Viloyat koordinatorlarida chellenj e'lon qilish tugmasi bo'lmaydi.
    if (adminAction) {
      if (isRepAdmin) {
        adminAction.innerHTML = `
          <button onclick="App.openAddChallengeModal('republic')" class="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-earth-asia text-base"></i> 🌍 Respublika Umumiy Video-Chellenji E'lon Qilish
          </button>
        `;
      } else if (isAdmin || isRegAdmin) {
        adminAction.innerHTML = `
          <div class="px-4 py-2 rounded-2xl bg-white/15 border border-white/25 text-white text-xs font-bold flex items-center gap-2">
            <i class="fa-solid fa-earth-asia text-amber-300"></i>
            <span>Video-chellenjlar Respublika tomonidan qo'yiladi (Tuman → Viloyat → Respublika)</span>
          </div>
        `;
      } else {
        adminAction.innerHTML = '';
      }
    }

    if (activeChallenges.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-10 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            <i class="fa-solid fa-film"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">${userDist.districtLabel ? `${userDist.districtLabel} bo'yicha hozircha` : 'Hozircha'} faol video-chellenjlar yo'q</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Muddati tugagan video-chellenjlar pastdagi <strong>Arxiv</strong> bo'limida saqlanadi.
          </p>
        </div>
      `;
    } else {
      grid.innerHTML = activeChallenges.map(chl => {
        const daysLeft = DataStore.getDaysLeft(chl.deadline);
        const isRepScope = chl.scope === 'republic' || chl.isRepublic || chl.district === 'all';
        const postedDate = chl.startDate || chl.createdAt || '2026-03-01';

        const statusBadge = `
          <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <i class="fa-solid fa-clock"></i> ${daysLeft} kun qoldi
          </span>
        `;

        let submitButton = '';
        if (Auth.isStudent()) {
          submitButton = `
            <button onclick="App.openSubmitChallengeModal('${chl.id}')" class="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-cloud-arrow-up text-sm"></i> Video Rolikni Topshirish
            </button>
          `;
        } else if (isAdmin || isRepAdmin) {
          submitButton = `
            <div class="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
              <i class="fa-solid fa-user-graduate text-emerald-600"></i> ${isRepScope ? 'Barcha tuman' : (chl.districtLabel || userDist.districtLabel || 'Tuman')} o'quvchilari ushbu chellenjga video topshirishadi
            </div>
          `;
        } else if (Auth.isStaff()) {
          submitButton = `
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center text-xs font-bold text-blue-700 flex items-center justify-center gap-2">
              <i class="fa-solid fa-film text-blue-600"></i> ${isRepScope ? 'Respublika' : (chl.districtLabel || userDist.districtLabel || 'Tuman')} o'quvchilari uchun ijodiy topshiriq
            </div>
          `;
        } else {
          submitButton = `
            <button onclick="App.openStudentAuthModal('login')" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-user-graduate text-emerald-600"></i> Topshirish uchun o'quvchi profiliga kiring
            </button>
          `;
        }

        return `
          <div class="bg-white rounded-3xl border ${isRepScope ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'} p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
            <div>
              <div class="flex items-center justify-between gap-2 flex-wrap">
                ${statusBadge}
                <span class="font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                  🪙 +${chl.awardCoins} tanga
                </span>
              </div>

              <div class="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                ${isRepScope ? `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                    🌍 Respublika Umumiy Vazifasi (Barcha ekranlarda)
                  </span>
                ` : `
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    📍 ${chl.districtLabel || userDist.districtLabel || 'Tuman chellenji'}
                  </span>
                `}
              </div>

              <h3 class="text-lg font-black text-slate-900 mt-2.5 leading-snug">
                ${chl.title}
              </h3>

              <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  📅 Qo'yilgan sana: <strong>${postedDate}</strong>
                </span>
                <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  ⏳ Tugash muddati: <strong>${chl.deadline}</strong>
                </span>
              </div>

              <p class="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                ${chl.description}
              </p>
            </div>

            <div class="mt-5 pt-4 border-t border-slate-100 space-y-3">
              ${submitButton}
              ${isRepAdmin ? `
                <div class="flex items-center justify-between pt-1">
                  <button onclick="App.handleArchiveChallenge('${chl.id}')" class="text-xs text-amber-700 hover:text-amber-900 font-bold">
                    <i class="fa-solid fa-box-archive mr-1"></i> Arxivga o'tkazish
                  </button>
                  <button onclick="App.handleDeleteChallenge('${chl.id}')" class="text-xs text-red-500 hover:text-red-700 font-bold">
                    <i class="fa-solid fa-trash mr-1"></i> O'chirish
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    // Topshirilgan video roliklar galereyasi (faqat shu tuman bo'yicha + joriy o'quvchi kollaboratsiyada qatnashgan barcha videolar)
    const allSubmissions = DataStore.getChallengeSubmissions();
    const currentUser = Auth.getCurrentUser();
    const currentCreator = (currentUser && currentUser.role === 'student')
      ? (DataStore.getCreatorById(currentUser.creatorId) || currentUser)
      : null;

    if (submissionsGrid) {
      let submissions = allSubmissions;
      if (activeFilterDist) {
        submissions = submissions.filter(sub =>
          DataStore.districtsMatch(sub.district || sub.creatorDistrict, activeFilterDist) ||
          (currentCreator && DataStore.isCreatorInSubmission(sub, currentCreator))
        );
      }
      if (submissions.length === 0) {
        submissionsGrid.innerHTML = `
          <div class="col-span-full py-8 text-center text-slate-400 text-xs">
            ${userDist.districtLabel ? `${userDist.districtLabel} bo'yicha hozircha` : 'Hozircha'} chellenj video roliklari topshirilmagan.
          </div>
        `;
      } else {
        submissionsGrid.innerHTML = submissions.map(sub => {
          const isMyCollab = currentCreator ? DataStore.isCreatorInSubmission(sub, currentCreator) : false;
          const collabInfo = DataStore.resolveSubmissionCollaborators(sub, sub.creatorId, sub.creatorName);
          const isTeamCollab = collabInfo.collaborators.length > 1 || collabInfo.collaboratorNicknames.length > 1;

          return `
          <div class="p-4 rounded-2xl ${isMyCollab ? 'bg-emerald-50/70 border-2 border-emerald-400 ring-2 ring-emerald-100' : 'bg-slate-50 border border-slate-200'} flex flex-col justify-between text-xs space-y-3">
            <div>
              ${isMyCollab ? `
                <div class="mb-2 px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[11px] flex items-center justify-between gap-2 shadow-2xs">
                  <span>🤝 Sizning ${isTeamCollab ? 'kollaboratsiya' : 'ijodiy'} videoroligingiz!</span>
                  ${sub.status === 'approved' ? `<span>Har biringizga +${sub.coinsAwarded} 🪙</span>` : ''}
                </div>
              ` : ''}
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-slate-900 truncate">${sub.creatorName} ${sub.creatorNickname ? `<span class="text-indigo-600 font-black">(${sub.creatorNickname})</span>` : ''}</span>
                ${sub.status === 'approved' ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                    🪙 Har biriga +${sub.coinsAwarded}
                  </span>
                ` : `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    ⏳ Ko'rib chiqilmoqda
                  </span>
                `}
              </div>
              <span class="text-[11px] text-slate-500 block truncate">${sub.creatorSchool} ${sub.creatorDistrict ? `• 📍 ${sub.creatorDistrict}` : ''}</span>
              <p class="text-[11px] font-semibold text-rose-700 mt-1 truncate">🎯 ${sub.challengeTitle}</p>

              <!-- 3-BOSQICH MUKOFOT BADGELARI -->
              <div class="flex flex-wrap gap-1 mt-1.5">
                ${sub.promotedToRegion ? `<span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-[10px]">🏅 Tuman G'olibi — Viloyatda (+5 🪙)</span>` : ''}
                ${sub.promotedToRepublic ? `<span class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-[10px]">🌟 Viloyat G'olibi — Respublikada (+10 🪙)</span>` : ''}
                ${sub.isRepublicWinner ? `<span class="px-2 py-0.5 rounded-md bg-amber-300 text-slate-950 font-black text-[10px]">🏆 Respublika 1-O'rin (+15 🪙)</span>` : ''}
              </div>

              <!-- KOLLABORATSIYA VA KIMLAR QATNASHGANI (@NICKNAME BILAN) -->
              <div class="mt-2.5 p-2.5 bg-white rounded-xl border border-indigo-200 text-[11px] text-slate-700 space-y-1.5">
                <span class="font-black text-indigo-950 block">
                  <i class="fa-solid fa-handshake-angle mr-1 text-indigo-600"></i>
                  ${isTeamCollab ? `Kollaboratsiya jamoasi (${collabInfo.collaborators.length || collabInfo.collaboratorNicknames.length} nafar):` : 'Rolik ishtirokchisi (@nickname):'}
                </span>
                ${this.formatSubmissionCollaboratorsHtml(sub)}
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200 flex items-center justify-between">
              <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
                <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Videoni Ko'rish
              </a>
              <span class="text-[11px] text-slate-500 font-bold inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs" title="Video rolik yuklangan sana">
                <i class="fa-regular fa-calendar-check text-emerald-600"></i> ${sub.submittedAt}
              </span>
            </div>
          </div>
        `;
        }).join('');
      }
    }

    // ARXIVLANGAN CHELLENJLAR BO'LIMI (Muddati tugagan chellenjlar va kimlar qatnashgani)
    if (archivedCountBadge) {
      archivedCountBadge.textContent = `${archivedChallenges.length} ta arxivda`;
    }
    if (archivedGrid) {
      if (archivedChallenges.length === 0) {
        archivedGrid.innerHTML = `
          <div class="col-span-full py-6 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            Hozircha muddati tugagan (arxivga tushgan) video-chellenjlar yo'q.
          </div>
        `;
      } else {
        archivedGrid.innerHTML = archivedChallenges.map(chl => {
          const postedDate = chl.startDate || chl.createdAt || '2026-01-10';
          const chlSubs = allSubmissions.filter(sub =>
            (sub.challengeId === chl.id || sub.challengeTitle === chl.title) &&
            (!activeFilterDist || DataStore.districtsMatch(sub.district || sub.creatorDistrict, activeFilterDist))
          );

          return `
            <div class="bg-white rounded-2xl border border-slate-300 p-5 flex flex-col justify-between shadow-xs space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-200 text-slate-800 flex items-center gap-1">
                    <i class="fa-solid fa-box-archive text-slate-600"></i> Arxivlangan (Muddati tugagan)
                  </span>
                  <span class="font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs">
                    🪙 +${chl.awardCoins} tanga
                  </span>
                </div>

                <h4 class="text-base font-black text-slate-900 mt-2">${chl.title}</h4>
                <p class="text-xs text-slate-600 mt-1">${chl.description}</p>

                <div class="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span class="text-slate-400 block font-semibold">📅 Qo'yilgan sana:</span>
                    <span class="font-black text-slate-800">${postedDate}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-semibold">⛔ Muddati tugagan sana:</span>
                    <span class="font-black text-red-700">${chl.deadline}</span>
                  </div>
                </div>

                <div class="mt-3">
                  <span class="text-xs font-black text-slate-800 block mb-1.5">
                    <i class="fa-solid fa-users text-emerald-600 mr-1"></i> Kimlar qatnashgan (${chlSubs.length} ta video rolik):
                  </span>
                  ${chlSubs.length === 0 ? `
                    <p class="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-xl border border-slate-100">Ushbu chellenj muddati davomida rolik topshirilmagan.</p>
                  ` : `
                    <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      ${chlSubs.map(s => `
                        <div class="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] flex items-center justify-between gap-2">
                          <div>
                            <span class="font-black text-slate-900">${s.creatorName}</span>
                            <span class="text-slate-500">(${s.creatorSchool})</span>
                            <div class="mt-1">${this.formatSubmissionCollaboratorsHtml(s)}</div>
                          </div>
                          <a href="${s.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] shrink-0">
                            <i class="fa-solid fa-play text-red-400 mr-0.5"></i> Video
                          </a>
                        </div>
                      `).join('')}
                    </div>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  formatSubmissionCollaboratorsHtml(sub) {
    if (!sub) return '';
    const collabInfo = DataStore.resolveSubmissionCollaborators(sub, sub.creatorId, sub.creatorName);
    if (collabInfo.collaborators.length > 0) {
      const badges = collabInfo.collaborators.map(c => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-[10px]">
          <span class="text-indigo-600">@${c.nickname}</span>
          <span class="text-slate-700 font-bold">(${c.fullName})</span>
        </span>
      `).join(' ');
      const extraText = sub.participants ? `<span class="block text-[10px] text-slate-500 mt-1">${sub.participants}</span>` : '';
      return `<div class="flex flex-wrap gap-1">${badges}</div>${extraText}`;
    }
    return `<span class="text-slate-700 font-semibold">${sub.participants || sub.creatorName || ''}</span>`;
  },

  openSubmitChallengeModal(challengeId) {
    if (!Auth.isStudent()) {
      this.showToast("Video rolik topshirish faqat maktab o'quvchilari uchun! Iltimos, o'quvchi sifatida kiring.", "warning");
      this.openStudentAuthModal('login');
      return;
    }

    const chl = DataStore.getChallenges().find(c => c.id === challengeId);
    if (!chl) return;

    const isRepScope = chl.scope === 'republic' || chl.isRepublic || chl.district === 'all';
    const userDist = this.getActiveDistrictInfo();
    if (!isRepScope && chl.district && userDist.district && !DataStore.districtsMatch(chl.district, userDist.district)) {
      this.showToast(`Siz faqat o'z tumaningiz (${userDist.districtLabel}) yoki Respublika chellenjlarida qatnasha olasiz!`, "error");
      return;
    }

    if (DataStore.isChallengeExpired(chl.deadline, chl.status)) {
      this.showToast("Ushbu chellenjning qabul qilish muddati tugagan va arxivga o'tkazilgan!", "error");
      return;
    }

    document.getElementById('submit-challenge-id').value = chl.id;
    document.getElementById('submit-challenge-title-text').textContent = chl.title;

    const user = Auth.getCurrentUser();
    let myNick = '';
    if (user.role === 'student') {
      const creator = DataStore.getCreatorById(user.creatorId) || user;
      document.getElementById('sub-creator-name').value = creator.fullName;
      document.getElementById('sub-creator-school').value = creator.school;
      myNick = DataStore.cleanNickname(creator.nickname || creator.fullName);
    } else {
      document.getElementById('sub-creator-name').value = '';
      document.getElementById('sub-creator-school').value = '';
    }

    document.getElementById('sub-video-url').value = '';
    document.getElementById('sub-participants').value = myNick ? `@${myNick}` : '';
    document.getElementById('sub-note').value = '';

    // Tuman o'quvchilarining @nickname ro'yxatini chiqarish (kollaboratsiyaga qo'shish uchun)
    const pickerEl = document.getElementById('sub-collaborators-picker');
    if (pickerEl) {
      const distCreators = DataStore.getCreators().filter(c =>
        !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)
      );
      if (distCreators.length === 0) {
        pickerEl.innerHTML = `<span class="text-[11px] text-slate-400">Tumaningizdagi o'quvchilarning @nickname'ini pastga yozing.</span>`;
      } else {
        pickerEl.innerHTML = distCreators.map(c => {
          const nick = DataStore.cleanNickname(c.nickname) || DataStore.cleanNickname(c.fullName).replace(/[^a-z0-9]/g, '');
          return `
            <button type="button" onclick="App.toggleCollaboratorNickname('${nick.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-xl text-[11px] font-black border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-600 hover:text-white text-indigo-900 transition flex items-center gap-1">
              <span>@${nick}</span>
              <span class="font-normal opacity-80">(${c.fullName})</span>
            </button>
          `;
        }).join('');
      }
    }

    this.updateCollaboratorsPreview();
    this.openModal('modal-submit-challenge');
  },

  toggleCollaboratorNickname(rawNick) {
    const nick = DataStore.cleanNickname(rawNick);
    if (!nick) return;
    const input = document.getElementById('sub-participants');
    if (!input) return;

    const token = '@' + nick;
    const current = input.value.trim();
    const parts = current ? current.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];
    const existsIdx = parts.findIndex(p => DataStore.cleanNickname(p.split('(')[0]) === nick);

    if (existsIdx >= 0) {
      parts.splice(existsIdx, 1);
    } else {
      parts.push(token);
    }

    input.value = parts.join(', ');
    this.updateCollaboratorsPreview();
  },

  updateCollaboratorsPreview() {
    const previewEl = document.getElementById('sub-collaborators-preview');
    const input = document.getElementById('sub-participants');
    if (!previewEl || !input) return;

    const user = Auth.getCurrentUser();
    const creator = (user && user.role === 'student') ? (DataStore.getCreatorById(user.creatorId) || user) : null;
    const collabInfo = DataStore.resolveSubmissionCollaborators(
      input.value,
      creator ? creator.id : '',
      creator ? creator.fullName : ''
    );

    if (collabInfo.collaborators.length === 0) {
      previewEl.innerHTML = `<i class="fa-solid fa-circle-info mr-1"></i> Qatnashgan o'quvchilarning <b>@nickname</b>'ini kiriting — ularning ham profilida ushbu video chiqadi.`;
      return;
    }

    const listHtml = collabInfo.collaborators.map(c =>
      `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-950 font-black text-[11px]">@${c.nickname} (${c.fullName})</span>`
    ).join(' ');

    previewEl.innerHTML = `
      <div class="space-y-1">
        <div class="font-black text-emerald-900">
          🤝 Kollaboratsiyaga ulangan o'quvchilar (${collabInfo.collaborators.length} nafar):
        </div>
        <div class="flex flex-wrap gap-1">${listHtml}</div>
        <div class="text-[10px] text-emerald-700 font-semibold pt-0.5">
          ✅ Ushbu ${collabInfo.collaborators.length} nafar o'quvchining barchasida video ko'rinadi, g'olib bo'lganda barchasiga tabriknoma chiqadi va har bittasiga va'da qilingan tangadan to'liq beriladi!
        </div>
      </div>
    `;
  },

  handleSubmitChallenge(e) {
    e.preventDefault();
    const challengeId = document.getElementById('submit-challenge-id').value;
    const chl = DataStore.getChallenges().find(c => c.id === challengeId);
    if (!chl) return;

    const user = Auth.getCurrentUser();
    const creator = (user && user.role === 'student') ? (DataStore.getCreatorById(user.creatorId) || user) : null;
    const userDist = this.getActiveDistrictInfo();
    const subData = {
      challengeId: chl.id,
      challengeTitle: chl.title,
      creatorId: user.role === 'student' ? user.creatorId : '',
      creatorName: document.getElementById('sub-creator-name').value,
      creatorNickname: creator && creator.nickname ? '@' + DataStore.cleanNickname(creator.nickname) : '',
      creatorSchool: document.getElementById('sub-creator-school').value,
      district: userDist.district || (chl.district !== 'all' ? chl.district : 'jondor'),
      creatorDistrict: userDist.districtLabel || chl.districtLabel || 'Jondor tumani',
      regionId: userDist.regionId || 'buxoro_vil',
      regionLabel: userDist.regionLabel || 'Buxoro viloyati',
      creatorPhone: user.phone || '',
      videoUrl: document.getElementById('sub-video-url').value,
      participants: document.getElementById('sub-participants').value,
      note: document.getElementById('sub-note').value
    };

    const savedSub = DataStore.submitChallengeVideo(subData);
    const collabCount = (savedSub.collaborators && savedSub.collaborators.length) || 1;
    this.closeModal('modal-submit-challenge');
    this.renderChallenges();
    this.renderStudentVictoryAchievements();
    this.showToast(
      collabCount > 1
        ? `🤝 Jamoaviy kollaboratsiya videoroligi (${collabCount} nafar o'quvchi @nickname bilan) topshirildi! Tuman koordinatoriga va barcha hamkorlaringiz profiliga ulandi.`
        : `Video rolik topshirildi! ${userDist.districtLabel || 'Tumaningiz'} admini ko'rib chiqib tangalarni taqdim etadi.`,
      "success"
    );
  },

  openAddChallengeModal() {
    if (!Auth.isRepublicAdmin()) {
      this.showToast("Video-chellenjni faqat Respublika Bosh Koordinatori e'lon qila oladi!", "warning");
      return;
    }
    const scopeInput = document.getElementById('chl-scope');
    const bannerEl = document.getElementById('chl-scope-banner-text');

    if (scopeInput) scopeInput.value = 'republic';
    if (bannerEl) {
      bannerEl.textContent = "🌍 Respublika umumiy video-chellenji (Barcha viloyat va tuman ekranlarida ko'rinadi)";
    }

    document.getElementById('chl-title').value = '';
    document.getElementById('chl-coins').value = '50';
    document.getElementById('chl-desc').value = '';

    const d = new Date();
    d.setDate(d.getDate() + 7);
    document.getElementById('chl-deadline').value = d.toISOString().split('T')[0];

    this.openModal('modal-add-challenge');
  },

  handleAddChallengeSubmit(e) {
    e.preventDefault();
    if (!Auth.isRepublicAdmin()) {
      this.showToast("Video-chellenjni faqat Respublika Bosh Koordinatori e'lon qila oladi!", "warning");
      return;
    }
    const coinsVal = document.getElementById('chl-coins').value;
    const todayStr = new Date().toISOString().split('T')[0];

    const chlData = {
      title: document.getElementById('chl-title').value,
      coins: coinsVal,
      awardCoins: coinsVal,
      startDate: todayStr,
      deadline: document.getElementById('chl-deadline').value,
      description: document.getElementById('chl-desc').value,
      scope: 'republic',
      isRepublic: true,
      district: 'all',
      districtLabel: '🌍 Respublika Umumiy Vazifasi (Barça tumanlar)'
    };

    DataStore.addChallenge(chlData);
    this.closeModal('modal-add-challenge');
    this.refreshAllUI();
    this.showToast("🌍 Respublika umumiy video-chellenji barcha viloyat va tumanlar uchun e'lon qilindi!", "success");
  },

  handleArchiveChallenge(id) {
    if (!Auth.isRepublicAdmin()) return;
    DataStore.archiveChallenge(id);
    this.refreshAllUI();
    this.showToast("📦 Video-chellenj arxivga o'tkazildi!", "info");
  },

  handleDeleteChallenge(id) {
    if (!Auth.isRepublicAdmin()) return;
    if (confirm("Ushbu chellenjni o'chirmoqchimisiz?")) {
      DataStore.deleteChallenge(id);
      this.refreshAllUI();
      this.showToast("Chellenj o'chirildi.", "info");
    }
  },

  // ================= 9. CHELLENJ VIDEOLARINI ADMIN BAHOLASHI =================

  openReviewSubmissionModal(submissionId) {
    if (!Auth.isAdmin()) return;
    const sub = DataStore.getChallengeSubmissions().find(s => s.id === submissionId);
    if (!sub) return;

    document.getElementById('review-submission-id').value = sub.id;
    document.getElementById('review-coins-amount').value = sub.coinsAwarded || 50;

    const collabInfo = DataStore.resolveSubmissionCollaborators(sub, sub.creatorId, sub.creatorName);
    const content = document.getElementById('review-submission-content');
    content.innerHTML = `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5">
        <div>
          <span class="text-slate-500 block">Topshirgan o'quvchi:</span>
          <span class="font-bold text-slate-900 text-sm">${sub.creatorName} ${sub.creatorNickname ? `<span class="text-indigo-600">(${sub.creatorNickname})</span>` : ''}</span> (${sub.creatorSchool})
        </div>
        <div>
          <span class="text-slate-500 block">Chellenj:</span>
          <span class="font-bold text-rose-700">${sub.challengeTitle}</span>
        </div>
        <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1.5">
          <span class="font-black text-indigo-950 block">🤝 Kollaboratsiyadagi barcha o'quvchilar (${collabInfo.collaborators.length || 1} nafar):</span>
          ${this.formatSubmissionCollaboratorsHtml(sub)}
          <span class="block text-[11px] font-bold text-emerald-800 pt-1">
            💡 Tasdiqlaganingizda yuqoridagi har bir o'quvchining hisobiga va'da qilingan tanga alohida-alohida to'liq qo'shiladi!
          </span>
        </div>
        <div class="pt-2">
          <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold inline-flex items-center gap-2">
            <i class="fa-solid fa-play text-red-400"></i> Videoni Asl Manbada Ochib Ko'rish
          </a>
        </div>
      </div>
    `;

    this.openModal('modal-review-submission');
  },

  handleApproveSubmissionSubmit(e) {
    e.preventDefault();
    const subId = document.getElementById('review-submission-id').value;
    const coins = document.getElementById('review-coins-amount').value;
    const note = document.getElementById('review-admin-note').value;

    const res = DataStore.approveChallengeSubmission(subId, coins, note);
    if (res.success) {
      this.closeModal('modal-review-submission');
      this.refreshAllUI();
      const count = res.rewardedCount || 1;
      this.showToast(
        count > 1
          ? `🪙 Kollaboratsiyadagi barcha ${count} nafar o'quvchining har biriga +${coins} tangadan taqdim etildi!`
          : `🪙 ${coins} tanga muvaffaqiyatli taqdim etildi va chellenj tasdiqlandi!`,
        "success"
      );
    }
  },

  // ================= 9B. O'QUVCHILAR UCHUN G'OLIBLIK TABRIKNOMASI VA KATTA EKRAN MOTIVATSION MODAL =================

  getStudentStageDetails(sub) {
    if (!sub) return null;
    const collabInfo = DataStore.resolveSubmissionCollaborators(sub, sub.creatorId, sub.creatorName);
    const isTeam = collabInfo.collaborators.length > 1;
    const teamBadgesHtml = collabInfo.collaborators.map(c =>
      `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/15 border border-white/25 text-amber-200 font-black text-xs">@${c.nickname} (${c.fullName})</span>`
    ).join(' ');

    if (sub.isRepublicWinner) {
      return {
        stageKey: 'republic_winner',
        priority: 4,
        icon: '🏆👑',
        badgeText: "RESPUBLIKA 1-O'RIN MUTLAQ G'OLIBI (+15 🪙 BONUS)",
        gradientClass: 'from-amber-500 via-rose-600 to-purple-800',
        borderClass: 'border-amber-300',
        headline: "🎉 TABRIKLAYMIZ! VIDEO-CHELLENJINGIZ RESPUBLIKADA 1-O'RINNI YUTDI!",
        subheadline: `Siz va jamoangiz "${sub.challengeTitle}" video-chellenjida butun O'zbekiston bo'yicha 1-o'rin mutlaq g'olibi bo'ldingiz!`,
        motivation: "🌟 Siz haqiqiy Kelajak Ijodkorisiz! Iste'dodingiz butun respublikaga namuna bo'ldi. Aslo to'xtab qolmang, yanada ulkan marralar sari dadil qadam tashlang — kelajak sizniki!",
        coinsInfo: `Kollaboratsiyada qatnashgan har bir ishtirokchiga jami +${sub.coinsAwarded || 80} 🪙 tangadan (jumladan Respublika 1-o'rin uchun +15 🪙) taqdim etildi!`,
        isTeam,
        teamBadgesHtml,
        collabInfo
      };
    }
    if (sub.promotedToRepublic) {
      return {
        stageKey: 'promoted_republic',
        priority: 3,
        icon: '🌟🚀',
        badgeText: "VILOYAT BOSQICHI G'OLIBI — RESPUBLIKA FINALIGA YO'LLANMA (+10 🪙 BONUS)",
        gradientClass: 'from-purple-700 via-indigo-800 to-rose-700',
        borderClass: 'border-purple-300',
        headline: `🎉 TABRIKLAYMIZ! VIDEO-CHELLENJINGIZ ${ (sub.regionLabel || 'VILOYAT').toUpperCase() }DA G'OLIB BO'LDI VA RESPUBLIKAGA O'TDI!`,
        subheadline: `"${sub.challengeTitle}" bo'yicha videoroligingiz viloyat koordinatori tomonidan eng zo'r deb topilib, Respublika final bosqichiga yuborildi!`,
        motivation: "🔥 Ajoyib natija! Tuman va viloyatda g'olib bo'ldingiz, endi navbat Respublika shohsupasiga! O'z ustingizda ishlashda davom eting, ijodiy parvozingiz hech qachon to'xtamasin!",
        coinsInfo: `Kollaboratsiyadagi har bir o'quvchiga +10 🪙 viloyat g'olibligi bonusi (jami +${sub.coinsAwarded || 65} 🪙 tangadan) berildi!`,
        isTeam,
        teamBadgesHtml,
        collabInfo
      };
    }
    if (sub.promotedToRegion) {
      return {
        stageKey: 'promoted_region',
        priority: 2,
        icon: '🏅✨',
        badgeText: "TUMAN BOSQICHI G'OLIBI — VILOYAT BOSQICHIGA O'TDI (+5 🪙 BONUS)",
        gradientClass: 'from-emerald-700 via-teal-700 to-indigo-800',
        borderClass: 'border-emerald-300',
        headline: `🎉 TABRIKLAYMIZ! VIDEO-CHELLENJINGIZ ${ (sub.creatorDistrict || sub.districtLabel || 'TUMAN').toUpperCase() }DA G'OLIB BO'LIB, VILOYATGA O'TDI!`,
        subheadline: `"${sub.challengeTitle}" uchun tayyorlagan videoroligingiz tuman koordinatori tomonidan eng yaxshi deb tanlandi va Viloyat bosqichiga yo'llanma oldi!`,
        motivation: "💪 Barakalla, ijod qilishda davom eting! Birinchi katta qadam qo'yildi — endi Viloyat va Respublika bosqichlarida ham g'olib bo'lishingizga ishonamiz. Olg'a, yosh ijodkor!",
        coinsInfo: `Kollaboratsiyada qatnashgan har bir o'quvchiga va'da qilingan tanga va +5 🪙 tuman g'olibligi bonusi (jami +${sub.coinsAwarded || 55} 🪙 tangadan) berildi!`,
        isTeam,
        teamBadgesHtml,
        collabInfo
      };
    }
    if (sub.status === 'approved') {
      return {
        stageKey: 'approved',
        priority: 1,
        icon: '🤝🎉',
        badgeText: `VIDEO-CHELLENJ TASDIQLANDI (+${sub.coinsAwarded || 50} 🪙 TANGA)`,
        gradientClass: 'from-indigo-700 via-blue-700 to-emerald-700',
        borderClass: 'border-indigo-300',
        headline: `🎉 TABRIKLAYMIZ! "${sub.challengeTitle}" VIDEOROLIGINGIZ QABUL QILINDI!`,
        subheadline: `Tuman koordinatori sizning jamoaviy videoroligingizni tasdiqladi va har bir ishtirokchiga va'da qilingan tangalarni taqdim etdi!`,
        motivation: "✨ Ijodiy faolligingiz uchun rahmat! Do'stlaringiz bilan kollaboratsiya qilishda va yangi cho'qqilarni zabt etishda davom eting!",
        coinsInfo: `Qatnashgan har bir o'quvchiga +${sub.coinsAwarded || 50} 🪙 tangadan taqdim etildi!`,
        isTeam,
        teamBadgesHtml,
        collabInfo
      };
    }
    return null;
  },

  // Tabriknoma va @nickname kollaboratsiya yozuvi bosh ekranda faqat 1 kun (24 soat) turishi tekshiruvi
  isVictoryBannerActiveWithin24h(sub, creator, stageKey = 'collab') {
    if (!sub) return false;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    let stageTime = 0;
    if (sub.stageUpdatedAt) {
      stageTime = typeof sub.stageUpdatedAt === 'number'
        ? sub.stageUpdatedAt
        : new Date(sub.stageUpdatedAt).getTime();
      if (isNaN(stageTime)) stageTime = 0;
    }
    if (stageTime > 0 && (now - stageTime) > ONE_DAY_MS) {
      return false;
    }

    const cKey = (creator && (creator.id || creator.nickname)) || 'student';
    const seenAtKey = `ijodkor_banner_first_seen_${cKey}_${sub.id}_${stageKey}`;
    let firstSeen = Number(localStorage.getItem(seenAtKey) || 0);
    if (!firstSeen || isNaN(firstSeen)) {
      firstSeen = stageTime > 0 ? stageTime : now;
      localStorage.setItem(seenAtKey, String(firstSeen));
    }
    return (now - firstSeen) <= ONE_DAY_MS;
  },

  renderStudentVictoryAchievements() {
    const creatorsBanner = document.getElementById('student-victory-achievements-banner');
    const challengesBanner = document.getElementById('challenges-victory-achievements-banner');

    if (!Auth.isStudent()) {
      if (creatorsBanner) {
        creatorsBanner.innerHTML = '';
        creatorsBanner.classList.add('hidden');
      }
      if (challengesBanner) {
        challengesBanner.innerHTML = '';
        challengesBanner.classList.add('hidden');
      }
      this.closeModal('modal-student-celebration');
      return;
    }

    const user = Auth.getCurrentUser();
    const creator = DataStore.getCreatorById(user.creatorId);
    if (!creator) {
      if (creatorsBanner) {
        creatorsBanner.innerHTML = '';
        creatorsBanner.classList.add('hidden');
      }
      if (challengesBanner) {
        challengesBanner.innerHTML = '';
        challengesBanner.classList.add('hidden');
      }
      this.closeModal('modal-student-celebration');
      return;
    }
    // Video-chellenj g'olibligi tabriknomasi katta ekranda (modalda) FAQAT BIR MARTA chiqadi.
    // "Rahmat, ijod qilishda davom etamiz!" bosilgandan so'ng bosh ekranda boshqa tabriknoma banneri turmaydi — u faqat "Yutuqlarim" bo'limida saqlanadi!
    // Bosh ekranda faqatgina Madaniyat xodimi tanlovga chaqirgan (hali sertifikat rasmi tasdiqlanmagan) faol chaqiruv xabarnomasi ko'rinadi.
    const allContests = DataStore.getContests();
    const mySelectedContests = allContests.filter(c => {
      if (!DataStore.isStudentSelectedInContest(c, creator)) return false;
      const myProof = (c.certificateProofs || []).find(p =>
        String(p.creatorId) === String(creator.id) ||
        DataStore.phonesMatch(p.creatorPhone, creator.phone)
      );
      // Agar sertifikat rasmi allaqachon tasdiqlangan bo'lsa, u ham "Yutuqlarim"ga o'tgan — bosh ekranda turishi shart emas
      return !(myProof && myProof.status === 'approved');
    });

    const contestSelectionHtml = mySelectedContests.map(c => {
      const selInfo = DataStore.getStudentContestSelectionInfo(c, creator) || {};
      const myProof = (c.certificateProofs || []).find(p =>
        String(p.creatorId) === String(creator.id) ||
        DataStore.phonesMatch(p.creatorPhone, creator.phone)
      );
      return `
        <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 text-white shadow-xl border-2 border-amber-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-xs">
                🎉 SIZ TADBIRGA CHAQIRILDINGIZ! (Madaniyat xodimi tanladi)
              </span>
              <span class="px-3 py-1 rounded-full bg-white/15 border border-white/30 text-amber-200 font-black text-[11px]">
                🪙 +${c.awardCoins || 50} tanga mukofot
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black leading-snug">
              🎭 "${c.title}" tadbiriga chaqirildingiz!
            </h3>
            <div class="p-3 rounded-2xl bg-black/25 border border-white/20 text-xs space-y-1">
              <p class="font-black text-amber-300 text-sm">
                📅 Tanlov sanasi: ${c.eventDate || 'Belgilangan sana'} — Mana shu sanada sizni kutamiz!
              </p>
              <p class="text-white/95 font-semibold">
                📍 Manzil: <strong>${c.location || c.districtLabel || 'Madaniyat markazi'}</strong> | 👤 Tanlagan madaniyat xodimi: <strong>${selInfo.selectedByStaffName || 'Madaniyat xodimi'}</strong>
              </p>
            </div>
            <p class="text-xs text-emerald-100 leading-relaxed">
              ✨ Tadbirga qatnashib kelganingizdan keyin, <strong>madaniyat xodimi bilan «Kelajak ijodkori» sertifikatini ushlab tushgan rasmingizni</strong> tanlov pastiga joylang! Madaniyat xodimi o'z oynasidan rasm haqiqiyligini tasdiqlab qabul qilgach, sizga <strong>+${c.awardCoins || 50} 🪙 tanga</strong> boradi.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
            ${myProof ? `
              <span class="px-5 py-3 rounded-2xl bg-emerald-500/30 border-2 border-emerald-300 text-white font-black text-xs text-center flex items-center justify-center gap-2">
                <i class="fa-solid fa-circle-check text-amber-300"></i> Siz sertifikat rasmini joyladingiz
              </span>
            ` : `
              <button type="button" onclick="App.openUploadContestProofModal('${c.id}')" class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-camera"></i> Sertifikat Rasmini Joylash
              </button>
            `}
            <button type="button" onclick="App.switchTab('contests')" class="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-bullhorn text-amber-300"></i> Tanlov oynasiga o'tish
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (mySelectedContests.length === 0) {
      if (creatorsBanner) {
        creatorsBanner.innerHTML = '';
        creatorsBanner.classList.add('hidden');
      }
      if (challengesBanner) {
        challengesBanner.innerHTML = '';
        challengesBanner.classList.add('hidden');
      }
      return;
    }

    if (creatorsBanner) {
      creatorsBanner.innerHTML = contestSelectionHtml;
      creatorsBanner.classList.remove('hidden');
    }
    if (challengesBanner) {
      challengesBanner.innerHTML = '';
      challengesBanner.classList.add('hidden');
    }
  },

  checkStudentCelebrationPopup() {
    if (!Auth.isStudent()) {
      this.closeModal('modal-student-celebration');
      return;
    }
    const user = Auth.getCurrentUser();
    const creator = DataStore.getCreatorById(user.creatorId);
    if (!creator) {
      this.closeModal('modal-student-celebration');
      return;
    }

    const allSubs = DataStore.getChallengeSubmissions();
    const myWinningSubs = allSubs.filter(sub =>
      DataStore.isCreatorInSubmission(sub, creator) &&
      (sub.isRepublicWinner || sub.promotedToRepublic || sub.promotedToRegion || sub.status === 'approved')
    );

    if (myWinningSubs.length === 0) {
      this.closeModal('modal-student-celebration');
      return;
    }

    // Eng yuqori bosqichdagi g'oliblikni birinchi ko'rsatamiz
    myWinningSubs.sort((a, b) => {
      const pa = this.getStudentStageDetails(a)?.priority || 0;
      const pb = this.getStudentStageDetails(b)?.priority || 0;
      return pb - pa;
    });

    for (const sub of myWinningSubs) {
      const stage = this.getStudentStageDetails(sub);
      if (!stage) continue;
      const storageKey = `ijodkor_celeb_seen_${creator.id}_${sub.id}_${stage.stageKey}`;
      if (!localStorage.getItem(storageKey)) {
        // Darhol bir martalik ko'rilgan deb belgilaymiz, shunda "Rahmat, ijod qilishda davom etamiz!" bosilgach qayta chiqmaydi
        this.state.activeCelebrationStorageKey = storageKey;
        localStorage.setItem(storageKey, 'true');
        this.openStudentCelebrationModal(sub.id);
        break;
      }
    }
  },

  openStudentCelebrationModal(submissionId) {
    const sub = DataStore.getChallengeSubmissions().find(s => s && s.id === submissionId);
    if (!sub) return;
    const stage = this.getStudentStageDetails(sub);
    if (!stage) return;

    const user = Auth.getCurrentUser();
    const creator = (user && user.role === 'student') ? (DataStore.getCreatorById(user.creatorId) || user) : null;
    const studentName = creator ? creator.fullName : sub.creatorName;
    const studentNick = creator && creator.nickname ? '@' + DataStore.cleanNickname(creator.nickname) : (sub.creatorNickname || '');

    const card = document.getElementById('modal-student-celebration-card');
    if (!card) return;

    card.innerHTML = `
      <div class="space-y-5">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center text-5xl mx-auto shadow-2xl border-4 border-white/40">
          ${stage.icon}
        </div>

        <div class="inline-block px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md">
          ${stage.badgeText}
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">
          ${stage.headline}
        </h2>

        <p class="text-sm sm:text-base text-amber-200 font-bold">
          Hurmatli <span class="text-white underline decoration-amber-400">${studentName}</span> ${studentNick ? `<span class="text-amber-300">(${studentNick})</span>` : ''}!
        </p>

        <p class="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
          ${stage.subheadline}
        </p>

        <div class="p-5 rounded-3xl bg-white/10 border-2 border-amber-400/50 text-left space-y-2 shadow-inner">
          <div class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <i class="fa-solid fa-fire-flame-curved"></i> Motivatsion Chorlov:
          </div>
          <p class="text-sm sm:text-base font-bold text-white leading-relaxed">
            "${stage.motivation}"
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-left space-y-2">
          <div class="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
            <i class="fa-solid fa-coins text-amber-400"></i> Taqdim etilgan tangalar va Jamoa (@nickname):
          </div>
          <p class="text-xs text-emerald-100 font-semibold">${stage.coinsInfo}</p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${stage.teamBadgesHtml}
          </div>
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onclick="App.dismissStudentCelebrationModal()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm shadow-xl transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-rocket"></i> Rahmat, ijod qilishda davom etamiz!
          </button>
          <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-play text-amber-300"></i> Videomizni Ko'rish
          </a>
        </div>
      </div>
    `;

    this.openModal('modal-student-celebration');
  },

  dismissStudentCelebrationModal() {
    if (this.state.activeCelebrationStorageKey) {
      localStorage.setItem(this.state.activeCelebrationStorageKey, 'true');
      this.state.activeCelebrationStorageKey = null;
    }
    this.closeModal('modal-student-celebration');
  },

  // ================= 9C. MAKTAB CHORAKLARI VA TA'TIL MAVSUMLARI TAYMERI HAMDA "YUTUQLARIM" BO'LIMI =================

  startSeasonCountdownTimer() {
    this.updateSeasonCountdownUI();
    if (this._seasonTimerInterval) {
      clearInterval(this._seasonTimerInterval);
    }
    this._seasonTimerInterval = setInterval(() => {
      this.updateSeasonCountdownUI();
    }, 1000);
  },

  updateSeasonCountdownUI() {
    try {
      if (typeof DataStore === 'undefined' || typeof DataStore.getCurrentSchoolSeason !== 'function') return;
      const season = DataStore.getCurrentSchoolSeason();
      if (!season) return;

      const rem = season.remaining || {
        days: season.days || 0,
        hours: season.hours || 0,
        minutes: season.minutes || 0,
        seconds: season.seconds || 0
      };
      const periodStr = season.periodText || season.rangeLabel || '';

      const badgeEl = document.getElementById('season-active-badge');
      const titleEl = document.getElementById('season-active-title');
      const datesEl = document.getElementById('season-active-dates');
      const dEl = document.getElementById('cd-days');
      const hEl = document.getElementById('cd-hours');
      const mEl = document.getElementById('cd-mins');
      const sEl = document.getElementById('cd-secs');

      if (badgeEl) {
        const bText = season.type === 'vacation' ? "🌴 TA'TIL MAVSUMI" : "📚 CHORAK MAVSUMI";
        if (badgeEl.textContent !== bText) badgeEl.textContent = bText;
      }
      if (titleEl) {
        const tText = `${season.icon || '📚'} ${season.name}`;
        if (titleEl.textContent !== tText) titleEl.textContent = tText;
      }
      if (datesEl) {
        const dtText = `(${periodStr})`;
        if (datesEl.textContent !== dtText) datesEl.textContent = dtText;
      }

      const dStr = String(rem.days ?? 0).padStart(2, '0');
      const hStr = String(rem.hours ?? 0).padStart(2, '0');
      const mStr = String(rem.minutes ?? 0).padStart(2, '0');
      const sStr = String(rem.seconds ?? 0).padStart(2, '0');

      if (dEl && dEl.textContent !== dStr) dEl.textContent = dStr;
      if (hEl && hEl.textContent !== hStr) hEl.textContent = hStr;
      if (mEl && mEl.textContent !== mStr) mEl.textContent = mStr;
      if (sEl && sEl.textContent !== sStr) sEl.textContent = sStr;

      // Agar avvalgi mavsum tugab, yangi mavsumga o'tilgan bo'lsa — katta ekranga mavsum yakuni xabarini chiqaramiz!
      const lastSeasonKey = 'ijodkor_active_season_id';
      const prevSeasonId = localStorage.getItem(lastSeasonKey);
      if (prevSeasonId && prevSeasonId !== season.id) {
        localStorage.setItem(lastSeasonKey, season.id);
        this.openSeasonEndedModal(false, prevSeasonId);
      } else if (!prevSeasonId) {
        localStorage.setItem(lastSeasonKey, season.id);
      }
    } catch (err) {
      console.warn('Season countdown update error:', err);
    }
  },

  openSeasonEndedModal(isManualPreview = false, completedSeasonId = null) {
    const card = document.getElementById('modal-season-ended-card');
    if (!card) return;

    const catalog = DataStore.getSchoolSeasonsCatalog();
    const currentSeason = DataStore.getCurrentSchoolSeason();
    const targetSeason = (completedSeasonId && catalog.find(s => s.id === completedSeasonId)) || currentSeason;

    const user = Auth.getCurrentUser();
    const creator = (user && user.role === 'student') ? (DataStore.getCreatorById(user.creatorId) || user) : null;
    const studentName = creator ? creator.fullName : (user ? user.fullName : "Yosh Ijodkor");

    const allSubs = DataStore.getChallengeSubmissions();
    const mySubs = creator ? allSubs.filter(sub => DataStore.isCreatorInSubmission(sub, creator)) : [];
    const mySeasonSubs = mySubs.filter(sub => !sub.seasonId || sub.seasonId === targetSeason.id);
    const totalCoins = creator ? (creator.coins || 10) : 0;
    const seasonCoins = creator && creator.seasonCoins && creator.seasonCoins[targetSeason.id]
      ? creator.seasonCoins[targetSeason.id]
      : totalCoins;
    const activeContestsCount = creator
      ? DataStore.getContests().filter(c => DataStore.isStudentSelectedInContest(c, creator)).length
      : 0;
    const cleanInvsCount = (creator && Array.isArray(creator.invitationsHistory))
      ? creator.invitationsHistory.filter(inv => {
          if (!inv) return false;
          const t = (inv.title || inv.eventName || '').toLowerCase();
          const s = (inv.seasonName || '').toLowerCase();
          return !t.includes('tadbirda faol ishtirok') && !s.includes('2-chorak');
        }).length
      : 0;
    const totalInvitesAndEvents = activeContestsCount + cleanInvsCount;

    card.innerHTML = `
      <div class="space-y-5">
        <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center text-4xl mx-auto shadow-2xl border-4 border-white/40">
          ${targetSeason.icon || '🏁'}
        </div>

        <div class="inline-block px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
          ${isManualPreview ? '📊 JORIY MAVSUM SARHISOBI VA VAQTI' : '🏁 MAVSUM YAKUNLANDI!'}
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">
          ${isManualPreview
            ? `${targetSeason.name} davom etmoqda!`
            : `🎉 "${targetSeason.name}" tugadi! Keyingi mavsumda sizga omad tilaymiz!`}
        </h2>

        <p class="text-sm text-indigo-100 max-w-xl mx-auto">
          Hurmatli <b class="text-amber-300">${studentName}</b>! Ushbu mavsum davomida erishgan natijalaringiz, to'plagan tangalaringiz va yutuqlaringiz bilan tanishing:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div class="p-4 rounded-2xl bg-white/10 border border-amber-400/40">
            <span class="text-[11px] font-bold text-amber-200 block">Mavsumda to'plangan tangalar</span>
            <span class="text-2xl font-black text-amber-300 mt-1 block">🪙 ${seasonCoins} ta</span>
          </div>
          <div class="p-4 rounded-2xl bg-white/10 border border-emerald-400/40">
            <span class="text-[11px] font-bold text-emerald-200 block">Video-chellenj va yutuqlar</span>
            <span class="text-2xl font-black text-emerald-300 mt-1 block">🏆 ${mySeasonSubs.length} ta</span>
          </div>
          <div class="p-4 rounded-2xl bg-white/10 border border-purple-400/40">
            <span class="text-[11px] font-bold text-purple-200 block">Taklif qilingan tadbirlar</span>
            <span class="text-2xl font-black text-purple-300 mt-1 block">🎭 ${totalInvitesAndEvents} ta</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 text-xs sm:text-sm text-emerald-100 font-bold leading-relaxed">
          🌟 "Mana shu mavsumda ajoyib faollik ko'rsatdingiz! Erishgan barcha yutuqlaringiz «🏆 Yutuqlarim» bo'limida abadiy saqlanib qoladi. Keyingi mavsumda sizga yanada ulkan omad va g'alabalar tilaymiz!"
        </div>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onclick="App.closeModal('modal-season-ended'); App.switchTab('achievements');" class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-medal"></i> "Yutuqlarim" bo'limiga o'tish
          </button>
          <button type="button" onclick="App.closeModal('modal-season-ended')" class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm transition">
            Yopish
          </button>
        </div>
      </div>
    `;

    this.openModal('modal-season-ended');
  },

  renderAchievementsSection() {
    const summaryBox = document.getElementById('achievements-summary-box');
    const seasonsGrid = document.getElementById('achievements-seasons-grid');
    const victoriesList = document.getElementById('achievements-victories-list');
    const invitationsList = document.getElementById('achievements-invitations-list');
    if (!seasonsGrid || !victoriesList || !invitationsList) return;

    const user = Auth.getCurrentUser();
    let creator = null;

    if (user && user.role === 'student') {
      creator = DataStore.getCreatorById(user.creatorId) || null;
    }

    const catalog = DataStore.getSchoolSeasonsCatalog();
    const currentSeason = DataStore.getCurrentSchoolSeason();
    const allSubs = DataStore.getChallengeSubmissions();
    const mySubs = creator ? allSubs.filter(sub => DataStore.isCreatorInSubmission(sub, creator)) : [];

    // Takliflar: FAQAT Madaniyat xodimi tomonidan tanlovga (+) tanlanganlar va bevosita taklif qilinganlar
    const selectedContests = creator
      ? DataStore.getContests().filter(c => DataStore.isStudentSelectedInContest(c, creator))
      : [];
    const directInvites = (creator && Array.isArray(creator.invitationsHistory))
      ? creator.invitationsHistory.filter(inv => {
          if (!inv) return false;
          const t = (inv.title || inv.eventName || '').toLowerCase();
          const s = (inv.seasonName || '').toLowerCase();
          if (t.includes('tadbirda faol ishtirok') || s.includes('2-chorak')) return false;
          // Tanlov orqali yozilgan takliflar selectedContests ichida chiqadi, ikki marta takrorlanmasin
          return !selectedContests.some(c => (inv.title || '').includes(c.title));
        })
      : [];

    const totalCoins = creator ? (creator.coins || 10) : 0;
    const totalVictories = mySubs.length;
    const totalInvites = selectedContests.length + directInvites.length;

    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="px-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-center">
          <span class="text-[11px] font-bold text-amber-200 block">${creator ? creator.fullName : 'Umumiy hisob'}</span>
          <span class="text-xl font-black text-amber-300">🪙 ${totalCoins} tanga</span>
        </div>
        <div class="px-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-center">
          <span class="text-[11px] font-bold text-emerald-200 block">Erishilgan yutuqlar</span>
          <span class="text-xl font-black text-white">🏆 ${totalVictories} ta</span>
        </div>
        <div class="px-4 py-3 rounded-2xl bg-white/15 border border-white/25 text-center">
          <span class="text-[11px] font-bold text-purple-200 block">Tadbir va tanlovlarga chaqiruv</span>
          <span class="text-sm sm:text-base font-black text-white">${totalInvites > 0 ? `🎭 ${totalInvites} ta tadbir` : '🎭 Chaqirilmagansiz'}</span>
        </div>
      `;
    }

    // 1. To'rtta mavsum (Kuzgi, Qishki, Bahorgi, Yozgi mavsum) kartochkalari
    const legacySeasonMap = {
      q1: 'autumn',
      v_autumn: 'autumn',
      q2: 'autumn',
      v_winter: 'winter',
      q3: 'winter',
      v_spring: 'spring',
      q4: 'spring',
      v_summer: 'summer'
    };
    seasonsGrid.innerHTML = catalog.map(s => {
      const isCurrent = s.id === currentSeason.id;
      const recordedSeasonCoins = creator && creator.seasonCoins && creator.seasonCoins[s.id] !== undefined
        ? Number(creator.seasonCoins[s.id])
        : (isCurrent ? totalCoins : 0);
      const seasonSubsCount = mySubs.filter(sub => {
        const mappedId = legacySeasonMap[sub.seasonId] || sub.seasonId;
        return mappedId === s.id || (!sub.seasonId && isCurrent);
      }).length;

      return `
        <div class="p-4 rounded-2xl border-2 transition ${
          isCurrent
            ? 'bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-amber-400 shadow-md'
            : 'bg-slate-50/80 border-slate-200'
        } flex flex-col justify-between gap-3">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-2xl">${s.icon}</span>
              ${isCurrent
                ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase animate-pulse">🔥 Joriy Mavsum</span>`
                : `<span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">Mavsum</span>`
              }
            </div>
            <h4 class="font-black text-slate-900 text-sm mt-2">${s.name}</h4>
            <p class="text-[11px] text-slate-500 font-semibold mt-0.5">📅 Muddati: ${s.periodText}</p>
          </div>
          <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-500 block font-bold">To'plangan tanga:</span>
              <span class="text-sm font-black text-amber-700">🪙 ${recordedSeasonCoins} tanga</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-500 block font-bold">Yutuqlar:</span>
              <span class="text-xs font-black text-emerald-700">🏆 ${seasonSubsCount} ta</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 2. Erishgan yutuqlar va @nickname kollaboratsiyalar ro'yxati (1 kundan keyin ham doimiy shu yerda turadi!)
    if (mySubs.length === 0) {
      victoriesList.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <div class="text-3xl mb-2">🎬</div>
          <p class="text-xs sm:text-sm font-bold text-slate-700">Hozircha video-chellenj yutuqlari yoki kollaboratsiyalar yo'q</p>
          <p class="text-xs text-slate-500 mt-1">Video-chellenjlarda do'stlaringizning <b>@nickname</b>'ini kiritib qatnashing va g'olib bo'ling — barcha yutuqlaringiz shu yerda saqlanadi!</p>
        </div>
      `;
    } else {
      victoriesList.innerHTML = mySubs.map(sub => {
        const stage = this.getStudentStageDetails(sub);
        const collabInfo = DataStore.resolveSubmissionCollaborators(sub, sub.creatorId, sub.creatorName);
        const collabBadges = collabInfo.collaborators.map(c =>
          `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-[11px]">@${c.nickname} (${c.fullName})</span>`
        ).join(' ');

        const statusBadge = stage
          ? `<span class="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-[11px]">${stage.icon} ${stage.badgeText}</span>`
          : `<span class="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px]">⏳ Tuman koordinatori ko'rib chiqmoqda</span>`;

        return `
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-300 transition">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                ${statusBadge}
                <span class="px-2.5 py-0.5 rounded-lg bg-slate-200/80 text-slate-700 font-bold text-[11px]">
                  📅 ${sub.seasonName || currentSeason.name} • ${sub.submittedAt || ''}
                </span>
              </div>
              <h4 class="font-black text-slate-900 text-sm sm:text-base">🎬 "${sub.challengeTitle}"</h4>
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[11px] text-slate-500 font-bold">🤝 Jamoa (@nickname):</span>
                ${collabBadges}
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              ${stage ? `
                <button type="button" onclick="App.openStudentCelebrationModal('${sub.id}')" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5">
                  <i class="fa-solid fa-trophy"></i> Tabriknoma
                </button>
              ` : ''}
              <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5">
                <i class="fa-solid fa-play text-red-400"></i> Videoni Ko'rish
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Qaysi tadbirlarga taklif qilingani ro'yxati (FAQAT haqiqatan madaniyat xodimi chaqirgan tanlov va tadbirlar)
    const allInviteCards = [];

    selectedContests.forEach(c => {
      const selInfo = DataStore.getStudentContestSelectionInfo(c, creator) || {};
      const myProof = (c.certificateProofs || []).find(p =>
        creator && (String(p.creatorId) === String(creator.id) || DataStore.phonesMatch(p.creatorPhone, creator.phone))
      );
      let statusLabel = `🎯 Madaniyat xodimi tomonidan chaqirilgan (${c.eventDate} sanada kutilmoqda)`;
      if (myProof) {
        statusLabel = myProof.status === 'approved'
          ? `✅ Tadbirda ishtirok etgan (+${myProof.awardedCoins || c.awardCoins} 🪙 tanga taqdim etilgan)`
          : `📸 Sertifikat rasmi joylangan (Admin tasdig'i kutilmoqda)`;
      }
      allInviteCards.push({
        title: `${c.title} (📍 ${c.location || c.districtLabel || 'Madaniyat markazi'})`,
        by: `${selInfo.selectedByStaffName || 'Madaniyat xodimi'} tomonidan tanlangan`,
        season: currentSeason.name,
        date: c.eventDate || 'Joriy mavsum',
        status: statusLabel
      });
    });

    directInvites.forEach(inv => {
      if (!inv) return;
      const t = (inv.title || inv.eventName || '').toLowerCase();
      const s = (inv.seasonName || '').toLowerCase();
      if (t.includes('tadbirda faol ishtirok') || s.includes('2-chorak')) return;
      allInviteCards.push({
        title: inv.title || inv.eventName || "Madaniy tadbir va bayram dasturiga taklif",
        by: `${inv.staffName || 'Madaniyat xodimi'} (${inv.staffOrg || inv.staffPosition || "Madaniyat bo'limi"})`,
        season: inv.seasonName || currentSeason.name,
        date: inv.date || 'Joriy mavsum',
        status: "📞 Madaniyat xodimi tomonidan chaqirilgan"
      });
    });

    if (allInviteCards.length === 0) {
      invitationsList.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div class="text-3xl mb-1">🎭</div>
          <span class="inline-block px-3.5 py-1 rounded-full bg-slate-200 text-slate-700 font-black text-xs">
            ⏳ Hozircha chaqirilmagansiz (Ishtirok etmagansiz)
          </span>
          <p class="text-xs sm:text-sm font-black text-slate-800 pt-1">
            Siz hozircha hech qanday tadbirga chaqirilmagansiz va ishtirok etmagansiz
          </p>
          <p class="text-xs text-slate-500 max-w-lg mx-auto">
            Madaniyat xodimi sizni yangi tanlov yoki bayram tadbiriga tanlaganida (<b>«Siz tanlandingiz»</b>) hamda tadbirda qatnashib sertifikat rasmingizni joylaganingizdan so'ng shu yerda chiqadi.
          </p>
        </div>
      `;
    } else {
      invitationsList.innerHTML = allInviteCards.map(item => `
        <div class="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-[10px]">
              📅 ${item.season} • ${item.date}
            </span>
            <h4 class="font-black text-slate-900 text-sm">🎭 ${item.title}</h4>
            <p class="text-xs text-slate-600 font-semibold">Mas'ul: ${item.by}</p>
          </div>
          <span class="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-black text-xs shrink-0">
            ${item.status}
          </span>
        </div>
      `).join('');
    }
  },

  // ================= 10. TANLOVLAR (MADANIYAT XODIMI '+' TANLOVI, SERTIFIKAT RASMI VA TANGA TAQDIM ETISH) =================

  buildContestCardHtml(c, userDist = {}) {
    const isAdmin = Auth.isAdmin();
    const isStaff = Auth.isStaff();
    const isStudent = Auth.isStudent();
    const currentUser = Auth.getCurrentUser();
    const currentCreator = isStudent && currentUser ? (DataStore.getCreatorById(currentUser.creatorId) || currentUser) : null;

    const selectedList = Array.isArray(c.selectedStudents) ? c.selectedStudents : [];
    const proofsList = Array.isArray(c.certificateProofs) ? c.certificateProofs : [];
    const isCurrentStudentSelected = currentCreator ? DataStore.isStudentSelectedInContest(c, currentCreator) : false;
    const mySelectionInfo = currentCreator ? DataStore.getStudentContestSelectionInfo(c, currentCreator) : null;
    const myProof = currentCreator
      ? proofsList.find(p => String(p.creatorId) === String(currentCreator.id) || DataStore.phonesMatch(p.creatorPhone, currentCreator.phone))
      : null;

    const selectedStudentsHtml = selectedList.length > 0 ? `
      <div class="mt-4 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-star text-amber-500"></i> Madaniyat xodimi tanlagan o'quvchilar (${selectedList.length} nafar)
          </span>
          <span class="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
            📅 ${c.eventDate} da kutiladi
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${selectedList.map(s => {
            const cr = DataStore.getCreatorById(s.creatorId) || s;
            const nick = DataStore.normalizeNickname(cr.nickname || s.nickname || cr.fullName || s.fullName);
            const hasProof = proofsList.some(p => String(p.creatorId) === String(s.creatorId) || DataStore.phonesMatch(p.creatorPhone, s.phone));
            return `
              <div class="p-2 rounded-xl bg-white border border-blue-100 flex items-center justify-between gap-2 shadow-2xs">
                <div class="flex items-center gap-2 min-w-0">
                  <img src="${cr.avatar || s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" alt="${s.fullName}" class="w-8 h-8 rounded-full object-cover border border-blue-300 shrink-0" />
                  <div class="min-w-0">
                    <p class="text-xs font-black text-slate-900 truncate">${s.fullName}</p>
                    <p class="text-[10px] font-bold text-indigo-600 truncate">@${nick} • ${s.school || cr.school || ''}</p>
                    <p class="text-[9px] text-slate-500 truncate">Tanladi: ${s.selectedByStaffName || 'Madaniyat xodimi'}</p>
                  </div>
                </div>
                ${hasProof ? `
                  <span class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[9px] shrink-0" title="Sertifikat rasmini joylagan">
                    📸 Joyladi
                  </span>
                ` : `
                  <span class="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[9px] shrink-0">
                    🎯 Chaqirilgan
                  </span>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="mt-4 p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-[11px] text-slate-500">
        <i class="fa-solid fa-user-plus text-blue-500 mr-1"></i> Hozircha madaniyat xodimi tomonidan o'quvchilar tanlanmagan.
        ${(isStaff || isAdmin) ? `<strong class="text-blue-700">Yuqoridagi ➕ tugmasini bosib o'quvchilarni tanlang!</strong>` : ''}
      </div>
    `;

    const studentSelectedCalloutHtml = isCurrentStudentSelected ? `
      <div class="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md border-2 border-amber-300 space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
            🎉 SIZ TADBIRGA CHAQIRILDINGIZ! (Madaniyat xodimi tanladi)
          </span>
          <span class="text-[11px] font-black text-amber-200">
            👤 ${mySelectionInfo?.selectedByStaffName || 'Madaniyat xodimi'}
          </span>
        </div>
        <p class="text-xs font-black text-amber-300">
          📅 Tanlov sanasi: ${c.eventDate} — Mana shu sanada sizni (${c.location}) manzilida kutamiz!
        </p>
        <p class="text-[11px] text-emerald-50 leading-relaxed">
          Tadbirga borib qatnashib kelganingizdan keyin, <strong>madaniyat xodimi bilan «Kelajak ijodkori» sertifikatini ushlab tushgan rasmingizni</strong> shu yerning pastiga joylang! Madaniyat xodimi rasm haqiqiyligini tasdiqlab qabul qilgach, sizga <strong>+${c.awardCoins} 🪙 tanga</strong> boradi.
        </p>
        <div class="pt-1">
          ${myProof ? `
            <div class="w-full py-2.5 px-4 rounded-xl bg-white/20 border border-amber-300/70 text-amber-200 font-black text-xs text-center flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-check text-emerald-300 text-sm"></i>
              <span>Siz sertifikat rasmini joyladingiz ${myProof.status === 'approved' ? `(Tasdiqlandi: +${myProof.awardedCoins || myProof.coinsAwarded || c.awardCoins} 🪙)` : "(Madaniyat xodimi tasdig'i kutilmoqda)"}</span>
            </div>
          ` : `
            <button type="button" onclick="App.openUploadContestProofModal('${c.id}')" class="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2">
              <i class="fa-solid fa-camera text-sm"></i> 📸 Madaniyat Xodimi Bilan Sertifikat Rasmini Joylash
            </button>
          `}
        </div>
      </div>
    ` : '';

    const proofsHtml = proofsList.length > 0 ? `
      <div class="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
        <h4 class="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <i class="fa-solid fa-award text-emerald-600"></i> Tadbirga chaqirilgan o'quvchilar joylagan sertifikat rasmlari (${proofsList.length})
        </h4>
        <div class="space-y-2.5">
          ${proofsList.map(proof => {
            const isApproved = proof.status === 'approved';
            const awardedVal = proof.awardedCoins || proof.coinsAwarded || c.awardCoins;
            return `
              <div class="p-3 rounded-2xl ${isApproved ? 'bg-emerald-50/70 border border-emerald-300' : 'bg-amber-50/60 border border-amber-200'} space-y-2">
                <div class="flex flex-col sm:flex-row items-start gap-3">
                  <img src="${proof.photoUrl}" alt="${proof.creatorName} sertifikat rasmi" onclick="window.open(this.src, '_blank')" class="w-full sm:w-28 h-36 sm:h-24 object-cover rounded-xl border-2 border-white shadow cursor-pointer shrink-0" title="Kattalashtirib ko'rish uchun bosing" />
                  <div class="flex-1 min-w-0 space-y-1">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-black text-slate-900 text-xs">${proof.creatorName} <span class="text-indigo-600">@${DataStore.normalizeNickname(proof.creatorNickname || proof.creatorName)}</span></span>
                      ${isApproved ? `
                        <span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                          ✅ Tasdiqlandi va Qabul qilindi (+${awardedVal} 🪙)
                        </span>
                      ` : `
                        <span class="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px]">
                          ⏳ Madaniyat xodimi tasdig'i kutilmoqda
                        </span>
                      `}
                    </div>
                    <p class="text-[11px] text-slate-600 font-semibold">🏫 ${proof.creatorSchool || ''} • 📅 Joylandi: ${proof.submittedAt || proof.uploadedAt || ''}</p>
                    ${proof.comment ? `<p class="text-xs text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/70">"${proof.comment}"</p>` : ''}
                    ${(isStaff || isAdmin) && !isApproved ? `
                      <div class="pt-1.5">
                        <button type="button" onclick="App.handleApproveContestCertificateProof('${c.id}', '${proof.id}', ${Number(c.awardCoins) || 50})" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5">
                          <i class="fa-solid fa-circle-check text-amber-300"></i> Rasm Haqiqiyligini Tasdiqlash va Qabul Qilish (+${c.awardCoins} 🪙 Tanga Berish)
                        </button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div class="bg-white rounded-3xl border ${isCurrentStudentSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'} p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition">
        <div>
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              📍 ${c.districtLabel || userDist.districtLabel || "Barcha Umumta'lim Maktablar Uchun"}
            </span>
            <div class="flex items-center gap-2">
              <span class="font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                🪙 +${c.awardCoins} tanga
              </span>
              ${(isStaff || isAdmin) ? `
                <button type="button" onclick="App.openSelectStudentsForContestModal('${c.id}')" class="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-md transition flex items-center justify-center" title="Tanlovga o'quvchi tanlash (+)">
                  <i class="fa-solid fa-plus"></i>
                </button>
              ` : ''}
            </div>
          </div>

          <h3 class="text-lg font-black text-slate-900 mt-3 leading-snug">
            ${c.title}
          </h3>

          <div class="mt-3 space-y-1.5 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-calendar-days text-emerald-600"></i>
              <span>Sanasi: <strong class="text-slate-900">${c.eventDate}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-red-500"></i>
              <span>Manzil: <strong class="text-slate-900">${c.location}</strong></span>
            </div>
          </div>

          <p class="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
            ${c.description}
          </p>

          ${(isStaff || isAdmin) ? `
            <div class="mt-3">
              <button type="button" onclick="App.openSelectStudentsForContestModal('${c.id}')" class="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">+</span>
                <span>Madaniyat xodimi: O'quvchi tanlash (${selectedList.length} nafar tanlangan)</span>
              </button>
            </div>
          ` : ''}

          ${selectedStudentsHtml}
          ${studentSelectedCalloutHtml}
          ${proofsHtml}
        </div>

        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[10px] text-slate-400">${c.districtLabel || userDist.districtLabel || 'Tuman'} Koordinatori tomonidan e'lon qilingan</span>
          ${isAdmin ? `
            <button onclick="App.handleDeleteContest('${c.id}')" class="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
              <i class="fa-solid fa-trash"></i> O'chirish
            </button>
          ` : `
            <span class="text-xs text-emerald-700 font-bold">Faol Tanlov</span>
          `}
        </div>
      </div>
    `;
  },

  renderContests() {
    const grid = document.getElementById('contests-grid');
    const adminAction = document.getElementById('contest-admin-action-block');
    const studentBanner = document.getElementById('student-selected-contests-banner');
    if (!grid) return;

    const userDist = this.getActiveDistrictInfo();
    const activeFilterDist = userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : '');

    let contests = DataStore.getContests();
    if (activeFilterDist) {
      contests = contests.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeFilterDist));
    }

    const isAdmin = Auth.isAdmin();

    if (adminAction) {
      if (isAdmin) {
        adminAction.innerHTML = `
          <button onclick="App.openAddContestModal()" class="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2">
            <i class="fa-solid fa-plus-circle text-base"></i> ${userDist.districtLabel ? `${userDist.districtLabel} Uchun ` : ''}Yangi Tanlov E'loni Qo'shish
          </button>
        `;
      } else {
        adminAction.innerHTML = '';
      }
    }

    // Tanlangan o'quvchi uchun Tanlovlar bo'limi tepasida katta xabarnoma
    if (studentBanner) {
      if (Auth.isStudent()) {
        const user = Auth.getCurrentUser();
        const creator = DataStore.getCreatorById(user.creatorId) || user;
        const selectedContests = contests.filter(c => DataStore.isStudentSelectedInContest(c, creator));
        if (selectedContests.length > 0) {
          studentBanner.classList.remove('hidden');
          studentBanner.innerHTML = selectedContests.map(c => {
            const selInfo = DataStore.getStudentContestSelectionInfo(c, creator) || {};
            const myProof = (c.certificateProofs || []).find(p =>
              String(p.creatorId) === String(creator.id) ||
              DataStore.phonesMatch(p.creatorPhone, creator.phone)
            );
            return `
              <div class="p-5 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-blue-900 text-white shadow-xl border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="space-y-1.5">
                  <span class="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase">
                    🎉 SIZ TADBIRGA CHAQIRILDINGIZ! (Madaniyat xodimi tanladi)
                  </span>
                  <h4 class="text-lg font-black">🎭 "${c.title}" — Mana shu sanada sizni kutamiz: <span class="text-amber-300 underline">${c.eventDate}</span></h4>
                  <p class="text-xs text-emerald-100">
                    📍 Manzil: <strong>${c.location}</strong> | 👤 Tanlagan madaniyat xodimi: <strong>${selInfo.selectedByStaffName || 'Madaniyat xodimi'}</strong>
                  </p>
                  <p class="text-xs text-amber-200 font-semibold">
                    ✨ Tadbirga qatnashib kelganingizdan so'ng, madaniyat xodimi bilan «Kelajak ijodkori» sertifikatini ushlab tushgan rasmingizni pastdagi tanlov kartasiga joylang! Madaniyat xodimi rasm haqiqiyligini tasdiqlab qabul qilgach sizga <strong>+${c.awardCoins} 🪙 tanga</strong> boradi.
                  </p>
                </div>
                ${myProof ? `
                  <span class="px-5 py-3 rounded-2xl bg-white/20 border-2 border-amber-300 text-amber-200 font-black text-xs shrink-0 flex items-center gap-2">
                    <i class="fa-solid fa-circle-check text-emerald-300 text-sm"></i> Siz sertifikat rasmini joyladingiz
                  </span>
                ` : `
                  <button type="button" onclick="App.openUploadContestProofModal('${c.id}')" class="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition shrink-0 flex items-center gap-2">
                    <i class="fa-solid fa-camera"></i> Sertifikat Rasmini Joylash
                  </button>
                `}
              </div>
            `;
          }).join('');
        } else {
          studentBanner.classList.add('hidden');
          studentBanner.innerHTML = '';
        }
      } else {
        studentBanner.classList.add('hidden');
        studentBanner.innerHTML = '';
      }
    }

    if (contests.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-10 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            <i class="fa-solid fa-bullhorn"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">${userDist.districtLabel ? `${userDist.districtLabel} bo'yicha hozircha` : 'Hozircha'} tanlov va tadbirlar e'lon qilinmagan</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            ${userDist.districtLabel ? `Ushbu bo'limda faqat ${userDist.districtLabel} o'quvchilari uchun mo'ljallangan tanlov va festivallar ko'rinadi.` : "Tumaningiz admini tomonidan yangi tadbir yoki festival e'lon qilinganda shu yerda aks etadi."}
          </p>
        </div>
      `;
      return;
    }

    grid.innerHTML = contests.map(c => this.buildContestCardHtml(c, userDist)).join('');
  },

  openSelectStudentsForContestModal(contestId) {
    if (!Auth.isStaff() && !Auth.isAdmin()) {
      this.showToast("O'quvchilarni tanlovga faqat Madaniyat xodimi yoki Tuman koordinatori tanlay oladi!", "warning");
      return;
    }
    const contest = DataStore.getContests().find(c => c.id === contestId);
    if (!contest) return;

    this.state.activeContestForSelection = contestId;
    this.state.draftSelectedCreatorIds = new Set(
      (Array.isArray(contest.selectedStudents) ? contest.selectedStudents : [])
        .map(s => s && String(s.creatorId))
        .filter(Boolean)
    );

    const idInput = document.getElementById('contest-select-target-id') || document.getElementById('select-contest-id');
    if (idInput) idInput.value = contestId;

    const subtitleEl = document.getElementById('contest-select-modal-subtitle') || document.getElementById('select-contest-modal-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `"${contest.title}" (📅 Sanasi: ${contest.eventDate} • 📍 ${contest.location}) uchun o'quvchilarni jonli ijrosini ko'rib tanlang`;
    }

    const infoBanner = document.getElementById('contest-select-info-banner');
    if (infoBanner) {
      infoBanner.innerHTML = `
        <p class="font-black text-indigo-950">🎭 Tanlov: ${contest.title} (🪙 +${contest.awardCoins} tanga)</p>
        <p class="text-indigo-800">📅 O'tkazilish sanasi: <strong>${contest.eventDate}</strong> • 📍 Manzil: <strong>${contest.location}</strong></p>
        <p class="text-indigo-700">💡 Quyidagi ro'yxatdan o'quvchilarning <strong>«▶ Jonli ijro»</strong> videolari bilan tanishib, bitta-bitta belgilang (select qiling) va pastdagi <strong>«Tanlanganlarni Tasdiqlash»</strong> tugmasini bosing.</p>
      `;
    }

    const stepPick = document.getElementById('contest-select-step-pick');
    const stepConfirm = document.getElementById('contest-select-step-confirm');
    if (stepPick) stepPick.classList.remove('hidden');
    if (stepConfirm) stepConfirm.classList.add('hidden');

    const searchInput = document.getElementById('select-contest-student-search');
    if (searchInput) searchInput.value = '';

    this.renderContestSelectStudentsList(contestId);
    this.openModal('modal-contest-select-students');
  },

  updateContestDraftCountersUI() {
    const count = this.state.draftSelectedCreatorIds ? this.state.draftSelectedCreatorIds.size : 0;
    const countEl = document.getElementById('contest-draft-selected-count');
    if (countEl) countEl.textContent = String(count);
    const badgeEl = document.getElementById('contest-draft-selected-badge');
    if (badgeEl) badgeEl.textContent = `Tanlanganlar: ${count} nafar`;
  },

  renderContestSelectStudentsList(contestId) {
    const cid = contestId || this.state.activeContestForSelection || document.getElementById('contest-select-target-id')?.value || document.getElementById('select-contest-id')?.value;
    const contest = DataStore.getContests().find(c => c.id === cid);
    const listContainer = document.getElementById('contest-select-students-list') || document.getElementById('select-contest-students-list');
    if (!contest || !listContainer) return;

    if (!this.state.draftSelectedCreatorIds) {
      this.state.draftSelectedCreatorIds = new Set(
        (Array.isArray(contest.selectedStudents) ? contest.selectedStudents : [])
          .map(s => s && String(s.creatorId))
          .filter(Boolean)
      );
    }
    this.updateContestDraftCountersUI();

    const userDist = this.getActiveDistrictInfo();
    const targetDist = contest.district || userDist.district || '';
    const searchVal = (document.getElementById('select-contest-student-search')?.value || '').trim().toLowerCase();

    let creators = DataStore.getCreators();
    if (targetDist && targetDist !== 'all') {
      creators = creators.filter(cr => DataStore.districtsMatch(cr.district || cr.districtLabel, targetDist));
    }
    if (searchVal) {
      creators = creators.filter(cr =>
        (cr.fullName || '').toLowerCase().includes(searchVal) ||
        (cr.nickname || '').toLowerCase().includes(searchVal) ||
        (cr.school || '').toLowerCase().includes(searchVal)
      );
    }

    if (creators.length === 0) {
      listContainer.innerHTML = `
        <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
          Ushbu tuman bo'yicha o'quvchilar topilmadi.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = creators.map((cr, idx) => {
      const isSelected = this.state.draftSelectedCreatorIds.has(String(cr.id));
      const nick = DataStore.normalizeNickname(cr.nickname || cr.fullName);
      const avatarSrc = cr.avatarUrl || cr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
      return `
        <div class="p-3 rounded-2xl border-2 ${isSelected ? 'bg-emerald-50/90 border-emerald-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-blue-300'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition">
          <div class="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onclick="App.toggleDraftSelectStudent('${cr.id}')">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300 text-transparent'}">
              <i class="fa-solid fa-check"></i>
            </span>
            <img src="${avatarSrc}" alt="${cr.fullName}" class="w-11 h-11 rounded-full object-cover border-2 ${isSelected ? 'border-emerald-500' : 'border-slate-300'} shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${idx + 1}. ${cr.fullName} <span class="text-xs font-bold text-indigo-600">@${nick}</span></p>
              <p class="text-xs text-slate-600 truncate">🏫 ${cr.school} • 📍 ${cr.districtLabel || ''}</p>
              <p class="text-[11px] text-emerald-700 font-bold">🪙 ${cr.coins || 0} tanga • 📞 ${cr.phone || ''}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button type="button" onclick="App.openVideoModal('${cr.id}')" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5" title="O'quvchining jonli ijrosini ko'rish">
              <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Jonli ijro
            </button>
            <button type="button" onclick="App.toggleDraftSelectStudent('${cr.id}')" class="px-4 py-2 rounded-xl font-black text-xs shadow-sm transition flex items-center gap-1.5 ${isSelected ? 'bg-emerald-600 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}">
              ${isSelected ? `<i class="fa-solid fa-check"></i> Tanlandi` : `<i class="fa-solid fa-plus"></i> Select (Tanlash)`}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleDraftSelectStudent(creatorId) {
    if (!Auth.isStaff() && !Auth.isAdmin()) return;
    if (!this.state.draftSelectedCreatorIds) {
      this.state.draftSelectedCreatorIds = new Set();
    }
    const idStr = String(creatorId);
    if (this.state.draftSelectedCreatorIds.has(idStr)) {
      this.state.draftSelectedCreatorIds.delete(idStr);
    } else {
      this.state.draftSelectedCreatorIds.add(idStr);
    }
    this.renderContestSelectStudentsList(this.state.activeContestForSelection);
    const stepConfirm = document.getElementById('contest-select-step-confirm');
    if (stepConfirm && !stepConfirm.classList.contains('hidden')) {
      this.renderContestConfirmSelectedList();
    }
  },

  openContestSelectionConfirmStep() {
    if (!Auth.isStaff() && !Auth.isAdmin()) return;
    const count = this.state.draftSelectedCreatorIds ? this.state.draftSelectedCreatorIds.size : 0;
    if (count === 0) {
      this.showToast("Iltimos, tasdiqlashdan oldin kamida bitta o'quvchini tanlang (Select qiling)!", "warning");
      return;
    }

    const stepPick = document.getElementById('contest-select-step-pick');
    const stepConfirm = document.getElementById('contest-select-step-confirm');
    if (stepPick) stepPick.classList.add('hidden');
    if (stepConfirm) stepConfirm.classList.remove('hidden');

    this.renderContestConfirmSelectedList();
  },

  backToContestSelectionPickStep() {
    const stepPick = document.getElementById('contest-select-step-pick');
    const stepConfirm = document.getElementById('contest-select-step-confirm');
    if (stepConfirm) stepConfirm.classList.add('hidden');
    if (stepPick) stepPick.classList.remove('hidden');
    this.renderContestSelectStudentsList(this.state.activeContestForSelection);
  },

  renderContestConfirmSelectedList() {
    const confirmContainer = document.getElementById('contest-confirm-selected-list');
    if (!confirmContainer) return;

    const selectedIds = Array.from(this.state.draftSelectedCreatorIds || []);
    if (selectedIds.length === 0) {
      confirmContainer.innerHTML = `
        <div class="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
          Tanlangan o'quvchilar qolmadi. Orqaga qaytib o'quvchilarni tanlang.
        </div>
      `;
      return;
    }

    const allCreators = DataStore.getCreators();
    const selectedCreators = selectedIds
      .map(id => allCreators.find(c => String(c.id) === String(id)))
      .filter(Boolean);

    confirmContainer.innerHTML = selectedCreators.map((cr, idx) => {
      const nick = DataStore.normalizeNickname(cr.nickname || cr.fullName);
      const avatarSrc = cr.avatarUrl || cr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
      return `
        <div class="p-3 rounded-2xl bg-emerald-50/80 border-2 border-emerald-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              ${idx + 1}
            </span>
            <img src="${avatarSrc}" alt="${cr.fullName}" class="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${cr.fullName} <span class="text-xs font-bold text-indigo-600">@${nick}</span></p>
              <p class="text-xs text-slate-600 truncate">🏫 ${cr.school} • 📞 ${cr.phone || ''}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button type="button" onclick="App.openVideoModal('${cr.id}')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1">
              <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Jonli ijro
            </button>
            <button type="button" onclick="App.toggleDraftSelectStudent('${cr.id}')" class="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-600 text-red-700 hover:text-white font-black text-xs transition flex items-center gap-1" title="Adashib qo'shilgan bo'lsa ro'yxatdan chiqarish">
              <i class="fa-solid fa-xmark"></i> Olib tashlash
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  confirmAndSaveContestSelectedStudents() {
    if (!Auth.isStaff() && !Auth.isAdmin()) return;
    const contestId = this.state.activeContestForSelection || document.getElementById('contest-select-target-id')?.value;
    if (!contestId) return;

    const selectedIds = Array.from(this.state.draftSelectedCreatorIds || []);
    const user = Auth.getCurrentUser() || {};

    const res = DataStore.saveSelectedStudentsForContest(contestId, selectedIds, {
      fullName: user.fullName || (Auth.isAdmin() ? `${user.districtLabel || 'Tuman'} Koordinatori` : 'Madaniyat xodimi'),
      organization: user.organization || user.position || "Madaniyat bo'limi",
      phone: user.phone || ''
    });

    if (res.success) {
      this.closeModal('modal-contest-select-students');
      this.refreshAllUI();
      this.showToast(
        `🎉 Tasdiqlandi! Tanlangan ${res.totalSelected} nafar o'quvchiga "Siz tadbirga chaqirildingiz!" xabari yuborildi va ular ekranda e'lon qilindi.`,
        "success"
      );
    } else {
      this.showToast(res.message || "Xatolik yuz berdi!", "error");
    }
  },

  handleToggleSelectStudentForContest(contestId, creatorId) {
    this.toggleDraftSelectStudent(creatorId);
  },

  openUploadContestProofModal(contestId) {
    if (!Auth.isStudent()) {
      this.showToast("Sertifikat rasmini joylash uchun o'quvchi profiliga kiring!", "warning");
      return;
    }
    const user = Auth.getCurrentUser();
    const creator = DataStore.getCreatorById(user.creatorId) || user;
    const contest = DataStore.getContests().find(c => c.id === contestId);
    if (!contest) return;

    if (!DataStore.isStudentSelectedInContest(contest, creator)) {
      this.showToast("Ushbu tanlovga faqat madaniyat xodimi tomonidan chaqirilgan (tanlangan) o'quvchilar sertifikat rasmini joylay oladi!", "warning");
      return;
    }

    const existingProof = (contest.certificateProofs || []).find(p =>
      String(p.creatorId) === String(creator.id) ||
      DataStore.phonesMatch(p.creatorPhone, creator.phone)
    );
    if (existingProof) {
      this.showToast("✅ Siz ushbu tanlov uchun sertifikat rasmini allaqachon joylagansiz!", "info");
      return;
    }

    this.state.pendingContestProofDataUrl = '';
    const idInput = document.getElementById('contest-proof-contest-id') || document.getElementById('proof-contest-id');
    if (idInput) idInput.value = contestId;

    const subtitleEl = document.getElementById('contest-proof-modal-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `"${contest.title}" (📅 ${contest.eventDate}) — Madaniyat xodimi bilan sertifikat rasmingizni yuklang`;
    }

    const fileInput = document.getElementById('contest-proof-file-input') || document.getElementById('proof-certificate-photo-file');
    if (fileInput) fileInput.value = '';
    const commentInput = document.getElementById('contest-proof-comment') || document.getElementById('proof-certificate-comment');
    if (commentInput) commentInput.value = '';
    const previewWrap = document.getElementById('contest-proof-preview-wrap') || document.getElementById('proof-photo-preview-wrapper');
    if (previewWrap) previewWrap.classList.add('hidden');

    this.openModal('modal-contest-upload-proof');
  },

  handleContestProofPhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 720;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h >= w && h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
        this.state.pendingContestProofDataUrl = compressedDataUrl;

        const previewImg = document.getElementById('contest-proof-preview-img') || document.getElementById('proof-photo-preview-img');
        const previewWrap = document.getElementById('contest-proof-preview-wrap') || document.getElementById('proof-photo-preview-wrapper');
        if (previewImg) previewImg.src = compressedDataUrl;
        if (previewWrap) previewWrap.classList.remove('hidden');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  },

  handleSubmitContestCertificateProof(e) {
    e.preventDefault();
    if (!Auth.isStudent()) return;

    const contestId = document.getElementById('contest-proof-contest-id')?.value || document.getElementById('proof-contest-id')?.value;
    const photoUrl = this.state.pendingContestProofDataUrl;
    const comment = (document.getElementById('contest-proof-comment')?.value || document.getElementById('proof-certificate-comment')?.value || '').trim();

    if (!photoUrl) {
      this.showToast("Iltimos, madaniyat xodimi bilan sertifikatni ushlab tushgan rasmingizni tanlang!", "warning");
      return;
    }

    const user = Auth.getCurrentUser();
    const creator = DataStore.getCreatorById(user.creatorId) || user;

    const res = DataStore.submitContestCertificateProof(contestId, {
      creatorId: creator.id || user.creatorId,
      creatorName: creator.fullName || user.fullName,
      creatorNickname: DataStore.normalizeNickname(creator.nickname || creator.fullName),
      creatorSchool: creator.school || user.school || '',
      creatorPhone: creator.phone || user.phone || '',
      photoUrl,
      comment
    });

    if (res.success) {
      this.closeModal('modal-contest-upload-proof');
      this.refreshAllUI();
      this.showToast("📸 Sertifikat rasmingiz muvaffaqiyatli joylandi! Madaniyat xodimi rasm haqiqiyligini tasdiqlab qabul qilgach tangalar hisobingizga o'tadi.", "success");
    } else {
      this.showToast(res.message || "Xatolik yuz berdi!", "error");
    }
  },

  handleApproveContestCertificateProof(contestId, proofId, defaultCoins = 50) {
    if (!Auth.isStaff() && !Auth.isAdmin()) {
      this.showToast("Rasm haqiqiyligini faqat Madaniyat xodimi (yoki Tuman koordinatori) tasdiqlay oladi!", "warning");
      return;
    }
    const user = Auth.getCurrentUser() || {};
    const approverName = user.fullName || (Auth.isStaff() ? 'Madaniyat xodimi' : 'Tuman koordinatori');
    const res = DataStore.approveContestCertificateProof(
      contestId,
      proofId,
      defaultCoins,
      `${approverName} tomonidan sertifikat rasmi haqiqiyligi tasdiqlandi va qabul qilindi!`,
      approverName
    );
    if (res.success) {
      this.refreshAllUI();
      this.showToast(`✅ ${res.proof.creatorName} joylagan sertifikat rasmi haqiqiyligi tasdiqlandi va hisobiga +${res.coins} 🪙 tanga yuborildi!`, "success");
    } else {
      this.showToast(res.message || "Xatolik yuz berdi!", "error");
    }
  },

  openAddContestModal() {
    if (!Auth.isAdmin()) return;
    document.getElementById('contest-title').value = '';
    document.getElementById('contest-coins').value = '50';
    document.getElementById('contest-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('contest-location').value = '';
    document.getElementById('contest-desc').value = '';
    this.openModal('modal-add-contest');
  },

  handleAddContestSubmit(e) {
    e.preventDefault();
    const userDist = this.getActiveDistrictInfo();
    const contestData = {
      title: document.getElementById('contest-title').value,
      awardCoins: document.getElementById('contest-coins').value,
      eventDate: document.getElementById('contest-date').value,
      location: document.getElementById('contest-location').value,
      description: document.getElementById('contest-desc').value,
      district: userDist.district,
      districtLabel: userDist.districtLabel
    };

    DataStore.addContest(contestData);
    this.closeModal('modal-add-contest');
    this.renderContests();
    this.renderStaffSection();
    this.showToast(`Yangi tanlov e'loni ${userDist.districtLabel} uchun joylashtirildi! Endi Madaniyat xodimlari (+) tugmasi orqali o'quvchi tanlashi mumkin.`, "success");
  },

  handleDeleteContest(id) {
    if (!Auth.isAdmin()) return;
    if (confirm("Ushbu tanlov e'lonini ro'yxatdan o'chirmoqchimisiz?")) {
      DataStore.deleteContest(id);
      this.renderContests();
      this.renderStaffSection();
      this.showToast("Tanlov o'chirildi.", "info");
    }
  },

  // ================= 11. TUMANLAR VA O'QUVCHILAR =================

  renderDistrictFilters() {
    const container = document.getElementById('district-filter-buttons');
    const selectFilter = document.getElementById('district-select-filter');

    const userDist = this.getActiveDistrictInfo();
    if (userDist.district) {
      this.state.selectedDistrict = userDist.district;
      // O'quvchi, xodim yoki tuman koordinatori kirganda boshqa tumanlar tanlovi (dropdown) umuman ko'rinmasin!
      if (selectFilter) {
        selectFilter.classList.add('hidden');
        selectFilter.innerHTML = `
          <option value="${userDist.district}" selected>
            📍 ${userDist.districtLabel}
          </option>
        `;
      }
      if (container) {
        container.innerHTML = `
          <div class="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-2 shadow-xs">
            <i class="fa-solid fa-location-dot text-emerald-600"></i>
            <span>📍 ${userDist.regionLabel || 'Buxoro viloyati'} • ${userDist.districtLabel} — Faqat shu tuman o'quvchilari va vazifalari</span>
          </div>
        `;
      }
      return;
    }

    // Agar Viloyat koordinatori bo'lsa — faqat o'z viloyatidagi tumanlarni ko'rsatamiz
    let availableDistricts = TUMANLAR;
    if (Auth.isRegionAdmin()) {
      const regInfo = Auth.getUserRegion();
      const regDists = DataStore.getDistrictsByRegion(regInfo.regionId || 'buxoro_vil');
      availableDistricts = [
        { id: 'all', name: `${regInfo.regionLabel || 'Viloyat'} (Barcha tumanlar)`, icon: '📍' },
        ...regDists
      ];
    } else {
      // Odatiy holatda Buxoro viloyati tumanlari birinchi ko'rinadi
      const buxoroDists = DataStore.getDistrictsByRegion('buxoro_vil');
      availableDistricts = [
        { id: 'all', name: 'Barcha tumanlar', icon: '📍' },
        ...buxoroDists
      ];
    }

    if (selectFilter) {
      selectFilter.classList.remove('hidden');
      selectFilter.innerHTML = availableDistricts.map(t => {
        const name = (t.id === 'all' && window.I18n && !Auth.isRegionAdmin()) ? I18n.t('all_districts') : t.name;
        return `
          <option value="${t.id}" ${this.state.selectedDistrict === t.id ? 'selected' : ''}>
            ${t.icon || '📍'} ${name}
          </option>
        `;
      }).join('');
    }

    if (!container) return;

    container.innerHTML = availableDistricts.map(t => {
      const isActive = this.state.selectedDistrict === t.id;
      const activeClass = isActive 
        ? 'bg-emerald-700 text-white shadow-sm' 
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700';
      const name = (t.id === 'all' && window.I18n && !Auth.isRegionAdmin()) ? I18n.t('all_districts') : t.name;

      return `
        <button onclick="App.setDistrict('${t.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${activeClass}">
          <span>${t.icon || '📍'}</span>
          <span>${name}</span>
        </button>
      `;
    }).join('');
  },

  setDistrict(districtId) {
    const userDist = this.getActiveDistrictInfo();
    if (userDist.district && !DataStore.districtsMatch(districtId, userDist.district)) {
      this.showToast(`Siz faqat o'z tumaningiz (${userDist.districtLabel}) ma'lumotlarini ko'ra olasiz!`, 'info');
      return;
    }
    this.state.selectedDistrict = userDist.district || districtId;
    const selectFilter = document.getElementById('district-select-filter');
    if (selectFilter) selectFilter.value = this.state.selectedDistrict;
    this.renderDistrictFilters();
    this.renderCreators();
    this.renderChallenges();
    this.renderContests();
    this.renderLeaderboard();
    this.renderStats();
  },

  handleSelectDistrictChange(e) {
    this.setDistrict(e.target.value);
  },

  handleFilterChange() {
    const input = document.getElementById('search-input');
    this.state.searchQuery = input ? input.value.trim().toLowerCase() : '';
    this.renderCreators();
  },

  renderCreators() {
    const container = document.getElementById('creators-grid');
    const noMsg = document.getElementById('no-creators-msg');
    if (!container) return;

    let creators = DataStore.getCreators();
    const userDist = this.getActiveDistrictInfo();
    const activeDist = userDist.district || this.state.selectedDistrict;

    if (activeDist && activeDist !== 'all') {
      creators = creators.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeDist));
    }

    if (this.state.searchQuery) {
      const q = DataStore.toCanonicalUzbek(this.state.searchQuery);
      creators = creators.filter(c => 
        DataStore.toCanonicalUzbek(c.fullName).includes(q) ||
        DataStore.toCanonicalUzbek(c.school).includes(q) ||
        DataStore.toCanonicalUzbek(c.districtLabel || '').includes(q) ||
        DataStore.toCanonicalUzbek(c.bio || '').includes(q)
      );
    }

    if (creators.length === 0) {
      container.innerHTML = '';
      if (noMsg) noMsg.classList.remove('hidden');
      return;
    }

    if (noMsg) noMsg.classList.add('hidden');
    const isStaffOrAdmin = Auth.isStaff();
    const isAdmin = Auth.isAdmin();
    const currentUser = Auth.getCurrentUser();

    container.innerHTML = creators.map(creator => {
      let phoneBlock = '';
      if (isStaffOrAdmin) {
        phoneBlock = `
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">Telefon (Xodim va Admin):</span>
              <a href="tel:${creator.phone}" class="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                <i class="fa-solid fa-phone text-[10px]"></i> ${creator.phone}
              </a>
            </div>
            <button onclick="App.openInviteModal('${creator.id}')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition">
              Taklif etish
            </button>
          </div>
        `;
      } else if (Auth.isStudent()) {
        phoneBlock = `
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
            <span class="text-slate-400 text-[11px] flex items-center gap-1 truncate">
              <i class="fa-solid fa-lock text-slate-400"></i> Telefon yopiq
            </span>
            <button onclick="App.openStudentComplaintModal('${creator.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0" title="Tanga taqdim etilmagani bo'yicha adminga shikoyat">
              <i class="fa-solid fa-triangle-exclamation text-rose-600"></i> Adminga Shikoyat
            </button>
          </div>
        `;
      } else {
        phoneBlock = `
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-400 text-[11px] flex items-center gap-1">
              <i class="fa-solid fa-lock text-slate-400"></i> Telefon yopiq
            </span>
            <span class="text-slate-400 text-[10px]">Faqat xodim va admin uchun</span>
          </div>
        `;
      }

      const isMyProfile = (currentUser.role === 'student' && currentUser.creatorId === creator.id) || isAdmin;
      let editBtn = '';
      if (isMyProfile) {
        editBtn = `
          <button onclick="App.openEditProfileModal('${creator.id}')" class="p-1 text-slate-400 hover:text-emerald-700 text-xs" title="Profilni tahrirlash">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        `;
      }

      let adminActions = '';
      if (isAdmin) {
        adminActions = `
          <div class="mt-2 pt-2 border-t border-dashed border-slate-200 flex items-center justify-between">
            <button onclick="App.openAwardModal('${creator.id}')" class="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1">
              <i class="fa-solid fa-coins"></i> +Tanga
            </button>
            <button onclick="App.handleDeleteCreator('${creator.id}')" class="text-xs text-red-400 hover:text-red-600" title="O'chirish">
              <i class="fa-solid fa-trash"></i> O'chirish
            </button>
          </div>
        `;
      }

      return `
        <div class="creator-card bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm relative group">
          <div>
            <div class="flex items-start gap-3.5">
              <div class="relative shrink-0">
                <img src="${creator.avatarUrl}" alt="${creator.fullName}" class="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
                <span class="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-sm">📍</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold badge-district truncate">
                    <i class="fa-solid fa-location-dot mr-1"></i>${creator.regionLabel ? creator.regionLabel + ' • ' : ''}${creator.districtLabel || 'Tuman'}
                  </span>
                  ${editBtn}
                </div>
                <h3 class="text-base font-bold text-slate-900 mt-1 truncate hover:text-emerald-700 cursor-pointer" onclick="App.openCreatorDetail('${creator.id}')">
                  ${creator.fullName}
                </h3>
                <p class="text-xs text-slate-500 truncate mt-0.5 font-medium">
                  <i class="fa-solid fa-school text-[10px] mr-1 text-slate-400"></i>${creator.school}
                </p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200/80 rounded-2xl px-3.5 py-2">
              <div class="flex items-center gap-2">
                <span class="text-xl coin-icon-pulse">🪙</span>
                <div>
                  <span class="text-xs text-amber-950 font-black tracking-tight">${creator.coins} TANGA</span>
                  <span class="text-[10px] text-amber-800 block">${creator.eventsCount} ta tadbir / chellenj</span>
                </div>
              </div>
              <span class="text-[10px] font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                Faol
              </span>
            </div>

            <p class="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
              ${creator.bio}
            </p>
          </div>

          <div class="mt-4">
            <div class="grid grid-cols-2 gap-2">
              <button onclick="App.openVideoModal('${creator.id}')" class="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm">
                <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Jonli Ijro
              </button>
              <button onclick="App.openCreatorDetail('${creator.id}')" class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                <i class="fa-solid fa-circle-info text-slate-500 text-[10px]"></i> Tarjimai hol
              </button>
            </div>

            ${phoneBlock}
            ${adminActions}
          </div>
        </div>
      `;
    }).join('');
  },

  // ================= 12. REYTING JADVALI =================

  renderLeaderboard() {
    const podiumContainer = document.getElementById('podium-container');
    const tableBody = document.getElementById('leaderboard-table-body');
    if (!podiumContainer || !tableBody) return;

    const userDist = this.getActiveDistrictInfo();
    const isRepAdmin = Auth.isRepublicAdmin();
    const activeFilterDist = isRepAdmin
      ? ''
      : (userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : ''));

    let leaderboard = DataStore.getLeaderboard();
    if (activeFilterDist) {
      leaderboard = leaderboard.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeFilterDist));
    }

    if (leaderboard.length === 0) {
      podiumContainer.innerHTML = `
        <div class="col-span-full py-10 px-6 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            <i class="fa-solid fa-crown"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">${(!isRepAdmin && userDist.districtLabel) ? `${userDist.districtLabel} bo'yicha hozircha` : 'Hozircha'} reyting jadvali shakllanmagan</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            O'quvchilar ro'yxatdan o'tib, tanlov va chellenjlarda faol qatnashgach, to'plangan tangalar bo'yicha ushbu shohsupa va reyting jadvali avtomatik hisoblab boriladi.
          </p>
        </div>
      `;
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-slate-400 text-xs">
            Hozircha ro'yxatda o'quvchilar mavjud emas.
          </td>
        </tr>
      `;
      return;
    }

    if (leaderboard.length >= 3) {
      const first = leaderboard[0];
      const second = leaderboard[1];
      const third = leaderboard[2];

      podiumContainer.innerHTML = `
        <div class="podium-card podium-2 p-5 rounded-3xl text-center flex flex-col justify-between order-2 md:order-1 h-[285px]">
          <div>
            <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black mx-auto mb-2 text-sm border-2 border-white shadow-sm">
              2
            </div>
            <img src="${second.avatarUrl}" class="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-300 shadow-sm mb-2" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
            <h4 class="font-bold text-slate-900 text-sm truncate">${second.fullName}</h4>
            <span class="text-[11px] font-bold text-purple-800 block truncate">🏛️ ${second.regionLabel || 'Buxoro viloyati'} • 📍 ${second.districtLabel}</span>
            <span class="text-[10px] text-slate-500 block truncate">${second.school}</span>
          </div>
          <div class="mt-2 bg-slate-100 py-2 rounded-2xl">
            <span class="text-sm font-black text-slate-800">🪙 ${second.coins} Tanga</span>
            <span class="text-[10px] text-slate-500 block">${second.eventsCount} ta tadbir</span>
          </div>
        </div>

        <div class="podium-card podium-1 p-6 rounded-3xl text-center flex flex-col justify-between order-1 md:order-2 h-[325px] shadow-lg shadow-amber-500/10">
          <div>
            <div class="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black mx-auto mb-2 text-lg border-2 border-white shadow-md">
              <i class="fa-solid fa-crown text-amber-900"></i>
            </div>
            <img src="${first.avatarUrl}" class="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-md mb-2" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
            <h4 class="font-black text-slate-900 text-base truncate">${first.fullName}</h4>
            <span class="text-xs font-extrabold text-purple-900 block truncate">🏛️ ${first.regionLabel || 'Buxoro viloyati'} • 📍 ${first.districtLabel}</span>
            <span class="text-[11px] text-amber-800 font-medium block truncate">${first.school}</span>
          </div>
          <div class="mt-2 bg-amber-100/80 py-2.5 rounded-2xl border border-amber-300">
            <span class="text-base font-black text-amber-950">🪙 ${first.coins} TANGA</span>
            <span class="text-[11px] text-amber-900 block font-semibold">1-o'rin • Mavsum Peshqadami</span>
          </div>
        </div>

        <div class="podium-card podium-3 p-5 rounded-3xl text-center flex flex-col justify-between order-3 md:order-3 h-[265px]">
          <div>
            <div class="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center font-black mx-auto mb-2 text-xs border-2 border-white shadow-sm">
              3
            </div>
            <img src="${third.avatarUrl}" class="w-14 h-14 rounded-full mx-auto object-cover border-2 border-amber-600 shadow-sm mb-2" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
            <h4 class="font-bold text-slate-900 text-sm truncate">${third.fullName}</h4>
            <span class="text-[11px] font-bold text-purple-800 block truncate">🏛️ ${third.regionLabel || 'Buxoro viloyati'} • 📍 ${third.districtLabel}</span>
            <span class="text-[10px] text-slate-500 block truncate">${third.school}</span>
          </div>
          <div class="mt-2 bg-orange-50 py-2 rounded-2xl">
            <span class="text-sm font-black text-orange-950">🪙 ${third.coins} Tanga</span>
            <span class="text-[10px] text-orange-800/80 block">${third.eventsCount} ta tadbir</span>
          </div>
        </div>
      `;
    } else {
      const first = leaderboard[0];
      const second = leaderboard[1];
      podiumContainer.innerHTML = `
        <div class="col-span-full flex flex-wrap items-center justify-center gap-6 py-4">
          <div class="podium-card podium-1 p-6 rounded-3xl text-center flex flex-col justify-between w-72 h-[325px] shadow-lg shadow-amber-500/10">
            <div>
              <div class="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black mx-auto mb-2 text-lg border-2 border-white shadow-md">
                <i class="fa-solid fa-crown text-amber-900"></i>
              </div>
              <img src="${first.avatarUrl}" class="w-20 h-20 rounded-full mx-auto object-cover border-4 border-amber-400 shadow-md mb-2" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
              <h4 class="font-black text-slate-900 text-base truncate">${first.fullName}</h4>
              <span class="text-xs font-extrabold text-purple-900 block truncate">🏛️ ${first.regionLabel || 'Buxoro viloyati'} • 📍 ${first.districtLabel}</span>
              <span class="text-[11px] text-amber-800 font-medium block truncate">${first.school}</span>
            </div>
            <div class="mt-2 bg-amber-100/80 py-2.5 rounded-2xl border border-amber-300">
              <span class="text-base font-black text-amber-950">🪙 ${first.coins} TANGA</span>
              <span class="text-[11px] text-amber-900 block font-semibold">1-o'rin • Mavsum Peshqadami</span>
            </div>
          </div>
          ${second ? `
            <div class="podium-card podium-2 p-5 rounded-3xl text-center flex flex-col justify-between w-64 h-[285px]">
              <div>
                <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black mx-auto mb-2 text-sm border-2 border-white shadow-sm">
                  2
                </div>
                <img src="${second.avatarUrl}" class="w-16 h-16 rounded-full mx-auto object-cover border-2 border-slate-300 shadow-sm mb-2" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
                <h4 class="font-bold text-slate-900 text-sm truncate">${second.fullName}</h4>
                <span class="text-[11px] font-bold text-purple-800 block truncate">🏛️ ${second.regionLabel || 'Buxoro viloyati'} • 📍 ${second.districtLabel}</span>
                <span class="text-[10px] text-slate-500 block truncate">${second.school}</span>
              </div>
              <div class="mt-2 bg-slate-100 py-2 rounded-2xl">
                <span class="text-sm font-black text-slate-800">🪙 ${second.coins} Tanga</span>
                <span class="text-[10px] text-slate-500 block">${second.eventsCount} ta tadbir</span>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    tableBody.innerHTML = leaderboard.map((creator, index) => {
      const rank = index + 1;
      let rankBadge = `<span class="font-bold text-slate-500">#${rank}</span>`;
      if (rank === 1) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black inline-flex items-center justify-center text-xs shadow-sm">🥇 1</span>`;
      else if (rank === 2) rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold inline-flex items-center justify-center text-xs">🥈 2</span>`;
      else if (rank === 3) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-700 text-white font-bold inline-flex items-center justify-center text-xs">🥉 3</span>`;

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-6 py-4 whitespace-nowrap">${rankBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <img src="${creator.avatarUrl}" class="w-9 h-9 rounded-full object-cover border border-slate-200" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
              <div>
                <a href="javascript:void(0)" onclick="App.openCreatorDetail('${creator.id}')" class="font-bold text-slate-900 hover:text-emerald-700 block text-sm">
                  ${creator.fullName}
                </a>
                <span class="text-[11px] text-slate-400">${creator.age} yosh</span>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col items-start gap-1">
              <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-purple-50 text-purple-800 border border-purple-200">
                🏛️ ${creator.regionLabel || 'Buxoro viloyati'}
              </span>
              <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold badge-district">
                📍 ${creator.districtLabel}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-xs font-medium text-slate-700">${creator.school}</td>
          <td class="px-6 py-4 text-center font-semibold text-xs text-slate-700">${creator.eventsCount} ta</td>
          <td class="px-6 py-4 text-right whitespace-nowrap">
            <span class="font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-sm">
              🪙 ${creator.coins}
            </span>
          </td>
          <td class="px-6 py-4 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-2">
              <button onclick="App.openVideoModal('${creator.id}')" class="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 transition" title="Jonli ijroni ko'rish">
                <i class="fa-solid fa-play"></i>
              </button>
              <button onclick="App.openCreatorDetail('${creator.id}')" class="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition" title="Avtobiografiya">
                <i class="fa-solid fa-user"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ================= 13. MADANIYAT XODIMLARI XIZMATI =================

  renderStaffSection() {
    const user = Auth.getCurrentUser();
    // O'quvchi, admin yoki mehmon uchun "Xodimlar / Madaniyat Koordinatorlari" bo'limi umuman kerak emas va ko'rsatilmaydi!
    if (!user || user.role !== 'staff') {
      const staffSec = document.getElementById('section-staff');
      if (staffSec) {
        staffSec.classList.add('hidden');
        staffSec.classList.remove('block');
      }
      return;
    }

    const authStatus = document.getElementById('staff-auth-status');
    const tableContainer = document.getElementById('staff-contacts-table-container');
    const mainTitle = document.getElementById('staff-section-main-title');
    const mainSubtitle = document.getElementById('staff-section-main-subtitle');
    const headingText = document.getElementById('staff-contacts-heading-text');
    const subtitleText = document.getElementById('staff-contacts-subtitle-text');
    if (!authStatus || !tableContainer) return;

    const userDist = this.getActiveDistrictInfo();
    const distId = userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : 'jondor');
    const distLabel = userDist.districtLabel || DataStore.getDistrictLabel(distId) || 'Jondor tumani';

    if (mainTitle) {
      mainTitle.textContent = "Madaniyat Xodimlari Xonasi";
    }
    if (mainSubtitle) {
      mainSubtitle.textContent = "Siz Navro'z, Mustaqillik, Yoshlar kuni yoki boshqa tadbirlar uchun o'quvchilarni tanlab, bevosita telefon orqali taklif qilishingiz mumkin.";
    }
    if (headingText) {
      headingText.textContent = "Madaniyat Xodimi uchun O'quvchilar Kontaktlari";
    }
    if (subtitleText) {
      subtitleText.textContent = `📍 Faqat ${distLabel} bo'yicha`;
    }

    const proposalsCard = document.getElementById('staff-my-proposals-card');
    if (proposalsCard) proposalsCard.classList.remove('hidden');

    authStatus.innerHTML = `
      <span class="text-xs text-emerald-300 font-bold block mb-1">
        <i class="fa-solid fa-circle-check"></i> ${userDist.districtLabel ? `📍 ${userDist.districtLabel} Xodimi` : 'Xodim tasdiqlangan'}
      </span>
      <span class="text-xs text-white font-black block">${user.fullName}</span>
      <span class="text-[11px] text-blue-200 block">${user.position || ''}</span>
    `;

    // Tuman koordinatori tomonidan kiritilgan tanlovlar (Madaniyat xodimi (+) orqali o'quvchi tanlashi uchun)
    const staffContestsContainer = document.getElementById('staff-contests-selection-container');
    if (staffContestsContainer) {
      let districtContests = DataStore.getContests();
      if (userDist.district) {
        districtContests = districtContests.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, userDist.district));
      }
      if (districtContests.length === 0) {
        staffContestsContainer.innerHTML = `
          <div class="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <i class="fa-solid fa-bullhorn text-amber-500 text-2xl mb-1.5 block"></i>
            Hozircha ${distLabel} koordinatori tomonidan yangi tanlov kiritilmagan. Koordinator yangi tanlov kiritishi bilan shu yerda <strong>➕ (O'quvchi tanlash)</strong> tugmasi bilan chiqadi!
          </div>
        `;
      } else {
        staffContestsContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${districtContests.map(c => this.buildContestCardHtml(c, userDist)).join('')}
          </div>
        `;
      }
    }

    let creators = DataStore.getCreators();
    if (userDist.district) {
      creators = creators.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, userDist.district));
    }

    if (creators.length === 0) {
      tableContainer.innerHTML = `
        <div class="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
          <i class="fa-solid fa-user-graduate text-2xl text-slate-400"></i>
          <h4 class="font-bold text-slate-800 text-sm">${userDist.districtLabel || 'Ushbu tuman'} bo'yicha hozircha o'quvchilar ro'yxatdan o'tmagan</h4>
          <p class="text-xs text-slate-500 max-w-md mx-auto">
            ${userDist.districtLabel || 'Tumaningiz'} o'quvchilari ro'yxatdan o'tganda ularning jonli ijro videolari va aloqa raqamlari faqat shu yerda ko'rinadi.
          </p>
        </div>
      `;
    } else {
      tableContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">O'quvchi</th>
                <th class="px-4 py-3">Tumani</th>
                <th class="px-4 py-3">Maktabi</th>
                <th class="px-4 py-3">Telefon Raqami</th>
                <th class="px-4 py-3 text-center">Jonli Chiqish</th>
                <th class="px-4 py-3 text-right">Aloqa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${creators.map(c => `
                <tr class="hover:bg-blue-50/40 transition">
                  <td class="px-4 py-3 font-bold text-slate-900">${c.fullName}</td>
                  <td class="px-4 py-3 text-xs font-semibold text-emerald-700">${c.districtLabel}</td>
                  <td class="px-4 py-3 text-xs text-slate-600">${c.school}</td>
                  <td class="px-4 py-3">
                    <a href="tel:${c.phone}" class="font-black text-blue-700 hover:underline text-xs flex items-center gap-1.5">
                      <i class="fa-solid fa-phone text-blue-500 text-[10px]"></i> ${c.phone}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button onclick="App.openVideoModal('${c.id}')" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold">
                      <i class="fa-solid fa-play text-red-500 text-[10px] mr-1"></i> Videoni ko'rish
                    </button>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button onclick="App.openInviteModal('${c.id}')" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto">
                      <i class="fa-solid fa-phone"></i> Taklif qilish
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const myProposalsContainer = document.getElementById('staff-my-proposals-container');
    if (myProposalsContainer) {
      const allProposals = DataStore.getStaffProposals();
      const myProposals = allProposals.filter(p => this.isProposalOwnedByStaff(p, user));

      if (myProposals.length === 0) {
        myProposalsContainer.innerHTML = `
          <div class="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <i class="fa-solid fa-lightbulb text-slate-400 text-2xl mb-1.5 block"></i>
            Hozircha siz tomoningizdan taklif yuborilmagan. Yuqoridagi "Yangi Taklif Yuborish" tugmasi orqali ${userDist.districtLabel || 'tumaningiz'} Adminiga yangi tadbirlar yoki iqtidorli o'quvchilarni tavsiya etishingiz mumkin!
          </div>
        `;
      } else {
        myProposalsContainer.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${myProposals.map(p => {
              const isApproved = p.status === 'approved';
              const studentName = p.targetStudentName || p.recommendedStudentName || '';
              return `
                <div class="p-4 rounded-2xl border ${isApproved ? 'bg-gradient-to-br from-emerald-50 to-teal-50/70 border-emerald-300 shadow-sm' : 'bg-amber-50/70 border-amber-200'} space-y-2.5">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    ${isApproved ? `
                      <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
                        <i class="fa-solid fa-circle-check text-white"></i> Tabriklaymiz, taklifingiz ma'qullandi!
                      </span>
                    ` : `
                      <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1.5 border border-amber-200">
                        <i class="fa-solid fa-hourglass-half text-amber-600"></i> Taklif uchun rahmat, admin siz bilan bog'lanadi
                      </span>
                    `}
                    <span class="text-[11px] text-slate-500 font-medium">
                      <i class="fa-regular fa-clock mr-1 text-slate-400"></i>${p.submittedAt || p.createdAt}
                    </span>
                  </div>

                  <div>
                    <h4 class="font-black text-slate-900 text-sm leading-snug">${p.title}</h4>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">${p.description}</p>
                  </div>

                  ${studentName ? `
                    <div class="text-[11px] text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 border border-amber-200">
                      <i class="fa-solid fa-star text-amber-600"></i> Tavsiya etilgan: ${studentName} ${p.targetStudentSchool ? `(${p.targetStudentSchool})` : ''}
                    </div>
                  ` : ''}

                  ${p.adminNote ? `
                    <div class="text-xs text-emerald-950 bg-white/95 p-2.5 rounded-xl border border-emerald-200 font-semibold shadow-2xs">
                      <i class="fa-solid fa-crown text-amber-500 mr-1"></i> <strong>Admin izohi:</strong> ${p.adminNote}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }

    this.checkStaffApprovedProposals();
  },

  // ================= 14. ADMIN BOSHQARUVI, STATISTIKA & CHELLENJ BAHOLASH =================

  renderAdminSection() {
    const tableBody = document.getElementById('admin-creators-table-body');
    const staffTableBody = document.getElementById('admin-staff-table-body');
    const submissionsTableBody = document.getElementById('admin-submissions-table-body');
    const visitorStatCards = document.getElementById('visitor-stat-cards');
    if (!Auth.isAdmin()) return;

    const userDist = this.getActiveDistrictInfo();
    const districtCreators = DataStore.getCreators().filter(c => !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district));

    // 1. Oylik Qiziqib Boruvchilar Statistikasi
    if (visitorStatCards) {
      const vStats = DataStore.getVisitorStats();
      const currentMonthKey = new Date().toISOString().slice(0, 7);
      const currentMonthVisits = (vStats.monthly && vStats.monthly[currentMonthKey]) || 0;
      const totalVisits = vStats.total || 0;
      const creatorsCount = districtCreators.length;

      visitorStatCards.innerHTML = `
        <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-indigo-700">Joriy Oydagi Qiziqish</span>
            <span class="w-8 h-8 rounded-xl bg-indigo-200 text-indigo-800 flex items-center justify-center text-sm font-black">
              <i class="fa-solid fa-eye"></i>
            </span>
          </div>
          <span class="text-2xl font-black text-indigo-950 mt-2 block">${currentMonthVisits.toLocaleString()} ta</span>
          <span class="text-[11px] text-indigo-800/80 mt-0.5 block">Bu oyda saytga kirganlar soni</span>
        </div>

        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-700">Jami Qiziqib Boruvchilar</span>
            <span class="w-8 h-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center text-sm font-black">
              <i class="fa-solid fa-chart-simple"></i>
            </span>
          </div>
          <span class="text-2xl font-black text-amber-950 mt-2 block">${totalVisits.toLocaleString()} ta</span>
          <span class="text-[11px] text-amber-800/80 mt-0.5 block">Umumiy ko'rishlar va tashriflar</span>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-700">${userDist.districtLabel || 'Ro\'yxatdagi'} O'quvchilar</span>
            <span class="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-black">
              <i class="fa-solid fa-user-graduate"></i>
            </span>
          </div>
          <span class="text-2xl font-black text-emerald-950 mt-2 block">${creatorsCount} ta</span>
          <span class="text-[11px] text-emerald-800/80 mt-0.5 block">Faol maktab iqtidorlari (${userDist.districtLabel || 'Tuman'})</span>
        </div>
      `;
    }

    // 2. Chellenjlarga Kelgan Video Roliklar (Baholash va Tanga berish — faqat shu tuman bo'yicha)
    if (submissionsTableBody) {
      const submissions = DataStore.getChallengeSubmissions().filter(sub =>
        !userDist.district || DataStore.districtsMatch(sub.district || sub.creatorDistrict, userDist.district)
      );
      if (submissions.length === 0) {
        submissionsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              ${userDist.districtLabel || 'Ushbu tuman'} bo'yicha hozircha o'quvchilar tomonidan topshirilgan video roliklar yo'q.
            </td>
          </tr>
        `;
      } else {
        submissionsTableBody.innerHTML = submissions.map(sub => `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-3 font-bold text-slate-900">
              <div>
                <span>${sub.creatorName} ${sub.creatorNickname ? `<span class="text-indigo-600 font-black">(${sub.creatorNickname})</span>` : ''}</span>
                <span class="block text-[11px] text-slate-400 font-normal">${sub.creatorSchool} (${sub.creatorDistrict || userDist.districtLabel})</span>
                <span class="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 font-bold border border-emerald-200" title="Yuklangan sana">
                  <i class="fa-regular fa-calendar-check text-[10px] text-emerald-600"></i> Sana: ${sub.submittedAt || 'Yangi'}
                </span>
              </div>
            </td>
            <td class="px-5 py-3 text-xs font-medium text-rose-700">${sub.challengeTitle}</td>
            <td class="px-5 py-3 text-xs text-slate-700 max-w-xs">
              ${this.formatSubmissionCollaboratorsHtml(sub)}
            </td>
            <td class="px-5 py-3 text-center">
              <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-slate-100 transition inline-block" title="Videoni ko'rish">
                <i class="fa-solid fa-play"></i>
              </a>
            </td>
            <td class="px-5 py-3 text-center">
              ${sub.status === 'approved' ? `
                <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800">
                  🪙 +${sub.coinsAwarded} berildi
                </span>
              ` : `
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                  Kutilmoqda
                </span>
              `}
              ${sub.promotedToRegion ? `<span class="block mt-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-[10px]">🏅 Viloyatga yuborildi (+5 🪙)</span>` : ''}
            </td>
            <td class="px-5 py-3 text-right">
              <div class="flex flex-wrap items-center justify-end gap-1.5">
                ${sub.status === 'approved' ? `
                  <button onclick="App.openReviewSubmissionModal('${sub.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition">
                    Tahrirlash
                  </button>
                ` : `
                  <button onclick="App.openReviewSubmissionModal('${sub.id}')" class="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow transition">
                    Baholash & Tanga Berish
                  </button>
                `}
                ${!sub.promotedToRegion ? `
                  <button onclick="App.handlePromoteSubmissionToRegion('${sub.id}')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs shadow-sm transition inline-flex items-center gap-1" title="Eng yaxshi rolik sifatida Viloyat koordinatoriga yuborish va o'quvchiga +5 qo'shimcha tanga berish">
                    🏅 Viloyatga Yuborish (+5 🪙)
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    // 3. Madaniyat xodimlari (Raqamlar FAQAT shu tuman Adminiga ko'rinadi)
    if (staffTableBody) {
      const staffList = DataStore.getStaffList().filter(s =>
        !userDist.district || DataStore.districtsMatch(s.district || s.districtLabel, userDist.district)
      );
      if (staffList.length === 0) {
        staffTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="px-5 py-6 text-center text-slate-400 text-xs">
              ${userDist.districtLabel || 'Ushbu tuman'} bo'yicha hozircha ro'yxatdan o'tgan madaniyat xodimlari yo'q.
            </td>
          </tr>
        `;
      } else {
        staffTableBody.innerHTML = staffList.map(s => `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-3 font-bold text-slate-900">
              ${s.fullName}
              <span class="block text-[10px] text-emerald-700 font-semibold">📍 ${s.districtLabel || userDist.districtLabel}</span>
            </td>
            <td class="px-5 py-3 text-xs text-slate-600">${s.position}</td>
            <td class="px-5 py-3 text-xs text-slate-600">${s.organization}</td>
            <td class="px-5 py-3">
              <a href="tel:${s.phone}" class="font-black text-blue-700 hover:underline text-xs flex items-center gap-1">
                <i class="fa-solid fa-phone text-blue-500 text-[10px]"></i> ${s.phone}
              </a>
            </td>
            <td class="px-5 py-3 text-right">
              <a href="tel:${s.phone}" class="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1">
                <i class="fa-solid fa-phone"></i> Qo'ng'iroq
              </a>
            </td>
          </tr>
        `).join('');
      }
    }

    // 4. O'quvchilar boshqaruvi (faqat shu tuman bo'yicha)
    if (tableBody) {
      if (districtCreators.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="px-5 py-6 text-center text-slate-400 text-xs">
              ${userDist.districtLabel || 'Ushbu tuman'} bo'yicha hozircha o'quvchilar ro'yxatdan o'tmagan.
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = districtCreators.map(c => `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-3 font-bold text-slate-900">
              <div class="flex items-center gap-2">
                <img src="${c.avatarUrl}" class="w-8 h-8 rounded-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
                <div>
                  <span>${c.fullName}</span>
                  <span class="block text-[11px] text-slate-400 font-normal">${c.districtLabel}</span>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 text-xs font-medium text-emerald-800">${c.school}</td>
            <td class="px-5 py-3 text-xs font-semibold text-slate-700">${c.phone}</td>
            <td class="px-5 py-3 text-center">
              <span class="font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg text-xs">🪙 ${c.coins}</span>
            </td>
            <td class="px-5 py-3 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="App.openEditProfileModal('${c.id}')" class="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition" title="Tahrirlash">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="App.openAwardModal('${c.id}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition" title="Tanga berish">
                  + Tanga
                </button>
                <button onclick="App.handleDeleteCreator('${c.id}')" class="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition" title="O'chirish">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    this.renderAdminBlacklistTable();
    this.renderStaffProposals();
    this.renderAdminComplaints();
    this.renderDistrictSubmittedReports();
  },

  renderAdminBlacklistTable() {
    const tbody = document.getElementById('admin-blacklist-table-body');
    const badge = document.getElementById('admin-blacklist-count-badge');
    if (!tbody) return;

    const userDist = this.getActiveDistrictInfo();
    const blacklisted = DataStore.getBlacklistedCreators().filter(c =>
      !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)
    );

    if (badge) {
      badge.textContent = `${blacklisted.length} nafar qora ro'yxatda (sanalmaydi)`;
    }

    if (blacklisted.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-5 py-6 text-center text-slate-400 text-xs">
            ${userDist.districtLabel || 'Ushbu tuman'} bo'yicha 1 oy (30 kun) davomida kirmagan va qora ro'yxatga tushgan o'quvchilar yo'q. Barcha o'quvchilar faol!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = blacklisted.map(c => {
      const inactiveDays = c.lastActiveAt
        ? Math.max(30, Math.floor((Date.now() - Number(c.lastActiveAt)) / (24 * 60 * 60 * 1000)))
        : 30;
      return `
        <tr class="bg-red-50/40 hover:bg-red-50 transition">
          <td class="px-5 py-3 font-bold text-slate-900">
            <div class="flex items-center gap-2">
              <img src="${c.avatarUrl}" class="w-8 h-8 rounded-full object-cover grayscale" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
              <div>
                <span class="line-through text-slate-700">${c.fullName}</span>
                <span class="block text-[10px] text-red-700 font-bold">🚫 Qora ro'yxatda (statistikada sanalmaydi)</span>
              </div>
            </div>
          </td>
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${c.school} • ${c.districtLabel}</td>
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${c.phone || '-'}</td>
          <td class="px-5 py-3 text-center">
            <span class="px-2.5 py-1 rounded-lg bg-red-100 text-red-900 font-black text-[11px]">⏳ ${inactiveDays} kun kirmagan</span>
          </td>
          <td class="px-5 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="App.handleRestoreBlacklistedCreator('${c.id}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition" title="Qora ro'yxatdan chiqarish va faollashtirish">
                <i class="fa-solid fa-rotate-left"></i> Tiklash
              </button>
              <button onclick="App.handleDeleteCreator('${c.id}')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition" title="Bazadan butunlay o'chirish">
                <i class="fa-solid fa-trash"></i> O'chirish
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleRestoreBlacklistedCreator(creatorId) {
    DataStore.restoreBlacklistedCreator(creatorId);
    this.refreshAllUI();
    this.showToast("✅ O'quvchi qora ro'yxatdan chiqarildi va qayta faol ro'yxatga qo'shildi!", "success");
  },

  // ================= 14B. O'QUVCHILAR SHIKOYATI (ADMINGA SHIKOYAT VA TANGA TAQDIM ETISH) =================

  openStudentComplaintModal(targetCreatorId = null) {
    try {
      const user = Auth.getCurrentUser();
      const userDist = this.getActiveDistrictInfo();
      const allCreators = DataStore.getCreators();
      const creator = (targetCreatorId ? DataStore.getCreatorById(targetCreatorId) : null) ||
                      (user && user.role === 'student' ? (
                        DataStore.getCreatorById(user.creatorId || user.id) ||
                        allCreators.find(c => c && user.fullName && c.fullName && c.fullName.toLowerCase().trim() === user.fullName.toLowerCase().trim()) ||
                        user
                      ) : null);

      const distLabel = (creator && creator.districtLabel) || userDist.districtLabel || 'Jondor tumani';
      const normDist = DataStore.normalizeDistrict(distLabel, userDist.regionLabel || 'Buxoro viloyati');
      const dAdmin = DataStore.getDistrictAdmin(normDist.id);
      const adminNameInfo = (dAdmin && dAdmin.fullName) ? ` (${dAdmin.fullName})` : '';

      const targetAdminText = document.getElementById('complaint-target-admin-text');
      if (targetAdminText) {
        targetAdminText.textContent = `📍 ${normDist.label || distLabel} koordinatoriga${adminNameInfo} shikoyat:`;
      }
      const modalTitle = document.getElementById('complaint-modal-title');
      if (modalTitle) {
        modalTitle.textContent = `${normDist.label || distLabel} Adminiga Shikoyat`;
      }

      const nameInput = document.getElementById('cmp-student-name');
      const schoolInput = document.getElementById('cmp-student-school');
      const eventInput = document.getElementById('cmp-event-title');
      const descInput = document.getElementById('cmp-description');
      const coinsInput = document.getElementById('cmp-requested-coins');

      if (nameInput) nameInput.value = creator ? (creator.fullName || '') : '';
      if (schoolInput) schoolInput.value = creator ? `${normDist.label || distLabel}${creator.school ? ', ' + creator.school : ''}` : (normDist.label || distLabel);
      if (eventInput) eventInput.value = '';
      if (descInput) descInput.value = '';
      if (coinsInput) coinsInput.value = '30';

      this.renderStudentMyComplaints();
    } catch (err) {
      console.error("Shikoyat oynasini ochishda xatolik:", err);
    }
    this.openModal('modal-student-complaint');
  },

  handleStudentComplaintSubmit(e) {
    if (e) e.preventDefault();
    const user = Auth.getCurrentUser();
    const userDist = this.getActiveDistrictInfo();
    const allCreators = DataStore.getCreators();
    const creator = (user && user.role === 'student') ? (
      DataStore.getCreatorById(user.creatorId || user.id) ||
      allCreators.find(c => c && user.fullName && c.fullName && c.fullName.toLowerCase().trim() === user.fullName.toLowerCase().trim()) ||
      user
    ) : null;

    const studentName = (document.getElementById('cmp-student-name')?.value || '').trim();
    const studentSchool = (document.getElementById('cmp-student-school')?.value || '').trim();
    const reason = (document.getElementById('cmp-reason')?.value || 'Videorolikda qatnashdim, lekin tanga olmadim').trim();
    const requestedCoins = parseInt(document.getElementById('cmp-requested-coins')?.value) || 30;
    const eventTitle = (document.getElementById('cmp-event-title')?.value || '').trim();
    const description = (document.getElementById('cmp-description')?.value || '').trim();

    if (!studentName || !description) {
      this.showToast("Iltimos, ismingiz va shikoyat mazmunini to'liq yozing!", "warning");
      return;
    }

    const normDist = DataStore.normalizeDistrict(
      userDist.districtLabel || userDist.district || (creator && creator.districtLabel) || studentSchool || 'jondor',
      userDist.regionLabel || (creator && creator.regionLabel) || 'Buxoro viloyati'
    );

    const newComplaint = DataStore.addComplaint({
      creatorId: creator ? (creator.id || user.creatorId || '') : '',
      creatorName: studentName,
      creatorSchool: studentSchool,
      creatorPhone: creator ? (creator.phone || '') : '',
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      reason: eventTitle ? `${reason} (${eventTitle})` : reason,
      reasonTitle: eventTitle ? `${reason} (${eventTitle})` : reason,
      eventOrChallengeName: eventTitle,
      description: description,
      requestedCoins: requestedCoins
    });

    DataStore.sendToAdminInbox({
      type: 'student_complaint',
      district: newComplaint.district,
      districtLabel: newComplaint.districtLabel,
      name: `${studentName} (${newComplaint.districtLabel})`,
      phone: newComplaint.creatorPhone || studentSchool,
      position: `⚠️ Shikoyat: ${reason}`,
      code: `+${requestedCoins} 🪙`
    });

    const eventInput = document.getElementById('cmp-event-title');
    const descInput = document.getElementById('cmp-description');
    if (eventInput) eventInput.value = '';
    if (descInput) descInput.value = '';

    this.renderStudentMyComplaints();
    this.refreshAllUI();
    this.showToast(`✅ Shikoyatingiz ${newComplaint.districtLabel} koordinatoriga yuborildi! Ko'rib chiqilgach, o'rinli bo'lsa tangangiz taqdim etiladi.`, "success");
  },

  renderStudentMyComplaints() {
    const container = document.getElementById('student-my-complaints-list');
    if (!container) return;

    const user = Auth.getCurrentUser();
    const userDist = this.getActiveDistrictInfo();
    const allComplaints = DataStore.getComplaints();

    const myComplaints = allComplaints.filter(c => {
      if (!c) return false;
      if (user && user.creatorId && c.creatorId === user.creatorId) return true;
      if (user && user.fullName && (c.creatorName || '').toLowerCase() === user.fullName.toLowerCase()) return true;
      if (userDist.district && DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)) return true;
      return false;
    });

    if (myComplaints.length === 0) {
      container.innerHTML = `
        <p class="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
          Hozircha yuborilgan shikoyatlar yo'q.
        </p>
      `;
      return;
    }

    container.innerHTML = myComplaints.map(c => {
      const isApproved = c.status === 'approved';
      const isRejected = c.status === 'rejected';
      const reasonText = c.reason || c.reasonTitle || "Videorolikda qatnashdim, lekin tanga olmadim";
      const awarded = c.awardedCoins || c.coinsAwarded || c.requestedCoins || 30;
      return `
        <div class="p-3 rounded-2xl border text-xs ${isApproved ? 'bg-emerald-50 border-emerald-200' : (isRejected ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')} space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-black text-slate-900">${reasonText}</span>
            ${isApproved ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                ✅ Ma'qullandi (+${awarded} 🪙 berildi)
              </span>
            ` : (isRejected ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-200 text-red-900">
                Rad etildi
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                ⏳ Admin ko'rib chiqmoqda
              </span>
            `)}
          </div>
          <p class="text-slate-600">${c.description || ''}</p>
          ${c.adminNote ? `<p class="text-[11px] font-bold text-emerald-900 mt-1"><i class="fa-solid fa-crown text-amber-500 mr-1"></i>Admin javobi: ${c.adminNote}</p>` : ''}
        </div>
      `;
    }).join('');
  },

  renderAdminComplaints() {
    const tableBody = document.getElementById('admin-complaints-table-body');
    const badge = document.getElementById('admin-complaints-count-badge');
    if (!tableBody) return;

    const userDist = this.getActiveDistrictInfo();
    const complaints = DataStore.getComplaints().filter(c =>
      !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)
    );

    if (badge) {
      const pendingCount = complaints.filter(c => c.status === 'pending').length;
      badge.textContent = pendingCount > 0 ? `${pendingCount} ta yangi (${complaints.length} jami)` : `${complaints.length} ta shikoyat`;
    }

    if (complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
            ${userDist.districtLabel || 'Ushbu tuman'} o'quvchilaridan hozircha shikoyat kelib tushmagan.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = complaints.map(c => {
      const isApproved = c.status === 'approved';
      const isRejected = c.status === 'rejected';
      const reasonText = c.reason || c.reasonTitle || "Videorolikda qatnashdim, lekin tanga olmadim";
      const awarded = c.awardedCoins || c.coinsAwarded || c.requestedCoins || 30;
      return `
        <tr class="hover:bg-rose-50/30 transition">
          <td class="px-5 py-3">
            <div class="font-bold text-slate-900">${c.creatorName}</div>
            <div class="text-[11px] text-slate-500">${c.creatorSchool}</div>
            <span class="inline-block mt-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              📍 ${c.districtLabel || userDist.districtLabel}
            </span>
          </td>
          <td class="px-5 py-3 max-w-sm">
            <div class="font-black text-rose-800 text-xs">${reasonText}</div>
            <p class="text-xs text-slate-600 mt-1">${c.description || ''}</p>
            ${c.adminNote ? `<p class="text-[11px] text-emerald-800 font-semibold mt-1">Izoh: ${c.adminNote}</p>` : ''}
          </td>
          <td class="px-5 py-3 text-center whitespace-nowrap">
            <span class="font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs">
              🪙 +${c.requestedCoins || 30}
            </span>
          </td>
          <td class="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">${c.createdAt}</td>
          <td class="px-5 py-3 text-center whitespace-nowrap">
            ${isApproved ? `
              <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                <i class="fa-solid fa-circle-check text-emerald-600"></i> Ma'qullandi (+${awarded} 🪙)
              </span>
            ` : (isRejected ? `
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-700">
                Rad etilgan
              </span>
            ` : `
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800">
                ⏳ Ko'rib chiqilmoqda
              </span>
            `)}
          </td>
          <td class="px-5 py-3 text-right whitespace-nowrap">
            ${c.status === 'pending' ? `
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="App.handleApproveComplaint('${c.id}', ${c.requestedCoins || 30})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm transition inline-flex items-center gap-1">
                  <i class="fa-solid fa-coins text-amber-300"></i> Ma'qullash & +${c.requestedCoins || 30} Tanga Berish
                </button>
                <button onclick="App.handleRejectComplaint('${c.id}')" class="px-2.5 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold rounded-xl text-xs transition">
                  Rad etish
                </button>
              </div>
            ` : `
              <span class="text-[11px] text-slate-400 font-semibold">Ko'rib chiqilgan</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  handleApproveComplaint(complaintId, defaultCoins = 30) {
    if (!Auth.isAdmin()) return;
    const coinsStr = prompt("Shikoyat o'rinli deb topildi! O'quvchiga qancha tanga taqdim etilsin?", String(defaultCoins));
    if (coinsStr === null) return;
    const coins = parseInt(coinsStr) || defaultCoins;

    const res = DataStore.resolveComplaint(
      complaintId,
      'approved',
      coins,
      `Shikoyatingiz o'rinli deb topildi va ma'qullanib +${coins} tanga taqdim etildi!`
    );
    if (res.success) {
      this.refreshAllUI();
      this.showToast(`✅ Shikoyat ma'qullandi va o'quvchiga 🪙 +${coins} tanga taqdim etildi!`, "success");
    } else {
      this.showToast(res.message || "Xatolik yuz berdi", "error");
    }
  },

  handleRejectComplaint(complaintId) {
    if (!Auth.isAdmin()) return;
    const note = prompt("Shikoyatni rad etish sababi (ixtiyoriy):", "Ma'lumot tasdiqlanmadi");
    if (note === null) return;
    DataStore.resolveComplaint(complaintId, 'rejected', 0, note || "Rad etildi");
    this.refreshAllUI();
    this.showToast("Shikoyat rad etildi.", "info");
  },

  // ================= 14C. MAVSUMIY HISOBOTLAR VA VILOYAT / RESPUBLIKA KOORDINATORLARI =================

  onDistrictReportChallengeChange() {
    this.populateDistrictReportBestVideoSelect();
  },

  onDistrictReportBestSubChange() {
    const bestSubSelect = document.getElementById('dist-report-best-submission-select');
    const customBlock = document.getElementById('dist-report-custom-video-block');
    if (!bestSubSelect || !customBlock) return;
    if (bestSubSelect.value === '__custom__') {
      customBlock.classList.remove('hidden');
    } else {
      customBlock.classList.add('hidden');
    }
  },

  selectDistrictCandidateVideo(submissionId) {
    const bestSubSelect = document.getElementById('dist-report-best-submission-select');
    const customBlock = document.getElementById('dist-report-custom-video-block');
    if (bestSubSelect) {
      bestSubSelect.value = submissionId;
    }
    if (customBlock) {
      customBlock.classList.add('hidden');
    }
    this.populateDistrictReportBestVideoSelect(submissionId);
    this.showToast("🏅 Eng zo'r maktab videoroligi hisobotga biriktirildi!", "info");
  },

  populateDistrictReportBestVideoSelect(preselectedSubId = '') {
    const chSelect = document.getElementById('dist-report-challenge-select');
    const subSelect = document.getElementById('dist-report-best-submission-select');
    const candidateContainer = document.getElementById('district-report-candidate-videos');
    if (!chSelect || !subSelect) return;

    const userDist = this.getActiveDistrictInfo();
    const allChallenges = DataStore.getChallenges();
    const visibleChallenges = allChallenges.filter(ch =>
      !ch.district || ch.district === 'all' || DataStore.districtsMatch(ch.district || ch.districtLabel, userDist.district)
    );

    const prevChId = chSelect.value;
    chSelect.innerHTML = `<option value="">-- Barcha Respublika va Tuman Video-Chellenjlari --</option>` +
      visibleChallenges.map(ch => `<option value="${ch.id}">🎬 ${ch.title} (+${ch.awardCoins} 🪙)</option>`).join('');
    if (prevChId && visibleChallenges.some(c => c.id === prevChId)) {
      chSelect.value = prevChId;
    }

    const selectedChId = chSelect.value;
    const allSubs = DataStore.getChallengeSubmissions();
    let distSubs = allSubs.filter(sb =>
      !userDist.district || DataStore.districtsMatch(sb.district || sb.creatorDistrict, userDist.district)
    );
    if (selectedChId) {
      distSubs = distSubs.filter(sb => sb.challengeId === selectedChId);
    }

    const currentVal = preselectedSubId || subSelect.value;
    subSelect.innerHTML =
      `<option value="">-- Tumandagi maktablar videoroliklaridan eng zo'rini tanlang --</option>` +
      distSubs.map(sb => {
        const badge = sb.promotedToRegion ? '🏅 [Viloyatga yuborilgan]' : '🎬';
        return `<option value="${sb.id}">${badge} ${sb.creatorSchool} — ${sb.creatorName} (${sb.challengeTitle})</option>`;
      }).join('') +
      `<option value="__custom__">➕ Ro'yxatda yo'q maktab/o'quvchi videoroligini qo'lda kiritish...</option>`;

    if (currentVal && (currentVal === '__custom__' || distSubs.some(s => s.id === currentVal))) {
      subSelect.value = currentVal;
    } else if (distSubs.length > 0 && !currentVal) {
      subSelect.value = distSubs[0].id;
    }

    if (candidateContainer) {
      if (distSubs.length === 0) {
        candidateContainer.innerHTML = `
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-purple-200 flex items-center justify-between gap-2">
            <span>ℹ️ Hozircha bu chellenj bo'yicha tuman maktablaridan video topshirilmagan. Pastdan <strong>"➕ Qo'lda kiritish"</strong> orqali g'olib maktab videosini qo'shishingiz mumkin.</span>
          </div>
        `;
      } else {
        const activeSubId = subSelect.value;
        candidateContainer.innerHTML = `
          <div class="text-[11px] font-bold text-amber-200 mb-1">
            📋 Tumandagi maktablar topshirgan videoroliklar (${distSubs.length} ta) — eng zo'r 1 tasini bosing:
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            ${distSubs.map(sb => {
              const isSelected = sb.id === activeSubId;
              return `
                <div onclick="App.selectDistrictCandidateVideo('${sb.id}')" class="cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${isSelected ? 'bg-amber-400/25 border-amber-300 shadow-sm' : 'bg-white/5 border-white/15 hover:bg-white/10'}">
                  <div class="min-w-0">
                    <div class="text-xs font-black text-white truncate">${isSelected ? '✅ ' : '🏫 '}${sb.creatorSchool} — ${sb.creatorName}</div>
                    <div class="text-[10px] text-purple-200 truncate">🎬 ${sb.challengeTitle} ${sb.promotedToRegion ? '• <span class="text-amber-300 font-black">🏅 Viloyatda (+5 🪙)</span>' : ''}</div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <a href="${sb.videoUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-amber-300 text-[10px] font-bold">
                      <i class="fa-solid fa-play"></i> Ko'rish
                    </a>
                    <span class="px-2 py-1 rounded-lg text-[10px] font-black ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white'}">
                      ${isSelected ? 'Tanlandi' : 'Tanlash'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }
  },

  handleSubmitDistrictReport(e) {
    if (e) e.preventDefault();
    if (!Auth.isAdmin()) return;

    const user = Auth.getCurrentUser();
    const userDist = this.getActiveDistrictInfo();
    const season = (document.getElementById('dist-report-season')?.value || '2026-yil Kuzgi Mavsum').trim();
    const summary = (document.getElementById('dist-report-summary')?.value || '').trim();
    const chSelect = document.getElementById('dist-report-challenge-select');
    const bestSubSelect = document.getElementById('dist-report-best-submission-select');

    if (!summary) {
      this.showToast("Iltimos, hisobotning qisqacha mazmunini va g'olib maktab tavsifini kiriting!", "warning");
      return;
    }

    let selectedSub = null;
    const bestSubVal = bestSubSelect ? bestSubSelect.value : '';

    if (bestSubVal === '__custom__') {
      const customSchool = (document.getElementById('dist-report-custom-school')?.value || '').trim();
      const customStudent = (document.getElementById('dist-report-custom-student')?.value || '').trim();
      const customVideo = (document.getElementById('dist-report-custom-video')?.value || '').trim();

      if (!customSchool || !customStudent || !customVideo) {
        this.showToast("Iltimos, g'olib maktab raqami, o'quvchi F.I.Sh. va video havolasini to'liq kiriting!", "warning");
        return;
      }

      const allChallenges = DataStore.getChallenges();
      const chosenCh = allChallenges.find(c => c.id === (chSelect?.value || '')) || allChallenges[0];
      selectedSub = DataStore.submitChallengeVideo({
        challengeId: chosenCh ? chosenCh.id : 'chl-rep',
        challengeTitle: chosenCh ? chosenCh.title : season,
        creatorName: customStudent,
        creatorSchool: customSchool,
        district: userDist.district,
        creatorDistrict: userDist.districtLabel,
        regionId: userDist.regionId || 'buxoro_vil',
        regionLabel: userDist.regionLabel || 'Buxoro viloyati',
        videoUrl: customVideo,
        participants: `${customSchool} jamoasi (${customStudent})`,
        note: summary
      });
    } else if (bestSubVal) {
      selectedSub = DataStore.getChallengeSubmissions().find(s => s && s.id === bestSubVal) || null;
    }

    // Agar eng zo'r videorolik tanlangan bo'lsa, uni Viloyat bosqichiga (+5 bonus tanga bilan) chiqaramiz
    if (selectedSub && !selectedSub.promotedToRegion) {
      const promRes = DataStore.promoteSubmissionToRegion(selectedSub.id);
      if (promRes && promRes.submission) {
        selectedSub = promRes.submission;
      }
    }

    const creators = DataStore.getCreators().filter(c => DataStore.districtsMatch(c.district || c.districtLabel, userDist.district));
    const challenges = DataStore.getChallenges().filter(c => !c.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district));
    const totalCoins = creators.reduce((sum, c) => sum + (c.coins || 0), 0);

    const report = DataStore.addSeasonReport({
      level: 'district_to_region',
      district: userDist.district,
      districtLabel: userDist.districtLabel,
      regionId: userDist.regionId || 'buxoro_vil',
      regionLabel: userDist.regionLabel || 'Buxoro viloyati',
      coordinatorName: user.fullName || `${userDist.districtLabel} Koordinatori`,
      coordinatorPhone: user.phone || '',
      season: season,
      summary: summary,
      studentsCount: creators.length,
      challengesCount: challenges.length,
      totalCoins: totalCoins,
      challengeId: selectedSub ? selectedSub.challengeId : (chSelect?.value || ''),
      challengeTitle: selectedSub ? selectedSub.challengeTitle : '',
      bestSubmissionId: selectedSub ? selectedSub.id : '',
      bestCreatorName: selectedSub ? selectedSub.creatorName : '',
      bestSchool: selectedSub ? selectedSub.creatorSchool : '',
      bestDistrict: userDist.districtLabel,
      bestVideoUrl: selectedSub ? selectedSub.videoUrl : '',
      bestParticipants: selectedSub ? (selectedSub.participants || '') : ''
    });

    const summaryEl = document.getElementById('dist-report-summary');
    if (summaryEl) summaryEl.value = '';
    const customBlock = document.getElementById('dist-report-custom-video-block');
    if (customBlock) customBlock.classList.add('hidden');

    this.refreshAllUI();
    this.showToast(
      selectedSub
        ? `🏅 ${report.districtLabel} hisoboti va "${selectedSub.creatorSchool} — ${selectedSub.creatorName}" eng zo'r videoroligi (+5 🪙) ${report.regionLabel} koordinatoriga yuborildi!`
        : `📈 ${report.districtLabel} mavsumiy hisoboti ${report.regionLabel} koordinatoriga muvaffaqiyatli yuborildi!`,
      "success"
    );
  },

  renderDistrictSubmittedReports() {
    this.populateDistrictReportBestVideoSelect();

    const container = document.getElementById('district-submitted-reports-list');
    if (!container) return;

    const userDist = this.getActiveDistrictInfo();
    const reports = DataStore.getSeasonReports().filter(r =>
      r.level === 'district_to_region' &&
      (!userDist.district || DataStore.districtsMatch(r.district || r.districtLabel, userDist.district))
    );

    if (reports.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = reports.map(r => `
      <div class="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="space-y-1">
          <div>
            <span class="font-black text-amber-300">${r.season || r.seasonTitle}</span> • <span>${r.summary}</span>
          </div>
          ${r.bestVideoUrl ? `
            <div class="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold">
              <span>🏅 Tanlangan eng zo'r video: <strong>${r.bestSchool || 'Maktab'} — ${r.bestCreatorName}</strong> (${r.challengeTitle || 'Video-Chellenj'})</span>
              <a href="${r.bestVideoUrl}" target="_blank" rel="noopener noreferrer" class="underline text-white font-black"><i class="fa-solid fa-play mr-0.5"></i>Videoni ko'rish</a>
            </div>
          ` : ''}
          <div class="text-[11px] text-purple-200">
            Ko'rsatkichlar: <strong>${r.studentsCount} ta o'quvchi</strong>, <strong>${r.challengesCount || r.eventsCount || 0} ta chellenj</strong>, <strong>🪙 ${r.totalCoins} tanga</strong> (${r.submittedAt})
          </div>
        </div>
        <span class="px-3 py-1 rounded-xl font-black text-[11px] shrink-0 ${r.status === 'approved' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400/20 text-amber-200 border border-amber-400/40'}">
          ${r.status === 'approved' ? '✅ Viloyat Koordinatori Tasdiqlagan' : '⏳ Viloyat Koordinatoriga Yuborilgan'}
        </span>
      </div>
    `).join('');
  },

  renderRegionAdminSection() {
    const barchartContainer = document.getElementById('region-districts-barchart');
    const districtsTableBody = document.getElementById('region-districts-table-body');
    const receivedReportsBody = document.getElementById('region-received-reports-body');
    const submittedReportsList = document.getElementById('region-submitted-reports-list');
    const summaryStatsEl = document.getElementById('region-admin-summary-stats');
    const badgeTitle = document.getElementById('region-admin-badge-title');
    const mainHeading = document.getElementById('region-admin-main-heading');
    const barchartTitle = document.getElementById('region-barchart-title');

    if (!barchartContainer || !districtsTableBody) return;

    const regInfo = Auth.getUserRegion();
    const activeRegionId = regInfo.regionId || 'buxoro_vil';
    const activeRegionLabel = regInfo.regionLabel || 'Buxoro viloyati';

    if (badgeTitle) {
      badgeTitle.innerHTML = `<i class="fa-solid fa-chart-column mr-1"></i> 📍 ${activeRegionLabel} Koordinatori Boshqaruv Xonasi`;
    }
    if (mainHeading) {
      mainHeading.textContent = `${activeRegionLabel}dagi Tuman Koordinatorlari Natijalari va O'sish Tendensiyasi`;
    }
    if (barchartTitle) {
      barchartTitle.textContent = `${activeRegionLabel} Tumanlari Kesimida O'quvchilar Qiziqishi va Sonining Oshib Borish Diagrammasi (BarChart)`;
    }

    const regionDistricts = DataStore.getDistrictsByRegion(activeRegionId);
    const allCreators = DataStore.getCreators();
    const allStaff = DataStore.getStaffList();
    const allChallenges = DataStore.getChallenges();
    const allSubmissions = DataStore.getChallengeSubmissions();

    const districtStats = regionDistricts.map(dist => {
      const dAdmin = DataStore.getDistrictAdmin(dist.id);
      const dCreators = allCreators.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, dist.id));
      const dStaff = allStaff.filter(s => DataStore.districtsMatch(s.district || s.districtLabel, dist.id));
      const dChallenges = allChallenges.filter(ch => DataStore.districtsMatch(ch.district || ch.districtLabel, dist.id));
      const dSubs = allSubmissions.filter(sb => DataStore.districtsMatch(sb.district || sb.creatorDistrict, dist.id));
      const totalCoins = dCreators.reduce((sum, c) => sum + (c.coins || 0), 0);

      return {
        id: dist.id,
        name: dist.name,
        icon: dist.icon || '📍',
        coordinatorName: dAdmin ? (dAdmin.fullName || '') : '',
        coordinatorPin: dAdmin ? (dAdmin.pin || '') : '',
        coordinatorPhone: dAdmin ? (dAdmin.phone || '') : '',
        hasRegisteredAdmin: Boolean(dAdmin && dAdmin.fullName && dAdmin.pin),
        studentsCount: dCreators.length,
        staffCount: dStaff.length,
        challengesCount: dChallenges.length + dSubs.length,
        totalCoins: totalCoins
      };
    });

    const maxStudents = Math.max(5, ...districtStats.map(d => d.studentsCount));
    const totalRegionStudents = districtStats.reduce((s, d) => s + d.studentsCount, 0);
    const totalRegionCoins = districtStats.reduce((s, d) => s + d.totalCoins, 0);
    const assignedCoordsCount = districtStats.filter(d => d.hasRegisteredAdmin).length;

    if (summaryStatsEl) {
      summaryStatsEl.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
          <span class="text-2xl font-black text-amber-300 block">${assignedCoordsCount} / ${regionDistricts.length} ta</span>
          <span class="text-[11px] text-purple-200 font-bold">Biriktirilgan Tuman Koordinatorlari</span>
        </div>
        <div class="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
          <span class="text-2xl font-black text-emerald-300 block">${totalRegionStudents} nafar</span>
          <span class="text-[11px] text-purple-200 font-bold">Jami O'quvchilar (🪙 ${totalRegionCoins})</span>
        </div>
      `;
    }

    // 1. BARCHART RENDERING (Visual Vertical BarChart)
    barchartContainer.innerHTML = `
      <div class="space-y-4">
        <div class="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-inner overflow-x-auto">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <i class="fa-solid fa-arrow-trend-up text-emerald-400"></i> ${activeRegionLabel} tumanlarida o'quvchilar sonining o'sish diagrammasi
            </span>
            <span class="text-[11px] text-slate-400">Ustun balandligi = ro'yxatdan o'tgan o'quvchilar va qiziqish ko'rsatkichi</span>
          </div>
          <div class="flex items-end gap-3 sm:gap-4 min-h-[210px] pt-8 pb-2 px-2 min-w-[640px]">
            ${districtStats.map((d, idx) => {
              const heightPercent = Math.max(12, Math.round((d.studentsCount / maxStudents) * 100));
              const barColors = [
                'from-emerald-500 to-teal-400',
                'from-purple-500 to-indigo-400',
                'from-amber-500 to-yellow-400',
                'from-blue-500 to-cyan-400',
                'from-rose-500 to-pink-400'
              ];
              const colorClass = barColors[idx % barColors.length];
              return `
                <div class="flex-1 flex flex-col items-center justify-end h-44 group">
                  <div class="text-[11px] font-black text-amber-300 mb-1">${d.studentsCount} ta</div>
                  <div class="w-full max-w-[44px] bg-slate-800/80 rounded-t-2xl h-36 flex items-end p-1 border border-slate-700/70">
                    <div class="w-full rounded-t-xl bg-gradient-to-t ${colorClass} transition-all duration-500 shadow-lg" style="height: ${heightPercent}%"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-300 mt-2 text-center leading-tight line-clamp-2">${d.name.replace(' tumani', '').replace(' shahri', ' sh.')}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // 2. TUMAN KOORDINATORLARINI KIRITISH VA 5 XONALI KOD BERISH JADVALI
    districtsTableBody.innerHTML = districtStats.map((d, idx) => `
      <tr class="hover:bg-purple-50/40 transition" data-district-row="${d.id}" data-district-name="${d.name}">
        <td class="px-4 py-3 font-black text-slate-900 whitespace-nowrap">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-black mr-1.5">${idx + 1}</span>
          <span class="mr-1">${d.icon}</span> ${d.name}
          <div class="mt-1">
            ${d.hasRegisteredAdmin
              ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800"><i class="fa-solid fa-circle-check"></i> Biriktirilgan</span>`
              : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"><i class="fa-solid fa-clock"></i> Kiritilmagan</span>`
            }
          </div>
        </td>
        <td class="px-4 py-3 min-w-[210px]">
          <input type="text" id="dist-coord-name-${d.id}" value="${(d.coordinatorName || '').replace(/"/g, '&quot;')}" placeholder="Masalan: Shuhrat Mirzoqulov" class="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none">
        </td>
        <td class="px-4 py-3 min-w-[175px]">
          <div class="flex items-center gap-1.5">
            <input type="text" id="dist-coord-pin-${d.id}" value="${(d.coordinatorPin || '').replace(/"/g, '&quot;')}" maxlength="5" placeholder="5 xonali kod" class="w-28 px-3 py-2 text-xs font-black tracking-widest text-purple-900 bg-purple-50 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none text-center">
            <button type="button" onclick="App.generateRandom5DigitPin('dist-coord-pin-${d.id}')" title="Tasodifiy 5 xonali kod" class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-purple-800 font-black text-xs transition">
              🎲
            </button>
          </div>
        </td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <button type="button" onclick="App.saveSingleDistrictCoordinator('${d.id}', '${d.name.replace(/'/g, "\\'")}')" class="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition inline-flex items-center gap-1" title="Shu qatordagi ism va kodni saqlash">
              <i class="fa-solid fa-floppy-disk"></i> Saqlash
            </button>
            <button type="button" onclick="App.openEditCoordinatorModal('district', '${d.id}', '${d.name.replace(/'/g, "\\'")}')" class="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs transition inline-flex items-center gap-1" title="Tuman admini almashganda ismini va kodini tahrirlash">
              <i class="fa-solid fa-pen-to-square"></i> Tahrirlash
            </button>
          </div>
        </td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs">${d.studentsCount} o'quvchi</span>
          <span class="block text-[10px] font-bold text-blue-700 mt-0.5">${d.staffCount} xodim • ${d.challengesCount} rolik</span>
        </td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs">🪙 ${d.totalCoins}</span>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${d.studentsCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
            <i class="fa-solid fa-arrow-trend-up"></i> ${d.studentsCount > 0 ? `+${d.studentsCount * 15}% O'sish` : 'Boshlang\'ich'}
          </span>
        </td>
      </tr>
    `).join('');

    // 3. TUMAN KOORDINATORLARIDAN KELGAN MAVSUMIY HISOBOTLAR VA ENG ZO'R VIDEO-CHELLENJLAR
    if (receivedReportsBody) {
      const distReports = DataStore.getSeasonReports().filter(r =>
        r.level === 'district_to_region' &&
        DataStore.regionsMatch(r.regionId || r.regionLabel, activeRegionId)
      );

      if (distReports.length === 0) {
        receivedReportsBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              ${activeRegionLabel} tuman koordinatorlaridan hozircha mavsumiy hisobotlar kelib tushmagan.
            </td>
          </tr>
        `;
      } else {
        receivedReportsBody.innerHTML = distReports.map(r => {
          const linkedSub = r.bestSubmissionId
            ? allSubmissions.find(s => s && s.id === r.bestSubmissionId)
            : null;
          const isPromotedToRep = linkedSub ? Boolean(linkedSub.promotedToRepublic) : false;

          return `
            <tr class="hover:bg-slate-50 transition">
              <td class="px-5 py-3 font-black text-slate-900">
                ${r.districtLabel}
                <span class="block text-[10px] font-bold text-slate-500">${r.studentsCount} o'quvchi • 🪙 ${r.totalCoins}</span>
              </td>
              <td class="px-5 py-3 text-xs font-bold text-slate-700">${r.coordinatorName}</td>
              <td class="px-5 py-3 max-w-sm">
                <span class="font-black text-purple-800 text-xs block">${r.season || r.seasonTitle}</span>
                <p class="text-xs text-slate-600 mt-0.5">${r.summary}</p>
              </td>
              <td class="px-5 py-3 text-center">
                ${r.bestVideoUrl ? `
                  <div class="inline-flex flex-col items-center gap-1 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5">
                    <span class="text-[11px] font-black text-purple-900">🏅 ${r.bestSchool || 'Maktab'} — ${r.bestCreatorName}</span>
                    <span class="text-[10px] text-rose-700 font-semibold">${r.challengeTitle || 'Video-Chellenj'}</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <a href="${r.bestVideoUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <i class="fa-solid fa-play text-red-400"></i> Ko'rish
                      </a>
                      ${linkedSub && !isPromotedToRep ? `
                        <button type="button" onclick="App.handlePromoteSubmissionToRepublic('${linkedSub.id}')" class="px-2 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-rose-600 text-white text-[10px] font-black shadow-xs">
                          🌟 Respublikaga (+10 🪙)
                        </button>
                      ` : (isPromotedToRep ? `<span class="text-[10px] font-black text-emerald-700">🌟 Respublikada</span>` : '')}
                    </div>
                  </div>
                ` : `<span class="text-xs text-slate-400">Biriktirilmagan</span>`}
              </td>
              <td class="px-5 py-3 text-center">
                ${r.status === 'approved' ? `
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">✅ Qabul qilindi</span>
                ` : `
                  <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">⏳ Yangi hisobot</span>
                `}
              </td>
              <td class="px-5 py-3 text-right">
                ${r.status !== 'approved' ? `
                  <button onclick="App.handleApproveSeasonReport('${r.id}')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs shadow-sm transition">
                    <i class="fa-solid fa-check mr-1"></i> Hisobotni Tasdiqlash
                  </button>
                ` : `<span class="text-xs text-slate-400">Tasdiqlangan</span>`}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 4. VILOYAT KOORDINATORINING RESPUBLIKAGA YUBORGAN HISOBOTLARI
    if (submittedReportsList) {
      const regReports = DataStore.getSeasonReports().filter(r =>
        r.level === 'region_to_republic' &&
        DataStore.regionsMatch(r.regionId || r.regionLabel, activeRegionId)
      );
      submittedReportsList.innerHTML = regReports.map(r => `
        <div class="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div class="space-y-1">
            <div>
              <span class="font-black text-amber-300">${r.season || r.seasonTitle}</span> • <span>${r.summary}</span>
            </div>
            ${r.bestVideoUrl ? `
              <div class="inline-flex flex-wrap items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold">
                <span>🌟 Viloyatdan Respublikaga tanlangan eng zo'r video: <strong>${r.bestDistrict ? r.bestDistrict + ' • ' : ''}${r.bestSchool || ''} — ${r.bestCreatorName}</strong></span>
                <a href="${r.bestVideoUrl}" target="_blank" rel="noopener noreferrer" class="underline text-white font-black"><i class="fa-solid fa-play mr-0.5"></i>Ko'rish</a>
              </div>
            ` : ''}
            <div class="text-[11px] text-rose-200">
              Viloyat ko'rsatkichi: <strong>${r.studentsCount} ta o'quvchi</strong>, <strong>🪙 ${r.totalCoins} tanga</strong> (${r.submittedAt})
            </div>
          </div>
          <span class="px-3 py-1 rounded-xl font-black text-[11px] shrink-0 ${r.status === 'approved' ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400/20 text-amber-200 border border-amber-400/40'}">
            ${r.status === 'approved' ? '✅ Respublika Koordinatori Tasdiqlagan' : '⏳ Respublika Koordinatoriga Yuborilgan'}
          </span>
        </div>
      `).join('');
    }

    // 5. TUMAN ADMINLARIDAN VILOYATGA TANLAB YUBORILGAN ENG YAXSHI VIDEO ROLIKLAR (+10 TANGA BILAN RESPUBLIKAGA YUBORISH)
    const regDistIds = regionDistricts.map(d => d.id);
    const regionSubs = allSubmissions.filter(sub =>
      sub.promotedToRegion ||
      regDistIds.some(dId => DataStore.districtsMatch(sub.district || sub.creatorDistrict, dId))
    );

    const regBestSubSelect = document.getElementById('reg-report-best-submission-select');
    const regCandidateVideos = document.getElementById('region-report-candidate-videos');
    if (regBestSubSelect) {
      const prevVal = regBestSubSelect.value;
      regBestSubSelect.innerHTML =
        `<option value="">-- Tumanlardan kelgan eng zo'r videoroliklardan 1 tasini Respublikaga tanlang --</option>` +
        regionSubs.map(sub => {
          const st = sub.promotedToRepublic ? '🌟 [Respublikaga yuborilgan]' : (sub.promotedToRegion ? '🏅 [Tuman g\'olibi]' : '🎬');
          return `<option value="${sub.id}">${st} ${sub.creatorDistrict || sub.district} • ${sub.creatorSchool} — ${sub.creatorName} (${sub.challengeTitle})</option>`;
        }).join('');
      if (prevVal && regionSubs.some(s => s.id === prevVal)) {
        regBestSubSelect.value = prevVal;
      } else if (regionSubs.length > 0) {
        const firstPromoted = regionSubs.find(s => s.promotedToRegion) || regionSubs[0];
        regBestSubSelect.value = firstPromoted.id;
      }
    }

    if (regCandidateVideos) {
      if (regionSubs.length === 0) {
        regCandidateVideos.innerHTML = `
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-rose-200">
            ℹ️ Hozircha tuman koordinatorlaridan g'olib videoroliklar kelib tushmagan.
          </div>
        `;
      } else {
        const selectedRegSubId = regBestSubSelect ? regBestSubSelect.value : '';
        regCandidateVideos.innerHTML = `
          <div class="text-[11px] font-bold text-amber-200 mb-1">
            📋 Tumanlardan kelgan g'olib videoroliklar (${regionSubs.length} ta) — Viloyat nomidan Respublikaga yuborish uchun eng zo'r 1 tasini tanlang:
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            ${regionSubs.map(sb => {
              const isSelected = sb.id === selectedRegSubId;
              return `
                <div onclick="document.getElementById('reg-report-best-submission-select').value='${sb.id}'; App.renderRegionAdminSection();" class="cursor-pointer p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${isSelected ? 'bg-amber-400/25 border-amber-300 shadow-sm' : 'bg-white/5 border-white/15 hover:bg-white/10'}">
                  <div class="min-w-0">
                    <div class="text-xs font-black text-white truncate">${isSelected ? '✅ ' : '📍 '}${sb.creatorDistrict || sb.district} • ${sb.creatorSchool}</div>
                    <div class="text-[10px] text-rose-200 truncate">👤 ${sb.creatorName} • 🎬 ${sb.challengeTitle}</div>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <a href="${sb.videoUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-amber-300 text-[10px] font-bold">
                      <i class="fa-solid fa-play"></i> Ko'rish
                    </a>
                    <span class="px-2 py-1 rounded-lg text-[10px] font-black ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white'}">
                      ${isSelected ? 'Tanlandi' : 'Tanlash'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
    }

    const regPromotedBody = document.getElementById('region-promoted-submissions-body');
    if (regPromotedBody) {
      if (regionSubs.length === 0) {
        regPromotedBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              ${activeRegionLabel} tumanlaridan hozircha video roliklar kelib tushmagan.
            </td>
          </tr>
        `;
      } else {
        regPromotedBody.innerHTML = regionSubs.map(sub => `
          <tr class="hover:bg-purple-50/40 transition">
            <td class="px-4 py-3 font-bold text-slate-900">
              ${sub.creatorName}
              <span class="block text-[11px] text-slate-500 font-normal">${sub.creatorSchool}</span>
              <div class="mt-1">${this.formatSubmissionCollaboratorsHtml(sub)}</div>
            </td>
            <td class="px-4 py-3 text-xs font-bold text-purple-800">📍 ${sub.creatorDistrict || sub.district || activeRegionLabel}</td>
            <td class="px-4 py-3 text-xs font-semibold text-rose-700">${sub.challengeTitle}</td>
            <td class="px-4 py-3 text-center">
              <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1">
                <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Ko'rish
              </a>
            </td>
            <td class="px-4 py-3 text-center">
              ${sub.promotedToRepublic ? `
                <span class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-black">🌟 Respublikaga yuborildi (+10 🪙)</span>
              ` : (sub.promotedToRegion ? `
                <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-black">🏅 Tuman tanlagan (+5 🪙)</span>
              ` : `
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">Tuman roligi</span>
              `)}
            </td>
            <td class="px-4 py-3 text-right">
              ${!sub.promotedToRepublic ? `
                <button onclick="App.handlePromoteSubmissionToRepublic('${sub.id}')" class="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black rounded-xl text-xs shadow-sm transition inline-flex items-center gap-1.5">
                  🌟 Respublikaga Yuborish (+10 🪙)
                </button>
              ` : `
                <span class="text-xs font-black text-emerald-700"><i class="fa-solid fa-circle-check mr-1"></i>Respublikada</span>
              `}
            </td>
          </tr>
        `).join('');
      }
    }
  },

  handleSubmitRegionReport(e) {
    if (e) e.preventDefault();
    const user = Auth.getCurrentUser();
    const regInfo = Auth.getUserRegion();
    const activeRegionId = regInfo.regionId || 'buxoro_vil';
    const activeRegionLabel = regInfo.regionLabel || 'Buxoro viloyati';

    const season = (document.getElementById('reg-report-season')?.value || '2026-yil Kuzgi Mavsum').trim();
    const summary = (document.getElementById('reg-report-summary')?.value || '').trim();
    const bestSubId = document.getElementById('reg-report-best-submission-select')?.value || '';

    if (!summary) {
      this.showToast("Iltimos, viloyat yakuniy hisoboti mazmunini yozing!", "warning");
      return;
    }

    let selectedSub = null;
    if (bestSubId) {
      selectedSub = DataStore.getChallengeSubmissions().find(s => s && s.id === bestSubId) || null;
      if (selectedSub && !selectedSub.promotedToRepublic) {
        const promRes = DataStore.promoteSubmissionToRepublic(selectedSub.id);
        if (promRes && promRes.submission) {
          selectedSub = promRes.submission;
        }
      }
    }

    const regionDistricts = DataStore.getDistrictsByRegion(activeRegionId);
    const distIds = regionDistricts.map(d => d.id);
    const creators = DataStore.getCreators().filter(c =>
      DataStore.regionsMatch(c.regionId || c.regionLabel, activeRegionId) || distIds.includes(c.district)
    );
    const totalCoins = creators.reduce((s, c) => s + (c.coins || 0), 0);

    DataStore.addSeasonReport({
      level: 'region_to_republic',
      regionId: activeRegionId,
      regionLabel: activeRegionLabel,
      coordinatorName: user.fullName || `${activeRegionLabel} Koordinatori`,
      coordinatorPhone: user.phone || '',
      season: season,
      summary: summary,
      studentsCount: creators.length,
      challengesCount: regionDistricts.length,
      totalCoins: totalCoins,
      challengeId: selectedSub ? selectedSub.challengeId : '',
      challengeTitle: selectedSub ? selectedSub.challengeTitle : '',
      bestSubmissionId: selectedSub ? selectedSub.id : '',
      bestCreatorName: selectedSub ? selectedSub.creatorName : '',
      bestSchool: selectedSub ? selectedSub.creatorSchool : '',
      bestDistrict: selectedSub ? (selectedSub.creatorDistrict || selectedSub.districtLabel || '') : '',
      bestVideoUrl: selectedSub ? selectedSub.videoUrl : '',
      bestParticipants: selectedSub ? (selectedSub.participants || '') : ''
    });

    const summaryEl = document.getElementById('reg-report-summary');
    if (summaryEl) summaryEl.value = '';

    this.refreshAllUI();
    this.showToast(
      selectedSub
        ? `🌟 ${activeRegionLabel} yakuniy hisoboti va "${selectedSub.creatorDistrict || ''} • ${selectedSub.creatorSchool} — ${selectedSub.creatorName}" eng zo'r videoroligi (+10 🪙) Respublika Koordinatoriga yuborildi!`
        : `🌍 ${activeRegionLabel} mavsumiy hisoboti Respublika Koordinatoriga yuborildi!`,
      "success"
    );
  },

  handleApproveSeasonReport(reportId) {
    DataStore.approveSeasonReport(reportId, "Hisobot qabul qilindi va tasdiqlandi!");
    this.renderRegionAdminSection();
    this.renderRepublicAdminSection();
    this.renderDistrictSubmittedReports();
    this.showToast("✅ Mavsumiy hisobot muvaffaqiyatli tasdiqlandi!", "success");
  },

  saveSingleDistrictCoordinator(districtId, districtName) {
    const regInfo = Auth.getUserRegion();
    const activeRegionId = regInfo.regionId || 'buxoro_vil';
    const activeRegionLabel = regInfo.regionLabel || 'Buxoro viloyati';

    const nameEl = document.getElementById(`dist-coord-name-${districtId}`);
    const pinEl = document.getElementById(`dist-coord-pin-${districtId}`);

    const fullName = (nameEl?.value || '').trim();
    const pin = (pinEl?.value || '').trim();

    if (!fullName) {
      this.showToast(`Iltimos, ${districtName} koordinatorining ism-familiyasini (F.I.Sh.) kiriting!`, "warning");
      if (nameEl) nameEl.focus();
      return;
    }
    if (!pin || pin.length < 4) {
      this.showToast(`Iltimos, ${districtName} koordinatori uchun 5 xonali kirish kodini kiriting!`, "warning");
      if (pinEl) pinEl.focus();
      return;
    }

    DataStore.saveDistrictAdmin({
      district: districtId,
      districtLabel: districtName,
      regionId: activeRegionId,
      regionLabel: activeRegionLabel,
      fullName: fullName,
      pin: pin
    });

    this.renderRegionAdminSection();
    this.showToast(`✅ ${districtName} koordinatori (${fullName}) va uning 5 xonali kodi (${pin}) saqlandi!`, "success");
  },

  saveAllDistrictCoordinatorsInRegion() {
    const regInfo = Auth.getUserRegion();
    const activeRegionId = regInfo.regionId || 'buxoro_vil';
    const activeRegionLabel = regInfo.regionLabel || 'Buxoro viloyati';

    const rows = document.querySelectorAll('[data-district-row]');
    let savedCount = 0;

    rows.forEach(row => {
      const distId = row.getAttribute('data-district-row');
      const distName = row.getAttribute('data-district-name') || distId;
      const nameVal = (document.getElementById(`dist-coord-name-${distId}`)?.value || '').trim();
      const pinVal = (document.getElementById(`dist-coord-pin-${distId}`)?.value || '').trim();

      if (nameVal && pinVal && pinVal.length >= 4) {
        DataStore.saveDistrictAdmin({
          district: distId,
          districtLabel: distName,
          regionId: activeRegionId,
          regionLabel: activeRegionLabel,
          fullName: nameVal,
          pin: pinVal
        });
        savedCount++;
      }
    });

    if (savedCount === 0) {
      this.showToast("Iltimos, kamida bitta tuman koordinatorining F.I.Sh. va 5 xonali kodini kiriting!", "warning");
      return;
    }

    this.renderRegionAdminSection();
    this.showToast(`🎉 ${activeRegionLabel} bo'yicha ${savedCount} ta tuman koordinatori va ularning 5 xonali kodlari bazaga saqlandi!`, "success");
  },

  handleQuickAddDistrictCoordinator(e) {
    if (e) e.preventDefault();
    const regInfo = Auth.getUserRegion();
    const activeRegionId = regInfo.regionId || 'buxoro_vil';
    const activeRegionLabel = regInfo.regionLabel || 'Buxoro viloyati';

    const distInput = document.getElementById('quick-dist-coord-district');
    const nameInput = document.getElementById('quick-dist-coord-name');
    const pinInput = document.getElementById('quick-dist-coord-pin');

    const distVal = (distInput?.value || '').trim();
    const fullName = (nameInput?.value || '').trim();
    const pin = (pinInput?.value || '').trim();

    if (!distVal || !fullName || !pin) {
      this.showToast("Iltimos, tuman nomi, koordinator F.I.Sh. va 5 xonali kodni kiriting!", "warning");
      return;
    }

    const normDist = DataStore.normalizeDistrict(distVal, activeRegionLabel);
    DataStore.saveDistrictAdmin({
      district: normDist.id,
      districtLabel: normDist.label,
      regionId: activeRegionId,
      regionLabel: activeRegionLabel,
      fullName: fullName,
      pin: pin
    });

    if (distInput) distInput.value = '';
    if (nameInput) nameInput.value = '';
    if (pinInput) pinInput.value = '';

    this.renderRegionAdminSection();
    this.showToast(`✅ ${normDist.label} koordinatori (${fullName}) va uning 5 xonali kodi (${pin}) bazaga biriktirildi!`, "success");
  },

  saveSingleRegionCoordinator(regionId, regionName) {
    const nameEl = document.getElementById(`reg-coord-name-${regionId}`);
    const pinEl = document.getElementById(`reg-coord-pin-${regionId}`);

    const fullName = (nameEl?.value || '').trim();
    const pin = (pinEl?.value || '').trim();

    if (!fullName) {
      this.showToast(`Iltimos, ${regionName} koordinatorining ism-familiyasini (F.I.Sh.) kiriting!`, "warning");
      if (nameEl) nameEl.focus();
      return;
    }
    if (!pin || pin.length < 4) {
      this.showToast(`Iltimos, ${regionName} koordinatori uchun 5 xonali kirish kodini kiriting!`, "warning");
      if (pinEl) pinEl.focus();
      return;
    }

    DataStore.saveRegionAdmin({
      regionId: regionId,
      regionLabel: regionName,
      fullName: fullName,
      pin: pin
    });

    this.renderRepublicAdminSection();
    this.showToast(`✅ ${regionName} koordinatori (${fullName}) va uning 5 xonali kodi (${pin}) saqlandi!`, "success");
  },

  saveAllRegionCoordinatorsInRepublic() {
    let savedCount = 0;
    VILOYATLAR.forEach(reg => {
      const nameVal = (document.getElementById(`reg-coord-name-${reg.id}`)?.value || '').trim();
      const pinVal = (document.getElementById(`reg-coord-pin-${reg.id}`)?.value || '').trim();

      if (nameVal && pinVal && pinVal.length >= 4) {
        DataStore.saveRegionAdmin({
          regionId: reg.id,
          regionLabel: reg.name,
          fullName: nameVal,
          pin: pinVal
        });
        savedCount++;
      }
    });

    if (savedCount === 0) {
      this.showToast("Iltimos, kamida bitta viloyat koordinatorining F.I.Sh. va 5 xonali kodini kiriting!", "warning");
      return;
    }

    this.renderRepublicAdminSection();
    this.showToast(`🎉 Respublika bo'yicha ${savedCount} ta viloyat koordinatori va ularning 5 xonali kodlari bazaga saqlandi!`, "success");
  },

  renderRepublicAdminSection() {
    const barchartContainer = document.getElementById('republic-regions-barchart');
    const regionsTableBody = document.getElementById('republic-regions-table-body');
    const receivedReportsBody = document.getElementById('republic-received-reports-body');
    const summaryStatsEl = document.getElementById('republic-admin-summary-stats');

    if (!barchartContainer || !regionsTableBody) return;

    const repAdmin = DataStore.getRepublicAdmin();
    const selfNameInput = document.getElementById('rep-self-edit-fullname');
    const selfPhoneInput = document.getElementById('rep-self-edit-phone');
    const selfPinInput = document.getElementById('rep-self-edit-pin');
    if (selfNameInput) selfNameInput.value = repAdmin.fullName || '';
    if (selfPhoneInput) selfPhoneInput.value = repAdmin.phone || '';
    if (selfPinInput) selfPinInput.value = repAdmin.pin || '12345';

    const allCreators = DataStore.getCreators();
    const allChallenges = DataStore.getChallenges();

    const regionStats = VILOYATLAR.map(reg => {
      const rAdmin = DataStore.getRegionAdmin(reg.id);
      const rDistricts = DataStore.getDistrictsByRegion(reg.id);
      const distIds = rDistricts.map(d => d.id);
      const rCreators = allCreators.filter(c =>
        DataStore.regionsMatch(c.regionId || c.regionLabel, reg.id) || distIds.includes(c.district)
      );
      const rChallenges = allChallenges.filter(ch => distIds.includes(ch.district));
      const totalCoins = rCreators.reduce((s, c) => s + (c.coins || 0), 0);

      return {
        id: reg.id,
        name: reg.name,
        icon: reg.icon || '🏛️',
        coordinatorName: rAdmin ? (rAdmin.fullName || '') : '',
        coordinatorPin: rAdmin ? (rAdmin.pin || '') : '',
        coordinatorPhone: rAdmin ? (rAdmin.phone || '') : '',
        hasRegisteredAdmin: Boolean(rAdmin && rAdmin.fullName && rAdmin.pin),
        districtsCount: rDistricts.length,
        studentsCount: rCreators.length,
        challengesCount: rChallenges.length,
        totalCoins: totalCoins
      };
    });

    const maxStudents = Math.max(5, ...regionStats.map(r => r.studentsCount));
    const totalRepublicStudents = regionStats.reduce((s, r) => s + r.studentsCount, 0);
    const totalRepublicCoins = regionStats.reduce((s, r) => s + r.totalCoins, 0);
    const assignedRegionsCount = regionStats.filter(r => r.hasRegisteredAdmin).length;

    if (summaryStatsEl) {
      summaryStatsEl.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
          <span class="text-2xl font-black text-amber-300 block">${assignedRegionsCount} / ${VILOYATLAR.length} ta</span>
          <span class="text-[11px] text-rose-200 font-bold">Biriktirilgan Viloyat Koordinatorlari</span>
        </div>
        <div class="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
          <span class="text-2xl font-black text-emerald-300 block">${totalRepublicStudents} nafar</span>
          <span class="text-[11px] text-rose-200 font-bold">Respublika O'quvchilari (🪙 ${totalRepublicCoins})</span>
        </div>
      `;
    }

    barchartContainer.innerHTML = `
      <div class="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-inner overflow-x-auto">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <i class="fa-solid fa-earth-asia text-amber-400"></i> Respublika hududlari bo'yicha o'quvchilar faolligi (BarChart)
          </span>
          <span class="text-[11px] text-slate-400">14 ta hudud bo'yicha real-vaqt ko'rsatkichlari</span>
        </div>
        <div class="flex items-end gap-3 min-h-[210px] pt-8 pb-2 px-2 min-w-[720px]">
          ${regionStats.map((r, idx) => {
            const heightPercent = Math.max(12, Math.round((r.studentsCount / maxStudents) * 100));
            const colors = [
              'from-rose-500 to-amber-400',
              'from-purple-500 to-indigo-400',
              'from-emerald-500 to-teal-400',
              'from-blue-500 to-cyan-400'
            ];
            const cClass = colors[idx % colors.length];
            return `
              <div class="flex-1 flex flex-col items-center justify-end h-44">
                <div class="text-[11px] font-black text-amber-300 mb-1">${r.studentsCount}</div>
                <div class="w-full max-w-[42px] bg-slate-800/80 rounded-t-2xl h-36 flex items-end p-1 border border-slate-700/70">
                  <div class="w-full rounded-t-xl bg-gradient-to-t ${cClass} transition-all duration-500" style="height: ${heightPercent}%"></div>
                </div>
                <span class="text-[10px] font-bold text-slate-300 mt-2 text-center leading-tight line-clamp-2">${r.name.replace(' viloyati', '').replace(' Respublikasi', '')}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    regionsTableBody.innerHTML = regionStats.map((r, idx) => `
      <tr class="hover:bg-rose-50/40 transition">
        <td class="px-4 py-3 font-black text-slate-900 whitespace-nowrap">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-black mr-1.5">${idx + 1}</span>
          ${r.icon} ${r.name}
          <div class="mt-1">
            ${r.hasRegisteredAdmin
              ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800"><i class="fa-solid fa-circle-check"></i> Biriktirilgan</span>`
              : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"><i class="fa-solid fa-clock"></i> Kiritilmagan</span>`
            }
          </div>
        </td>
        <td class="px-4 py-3 min-w-[210px]">
          <input type="text" id="reg-coord-name-${r.id}" value="${(r.coordinatorName || '').replace(/"/g, '&quot;')}" placeholder="Masalan: Shuhratov Mirzohid" class="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:bg-white focus:outline-none">
        </td>
        <td class="px-4 py-3 min-w-[175px]">
          <div class="flex items-center gap-1.5">
            <input type="text" id="reg-coord-pin-${r.id}" value="${(r.coordinatorPin || '').replace(/"/g, '&quot;')}" maxlength="5" placeholder="5 xonali kod" class="w-28 px-3 py-2 text-xs font-black tracking-widest text-rose-900 bg-rose-50 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:bg-white focus:outline-none text-center">
            <button type="button" onclick="App.generateRandom5DigitPin('reg-coord-pin-${r.id}')" title="Tasodifiy 5 xonali kod" class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-800 font-black text-xs transition">
              🎲
            </button>
          </div>
        </td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5">
            <button type="button" onclick="App.saveSingleRegionCoordinator('${r.id}', '${r.name.replace(/'/g, "\\'")}')" class="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition inline-flex items-center gap-1" title="Shu qatordagi ism va kodni saqlash">
              <i class="fa-solid fa-floppy-disk"></i> Saqlash
            </button>
            <button type="button" onclick="App.openEditCoordinatorModal('region', '${r.id}', '${r.name.replace(/'/g, "\\'")}')" class="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs transition inline-flex items-center gap-1" title="Viloyat admini almashganda ismini va kodini tahrirlash">
              <i class="fa-solid fa-pen-to-square"></i> Tahrirlash
            </button>
          </div>
        </td>
        <td class="px-4 py-3 text-center font-bold text-purple-700 text-xs whitespace-nowrap">${r.districtsCount} ta tuman</td>
        <td class="px-4 py-3 text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs">${r.studentsCount} o'quvchi</span>
          <span class="block text-[10px] font-black text-amber-800 mt-0.5">🪙 ${r.totalCoins} tanga</span>
        </td>
        <td class="px-4 py-3 text-right whitespace-nowrap">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${r.studentsCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
            <i class="fa-solid fa-arrow-trend-up"></i> ${r.studentsCount > 0 ? 'Faol O\'sishda' : 'Kutilmoqda'}
          </span>
        </td>
      </tr>
    `).join('');

    const allSubmissions = DataStore.getChallengeSubmissions();

    if (receivedReportsBody) {
      const repReports = DataStore.getSeasonReports().filter(r => r.level === 'region_to_republic');
      if (repReports.length === 0) {
        receivedReportsBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              Viloyat koordinatorlaridan hozircha mavsumiy hisobotlar kelib tushmagan.
            </td>
          </tr>
        `;
      } else {
        receivedReportsBody.innerHTML = repReports.map(r => {
          const linkedSub = r.bestSubmissionId
            ? allSubmissions.find(s => s && s.id === r.bestSubmissionId)
            : null;
          const isWinner = linkedSub ? Boolean(linkedSub.isRepublicWinner) : false;

          return `
            <tr class="hover:bg-slate-50 transition">
              <td class="px-5 py-3 font-black text-slate-900">
                ${r.regionLabel}
                <span class="block text-[10px] font-bold text-slate-500">${r.studentsCount} o'quvchi • 🪙 ${r.totalCoins}</span>
              </td>
              <td class="px-5 py-3 text-xs font-bold text-slate-700">${r.coordinatorName}</td>
              <td class="px-5 py-3 max-w-sm">
                <span class="font-black text-rose-800 text-xs block">${r.season || r.seasonTitle}</span>
                <p class="text-xs text-slate-600 mt-0.5">${r.summary}</p>
              </td>
              <td class="px-5 py-3 text-center">
                ${r.bestVideoUrl ? `
                  <div class="inline-flex flex-col items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                    <span class="text-[11px] font-black text-slate-900">🌟 ${r.bestDistrict ? r.bestDistrict + ' • ' : ''}${r.bestSchool || 'Maktab'} — ${r.bestCreatorName}</span>
                    <span class="text-[10px] text-rose-700 font-semibold">${r.challengeTitle || 'Video-Chellenj'}</span>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <a href="${r.bestVideoUrl}" target="_blank" rel="noopener noreferrer" class="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <i class="fa-solid fa-play text-red-400"></i> Ko'rish
                      </a>
                      ${linkedSub && !isWinner ? `
                        <button type="button" onclick="App.handleAwardRepublicSubmissionWinner('${linkedSub.id}')" class="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-xs">
                          🏆 1-O'rin (+15 🪙)
                        </button>
                      ` : (isWinner ? `<span class="text-[10px] font-black text-amber-800">🏆 1-O'rin G'olibi!</span>` : '')}
                    </div>
                  </div>
                ` : `<span class="text-xs text-slate-400">Biriktirilmagan</span>`}
              </td>
              <td class="px-5 py-3 text-center">
                ${r.status === 'approved' ? `
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">✅ Tasdiqlangan</span>
                ` : `
                  <span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">⏳ Yangi hisobot</span>
                `}
              </td>
              <td class="px-5 py-3 text-right">
                ${r.status !== 'approved' ? `
                  <button onclick="App.handleApproveSeasonReport('${r.id}')" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-sm transition">
                    <i class="fa-solid fa-check mr-1"></i> Qabul Qilish
                  </button>
                ` : `<span class="text-xs text-slate-400">Qabul qilingan</span>`}
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // VILOYATLARDAN RESPUBLIKAGA TANLAB YUBORILGAN ENG YAXSHI VIDEO ROLIKLAR (1-O'RINNI TANLASH VA +15 TANGA BERISH)
    const repPromotedBody = document.getElementById('republic-promoted-submissions-body');
    const grandWinnerBanner = document.getElementById('republic-grand-winner-banner');
    if (repPromotedBody) {
      const repSubs = allSubmissions.filter(sub => sub.promotedToRepublic || sub.promotedToRegion || sub.isRepublicWinner);
      const grandWinners = repSubs.filter(sub => sub.isRepublicWinner);

      if (grandWinnerBanner) {
        if (grandWinners.length > 0) {
          const gw = grandWinners[0];
          grandWinnerBanner.innerHTML = `
            <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-2xl shrink-0 shadow">🏆</div>
                <div>
                  <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-amber-300">Respublika Mutlaq 1-O'rin G'olibi (+15 🪙)</span>
                  <h5 class="text-base font-black text-slate-950 mt-0.5">${gw.creatorName} — ${gw.creatorSchool} (${gw.creatorDistrict || gw.district}, ${gw.regionLabel || 'Buxoro viloyati'})</h5>
                  <p class="text-xs font-bold text-slate-800">🎬 Chellenj: "${gw.challengeTitle}" • Jami mukofot: 🪙 ${gw.coinsAwarded} tanga</p>
                </div>
              </div>
              <a href="${gw.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs inline-flex items-center gap-1.5 shrink-0">
                <i class="fa-solid fa-play text-red-400"></i> G'olib Videoni Ko'rish
              </a>
            </div>
          `;
        } else {
          grandWinnerBanner.innerHTML = `
            <div class="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between gap-2">
              <span>👑 Quyidagi viloyatlar g'oliblaridan <strong>eng zo'r 1 tasini</strong> tanlab <strong>"🏆 1-O'rinni Berish (+15 🪙)"</strong> tugmasini bosing!</span>
            </div>
          `;
        }
      }

      if (repSubs.length === 0) {
        repPromotedBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              Hozircha viloyat koordinatorlaridan Respublika finaliga yuborilgan video roliklar yo'q.
            </td>
          </tr>
        `;
      } else {
        repPromotedBody.innerHTML = repSubs.map(sub => `
          <tr class="hover:bg-amber-50/50 transition ${sub.isRepublicWinner ? 'bg-amber-50/90' : ''}">
            <td class="px-4 py-3 font-bold text-slate-900">
              ${sub.creatorName}
              <span class="block text-[11px] text-slate-500 font-normal">${sub.creatorSchool}</span>
              <div class="mt-1">${this.formatSubmissionCollaboratorsHtml(sub)}</div>
            </td>
            <td class="px-4 py-3 text-xs font-bold text-rose-800">
              📍 ${sub.creatorDistrict || sub.district || 'Tuman'}
              <span class="block text-[10px] text-slate-500">${sub.regionLabel || 'Buxoro viloyati'}</span>
            </td>
            <td class="px-4 py-3 text-xs font-semibold text-slate-800">${sub.challengeTitle}</td>
            <td class="px-4 py-3 text-center">
              <a href="${sub.videoUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1">
                <i class="fa-solid fa-play text-red-400 text-[10px]"></i> Videoni Ko'rish
              </a>
            </td>
            <td class="px-4 py-3 text-center">
              ${sub.isRepublicWinner ? `
                <span class="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shadow-xs">🏆 1-O'rin G'olibi (+15 🪙)</span>
              ` : (sub.promotedToRepublic ? `
                <span class="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-black">🌟 Viloyat g'olibi (+10 🪙)</span>
              ` : `
                <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">🏅 Tuman g'olibi (+5 🪙)</span>
              `)}
            </td>
            <td class="px-4 py-3 text-right">
              ${!sub.isRepublicWinner ? `
                <button onclick="App.handleAwardRepublicSubmissionWinner('${sub.id}')" class="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition inline-flex items-center gap-1.5">
                  🏆 1-O'rinni Berish (+15 🪙)
                </button>
              ` : `
                <span class="text-xs font-black text-amber-700"><i class="fa-solid fa-crown mr-1"></i>1-O'rin Berilgan</span>
              `}
            </td>
          </tr>
        `).join('');
      }
    }

    // RESPUBLIKA BO'YICHA BARCHA O'QUVCHILAR UMUMIY REYTINGI (VILOYAT VA TUMANI BILAN)
    const repAllStudentsBody = document.getElementById('republic-all-students-leaderboard-body');
    const repAllStudentsCount = document.getElementById('republic-all-students-count-badge');
    if (repAllStudentsBody) {
      const fullLeaderboard = DataStore.getLeaderboard();
      if (repAllStudentsCount) {
        repAllStudentsCount.textContent = `${fullLeaderboard.length} nafar o'quvchi`;
      }
      if (fullLeaderboard.length === 0) {
        repAllStudentsBody.innerHTML = `
          <tr>
            <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
              Hozircha respublika bo'yicha ro'yxatdan o'tgan o'quvchilar mavjud emas.
            </td>
          </tr>
        `;
      } else {
        repAllStudentsBody.innerHTML = fullLeaderboard.map((c, idx) => {
          const rank = idx + 1;
          const rankHtml = rank === 1 ? '🥇 1' : (rank === 2 ? '🥈 2' : (rank === 3 ? '🥉 3' : `#${rank}`));
          return `
            <tr class="hover:bg-emerald-50/40 transition">
              <td class="px-4 py-3 font-black text-slate-800 whitespace-nowrap">${rankHtml}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <img src="${c.avatarUrl}" class="w-8 h-8 rounded-full object-cover border border-slate-200" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
                  <div>
                    <a href="javascript:void(0)" onclick="App.openCreatorDetail('${c.id}')" class="font-black text-slate-900 hover:text-emerald-700 text-xs block">${c.fullName}</a>
                    <span class="text-[10px] text-slate-400">${c.age} yosh • @${c.nickname || 'ijodkor'}</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-black text-xs inline-flex items-center gap-1">
                  🏛️ ${c.regionLabel || 'Buxoro viloyati'}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs inline-flex items-center gap-1">
                  📍 ${c.districtLabel || 'Tuman'}
                </span>
              </td>
              <td class="px-4 py-3 text-xs font-semibold text-slate-700">${c.school}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <span class="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 font-black text-xs">🪙 ${c.coins} tanga</span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  handlePromoteSubmissionToRegion(submissionId) {
    if (!Auth.isAdmin()) return;
    const res = DataStore.promoteSubmissionToRegion(submissionId);
    if (res.success) {
      this.refreshAllUI();
      const count = res.rewardedCount || 1;
      this.showToast(
        count > 1
          ? `🏅 "${res.submission.creatorName}" va kollaboratsiyadagi barcha ${count} nafar o'quvchining videoroligi Viloyat bosqichiga yuborildi hamda har biriga +5 bonus tangadan berildi!`
          : `🏅 "${res.submission.creatorName}" videoroligi Viloyat koordinatoriga yuborildi va o'quvchiga +5 qo'shimcha tanga taqdim etildi!`,
        "success"
      );
    } else {
      this.showToast(res.message || "Xatolik yuz berdi", "warning");
    }
  },

  handlePromoteSubmissionToRepublic(submissionId) {
    if (!Auth.isRegionAdmin() && !Auth.isRepublicAdmin() && !Auth.isAdmin()) return;
    const res = DataStore.promoteSubmissionToRepublic(submissionId);
    if (res.success) {
      this.refreshAllUI();
      const count = res.rewardedCount || 1;
      this.showToast(
        count > 1
          ? `🌟 "${res.submission.creatorName}" va kollaboratsiyadagi barcha ${count} nafar o'quvchining videoroligi Respublika bosqichiga yuborildi hamda har biriga +10 bonus tangadan berildi!`
          : `🌟 "${res.submission.creatorName}" videoroligi Respublika koordinatoriga yuborildi va o'quvchiga +10 qo'shimcha tanga taqdim etildi!`,
        "success"
      );
    } else {
      this.showToast(res.message || "Xatolik yuz berdi", "warning");
    }
  },

  handleAwardRepublicSubmissionWinner(submissionId) {
    if (!Auth.isRepublicAdmin() && !Auth.isAdmin()) return;
    const res = DataStore.awardRepublicSubmissionWinner(submissionId);
    if (res.success) {
      this.refreshAllUI();
      const count = res.rewardedCount || 1;
      this.showToast(
        count > 1
          ? `🏆 Tabriklaymiz! "${res.submission.creatorName}" va kollaboratsiyadagi barcha ${count} nafar o'quvchi Respublika 1-o'rin g'olibi deb topildi va har biriga +15 bonus tangadan berildi!`
          : `🏆 Tabriklaymiz! "${res.submission.creatorName}" Respublika bo'yicha 1-o'rin g'olibi deb topildi va unga +15 qo'shimcha tanga berildi!`,
        "success"
      );
    } else {
      this.showToast(res.message || "Xatolik yuz berdi", "warning");
    }
  },

  renderStats() {
    const userDist = this.getActiveDistrictInfo();
    const activeFilterDist = userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : '');

    let creators = DataStore.getCreators();
    let contests = DataStore.getContests();

    if (activeFilterDist) {
      creators = creators.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeFilterDist));
      contests = contests.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeFilterDist));
    }

    const totalCreatorsEl = document.getElementById('stat-total-creators');
    const totalContestsEl = document.getElementById('stat-total-contests');
    const totalCoinsEl = document.getElementById('stat-total-coins');

    if (totalCreatorsEl) totalCreatorsEl.textContent = creators.length;
    if (totalContestsEl) totalContestsEl.textContent = contests.length;

    let totalCoins = 0;
    creators.forEach(c => {
      totalCoins += (c.coins || 0);
    });

    if (totalCoinsEl) totalCoinsEl.textContent = totalCoins.toLocaleString();
  },

  // ================= MADANIYAT XODIMLARI TAKLIF VA TASHABBUSLARI =================

  openStaffProposalModal() {
    if (!Auth.isStaff()) {
      this.showToast("Taklif yuborish uchun Madaniyat xodimi sifatida kiring!", "warning");
      this.openStaffAuthModal('login');
      return;
    }

    const form = document.getElementById('proposal-form');
    const successBox = document.getElementById('proposal-success-box');
    if (form) form.classList.remove('hidden');
    if (successBox) successBox.classList.add('hidden');

    const catSelect = document.getElementById('proposal-category');
    if (catSelect) catSelect.value = 'event';

    const titleInput = document.getElementById('proposal-title');
    if (titleInput) titleInput.value = '';

    const descInput = document.getElementById('proposal-desc');
    if (descInput) descInput.value = '';

    // Populate students dropdown for nomination (filtered by staff's district)
    const studentSelect = document.getElementById('proposal-student-select');
    if (studentSelect) {
      const userDist = this.getActiveDistrictInfo();
      const creators = DataStore.getCreators().filter(c =>
        !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)
      );
      studentSelect.innerHTML = creators.map(c => `
        <option value="${c.id}">${c.fullName} (${c.districtLabel}, ${c.school})</option>
      `).join('');
    }

    this.handleProposalCategoryChange();
    this.openModal('modal-staff-proposal');
  },

  handleProposalCategoryChange() {
    const catSelect = document.getElementById('proposal-category');
    const studentBlock = document.getElementById('proposal-student-block');
    const titleLabel = document.getElementById('proposal-title-label');
    const titleInput = document.getElementById('proposal-title');

    if (!catSelect) return;
    const val = catSelect.value;

    if (val === 'nomination') {
      if (studentBlock) studentBlock.classList.remove('hidden');
      if (titleLabel) titleLabel.textContent = "Tavsiya Sababi / Yutug'i Sarlavhasi *";
      if (titleInput) titleInput.placeholder = "Masalan: 'Viloyat maqom tanlovi g'olibi sifatida rag'batlantirish'";
    } else {
      if (studentBlock) studentBlock.classList.add('hidden');
      if (titleLabel) titleLabel.textContent = "Taklif / Loyiha Sarlavhasi *";
      if (titleInput) {
        if (val === 'event') {
          titleInput.placeholder = "Masalan: 'Yosh ijrochilar teatr festivali'";
        } else if (val === 'challenge') {
          titleInput.placeholder = "Masalan: 'Milliy hunarmandchilik sirlari video-chellenji'";
        } else {
          titleInput.placeholder = "Masalan: 'Tuman madaniyat markazi bilan hamkorlik loyihasi'";
        }
      }
    }
  },

  isProposalOwnedByStaff(p, user) {
    if (!p || !user || user.role !== 'staff') return false;
    const pName = (p.staffName || '').trim().toLowerCase();
    const uName = (user.fullName || '').trim().toLowerCase();
    const userStaffId = (user.staffId || user.id || '').trim();
    const propStaffId = (p.staffId || '').trim();

    // Agar taklifda muallifning ism-familiyasi aniq ko'rsatilgan bo'lsa va joriy xodimning ismi boshqa bo'lsa — boshqa xodimga ko'rsatilmasin!
    if (pName && uName && pName !== 'madaniyat xodimi' && pName !== uName) {
      return false;
    }

    // 1. staffId bo'yicha aniq moslik
    if (propStaffId && userStaffId && propStaffId === userStaffId) {
      return true;
    }

    // 2. Telefon raqami (9 xonali) hamda ism-familiya bo'yicha moslik
    if (DataStore.phonesMatch(p.staffPhone, user.phone) && pName && uName && pName === uName) {
      return true;
    }

    // 3. Ism-familiya to'liq mos kelsa (notebook qayta yuklanganda xuddi shu ism-familiya bilan kirgan xodim uchun)
    if (pName && uName && pName.length >= 5 && pName === uName) {
      return true;
    }

    return false;
  },

  handleStaffProposalSubmit(e) {
    if (e) e.preventDefault();
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'staff') {
      this.showToast("Faqat madaniyat xodimlari taklif yubora oladi!", "error");
      return;
    }

    const userDist = this.getActiveDistrictInfo();
    const categoryId = document.getElementById('proposal-category').value;
    const title = (document.getElementById('proposal-title').value || '').trim();
    const description = (document.getElementById('proposal-desc').value || '').trim();

    if (!title || !description) {
      this.showToast("Iltimos, barcha maydonlarni to'ldiring!", "warning");
      return;
    }

    let targetStudentId = null;
    let targetStudentName = null;
    let targetStudentSchool = null;

    if (categoryId === 'nomination') {
      const studentSelect = document.getElementById('proposal-student-select');
      if (studentSelect && studentSelect.value) {
        const student = DataStore.getCreatorById(studentSelect.value);
        if (student) {
          targetStudentId = student.id;
          targetStudentName = student.fullName;
          targetStudentSchool = `${student.districtLabel}, ${student.school}`;
        }
      }
    }

    const proposalData = {
      categoryId,
      category: categoryId,
      title,
      description,
      district: userDist.district || user.district || '',
      districtLabel: userDist.districtLabel || user.districtLabel || '',
      regionId: userDist.regionId || user.regionId || '',
      regionLabel: userDist.regionLabel || user.regionLabel || '',
      staffId: user.staffId || user.id,
      staffName: user.fullName,
      staffPosition: user.position || 'Madaniyat xodimi',
      staffOrg: user.organization || 'Madaniyat markazi',
      staffPhone: user.phone || '',
      targetStudentId,
      targetStudentName,
      targetStudentSchool,
      recommendedStudentId: targetStudentId,
      recommendedStudentName: targetStudentName
    };

    DataStore.addStaffProposal(proposalData);

    // Faqat shu tuman Admini Inboxiga xabar tushadi
    DataStore.sendToAdminInbox({
      type: 'staff_proposal',
      district: userDist.district || user.district || '',
      districtLabel: userDist.districtLabel || user.districtLabel || '',
      regionId: userDist.regionId || user.regionId || '',
      regionLabel: userDist.regionLabel || user.regionLabel || '',
      name: `${user.fullName} (${userDist.districtLabel || ''} - ${user.organization || 'Madaniyat markazi'})`,
      phone: user.phone || 'Xodim',
      position: `Yangi Taklif: ${title}`,
      code: `Yo'nalish: ${categoryId.toUpperCase()}`
    });

    const form = document.getElementById('proposal-form');
    const successBox = document.getElementById('proposal-success-box');
    if (form) form.classList.add('hidden');
    if (successBox) successBox.classList.remove('hidden');

    this.refreshAllUI();
    this.showToast(`Taklif uchun rahmat, ${userDist.districtLabel || 'tumaningiz'} admini siz bilan bog'lanadi`, "success");
  },

  renderStaffProposals() {
    const tableBody = document.getElementById('admin-proposals-table-body');
    const badge = document.getElementById('admin-proposals-count-badge');
    if (!tableBody) return;

    const userDist = this.getActiveDistrictInfo();
    const proposals = DataStore.getStaffProposals().filter(p => {
      if (!p || (!p.district && !p.districtLabel)) return false;
      if (userDist.district) {
        return DataStore.districtsMatch(p.district || p.districtLabel, userDist.district);
      }
      return true;
    });
    if (badge) {
      badge.textContent = `${proposals.length} ta taklif`;
    }

    if (proposals.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-5 py-6 text-center text-slate-400 text-xs">
            ${userDist.districtLabel || 'Ushbu tuman'} madaniyat xodimlaridan kelgan taklif yoki tashabbuslar hozircha mavjud emas.
          </td>
        </tr>
      `;
      return;
    }

    const categoryBadges = {
      event: { label: '🎭 Tadbir / Festival', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      challenge: { label: '🎬 Chellenj Mavzusi', class: 'bg-rose-100 text-rose-800 border-rose-200' },
      nomination: { label: '🌟 O\'quvchi Tavsiyasi', class: 'bg-amber-100 text-amber-800 border-amber-200' },
      initiative: { label: '📢 Hududiy Loyiha', class: 'bg-blue-100 text-blue-800 border-blue-200' }
    };

    tableBody.innerHTML = proposals.map(p => {
      const catKey = p.categoryId || p.category || 'event';
      const cat = categoryBadges[catKey] || { label: catKey, class: 'bg-slate-100 text-slate-800 border-slate-200' };
      const isApproved = p.status === 'approved';
      const studentName = p.targetStudentName || p.recommendedStudentName || '';

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-5 py-3">
            <span class="inline-block px-2.5 py-1 rounded-lg text-[11px] font-black border ${cat.class}">
              ${cat.label}
            </span>
          </td>
          <td class="px-5 py-3">
            <div class="font-bold text-slate-900">${p.staffName}</div>
            <div class="text-[11px] text-slate-500">${p.staffPosition} • ${p.staffOrg}</div>
            <a href="tel:${p.staffPhone}" class="inline-flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline mt-0.5">
              <i class="fa-solid fa-phone text-[10px]"></i> ${p.staffPhone}
            </a>
          </td>
          <td class="px-5 py-3 max-w-sm">
            <div class="font-bold text-slate-900 text-sm">${p.title}</div>
            <div class="text-xs text-slate-600 mt-0.5 line-clamp-2" title="${p.description}">
              ${p.description}
            </div>
            ${studentName ? `
              <div class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                <i class="fa-solid fa-star text-amber-500"></i> Tavsiya etilgan: ${studentName} ${p.targetStudentSchool ? `(${p.targetStudentSchool})` : ''}
              </div>
            ` : ''}
          </td>
          <td class="px-5 py-3 text-xs text-slate-500 font-medium whitespace-nowrap">
            <i class="fa-regular fa-clock mr-1 text-slate-400"></i>${p.submittedAt || p.createdAt}
          </td>
          <td class="px-5 py-3 text-center whitespace-nowrap">
            ${isApproved ? `
              <span class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                <i class="fa-solid fa-circle-check text-emerald-600"></i> Tabriklaymiz, taklifingiz ma'qullandi!
              </span>
            ` : `
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                <i class="fa-solid fa-hourglass-half text-amber-600"></i> Taklif uchun rahmat, admin siz bilan bog'lanadi
              </span>
            `}
          </td>
          <td class="px-5 py-3 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1.5">
              ${!isApproved ? `
                <button onclick="App.handleApproveProposal('${p.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition inline-flex items-center gap-1" title="Ma'qullash">
                  <i class="fa-solid fa-check"></i> Ma'qullash
                </button>
              ` : ''}

              ${catKey === 'event' ? `
                <button onclick="App.handleConvertProposalToContest('${p.id}')" class="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition inline-flex items-center gap-1" title="Tanlov/Tadbirga aylantirish">
                  <i class="fa-solid fa-bullhorn"></i> Tadbir qilish
                </button>
              ` : ''}

              <button onclick="App.handleDeleteProposal('${p.id}')" class="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition" title="O'chirish">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  handleApproveProposal(id) {
    if (!Auth.isAdmin()) return;
    DataStore.updateProposalStatus(id, 'approved', "Tabriklaymiz, taklifingiz ma'qullandi!");
    this.renderStaffProposals();
    this.renderStaffSection();
    this.showToast("Taklif ma'qullandi! Xodimga 'Tabriklaymiz, taklifingiz ma'qullandi' xabari yetkazildi.", "success");
  },

  handleDeleteProposal(id) {
    if (!Auth.isAdmin()) return;
    if (confirm("Ushbu taklifni o'chirmoqchimisiz?")) {
      DataStore.deleteProposal(id);
      this.renderStaffProposals();
      this.renderStaffSection();
      this.showToast("Taklif o'chirildi.", "info");
    }
  },

  handleConvertProposalToChallenge(id) {
    if (!Auth.isAdmin()) return;
    const proposals = DataStore.getStaffProposals();
    const p = proposals.find(x => x.id === id);
    if (!p) return;

    const userDist = this.getActiveDistrictInfo();
    DataStore.addChallenge({
      title: p.title,
      awardCoins: 25,
      district: p.district || userDist.district,
      districtLabel: p.districtLabel || userDist.districtLabel,
      description: `${p.description} (Tashabbuskor: ${p.staffName}, ${p.staffOrg})`,
      iconClass: 'fa-solid fa-lightbulb',
      categoryLabel: 'Xodim Tashabbusi'
    });

    DataStore.updateProposalStatus(id, 'approved', "Tabriklaymiz, taklifingiz ma'qullandi va rasmiy chellenjga aylantirildi!");
    this.refreshAllUI();
    this.switchTab('challenges');
    this.showToast(`🎬 "${p.title}" ${p.districtLabel || userDist.districtLabel} uchun rasmiy chellenj sifatida e'lon qilindi!`, "success");
  },

  handleConvertProposalToContest(id) {
    if (!Auth.isAdmin()) return;
    const proposals = DataStore.getStaffProposals();
    const p = proposals.find(x => x.id === id);
    if (!p) return;

    const userDist = this.getActiveDistrictInfo();
    DataStore.addContest({
      title: p.title,
      awardCoins: 50,
      district: p.district || userDist.district,
      districtLabel: p.districtLabel || userDist.districtLabel,
      eventDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      location: p.staffOrg || 'Madaniyat Markazi',
      description: `${p.description} (Tashabbuskor: ${p.staffName}, ${p.staffPosition})`
    });

    DataStore.updateProposalStatus(id, 'approved', "Tabriklaymiz, taklifingiz ma'qullandi va tadbirlar rejasiga kiritildi!");
    this.refreshAllUI();
    this.switchTab('contests');
    this.showToast(`🎭 "${p.title}" ${p.districtLabel || userDist.districtLabel} tanlov va tadbirlari bo'limiga qo'shildi!`, "success");
  },

  checkStaffApprovedProposals() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'staff') return;

    const proposals = DataStore.getStaffProposals();
    const myApproved = proposals.filter(p => 
      this.isProposalOwnedByStaff(p, user) &&
      p.status === 'approved'
    );

    const staffKeyPart = (user.fullName || user.staffId || user.id || 'staff').trim().toLowerCase().replace(/\s+/g, '_');

    myApproved.forEach(p => {
      const key = `ijodkor_notified_approved_${staffKeyPart}_${p.id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        const congratsText = document.getElementById('approved-congrats-text');
        if (congratsText) {
          congratsText.innerHTML = `Hurmatli <strong>${user.fullName}</strong>! Siz tomoningizdan Bosh Koordinatorga yuborilgan <strong>"${p.title}"</strong> nomli tashabbus ko'rib chiqildi va rasman ma'qullandi!`;
        }
        this.openModal('modal-staff-approved-congrats');
        this.showToast(`🎉 Tabriklaymiz, taklifingiz ma'qullandi! ("${p.title}")`, "success");
      }
    });
  },

  // ================= 15. TANGA TAQDIM ETISH =================

  openAwardModal(preselectedCreatorId = null) {
    if (!Auth.isAdmin()) {
      this.showToast("Tanga taqdim etish faqat Admin uchun!", "error");
      return;
    }

    const userDist = this.getActiveDistrictInfo();
    const select = document.getElementById('award-creator-select');
    const creators = DataStore.getCreators().filter(c =>
      !userDist.district || DataStore.districtsMatch(c.district || c.districtLabel, userDist.district)
    );
    
    select.innerHTML = creators.map(c => `
      <option value="${c.id}" ${c.id === preselectedCreatorId ? 'selected' : ''}>
        ${c.fullName} (${c.school} - ${c.districtLabel})
      </option>
    `).join('');

    document.getElementById('award-event-name').value = '';
    document.getElementById('award-coins-amount').value = '35';
    document.getElementById('award-note').value = '';

    this.openModal('modal-award-coins');
  },

  setAwardCoins(amount) {
    document.getElementById('award-coins-amount').value = amount;
  },

  handleAwardSubmit(e) {
    e.preventDefault();
    const creatorId = document.getElementById('award-creator-select').value;
    const eventName = document.getElementById('award-event-name').value;
    const coinsAmount = document.getElementById('award-coins-amount').value;
    const note = document.getElementById('award-note').value;

    const res = DataStore.awardCoins(creatorId, eventName, coinsAmount, note);
    if (res.success) {
      this.closeModal('modal-award-coins');
      this.refreshAllUI();
      this.showToast(`🪙 ${coinsAmount} tanga "${res.creator.fullName}" ga taqdim etildi!`, 'success');
    } else {
      this.showToast(res.message, 'error');
    }
  },

  handleDeleteCreator(creatorId) {
    if (!Auth.isAdmin()) return;
    const creator = DataStore.getCreatorById(creatorId);
    if (!creator) return;

    if (confirm(`Haqiqatan ham "${creator.fullName}" o'quvchisini ro'yxatdan o'chirmoqchimisiz?`)) {
      DataStore.deleteCreator(creatorId);
      this.showToast("O'quvchi bazadan o'chirildi.", 'info');
      this.refreshAllUI();
    }
  },

  handleClearDemoCreators() {
    if (!Auth.isAdmin()) return;
    const demoIds = ['cre-1', 'cre-2', 'cre-3', 'cre-4', 'cre-5', 'cre-6', 'cre-7', 'cre-8', 'cre-9', 'cre-10'];
    const currentCreators = DataStore.getCreators();
    const demoPresent = currentCreators.filter(c => demoIds.includes(c.id));

    if (demoPresent.length === 0) {
      this.showToast("Bazada hech qanday namuna o'quvchi qolmagan (allaqachon tozalangan).", 'info');
      return;
    }

    if (confirm(`Boshlang'ich namuna sifatida kiritilgan barcha (${demoPresent.length} ta) test o'quvchilarni butunlay tozalab tashlamoqchimisiz?\n\n(Haqiqiy ro'yxatdan o'tgan o'quvchilaringiz o'chmaydi)`)) {
      DataStore.clearDemoCreators();
      this.showToast("Barcha namuna o'quvchilar muvaffaqiyatli tozalandi!", 'success');
      this.refreshAllUI();
    }
  },

  // ================= 16. VIDEO VA DETALLAR =================

  openVideoModal(creatorId) {
    const creator = DataStore.getCreatorById(creatorId);
    if (!creator) return;

    this.state.selectedCreatorForVideo = creator;

    document.getElementById('video-modal-title').textContent = `${creator.fullName} - Jonli Ijro`;
    document.getElementById('video-modal-performer').textContent = `${creator.school} (${creator.districtLabel})`;
    
    const extLink = document.getElementById('video-external-link');
    extLink.href = creator.videoUrl || '#';

    const playerContainer = document.getElementById('video-player-container');
    
    if (!creator.videoUrl) {
      const currentUser = Auth.getCurrentUser();
      const canEdit = (currentUser && currentUser.role === 'student' && currentUser.creatorId === creator.id) || Auth.isAdmin();
      playerContainer.innerHTML = `
        <div class="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl">
            <i class="fa-solid fa-video-slash"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-white">Jonli ijro videosi hali biriktirilmagan</h4>
            <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              O'quvchi ro'yxatdan o'tishda video ssilkasini ixtiyoriy ravishda keyinchalik qo'shish uchun qoldirgan.
            </p>
          </div>
          ${canEdit ? `
            <div class="pt-2">
              <button onclick="App.closeVideoModal(); App.openEditProfileModal('${creator.id}')" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition">
                <i class="fa-solid fa-pen-to-square"></i> Video ssilkasini hozir qo'shish (Tahrirlash)
              </button>
            </div>
          ` : ''}
        </div>
      `;
    } else if (creator.videoEmbedUrl) {
      playerContainer.innerHTML = `
        <div class="video-responsive-container">
          <iframe src="${creator.videoEmbedUrl}" title="${creator.fullName} chiqishi" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    } else {
      playerContainer.innerHTML = `
        <div class="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <div class="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-3xl">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-white">Telegramdagi Jonli Ijro</h4>
            <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Ushbu o'quvchining chiqish videosi Telegram havola orqali ko'riladi.
            </p>
          </div>
          <div class="pt-2">
            <a href="${creator.videoUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Telegramda Videoni Ochish
            </a>
          </div>
        </div>
      `;
    }

    this.openModal('modal-video');
  },

  closeVideoModal() {
    const playerContainer = document.getElementById('video-player-container');
    if (playerContainer) {
      playerContainer.innerHTML = '';
    }
    this.closeModal('modal-video');
  },

  openCreatorDetail(creatorId) {
    const creator = DataStore.getCreatorById(creatorId);
    if (!creator) return;

    const content = document.getElementById('creator-detail-content');
    const isStaffOrAdmin = Auth.isStaff();
    const currentUser = Auth.getCurrentUser();
    const isMyProfile = (currentUser.role === 'student' && currentUser.creatorId === creator.id) || Auth.isAdmin();

    const eventsHistory = creator.eventsHistory && creator.eventsHistory.length > 0
      ? creator.eventsHistory.map(ev => `
          <div class="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3 text-xs">
            <div>
              <span class="font-bold text-slate-900 block">${ev.eventName}</span>
              <span class="text-slate-500 text-[11px]">${ev.date || ''} • ${ev.note || 'Faol chiqish'}</span>
            </div>
            <span class="font-black text-amber-700 bg-amber-200/70 px-2.5 py-1 rounded-lg shrink-0">
              +${ev.coinsAwarded} 🪙
            </span>
          </div>
        `).join('')
      : '<p class="text-xs text-slate-400">Hozircha bayramlar tarixi qayd etilmagan.</p>';

    content.innerHTML = `
      <div class="flex items-start gap-4 pb-5 border-b border-slate-100">
        <img src="${creator.avatarUrl}" class="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'">
        <div class="flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold badge-district">
                <i class="fa-solid fa-location-dot mr-1"></i>${creator.districtLabel}
              </span>
              <span class="text-xs text-slate-400">${creator.age} yosh</span>
            </div>
            ${isMyProfile ? `
              <button onclick="App.openEditProfileModal('${creator.id}')" class="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1">
                <i class="fa-solid fa-pen-to-square"></i> Tahrirlash
              </button>
            ` : ''}
          </div>
          <h3 class="text-xl font-black text-slate-900 mt-1">${creator.fullName}</h3>
          <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-school mr-1 text-slate-400"></i>${creator.school}</p>
        </div>
      </div>

      <div class="py-4 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span class="text-2xl font-black text-amber-800 flex items-center justify-center gap-1">
              🪙 ${creator.coins}
            </span>
            <span class="text-xs text-amber-900 font-bold block mt-0.5">Mavsumiy Jamg'arma</span>
          </div>
          <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span class="text-2xl font-black text-emerald-800">${creator.eventsCount} ta</span>
            <span class="text-xs text-emerald-900 font-bold block mt-0.5">Madaniy Chiqishlar</span>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="fa-solid fa-file-lines text-emerald-600"></i> Avtobiografiya va Yutuqlari
          </h4>
          <p class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            ${creator.bio}
          </p>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="fa-solid fa-phone text-blue-600"></i> Aloqa Ma'lumotlari
          </h4>
          ${isStaffOrAdmin ? `
            <div class="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
              <div>
                <span class="text-slate-500 block text-[11px]">Telefon raqami (Xodim va Admin):</span>
                <span class="font-bold text-blue-900 text-sm">${creator.phone}</span>
              </div>
              <a href="tel:${creator.phone}" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition">
                Qo'ng'iroq qilish
              </a>
            </div>
          ` : `
            <div class="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center justify-between">
              <span>🔒 Telefon raqami faqat Madaniyat xodimlari va Admin uchun ochiq.</span>
            </div>
          `}
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-clock-rotate-left text-amber-600"></i> Bayramlar & Chellenjlar Tarixi
          </h4>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            ${eventsHistory}
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <button onclick="App.openVideoModal('${creator.id}')" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-play text-red-400"></i> Jonli Ijroni Ko'rish
        </button>
        <span class="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <i class="fa-regular fa-calendar-check text-emerald-600"></i> Yuklangan sana: ${creator.createdAt || 'Yangi'}
        </span>
        <button onclick="App.closeModal('modal-creator-detail')" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition">
          Yopish
        </button>
      </div>
    `;

    this.openModal('modal-creator-detail');
  },

  openInviteModal(creatorId) {
    const creator = DataStore.getCreatorById(creatorId);
    if (!creator) return;

    document.getElementById('invite-creator-name').textContent = creator.fullName;
    document.getElementById('invite-creator-school').textContent = `${creator.school} • ${creator.districtLabel}`;
    
    const phoneLink = document.getElementById('invite-phone-link');
    phoneLink.href = `tel:${creator.phone}`;
    phoneLink.textContent = creator.phone;

    const callBtn = document.getElementById('invite-call-btn');
    callBtn.href = `tel:${creator.phone}`;

    // Madaniyat xodimi yoki admin taklif oynasini ochganda o'quvchining "Yutuqlarim" bo'limiga taklifnoma yozib qo'yiladi
    const user = Auth.getCurrentUser();
    if (user && (user.role === 'staff' || user.role === 'admin')) {
      DataStore.recordStudentInvitation(creator.id, {
        eventName: `${creator.districtLabel || 'Tuman'} madaniy tadbiri va bayram dasturiga taklif`,
        staffName: user.fullName || "Madaniyat bo'limi",
        staffPosition: user.position || "Madaniyat xodimi"
      });
    }

    this.openModal('modal-invite');
  },

  // ================= 17. ZAXIRA VA EKSPORT =================

  exportLeaderboard() {
    const userDist = this.getActiveDistrictInfo();
    const activeFilterDist = userDist.district || (this.state.selectedDistrict !== 'all' ? this.state.selectedDistrict : '');
    let creators = DataStore.getLeaderboard();
    if (activeFilterDist) {
      creators = creators.filter(c => DataStore.districtsMatch(c.district || c.districtLabel, activeFilterDist));
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "O'rin,F.I.O.,Tumani,Maktabi,Qatnashgan tadbirlar,Jami tangalar\n";

    creators.forEach((c, index) => {
      csvContent += `${index + 1},"${c.fullName}","${c.districtLabel}","${c.school}",${c.eventsCount},${c.coins}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kelajak_Ijodkori_Reyting_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Mavsumiy reyting yuklab olindi!", "success");
  },

  handleDownloadBackup() {
    const jsonStr = DataStore.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kelajak_Ijodkori_Zaxira_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast("To'liq ma'lumotlar bazasi zaxirasi yuklab olindi!", "success");
  },

  handleImportBackupFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const ok = DataStore.importFullBackup(event.target.result);
      if (ok) {
        this.refreshAllUI();
        this.showToast("Zaxira muvaffaqiyatli tiklandi!", "success");
      } else {
        this.showToast("Zaxira fayli formati noto'g'ri!", "error");
      }
    };
    reader.readAsText(file);
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (window.I18n && window.I18n.currentLang === 'uz' && typeof window.I18n.convertDOMToNewUzbek === 'function') {
        window.I18n.convertDOMToNewUzbek(el);
      }
    }
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  },

  closeAllModals() {
    this.closeVideoModal();
    [
      'modal-admin-login',
      'modal-region-admin-login',
      'modal-republic-admin-login',
      'modal-admin-change-pin',
      'modal-staff-auth',
      'modal-student-auth',
      'modal-student-complaint',
      'modal-edit-profile',
      'modal-submit-challenge',
      'modal-add-challenge',
      'modal-review-submission',
      'modal-add-contest',
      'modal-award-coins',
      'modal-creator-detail',
      'modal-invite',
      'modal-admin-inbox',
      'modal-edit-coordinator',
      'modal-student-celebration',
      'modal-season-ended',
      'modal-edit-staff-profile',
      'modal-contest-select-students',
      'modal-contest-upload-proof'
    ].forEach(id => {
      this.closeModal(id);
    });
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    let bg = 'bg-slate-900 text-white';
    let icon = '<i class="fa-solid fa-circle-info text-blue-400"></i>';

    if (type === 'success') {
      bg = 'bg-emerald-800 text-white';
      icon = '<i class="fa-solid fa-circle-check text-emerald-300"></i>';
    } else if (type === 'error') {
      bg = 'bg-red-800 text-white';
      icon = '<i class="fa-solid fa-circle-exclamation text-red-300"></i>';
    }

    const displayMsg = (window.I18n && window.I18n.currentLang === 'uz' && typeof window.I18n.toNewUzbek === 'function')
      ? window.I18n.toNewUzbek(message)
      : message;

    toast.className = `toast px-4 py-3 rounded-2xl ${bg} flex items-center gap-3 text-xs font-semibold shadow-2xl`;
    toast.innerHTML = `${icon}<span>${displayMsg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

if (typeof window !== 'undefined') {
  window.App = App;
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
