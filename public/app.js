(function () {
  'use strict';

  const STATUS = [
    'رزومه دریافت شد',
    'در انتظار تماس',
    'دعوت به مصاحبه',
    'مصاحبه اول',
    'مصاحبه دوم',
    'در انتظار نتیجه',
    'پذیرفته شده',
    'عدم همکاری',
    'لیست انتظار'
  ];

  const STATUS_CLASS = {
    'پذیرفته شده': 'green',
    'عدم همکاری': 'red',
    'لیست انتظار': 'yellow',
    'در انتظار نتیجه': 'yellow',
    'دعوت به مصاحبه': 'green'
  };

  const DEFAULT_SETTINGS = {
    companyName: 'ایران‌هتل آنلاین',
    hrName: 'واحد منابع انسانی ایران‌هتل',
    defaultLocation: 'مشهد، دفتر مرکزی ایران‌هتل آنلاین',
    locationLink: '',
    apiToken: '',
    clientDryRun: 'true'
  };

  const DEFAULT_TEMPLATES = [
    {
      id: uid(),
      title: 'دعوت به مصاحبه',
      body: 'سلام {name} عزیز\nاز طرف {company} برای موقعیت شغلی «{role}» به مصاحبه دعوت شده‌اید.\nزمان مصاحبه: {date} ساعت {time}\nمحل مصاحبه: {location}\nلطفاً در صورت عدم امکان حضور، همین پیامک را به HR اطلاع دهید.\n{hrName}'
    },
    {
      id: uid(),
      title: 'یادآوری ۲۴ ساعت قبل مصاحبه',
      body: 'سلام {name} عزیز\nیادآوری می‌شود مصاحبه شما برای موقعیت «{role}» فردا در تاریخ {date} ساعت {time} برگزار می‌شود.\nمحل: {location}\nبا آرزوی موفقیت\n{hrName}'
    },
    {
      id: uid(),
      title: 'یادآوری ۳ ساعت قبل مصاحبه',
      body: 'سلام {name} عزیز\nمصاحبه شما با {company} امروز ساعت {time} برگزار می‌شود.\nلطفاً چند دقیقه زودتر در محل حضور داشته باشید.\nآدرس: {location}\n{hrName}'
    },
    {
      id: uid(),
      title: 'تغییر زمان مصاحبه',
      body: 'سلام {name} عزیز\nزمان مصاحبه شما برای موقعیت «{role}» تغییر کرد.\nزمان جدید: {date} ساعت {time}\nمحل: {location}\nاز همراهی شما سپاسگزاریم.\n{hrName}'
    },
    {
      id: uid(),
      title: 'درخواست ارسال مدارک',
      body: 'سلام {name} عزیز\nلطفاً برای تکمیل فرایند بررسی موقعیت «{role}»، رزومه به‌روز، تصویر کارت ملی و مدارک مرتبط را برای واحد منابع انسانی ارسال کنید.\n{hrName}'
    },
    {
      id: uid(),
      title: 'اعلام نتیجه مثبت',
      body: 'سلام {name} عزیز\nبا خوشحالی اعلام می‌کنیم نتیجه بررسی شما برای موقعیت «{role}» مثبت بوده است.\nبرای هماهنگی مراحل بعدی، همکاران منابع انسانی با شما تماس خواهند گرفت.\n{company}'
    },
    {
      id: uid(),
      title: 'عدم همکاری محترمانه',
      body: 'سلام {name} عزیز\nاز وقتی که برای فرایند مصاحبه موقعیت «{role}» در {company} گذاشتید سپاسگزاریم.\nدر این مرحله امکان همکاری فراهم نشد، اما اطلاعات شما برای فرصت‌های آینده در بانک منابع انسانی باقی می‌ماند.\nبا آرزوی موفقیت\n{hrName}'
    },
    {
      id: uid(),
      title: 'لیست انتظار',
      body: 'سلام {name} عزیز\nنتیجه بررسی شما برای موقعیت «{role}» در وضعیت لیست انتظار قرار گرفته است.\nدر صورت باز شدن ظرفیت همکاری، واحد منابع انسانی با شما تماس می‌گیرد.\n{hrName}'
    },
    {
      id: uid(),
      title: 'شروع همکاری / آنبوردینگ',
      body: 'سلام {name} عزیز\nبه خانواده {company} خوش آمدید.\nبرای شروع همکاری، لطفاً در تاریخ {date} ساعت {time} در محل {location} حضور داشته باشید.\n{hrName}'
    }
  ];

  const SAMPLE_CANDIDATES = [
    {
      id: uid(),
      name: 'مریم احمدی',
      phone: '09151234567',
      role: 'کارشناس منابع انسانی',
      source: 'جابینجا',
      status: 'دعوت به مصاحبه',
      date: todayPlus(1),
      time: '10:30',
      location: 'مشهد، دفتر مرکزی ایران‌هتل آنلاین',
      score: 82,
      notes: 'رزومه خوب، سابقه جذب و مصاحبه دارد.',
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      name: 'علی رضایی',
      phone: '09351234567',
      role: 'کارشناس پشتیبانی',
      source: 'معرفی همکار',
      status: 'مصاحبه اول',
      date: todayPlus(2),
      time: '14:00',
      location: 'مشهد، دفتر مرکزی ایران‌هتل آنلاین',
      score: 76,
      notes: 'فن بیان مناسب، نیاز به بررسی شیفت کاری.',
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      name: 'سارا محمدی',
      phone: '09121234567',
      role: 'کارشناس فروش سازمانی',
      source: 'سایت شرکت',
      status: 'در انتظار نتیجه',
      date: todayPlus(-1),
      time: '11:00',
      location: 'مصاحبه آنلاین',
      score: 88,
      notes: 'برای مصاحبه دوم مناسب است.',
      createdAt: new Date().toISOString()
    }
  ];

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  let candidates = store.get('iho_hr_candidates', []);
  let templates = store.get('iho_hr_templates', DEFAULT_TEMPLATES);
  let logs = store.get('iho_hr_logs', []);
  let settings = { ...DEFAULT_SETTINGS, ...store.get('iho_hr_settings', {}) };
  let selectedCandidates = new Set();
  let currentView = 'dashboard';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    fillStaticSelects();
    bindNavigation();
    bindCandidateForm();
    bindTemplates();
    bindMessaging();
    bindBulk();
    bindLogs();
    bindSettings();
    bindMisc();
    renderAll();
  }

  function fillStaticSelects() {
    const statusFilter = $('#statusFilter');
    statusFilter.innerHTML = '<option value="all">همه مراحل</option>' + STATUS.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');

    const candidateStatus = $('#candidateStatus');
    candidateStatus.innerHTML = STATUS.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  }

  function bindNavigation() {
    $$('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });
    $$('[data-jump]').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.jump));
    });
    $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  }

  function setView(view) {
    currentView = view;
    $$('.view').forEach((el) => el.classList.remove('active'));
    $(`#view-${view}`).classList.add('active');
    $$('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
    $('#pageTitle').textContent = getTitle(view);
    $('#sidebar').classList.remove('open');
    renderAll();
  }

  function getTitle(view) {
    return {
      dashboard: 'داشبورد',
      candidates: 'کاندیداها',
      interviews: 'مصاحبه‌ها',
      messages: 'مرکز پیامک',
      templates: 'قالب‌ها',
      bulk: 'ورود گروهی',
      logs: 'گزارش ارسال',
      settings: 'تنظیمات'
    }[view] || 'پنل HR';
  }

  function bindCandidateForm() {
    $('#openCandidateModal').addEventListener('click', () => openCandidateModal());
    $('#addCandidateFromTable').addEventListener('click', () => openCandidateModal());
    $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeCandidateModal));

    $('#candidateForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#candidateId').value || uid();
      const candidate = {
        id,
        name: $('#candidateName').value.trim(),
        phone: normalizeMobile($('#candidatePhone').value),
        role: $('#candidateRole').value.trim(),
        source: $('#candidateSource').value.trim(),
        status: $('#candidateStatus').value,
        date: $('#candidateDate').value,
        time: $('#candidateTime').value,
        location: $('#candidateLocation').value.trim() || settings.defaultLocation,
        score: Number($('#candidateScore').value || 0),
        notes: $('#candidateNotes').value.trim(),
        createdAt: new Date().toISOString()
      };

      if (!/^09\d{9}$/.test(candidate.phone)) {
        toast('شماره موبایل معتبر نیست. فرمت درست: 09xxxxxxxxx');
        return;
      }

      const exists = candidates.some((item) => item.id === id);
      candidates = exists ? candidates.map((item) => item.id === id ? candidate : item) : [candidate, ...candidates];
      saveCandidates();
      closeCandidateModal();
      renderAll();
      toast('کاندیدا ذخیره شد.');
    });

    $('#searchInput').addEventListener('input', renderCandidatesTable);
    $('#statusFilter').addEventListener('change', renderCandidatesTable);
  }

  function openCandidateModal(candidate) {
    $('#candidateModalTitle').textContent = candidate ? 'ویرایش کاندیدا' : 'افزودن کاندیدا';
    $('#candidateId').value = candidate ? candidate.id : '';
    $('#candidateName').value = candidate ? candidate.name : '';
    $('#candidatePhone').value = candidate ? candidate.phone : '';
    $('#candidateRole').value = candidate ? candidate.role : '';
    $('#candidateSource').value = candidate ? candidate.source : '';
    $('#candidateStatus').value = candidate ? candidate.status : 'رزومه دریافت شد';
    $('#candidateDate').value = candidate ? candidate.date : todayPlus(1);
    $('#candidateTime').value = candidate ? candidate.time : '10:00';
    $('#candidateLocation').value = candidate ? candidate.location : settings.defaultLocation;
    $('#candidateScore').value = candidate ? candidate.score : 70;
    $('#candidateNotes').value = candidate ? candidate.notes : '';
    $('#candidateModal').classList.add('open');
    $('#candidateModal').setAttribute('aria-hidden', 'false');
  }

  function closeCandidateModal() {
    $('#candidateModal').classList.remove('open');
    $('#candidateModal').setAttribute('aria-hidden', 'true');
  }

  function bindTemplates() {
    $('#templateForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#templateId').value || uid();
      const item = {
        id,
        title: $('#templateTitle').value.trim(),
        body: $('#templateBody').value.trim()
      };
      templates = templates.some((template) => template.id === id)
        ? templates.map((template) => template.id === id ? item : template)
        : [item, ...templates];
      saveTemplates();
      renderTemplates();
      renderTemplateSelect();
      toast('قالب ذخیره شد.');
    });

    $('#newTemplateBtn').addEventListener('click', () => editTemplate({ id: '', title: '', body: '' }));
  }

  function editTemplate(template) {
    $('#templateId').value = template.id;
    $('#templateTitle').value = template.title;
    $('#templateBody').value = template.body;
  }

  function bindMessaging() {
    $('#templateSelect').addEventListener('change', () => {
      const template = templates.find((item) => item.id === $('#templateSelect').value);
      $('#messageText').value = template ? template.body : '';
      updateSmsLength();
    });
    $('#messageText').addEventListener('input', updateSmsLength);
    $('#selectUpcomingBtn').addEventListener('click', selectUpcomingCandidates);
    $('#previewBtn').addEventListener('click', previewFirstMessage);
    $('#sendSmsBtn').addEventListener('click', () => sendSelectedMessages());
    $('#scheduleAllBtn').addEventListener('click', scheduleAllReminders);
  }

  function bindBulk() {
    $('#bulkSampleBtn').addEventListener('click', () => {
      $('#bulkText').value = `علی رضایی،09121234567،کارشناس فروش،${todayPlus(1)}،10:30\nسارا محمدی،09351234567،کارشناس پشتیبانی،${todayPlus(2)}،14:00\nمحمد کریمی،09901234567،کارشناس تولید محتوا،${todayPlus(3)}،09:30`;
    });

    $('#bulkImportBtn').addEventListener('click', () => {
      const rows = $('#bulkText').value.split('\n').map((line) => line.trim()).filter(Boolean);
      const imported = [];
      for (const row of rows) {
        const parts = row.split(/[،,]/).map((part) => part.trim());
        if (parts.length < 3) continue;
        const phone = normalizeMobile(parts[1]);
        if (!/^09\d{9}$/.test(phone)) continue;
        imported.push({
          id: uid(),
          name: parts[0],
          phone,
          role: parts[2] || 'ثبت نشده',
          source: 'ورود گروهی',
          status: 'رزومه دریافت شد',
          date: parts[3] || '',
          time: parts[4] || '',
          location: settings.defaultLocation,
          score: 70,
          notes: '',
          createdAt: new Date().toISOString()
        });
      }
      candidates = [...imported, ...candidates];
      saveCandidates();
      $('#bulkText').value = '';
      renderAll();
      toast(`${toFa(imported.length)} کاندیدا اضافه شد.`);
    });
  }

  function bindLogs() {
    $('#exportLogsBtn').addEventListener('click', exportLogs);
    $('#clearLogsBtn').addEventListener('click', () => {
      if (!confirm('لاگ ارسال‌ها پاک شود؟')) return;
      logs = [];
      saveLogs();
      renderLogs();
      toast('لاگ‌ها پاک شد.');
    });
  }

  function bindSettings() {
    $('#settingsForm').addEventListener('submit', (event) => {
      event.preventDefault();
      settings = {
        companyName: $('#companyName').value.trim() || DEFAULT_SETTINGS.companyName,
        hrName: $('#hrName').value.trim() || DEFAULT_SETTINGS.hrName,
        defaultLocation: $('#defaultLocation').value.trim() || DEFAULT_SETTINGS.defaultLocation,
        locationLink: $('#locationLink').value.trim(),
        apiToken: $('#apiToken').value.trim(),
        clientDryRun: $('#clientDryRun').value
      };
      saveSettings();
      renderAll();
      toast('تنظیمات ذخیره شد.');
    });
  }

  function bindMisc() {
    $('#seedBtn').addEventListener('click', () => {
      if (candidates.length && !confirm('دیتای نمونه به لیست فعلی اضافه شود؟')) return;
      candidates = [...SAMPLE_CANDIDATES.map((item) => ({ ...item, id: uid() })), ...candidates];
      saveCandidates();
      renderAll();
      toast('دیتای نمونه اضافه شد.');
    });
  }

  function renderAll() {
    renderDryRunBadge();
    renderStats();
    renderUpcoming();
    renderPipeline();
    renderCandidatesTable();
    renderCandidatePicker();
    renderTemplateSelect();
    renderTemplates();
    renderReminders();
    renderLogs();
    renderSettings();
    updateSelectedCount();
    updateSmsLength();
  }

  function renderDryRunBadge() {
    $('#dryRunBadge').textContent = settings.clientDryRun === 'false' ? 'ارسال واقعی سمت سرور' : 'تستی / امن';
  }

  function renderStats() {
    const total = candidates.length;
    const upcoming = getUpcoming(3).length;
    const accepted = candidates.filter((item) => item.status === 'پذیرفته شده').length;
    const waiting = candidates.filter((item) => item.status.includes('انتظار')).length;
    const items = [
      ['کل کاندیداها', total],
      ['مصاحبه‌های ۳ روز آینده', upcoming],
      ['پذیرفته شده', accepted],
      ['در انتظار تصمیم', waiting]
    ];
    $('#statsGrid').innerHTML = items.map(([label, value]) => `<div class="stat"><b>${toFa(value)}</b><span>${label}</span></div>`).join('');
  }

  function renderUpcoming() {
    const list = getUpcoming(2).slice(0, 6);
    $('#upcomingList').innerHTML = list.length ? list.map((item) => `
      <div class="list-item">
        <div>
          <h4>${escapeHtml(item.name)} <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></h4>
          <p>${escapeHtml(item.role)} | ${formatDate(item.date)} ساعت ${toFa(item.time || '-')} | ${escapeHtml(item.location || settings.defaultLocation)}</p>
        </div>
        <button class="btn ghost small" data-send-one="${item.id}">پیامک</button>
      </div>
    `).join('') : '<p class="muted">مصاحبه نزدیک ثبت نشده است.</p>';

    $$('[data-send-one]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCandidates = new Set([btn.dataset.sendOne]);
        setView('messages');
      });
    });
  }

  function renderPipeline() {
    const counts = STATUS.map((status) => [status, candidates.filter((item) => item.status === status).length]);
    const max = Math.max(1, ...counts.map(([, count]) => count));
    $('#pipelineChart').innerHTML = counts.map(([status, count]) => `
      <div class="pipeline-row">
        <span>${escapeHtml(status)}</span>
        <div class="bar"><span style="width:${Math.round((count / max) * 100)}%"></span></div>
        <b>${toFa(count)}</b>
      </div>
    `).join('');
  }

  function renderCandidatesTable() {
    const q = ($('#searchInput')?.value || '').trim().toLowerCase();
    const status = $('#statusFilter')?.value || 'all';
    const rows = candidates.filter((item) => {
      const text = `${item.name} ${item.phone} ${item.role} ${item.source}`.toLowerCase();
      const matchesText = !q || text.includes(q);
      const matchesStatus = status === 'all' || item.status === status;
      return matchesText && matchesStatus;
    });

    $('#candidateRows').innerHTML = rows.length ? rows.map((item) => `
      <tr>
        <td>
          <div class="person">
            <div class="avatar">${escapeHtml(initials(item.name))}</div>
            <div><strong>${escapeHtml(item.name)}</strong><div class="muted">${escapeHtml(item.source || 'بدون منبع')}</div></div>
          </div>
        </td>
        <td>${toFa(item.phone)}</td>
        <td>${escapeHtml(item.role)}</td>
        <td><span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${item.date ? `${formatDate(item.date)}<br><span class="muted">ساعت ${toFa(item.time || '-')}</span>` : '<span class="muted">ثبت نشده</span>'}</td>
        <td>${toFa(item.score || 0)}</td>
        <td>
          <button class="btn ghost small" data-edit="${item.id}">ویرایش</button>
          <button class="btn danger small" data-delete="${item.id}">حذف</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="7" class="muted">کاندیدایی پیدا نشد.</td></tr>';

    $$('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.edit);
      if (item) openCandidateModal(item);
    }));

    $$('[data-delete]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.delete);
      if (!item || !confirm(`کاندیدای ${item.name} حذف شود؟`)) return;
      candidates = candidates.filter((candidate) => candidate.id !== item.id);
      selectedCandidates.delete(item.id);
      saveCandidates();
      renderAll();
      toast('کاندیدا حذف شد.');
    }));
  }

  function renderCandidatePicker() {
    $('#candidatePicker').innerHTML = candidates.length ? candidates.map((item) => `
      <label class="pick-item">
        <input type="checkbox" value="${item.id}" ${selectedCandidates.has(item.id) ? 'checked' : ''} />
        <span>
          <strong>${escapeHtml(item.name)} - ${toFa(item.phone)}</strong>
          <span>${escapeHtml(item.role)} | ${escapeHtml(item.status)} | ${item.date ? formatDate(item.date) + ' ساعت ' + toFa(item.time || '-') : 'بدون زمان مصاحبه'}</span>
        </span>
      </label>
    `).join('') : '<p class="muted">ابتدا کاندیدا ثبت کن.</p>';

    $$('#candidatePicker input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) selectedCandidates.add(input.value);
        else selectedCandidates.delete(input.value);
        updateSelectedCount();
      });
    });
  }

  function renderTemplateSelect() {
    const select = $('#templateSelect');
    const current = select.value;
    select.innerHTML = templates.map((template) => `<option value="${template.id}">${escapeHtml(template.title)}</option>`).join('');
    select.value = templates.some((template) => template.id === current) ? current : (templates[0]?.id || '');
    if (!$('#messageText').value && templates[0]) $('#messageText').value = templates[0].body;
  }

  function renderTemplates() {
    $('#templateList').innerHTML = templates.map((template) => `
      <div class="template-item" data-template-item="${template.id}">
        <h4>${escapeHtml(template.title)}</h4>
        <p>${escapeHtml(template.body.slice(0, 150))}${template.body.length > 150 ? '...' : ''}</p>
      </div>
    `).join('');

    $$('[data-template-item]').forEach((el) => {
      el.addEventListener('click', () => {
        const template = templates.find((item) => item.id === el.dataset.templateItem);
        if (template) editTemplate(template);
      });
    });

    if (!$('#templateId').value && templates[0]) editTemplate(templates[0]);
  }

  function renderReminders() {
    const list = candidates
      .filter((item) => item.date && item.time && ['دعوت به مصاحبه', 'مصاحبه اول', 'مصاحبه دوم'].includes(item.status))
      .sort((a, b) => interviewDate(a) - interviewDate(b));

    $('#reminderList').innerHTML = list.length ? list.map((item) => `
      <div class="list-item">
        <div>
          <h4>${escapeHtml(item.name)} | ${escapeHtml(item.role)}</h4>
          <p>${formatDate(item.date)} ساعت ${toFa(item.time)} | ${escapeHtml(item.location || settings.defaultLocation)}</p>
        </div>
        <div class="actions-row compact">
          <button class="btn ghost small" data-reminder="24" data-id="${item.id}">۲۴ ساعت قبل</button>
          <button class="btn ghost small" data-reminder="3" data-id="${item.id}">۳ ساعت قبل</button>
          <button class="btn ghost small" data-reminder="1" data-id="${item.id}">۱ ساعت قبل</button>
        </div>
      </div>
    `).join('') : '<p class="muted">برای زمان‌بندی یادآوری، برای کاندیدا تاریخ و ساعت مصاحبه ثبت کن.</p>';

    $$('[data-reminder]').forEach((btn) => btn.addEventListener('click', () => {
      const candidate = candidates.find((item) => item.id === btn.dataset.id);
      if (candidate) scheduleReminder(candidate, Number(btn.dataset.reminder));
    }));
  }

  function renderLogs() {
    $('#logRows').innerHTML = logs.length ? logs.map((log) => `
      <tr>
        <td>${formatDateTime(log.createdAt)}</td>
        <td>${escapeHtml(log.recipient || '-')}</td>
        <td>${escapeHtml(log.kind || '-')}</td>
        <td><span class="pill ${log.ok ? 'green' : 'red'}">${log.ok ? 'موفق' : 'خطا'}</span></td>
        <td>${escapeHtml((log.message || '').slice(0, 100))}${(log.message || '').length > 100 ? '...' : ''}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="muted">لاگی ثبت نشده است.</td></tr>';
  }

  function renderSettings() {
    $('#companyName').value = settings.companyName;
    $('#hrName').value = settings.hrName;
    $('#defaultLocation').value = settings.defaultLocation;
    $('#locationLink').value = settings.locationLink;
    $('#apiToken').value = settings.apiToken;
    $('#clientDryRun').value = settings.clientDryRun;
  }

  function updateSelectedCount() {
    $('#selectedCount').textContent = `${toFa(selectedCandidates.size)} نفر انتخاب شده`;
  }

  function updateSmsLength() {
    const length = ($('#messageText').value || '').length;
    $('#smsLength').textContent = `${toFa(length)} کاراکتر`;
  }

  function selectUpcomingCandidates() {
    selectedCandidates = new Set(getUpcoming(3).map((item) => item.id));
    renderCandidatePicker();
    updateSelectedCount();
    toast('مصاحبه‌های نزدیک انتخاب شدند.');
  }

  function previewFirstMessage() {
    const selected = selectedCandidateObjects();
    if (!selected.length) {
      toast('اول حداقل یک کاندیدا انتخاب کن.');
      return;
    }
    const msg = applyTemplate($('#messageText').value, selected[0]);
    alert(msg);
  }

  async function sendSelectedMessages() {
    const selected = selectedCandidateObjects();
    if (!selected.length) {
      toast('هیچ گیرنده‌ای انتخاب نشده است.');
      return;
    }
    const body = $('#messageText').value.trim();
    if (!body) {
      toast('متن پیامک خالی است.');
      return;
    }

    $('#sendSmsBtn').disabled = true;
    $('#sendSmsBtn').textContent = 'در حال ارسال...';

    try {
      const results = [];
      for (const candidate of selected) {
        const message = applyTemplate(body, candidate);
        const result = await callSmsApi({
          mobiles: [candidate.phone],
          messageText: message,
          sendDateTime: normalizeSendDateTime($('#sendDateTime').value)
        });
        results.push({ candidate, message, result });
        logs.unshift({
          id: uid(),
          createdAt: new Date().toISOString(),
          recipient: `${candidate.name} - ${candidate.phone}`,
          kind: $('#sendDateTime').value ? 'زمان‌بندی‌شده' : 'ارسال مستقیم',
          ok: Boolean(result.ok),
          message,
          response: result
        });
      }
      saveLogs();
      renderLogs();
      toast(`${toFa(results.filter((item) => item.result.ok).length)} پیامک پردازش شد.`);
    } catch (error) {
      toast(error.message || 'ارسال با خطا روبه‌رو شد.');
    } finally {
      $('#sendSmsBtn').disabled = false;
      $('#sendSmsBtn').textContent = 'ارسال / زمان‌بندی پیامک';
    }
  }

  async function scheduleReminder(candidate, hoursBefore) {
    const interview = interviewDate(candidate);
    if (!interview) {
      toast('زمان مصاحبه این کاندیدا کامل نیست.');
      return;
    }
    const sendAt = new Date(interview.getTime() - hoursBefore * 60 * 60 * 1000);
    const template = templates.find((item) => item.title.includes(hoursBefore === 24 ? '۲۴' : '۳')) || templates[1] || templates[0];
    const message = applyTemplate(template.body, candidate);
    const result = await callSmsApi({
      mobiles: [candidate.phone],
      messageText: message,
      sendDateTime: sendAt > new Date() ? sendAt.toISOString() : undefined
    });

    logs.unshift({
      id: uid(),
      createdAt: new Date().toISOString(),
      recipient: `${candidate.name} - ${candidate.phone}`,
      kind: `یادآوری ${toFa(hoursBefore)} ساعت قبل`,
      ok: Boolean(result.ok),
      message,
      response: result
    });
    saveLogs();
    renderLogs();
    toast(result.ok ? 'یادآوری پردازش شد.' : 'پردازش یادآوری با خطا مواجه شد.');
  }

  async function scheduleAllReminders() {
    const list = candidates.filter((item) => item.date && item.time && ['دعوت به مصاحبه', 'مصاحبه اول', 'مصاحبه دوم'].includes(item.status));
    if (!list.length) {
      toast('مصاحبه‌ای برای زمان‌بندی پیدا نشد.');
      return;
    }
    if (!confirm(`برای ${list.length} مصاحبه یادآوری ۲۴ ساعت قبل زمان‌بندی شود؟`)) return;
    for (const candidate of list) {
      await scheduleReminder(candidate, 24);
    }
  }

  async function callSmsApi(payload) {
    if (settings.clientDryRun === 'true') {
      return { ok: true, dryRun: true, message: 'حالت تست ظاهری پنل فعال است.' };
    }

    const response = await fetch('/api/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiToken ? { 'X-HR-Token': settings.apiToken } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({ ok: false, message: 'پاسخ نامعتبر از سرور.' }));
    if (!response.ok || !data.ok) {
      return { ok: false, status: response.status, ...data };
    }
    return data;
  }

  function selectedCandidateObjects() {
    return candidates.filter((item) => selectedCandidates.has(item.id));
  }

  function applyTemplate(template, candidate) {
    return String(template || '')
      .replaceAll('{name}', candidate.name || '')
      .replaceAll('{role}', candidate.role || '')
      .replaceAll('{date}', formatDate(candidate.date || ''))
      .replaceAll('{time}', toFa(candidate.time || ''))
      .replaceAll('{location}', candidate.location || settings.defaultLocation || '')
      .replaceAll('{company}', settings.companyName || '')
      .replaceAll('{hrName}', settings.hrName || '')
      .replaceAll('{link}', settings.locationLink || '');
  }

  function getUpcoming(days) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() + days + 1);
    return candidates
      .filter((item) => item.date && interviewDate(item) >= now && interviewDate(item) < end)
      .sort((a, b) => interviewDate(a) - interviewDate(b));
  }

  function interviewDate(candidate) {
    if (!candidate.date) return null;
    const time = candidate.time || '00:00';
    return new Date(`${candidate.date}T${time}:00`);
  }

  function statusClass(status) {
    return STATUS_CLASS[status] || 'gray';
  }

  function normalizeMobile(value) {
    let mobile = String(value || '').trim().replace(/[\s\-()]/g, '');
    if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
    if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2);
    return mobile;
  }

  function normalizeSendDateTime(value) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  function saveCandidates() { store.set('iho_hr_candidates', candidates); }
  function saveTemplates() { store.set('iho_hr_templates', templates); }
  function saveLogs() { store.set('iho_hr_logs', logs); }
  function saveSettings() { store.set('iho_hr_settings', settings); }

  function exportLogs() {
    const rows = [
      ['time', 'recipient', 'kind', 'ok', 'message'],
      ...logs.map((log) => [log.createdAt, log.recipient, log.kind, log.ok ? 'ok' : 'failed', (log.message || '').replace(/\n/g, ' ')])
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iho-hr-sms-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    return '"' + String(value || '').replace(/"/g, '""') + '"';
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 3600);
  }

  function uid() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function todayPlus(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return toFa(value);
    try {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch (_) {
      return toFa(value);
    }
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (_) {
      return toFa(date.toLocaleString());
    }
  }

  function toFa(value) {
    return String(value ?? '').replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(name) {
    return String(name || 'HR').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('') || 'HR';
  }
})();
