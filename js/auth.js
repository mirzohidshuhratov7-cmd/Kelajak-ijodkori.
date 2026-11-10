/**
 * Kelajak ijodkori - Foydalanuvchi va Rollarni boshqarish (Auth tizimi)
 * Rollar:
 * 1. 'guest' - Ommaviy ko'rish rejimi
 * 2. 'admin' - Bosh koordinator
 * 3. 'staff' - Madaniyat xodimi
 * 4. 'student' - Umumta'lim maktab o'quvchisi
 */

const Auth = {
  // Joriy sessiyani olish
  getCurrentUser() {
    try {
      const session = localStorage.getItem(STORAGE_KEY_SESSION);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {
      console.error("Sessiyani o'qishda xatolik:", e);
    }
    return {
      id: 'guest',
      role: 'guest',
      fullName: 'Mehmon',
      position: 'Umumiy foydalanuvchi',
      organization: 'Ommaviy ko\'rish'
    };
  },

  // 1. ADMIN SIFATIDA KIRISH (HAR BIR TUMAN ADMINI ALOHIDA — VILOYAT KOORDINATORI KIRITGAN KOD ORQALI)
  loginAdmin(enteredPin, districtInput, regionInput) {
    if (!districtInput || !districtInput.trim()) {
      return { success: false, message: "Iltimos, qaysi tuman yoki shahar koordinatori ekanligingizni tanlang!" };
    }
    if (!enteredPin || enteredPin.trim() === '') {
      return { success: false, message: "Iltimos, Viloyat koordinatori tomonidan berilgan 5 xonali kodni kiriting!" };
    }

    const normDist = DataStore.normalizeDistrict(districtInput, regionInput);
    if (!normDist.id || normDist.id === 'all') {
      return { success: false, message: "Iltimos, aniq tuman yoki shahar nomini kiriting (masalan: Jondor tumani)!" };
    }

    const dAdmin = DataStore.getDistrictAdmin(normDist.id);
    if (!dAdmin || !dAdmin.pin) {
      return {
        success: false,
        message: `${normDist.label} uchun koordinator hali ${normDist.regionLabel} koordinatori tomonidan bazaga kiritilmagan! Avval Viloyat koordinatori sizning ismingizni va 5 xonali kodingizni kiritishi lozim.`
      };
    }

    if (DataStore.verifyDistrictAdminPin(normDist.id, enteredPin)) {
      const adminName = dAdmin.fullName || `${normDist.label} Koordinatori`;
      const sessionData = {
        id: 'usr-admin-' + normDist.id,
        role: 'admin',
        fullName: adminName,
        district: normDist.id,
        districtLabel: normDist.label,
        regionId: dAdmin.regionId || normDist.regionId,
        regionLabel: dAdmin.regionLabel || normDist.regionLabel,
        phone: dAdmin.phone || DataStore.getAdminPhone(normDist.id),
        position: `${normDist.label} Koordinatori`,
        organization: `${normDist.label}, ${normDist.regionLabel}`
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return {
      success: false,
      message: `Xato kod! Hurmatli ${dAdmin.fullName}, ${normDist.label} koordinatori uchun Viloyat koordinatori taqdim etgan 5 xonali kod noto'g'ri kiritildi.`
    };
  },

  registerDistrictAdmin(adminData) {
    if (!adminData.district || !adminData.district.trim()) {
      return { success: false, message: "Iltimos, tuman yoki shahar nomini kiriting!" };
    }
    if (!adminData.fullName || !adminData.fullName.trim()) {
      return { success: false, message: "Iltimos, F.I.O. (ism-sharifingiz)ni kiriting!" };
    }
    if (!adminData.pin || adminData.pin.trim().length < 4) {
      return { success: false, message: "Koordinator maxfiy kodi kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    const normDist = DataStore.normalizeDistrict(adminData.district, adminData.region);
    if (!normDist.id || normDist.id === 'all') {
      return { success: false, message: "Iltimos, aniq tuman yoki shahar nomini kiriting!" };
    }

    const existing = DataStore.getDistrictAdmin(normDist.id);
    if (existing && existing.pin && existing.pin !== adminData.pin.trim()) {
      return {
        success: false,
        message: `${normDist.label} uchun koordinator allaqachon ro'yxatdan o'tgan (${existing.fullName}). Kirish bo'limidan o'z parolingiz bilan kiring!`
      };
    }

    const saved = DataStore.saveDistrictAdmin({
      district: normDist.id,
      districtLabel: normDist.label,
      regionId: normDist.regionId,
      regionLabel: normDist.regionLabel,
      fullName: adminData.fullName.trim(),
      phone: (adminData.phone || '').trim(),
      pin: adminData.pin.trim()
    });

    const sessionData = {
      id: 'usr-admin-' + normDist.id,
      role: 'admin',
      fullName: saved.fullName,
      district: normDist.id,
      districtLabel: normDist.label,
      regionId: saved.regionId || normDist.regionId,
      regionLabel: saved.regionLabel || normDist.regionLabel,
      phone: saved.phone,
      position: `${normDist.label} Koordinatori`,
      organization: `${normDist.label}, ${normDist.regionLabel}`
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  },

  // 1B. VILOYAT KOORDINATORI SIFATIDA KIRISH (RESPUBLIKA KOORDINATORI KIRITGAN KOD ORQALI)
  loginRegionAdmin(enteredPin, regionInput) {
    if (!regionInput || !regionInput.trim()) {
      return { success: false, message: "Iltimos, qaysi viloyat koordinatori ekanligingizni tanlang!" };
    }
    if (!enteredPin || enteredPin.trim() === '') {
      return { success: false, message: "Iltimos, Respublika koordinatori tomonidan berilgan 5 xonali kodni kiriting!" };
    }

    const normReg = DataStore.normalizeRegion(regionInput);
    if (!normReg.id) {
      return { success: false, message: "Iltimos, viloyat nomini kiriting (masalan: Buxoro viloyati)!" };
    }

    const rAdmin = DataStore.getRegionAdmin(normReg.id);
    if (!rAdmin || !rAdmin.pin) {
      return {
        success: false,
        message: `${normReg.label} uchun koordinator hali Respublika koordinatori tomonidan bazaga kiritilmagan! Avval Respublika koordinatori sizning ismingizni va 5 xonali kodingizni kiritishi lozim.`
      };
    }

    if (DataStore.verifyRegionAdminPin(normReg.id, enteredPin)) {
      const sessionData = {
        id: 'usr-reg-admin-' + normReg.id,
        role: 'region_admin',
        fullName: rAdmin.fullName || `${normReg.label} Koordinatori`,
        regionId: normReg.id,
        regionLabel: normReg.label,
        phone: rAdmin.phone || '',
        position: `${normReg.label} Bosh Koordinatori`,
        organization: `${normReg.label} Madaniyat Boshqarmasi`
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return {
      success: false,
      message: `Xato kod! Hurmatli ${rAdmin.fullName}, ${normReg.label} koordinatori uchun Respublika koordinatori taqdim etgan 5 xonali kod noto'g'ri kiritildi.`
    };
  },

  registerRegionAdmin(adminData) {
    if (!adminData.region || !adminData.region.trim()) {
      return { success: false, message: "Iltimos, viloyat nomini tanlang yoki kiriting!" };
    }
    if (!adminData.fullName || !adminData.fullName.trim()) {
      return { success: false, message: "Iltimos, F.I.O. (ism-sharifingiz)ni kiriting!" };
    }
    if (!adminData.pin || adminData.pin.trim().length < 4) {
      return { success: false, message: "Viloyat koordinatori maxfiy kodi kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    const normReg = DataStore.normalizeRegion(adminData.region);
    const existing = DataStore.getRegionAdmin(normReg.id);
    if (existing && existing.pin && existing.pin !== adminData.pin.trim()) {
      return {
        success: false,
        message: `${normReg.label} uchun koordinator allaqachon ro'yxatdan o'tgan (${existing.fullName}). Kirish bo'limidan o'z parolingiz bilan kiring!`
      };
    }

    const saved = DataStore.saveRegionAdmin({
      regionId: normReg.id,
      regionLabel: normReg.label,
      fullName: adminData.fullName.trim(),
      phone: (adminData.phone || '').trim(),
      pin: adminData.pin.trim()
    });

    const sessionData = {
      id: 'usr-reg-admin-' + normReg.id,
      role: 'region_admin',
      fullName: saved.fullName,
      regionId: normReg.id,
      regionLabel: normReg.label,
      phone: saved.phone,
      position: `${normReg.label} Bosh Koordinatori`,
      organization: `${normReg.label} Madaniyat Boshqarmasi`
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  },

  // 1C. RESPUBLIKA KOORDINATORI SIFATIDA KIRISH VA RO'YXATDAN O'TISH
  loginRepublicAdmin(enteredPin) {
    if (!enteredPin || enteredPin.trim() === '') {
      return { success: false, message: "Iltimos, Respublika koordinatori maxfiy kodini kiriting!" };
    }

    if (DataStore.verifyRepublicAdminPin(enteredPin)) {
      const repAdmin = DataStore.getRepublicAdmin();
      const sessionData = {
        id: 'usr-rep-admin',
        role: 'republic_admin',
        fullName: repAdmin.fullName || 'Respublika Bosh Koordinatori',
        phone: repAdmin.phone || '+998 90 123 45 67',
        position: 'Respublika Bosh Koordinatori',
        organization: "O'zbekiston Respublikasi Madaniyat Vazirligi"
      };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }

    return { success: false, message: "Xato kod! Respublika koordinatori maxfiy kodi noto'g'ri." };
  },

  registerRepublicAdmin(adminData) {
    if (!adminData.fullName || !adminData.fullName.trim()) {
      return { success: false, message: "Iltimos, F.I.O. (ism-sharifingiz)ni kiriting!" };
    }
    if (!adminData.pin || adminData.pin.trim().length < 4) {
      return { success: false, message: "Respublika koordinatori maxfiy kodi kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    const saved = DataStore.saveRepublicAdmin({
      fullName: adminData.fullName.trim(),
      phone: (adminData.phone || '').trim(),
      pin: adminData.pin.trim()
    });

    const sessionData = {
      id: 'usr-rep-admin',
      role: 'republic_admin',
      fullName: saved.fullName,
      phone: saved.phone,
      position: 'Respublika Bosh Koordinatori',
      organization: "O'zbekiston Respublikasi Madaniyat Vazirligi"
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    return { success: true, user: sessionData };
  },

  changeAdminPin(currentPin, newPin) {
    const user = this.getCurrentUser();
    const dist = (user && user.role === 'admin' && user.district) ? user.district : '';
    if (!DataStore.verifyAdminPin(currentPin, dist)) {
      return { success: false, message: "Hozirgi admin kodingiz noto'g'ri kiritildi!" };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: "Yangi maxfiy kod kamida 4 ta belgidan iborat bo'lishi kerak!" };
    }

    DataStore.setAdminPin(newPin.trim(), dist);
    return { success: true, message: "Admin maxfiy kodi muvaffaqiyatli yangilandi!" };
  },

  // 2. MADANIYAT XODIMI SIFATIDA KIRISH
  loginStaff(staffData) {
    const saved = staffData.id ? staffData : DataStore.addStaffMember(staffData);
    const normDist = DataStore.normalizeDistrict(
      saved.districtLabel || saved.district || staffData.districtLabel || staffData.district || 'jondor',
      saved.regionLabel || saved.regionId || staffData.regionLabel || staffData.region || ''
    );

    const sessionData = {
      id: saved.id || ('staff-' + Date.now()),
      staffId: saved.id,
      role: 'staff',
      fullName: saved.fullName.trim(),
      district: normDist.id || 'jondor',
      districtLabel: normDist.label || 'Jondor tumani',
      regionId: normDist.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || 'Buxoro viloyati',
      position: (saved.position || '').trim() || 'Madaniyat Xodimi / Tadbir Tashkilotchisi',
      organization: (saved.organization || '').trim() || 'Madaniyat Boshqarmasi',
      phone: (saved.phone || '').trim()
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    return { success: true, user: sessionData, staff: saved };
  },

  // Madaniyat xodimi ismi yoki telefoni hamda profil kodi (parol) orqali kirish
  loginStaffByCredentials(identifier, pin, districtInput) {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: "Iltimos, ismingiz yoki telefon raqamingizni kiriting!" };
    }
    if (!pin || !pin.trim()) {
      return { success: false, message: "Iltimos, profil maxfiy kodingizni (parol) kiriting!" };
    }

    let staff = DataStore.findStaffByCredentials(identifier, pin);
    if (!staff) {
      return {
        success: false,
        message: "Ism yoki profil kodi noto'g'ri kiritildi! Kodni unutgan bo'lsangiz, 'Profil kodi esimdan chiqdi' tugmasidan foydalaning."
      };
    }

    // Agar kirish paytida tuman ko'rsatilgan bo'lsa yoki xodimda hali tuman bo'lmasa, tumanini yangilaymiz
    if (districtInput && districtInput.trim()) {
      const normDist = DataStore.normalizeDistrict(districtInput);
      if (normDist.id && normDist.id !== 'all') {
        if (!staff.district) {
          staff = DataStore.updateStaffMember(staff.id, {
            district: normDist.id,
            districtLabel: normDist.label,
            regionId: normDist.regionId,
            regionLabel: normDist.regionLabel
          }) || staff;
        } else if (!DataStore.districtsMatch(staff.district || staff.districtLabel, normDist.id)) {
          return {
            success: false,
            message: `Siz ${staff.districtLabel || staff.district} madaniyat xodimi sifatida ro'yxatdan o'tgansiz. Iltimos, o'z tumaningizni tanlab kiring!`
          };
        }
      }
    }

    const res = this.loginStaff(staff);
    return { success: true, user: res.user, staff: staff };
  },

  updateStaffSession(updatedStaff) {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'staff' && (currentUser.staffId === updatedStaff.id || currentUser.id === updatedStaff.id)) {
      const normDist = DataStore.normalizeDistrict(
        updatedStaff.districtLabel || updatedStaff.district || currentUser.districtLabel || currentUser.district || 'jondor',
        updatedStaff.regionLabel || updatedStaff.regionId || currentUser.regionLabel || currentUser.regionId || ''
      );
      currentUser.fullName = updatedStaff.fullName;
      currentUser.position = updatedStaff.position;
      currentUser.organization = updatedStaff.organization;
      currentUser.district = normDist.id || currentUser.district;
      currentUser.districtLabel = normDist.label || currentUser.districtLabel;
      currentUser.regionId = normDist.regionId || currentUser.regionId;
      currentUser.regionLabel = normDist.regionLabel || currentUser.regionLabel;
      currentUser.phone = updatedStaff.phone;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }
  },

  // 3. O'QUVCHI SIFATIDA KIRISH
  loginStudent(studentData) {
    const normDist = DataStore.normalizeDistrict(
      studentData.districtLabel || studentData.district || 'jondor',
      studentData.regionLabel || studentData.regionId || studentData.region || ''
    );
    const sessionData = {
      id: studentData.id,
      creatorId: studentData.id,
      role: 'student',
      fullName: studentData.fullName.trim(),
      nickname: studentData.nickname || '',
      district: normDist.id || studentData.district,
      districtLabel: normDist.label || studentData.districtLabel,
      regionId: normDist.regionId || studentData.regionId || 'buxoro_vil',
      regionLabel: normDist.regionLabel || studentData.regionLabel || 'Buxoro viloyati',
      school: studentData.school,
      phone: studentData.phone,
      avatarUrl: studentData.avatarUrl
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
    return sessionData;
  },

  // O'quvchi ismi, niki yoki telefoni hamda profil kodi (paroli) orqali kirish
  loginStudentByCredentials(identifier, pin) {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: "Iltimos, ismingiz, nikingiz yoki telefon raqamingizni kiriting!" };
    }
    if (!pin || !pin.trim()) {
      return { success: false, message: "Iltimos, profil maxfiy kodingizni (parol) kiriting!" };
    }

    const creator = DataStore.findCreatorByCredentials(identifier, pin);
    if (!creator) {
      return {
        success: false,
        message: "Ism/nik yoki profil kodi noto'g'ri kiritildi! Kodni unutgan bo'lsangiz, 'Profil kodi esimdan chiqdi' tugmasidan foydalaning."
      };
    }

    const sessionData = this.loginStudent(creator);
    return { success: true, user: sessionData, creator: creator };
  },

  // O'quvchi profilini yangilaganda sessiyani yangilash
  updateStudentSession(updatedCreator) {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'student' && currentUser.creatorId === updatedCreator.id) {
      const normDist = DataStore.normalizeDistrict(
        updatedCreator.districtLabel || updatedCreator.district || currentUser.districtLabel || currentUser.district || 'jondor',
        updatedCreator.regionLabel || updatedCreator.regionId || currentUser.regionLabel || currentUser.regionId || ''
      );
      currentUser.fullName = updatedCreator.fullName;
      currentUser.nickname = updatedCreator.nickname || '';
      currentUser.district = normDist.id || updatedCreator.district;
      currentUser.districtLabel = normDist.label || updatedCreator.districtLabel;
      currentUser.regionId = normDist.regionId || updatedCreator.regionId || currentUser.regionId;
      currentUser.regionLabel = normDist.regionLabel || updatedCreator.regionLabel || currentUser.regionLabel;
      currentUser.school = updatedCreator.school;
      currentUser.phone = updatedCreator.phone;
      currentUser.avatarUrl = updatedCreator.avatarUrl;
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(currentUser));
    }
  },

  // Joriy foydalanuvchining tumanini olish (o'quvchi, xodim yoki tuman koordinatori)
  getUserDistrict() {
    const user = this.getCurrentUser();
    if (!user || user.role === 'guest' || user.role === 'region_admin' || user.role === 'republic_admin') {
      return { district: '', districtLabel: '', regionId: '', regionLabel: '' };
    }
    if (user.district || user.districtLabel) {
      const norm = DataStore.normalizeDistrict(user.districtLabel || user.district, user.regionLabel || user.regionId);
      if (norm.id && norm.id !== 'all') {
        return {
          district: norm.id,
          districtLabel: norm.label,
          regionId: norm.regionId || 'buxoro_vil',
          regionLabel: norm.regionLabel || 'Buxoro viloyati'
        };
      }
    }
    if (user.role === 'student') {
      const creators = DataStore.getCreators();
      const c = (user.creatorId ? DataStore.getCreatorById(user.creatorId) : null) ||
                creators.find(item => item && (
                  item.id === user.id ||
                  item.id === user.creatorId ||
                  (user.fullName && item.fullName && item.fullName.toLowerCase().trim() === user.fullName.toLowerCase().trim()) ||
                  (user.phone && item.phone && item.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, ''))
                ));
      if (c && (c.district || c.districtLabel)) {
        const norm = DataStore.normalizeDistrict(c.districtLabel || c.district, c.regionLabel || c.regionId);
        if (norm.id && norm.id !== 'all') {
          user.district = norm.id;
          user.districtLabel = norm.label;
          user.regionId = norm.regionId || 'buxoro_vil';
          user.regionLabel = norm.regionLabel || 'Buxoro viloyati';
          try { localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user)); } catch (e) {}
          return {
            district: norm.id,
            districtLabel: norm.label,
            regionId: norm.regionId || 'buxoro_vil',
            regionLabel: norm.regionLabel || 'Buxoro viloyati'
          };
        }
      }
      return {
        district: 'jondor',
        districtLabel: 'Jondor tumani',
        regionId: 'buxoro_vil',
        regionLabel: 'Buxoro viloyati'
      };
    }
    if (user.role === 'staff') {
      const sList = DataStore.getStaffList();
      const s = sList.find(item => item && (
        item.id === user.staffId ||
        item.id === user.id ||
        (user.fullName && item.fullName && item.fullName.toLowerCase().trim() === user.fullName.toLowerCase().trim())
      ));
      if (s && (s.district || s.districtLabel)) {
        const norm = DataStore.normalizeDistrict(s.districtLabel || s.district, s.regionLabel || s.regionId);
        return {
          district: norm.id,
          districtLabel: norm.label,
          regionId: norm.regionId || 'buxoro_vil',
          regionLabel: norm.regionLabel || 'Buxoro viloyati'
        };
      }
      return {
        district: 'jondor',
        districtLabel: 'Jondor tumani',
        regionId: 'buxoro_vil',
        regionLabel: 'Buxoro viloyati'
      };
    }
    return { district: '', districtLabel: '', regionId: '', regionLabel: '' };
  },

  // Joriy foydalanuvchining viloyatini olish
  getUserRegion() {
    const user = this.getCurrentUser();
    if (!user || user.role === 'guest' || user.role === 'republic_admin') {
      return { regionId: '', regionLabel: '' };
    }
    if (user.regionId || user.regionLabel) {
      const normReg = DataStore.normalizeRegion(user.regionLabel || user.regionId);
      return { regionId: normReg.id, regionLabel: normReg.label };
    }
    const uDist = this.getUserDistrict();
    if (uDist.regionId) {
      return { regionId: uDist.regionId, regionLabel: uDist.regionLabel };
    }
    return { regionId: 'buxoro_vil', regionLabel: 'Buxoro viloyati' };
  },

  // Tizimdan chiqish (Logout)
  logout() {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    return true;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  isRegionAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'region_admin';
  },

  isRepublicAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'republic_admin';
  },

  isStaff() {
    const user = this.getCurrentUser();
    return user && (user.role === 'staff' || user.role === 'admin');
  },

  isStudent() {
    const user = this.getCurrentUser();
    return user && user.role === 'student';
  },

  isGuest() {
    const user = this.getCurrentUser();
    return !user || user.role === 'guest';
  }
};

if (typeof window !== 'undefined') {
  window.Auth = Auth;
}
