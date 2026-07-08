(function () {
  'use strict';

  const STAGES = [
    'رزومه دریافت شد',
    'غربالگری',
    'تماس اولیه',
    'دعوت به مصاحبه',
    'مصاحبه اول',
    'مصاحبه دوم',
    'ارزیابی نهایی',
    'پیشنهاد همکاری',
    'پذیرفته شده',
    'عدم همکاری',
    'لیست انتظار'
  ];

  const ACTIVE_STAGES = STAGES.filter((stage) => !['پذیرفته شده', 'عدم همکاری', 'لیست انتظار'].includes(stage));

  const STAGE_CLASS = {
    'پذیرفته شده': 'green',
    'عدم همکاری': 'red',
    'لیست انتظار': 'yellow',
    'پیشنهاد همکاری': 'blue',
    'دعوت به مصاحبه': 'green',
    'ارزیابی نهایی': 'yellow'
  };

  const DEFAULT_SETTINGS = {
    companyName: 'ایران‌هتل آنلاین',
    panelTitle: 'IHO ATS',
    hrName: 'واحد منابع انسانی ایران‌هتل',
    defaultLocation: 'مشهد، دفتر مرکزی ایران‌هتل آنلاین',
    locationLink: '',
    hrPhone: '',
    interviewers: 'مدیر منابع انسانی، مدیر واحد مربوطه، مدیر عملیات',
    apiToken: '',
    clientDryRun: 'true'
  };

  const KEYS = {
    settings: 'iho_ats_settings_v2',
    jobs: 'iho_ats_jobs_v2',
    candidates: 'iho_ats_candidates_v2',
    templates: 'iho_ats_templates_v2',
    tasks: 'iho_ats_tasks_v2',
    logs: 'iho_ats_logs_v2',
    activities: 'iho_ats_activities_v2'
  };

  const DEFAULT_JOBS = [
    {
      id: uid(), title: 'کارشناس منابع انسانی', department: 'منابع انسانی', city: 'مشهد', owner: 'HR', status: 'باز', priority: 'بالا', openings: 1, type: 'تمام‌وقت', description: 'جذب، مصاحبه، پیگیری کاندیداها و هماهنگی آنبوردینگ.', createdAt: nowIso()
    },
    {
      id: uid(), title: 'کارشناس پشتیبانی هتل', department: 'عملیات', city: 'مشهد', owner: 'عملیات', status: 'باز', priority: 'متوسط', openings: 3, type: 'تمام‌وقت/شیفتی', description: 'پاسخگویی، پیگیری رزروها و ارتباط با واحدهای داخلی.', createdAt: nowIso()
    },
    {
      id: uid(), title: 'کارشناس فروش سازمانی', department: 'فروش', city: 'مشهد', owner: 'فروش', status: 'باز', priority: 'بالا', openings: 2, type: 'تمام‌وقت', description: 'توسعه فروش B2B و پیگیری سازمان‌ها و شرکت‌ها.', createdAt: nowIso()
    }
  ];

  const DEFAULT_TEMPLATES = [
    { id: uid(), title: 'دعوت به مصاحبه', body: 'سلام {name} عزیز\nاز طرف {company} برای موقعیت شغلی «{job}» به مصاحبه دعوت شده‌اید.\nزمان مصاحبه: {date} ساعت {time}\nمحل مصاحبه: {location}\n{link}\nلطفاً در صورت عدم امکان حضور، به واحد HR اطلاع دهید.\n{hrName}' },
    { id: uid(), title: 'یادآوری ۲۴ ساعت قبل مصاحبه', body: 'سلام {name} عزیز\nیادآوری می‌شود مصاحبه شما برای موقعیت «{job}» فردا در تاریخ {date} ساعت {time} برگزار می‌شود.\nمحل: {location}\nبا آرزوی موفقیت\n{hrName}' },
    { id: uid(), title: 'یادآوری ۳ ساعت قبل مصاحبه', body: 'سلام {name} عزیز\nمصاحبه شما با {company} امروز ساعت {time} برگزار می‌شود.\nلطفاً چند دقیقه زودتر در محل حضور داشته باشید.\nآدرس: {location}\n{hrName}' },
    { id: uid(), title: 'تغییر زمان مصاحبه', body: 'سلام {name} عزیز\nزمان مصاحبه شما برای موقعیت «{job}» تغییر کرد.\nزمان جدید: {date} ساعت {time}\nمحل: {location}\nاز همراهی شما سپاسگزاریم.\n{hrName}' },
    { id: uid(), title: 'درخواست تکمیل مدارک', body: 'سلام {name} عزیز\nلطفاً برای تکمیل فرایند بررسی موقعیت «{job}»، رزومه به‌روز و مدارک مرتبط را ارسال کنید.\n{hrName}' },
    { id: uid(), title: 'دعوت به مصاحبه دوم', body: 'سلام {name} عزیز\nنتیجه مصاحبه اول شما مثبت بوده و برای مصاحبه مرحله دوم موقعیت «{job}» دعوت می‌شوید.\nزمان: {date} ساعت {time}\nمحل: {location}\n{hrName}' },
    { id: uid(), title: 'اعلام نتیجه مثبت', body: 'سلام {name} عزیز\nبا خوشحالی اعلام می‌کنیم نتیجه بررسی شما برای موقعیت «{job}» مثبت بوده است.\nبرای هماهنگی مراحل بعدی، واحد منابع انسانی با شما تماس خواهد گرفت.\n{company}' },
    { id: uid(), title: 'عدم همکاری محترمانه', body: 'سلام {name} عزیز\nاز زمانی که برای فرایند مصاحبه موقعیت «{job}» در {company} گذاشتید سپاسگزاریم.\nدر این مرحله امکان همکاری فراهم نشد، اما اطلاعات شما برای فرصت‌های آینده در بانک منابع انسانی باقی می‌ماند.\nبا آرزوی موفقیت\n{hrName}' },
    { id: uid(), title: 'پیشنهاد همکاری / Offer', body: 'سلام {name} عزیز\nبا توجه به نتیجه مثبت ارزیابی‌ها، برای ادامه فرایند پیشنهاد همکاری موقعیت «{job}» با شما تماس گرفته خواهد شد.\n{company}' },
    { id: uid(), title: 'شروع همکاری / آنبوردینگ', body: 'سلام {name} عزیز\nبه خانواده {company} خوش آمدید.\nبرای شروع همکاری، لطفاً در تاریخ {date} ساعت {time} در محل {location} حضور داشته باشید.\n{hrName}' }
  ];

  const store = {
    available: false,
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        console.warn('storage get failed', key, error);
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    },
    remove(key) { localStorage.removeItem(key); }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  let settings = loadSettings();
  let jobs = store.get(KEYS.jobs, DEFAULT_JOBS);
  let candidates = loadCandidates();
  let templates = store.get(KEYS.templates, DEFAULT_TEMPLATES);
  let tasks = store.get(KEYS.tasks, []);
  let logs = store.get(KEYS.logs, []);
  let activities = store.get(KEYS.activities, []);
  let selectedCandidates = new Set();
  let currentView = 'dashboard';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    checkStorage();
    bindNavigation();
    bindJobs();
    bindCandidateForm();
    bindPipeline();
    bindTasks();
    bindTemplates();
    bindMessaging();
    bindReports();
    bindSettings();
    bindBackup();
    bindMisc();
    fillStaticSelects();
    applySettingsToUi();
    renderAll();
  }

  function checkStorage() {
    try {
      const k = '__iho_ats_storage_test__';
      localStorage.setItem(k, 'ok');
      store.available = localStorage.getItem(k) === 'ok';
      localStorage.removeItem(k);
    } catch (_) {
      store.available = false;
    }
  }

  function loadSettings() {
    const previous = store.get(KEYS.settings, null) || store.get('iho_hr_settings', null) || {};
    return { ...DEFAULT_SETTINGS, ...previous };
  }

  function loadCandidates() {
    const existing = store.get(KEYS.candidates, null);
    if (existing) return existing.map(normalizeCandidate);
    const old = store.get('iho_hr_candidates', null);
    if (old) return old.map(normalizeCandidate);
    return [];
  }

  function fillStaticSelects() {
    fillOptions('#statusFilter', ['all', ...STAGES], (item) => item === 'all' ? 'همه مراحل' : item);
    fillOptions('#candidateStage', STAGES);
    fillJobSelects();
    fillInterviewers();
  }

  function fillJobSelects() {
    const activeJobs = jobs.filter((job) => job.status !== 'بسته');
    const jobOptions = activeJobs.map((job) => ({ value: job.id, label: job.title }));
    setSelect('#candidateJob', [{ value: '', label: 'بدون اتصال به فرصت شغلی' }, ...jobOptions]);
    setSelect('#jobFilter', [{ value: 'all', label: 'همه موقعیت‌ها' }, ...jobOptions]);
    setSelect('#pipelineJobFilter', [{ value: 'all', label: 'همه فرصت‌های شغلی' }, ...jobOptions]);
    setSelect('#taskCandidate', [{ value: '', label: 'بدون کاندیدا' }, ...candidates.map((c) => ({ value: c.id, label: `${c.name} - ${candidateJobTitle(c)}` }))]);
  }

  function fillInterviewers() {
    const list = parseList(settings.interviewers);
    const data = $('#interviewerList');
    data.innerHTML = list.map((item) => `<option value="${escapeHtml(item)}"></option>`).join('');
  }

  function bindNavigation() {
    $$('.nav-item').forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));
    document.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-jump]');
      if (jump) setView(jump.dataset.jump);
    });
    $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  }

  function setView(view) {
    currentView = view;
    $$('.view').forEach((el) => el.classList.remove('active'));
    const target = $(`#view-${view}`);
    if (target) target.classList.add('active');
    $$('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
    $('#pageTitle').textContent = getTitle(view);
    $('#sidebar').classList.remove('open');
    renderAll();
  }

  function getTitle(view) {
    return {
      dashboard: 'داشبورد', jobs: 'فرصت‌های شغلی', candidates: 'کاندیداها', pipeline: 'پایپ‌لاین جذب', interviews: 'مصاحبه‌ها', tasks: 'تسک‌های HR', messages: 'مرکز پیامک', templates: 'قالب‌ها', reports: 'گزارش‌ها', settings: 'تنظیمات'
    }[view] || 'IHO ATS';
  }

  function bindJobs() {
    $('#openJobModal').addEventListener('click', () => openJobModal());
    $$('[data-close-job-modal]').forEach((el) => el.addEventListener('click', closeJobModal));
    $('#jobForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#jobId').value || uid();
      const item = {
        id,
        title: $('#jobTitle').value.trim(),
        department: $('#jobDepartment').value.trim(),
        city: $('#jobCity').value.trim(),
        owner: $('#jobOwner').value.trim(),
        status: $('#jobStatus').value,
        priority: $('#jobPriority').value,
        openings: Number($('#jobOpenings').value || 1),
        type: $('#jobType').value.trim(),
        description: $('#jobDescription').value.trim(),
        createdAt: jobs.find((job) => job.id === id)?.createdAt || nowIso(),
        updatedAt: nowIso()
      };
      if (!item.title) return toast('عنوان شغلی الزامی است.');
      jobs = jobs.some((job) => job.id === id) ? jobs.map((job) => job.id === id ? item : job) : [item, ...jobs];
      saveJobs();
      addActivity(null, 'job', `فرصت شغلی «${item.title}» ذخیره شد.`);
      closeJobModal();
      fillStaticSelects();
      renderAll();
      toast('فرصت شغلی ذخیره شد.');
    });
    $('#jobSearch').addEventListener('input', renderJobs);
    $('#jobStatusFilter').addEventListener('change', renderJobs);
  }

  function openJobModal(job) {
    $('#jobModalTitle').textContent = job ? 'ویرایش فرصت شغلی' : 'افزودن فرصت شغلی';
    $('#jobId').value = job?.id || '';
    $('#jobTitle').value = job?.title || '';
    $('#jobDepartment').value = job?.department || '';
    $('#jobCity').value = job?.city || '';
    $('#jobOwner').value = job?.owner || settings.hrName || '';
    $('#jobStatus').value = job?.status || 'باز';
    $('#jobPriority').value = job?.priority || 'متوسط';
    $('#jobOpenings').value = job?.openings || 1;
    $('#jobType').value = job?.type || 'تمام‌وقت';
    $('#jobDescription').value = job?.description || '';
    openModal('#jobModal');
  }

  function closeJobModal() { closeModal('#jobModal'); }

  function bindCandidateForm() {
    $('#openCandidateModal').addEventListener('click', () => openCandidateModal());
    $('#addCandidateFromTable').addEventListener('click', () => openCandidateModal());
    $$('[data-close-modal]').forEach((el) => el.addEventListener('click', closeCandidateModal));

    $('#candidateJob').addEventListener('change', () => {
      const job = jobs.find((item) => item.id === $('#candidateJob').value);
      if (job && !$('#candidateRole').value.trim()) $('#candidateRole').value = job.title;
    });

    $('#candidateForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#candidateId').value || uid();
      const old = candidates.find((item) => item.id === id);
      const candidate = normalizeCandidate({
        id,
        name: $('#candidateName').value.trim(),
        phone: normalizeMobile($('#candidatePhone').value),
        email: $('#candidateEmail').value.trim(),
        jobId: $('#candidateJob').value,
        role: $('#candidateRole').value.trim(),
        source: $('#candidateSource').value.trim(),
        stage: $('#candidateStage').value,
        date: $('#candidateDate').value,
        time: $('#candidateTime').value,
        interviewer: $('#candidateInterviewer').value.trim(),
        expectedSalary: $('#candidateSalary').value.trim(),
        availability: $('#candidateAvailability').value.trim(),
        resumeUrl: $('#candidateResume').value.trim(),
        location: $('#candidateLocation').value.trim() || settings.defaultLocation,
        tags: $('#candidateTags').value.trim(),
        notes: $('#candidateNotes').value.trim(),
        score: Number($('#candidateScore').value || 0),
        scorecard: {
          technical: Number($('#scoreTechnical').value || 0),
          communication: Number($('#scoreCommunication').value || 0),
          culture: Number($('#scoreCulture').value || 0),
          motivation: Number($('#scoreMotivation').value || 0),
          availability: Number($('#scoreAvailability').value || 0)
        },
        createdAt: old?.createdAt || nowIso(),
        updatedAt: nowIso()
      });

      if (!candidate.name) return toast('نام کاندیدا الزامی است.');
      if (!/^09\d{9}$/.test(candidate.phone)) return toast('شماره موبایل معتبر نیست. فرمت درست: 09xxxxxxxxx');
      if (!candidate.role) return toast('موقعیت شغلی الزامی است.');

      candidates = old ? candidates.map((item) => item.id === id ? candidate : item) : [candidate, ...candidates];
      saveCandidates();
      addActivity(candidate.id, old ? 'candidate_update' : 'candidate_create', `${old ? 'کاندیدا ویرایش شد' : 'کاندیدا ثبت شد'}: ${candidate.name}`);
      closeCandidateModal();
      fillStaticSelects();
      renderAll();
      toast('کاندیدا ذخیره شد و تنظیمات فعلی اعمال شد.');
    });

    $('#searchInput').addEventListener('input', renderCandidatesTable);
    $('#statusFilter').addEventListener('change', renderCandidatesTable);
    $('#jobFilter').addEventListener('change', renderCandidatesTable);
  }

  function openCandidateModal(candidate) {
    const item = candidate ? normalizeCandidate(candidate) : null;
    $('#candidateModalTitle').textContent = item ? 'ویرایش کاندیدا' : 'افزودن کاندیدا';
    $('#candidateId').value = item?.id || '';
    $('#candidateName').value = item?.name || '';
    $('#candidatePhone').value = item?.phone || '';
    $('#candidateEmail').value = item?.email || '';
    $('#candidateJob').value = item?.jobId || '';
    $('#candidateRole').value = item?.role || candidateJobTitleFromJobId($('#candidateJob').value) || '';
    $('#candidateSource').value = item?.source || '';
    $('#candidateStage').value = item?.stage || 'رزومه دریافت شد';
    $('#candidateScore').value = item?.score ?? 70;
    $('#candidateDate').value = item?.date || '';
    $('#candidateTime').value = item?.time || '';
    $('#candidateInterviewer').value = item?.interviewer || '';
    $('#candidateSalary').value = item?.expectedSalary || '';
    $('#candidateAvailability').value = item?.availability || '';
    $('#candidateResume').value = item?.resumeUrl || '';
    $('#candidateLocation').value = item?.location || settings.defaultLocation;
    $('#candidateTags').value = item?.tags || '';
    $('#candidateNotes').value = item?.notes || '';
    $('#scoreTechnical').value = item?.scorecard?.technical || '';
    $('#scoreCommunication').value = item?.scorecard?.communication || '';
    $('#scoreCulture').value = item?.scorecard?.culture || '';
    $('#scoreMotivation').value = item?.scorecard?.motivation || '';
    $('#scoreAvailability').value = item?.scorecard?.availability || '';
    openModal('#candidateModal');
  }

  function closeCandidateModal() { closeModal('#candidateModal'); }

  function bindPipeline() {
    $('#pipelineJobFilter').addEventListener('change', renderPipelineBoard);
    $('#moveSelectedToInterview').addEventListener('click', () => {
      const ids = selectedCandidateIdsFromPipeline();
      if (!ids.length) return toast('در پایپ‌لاین هیچ کاندیدایی انتخاب نشده است.');
      candidates = candidates.map((candidate) => ids.includes(candidate.id) ? { ...candidate, stage: 'دعوت به مصاحبه', updatedAt: nowIso() } : candidate);
      saveCandidates();
      ids.forEach((id) => addActivity(id, 'stage', 'کاندیدا به مرحله دعوت به مصاحبه منتقل شد.'));
      renderAll();
      toast(`${toFa(ids.length)} کاندیدا به مرحله دعوت به مصاحبه منتقل شد.`);
    });
  }

  function bindTasks() {
    $('#openTaskModal').addEventListener('click', () => openTaskModal());
    $$('[data-close-task-modal]').forEach((el) => el.addEventListener('click', closeTaskModal));
    $('#taskStatusFilter').addEventListener('change', renderTasks);
    $('#taskForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#taskId').value || uid();
      const old = tasks.find((task) => task.id === id);
      const task = {
        id,
        title: $('#taskTitle').value.trim(),
        candidateId: $('#taskCandidate').value,
        dueDate: $('#taskDueDate').value,
        owner: $('#taskOwner').value.trim() || settings.hrName,
        priority: $('#taskPriority').value,
        notes: $('#taskNotes').value.trim(),
        status: old?.status || 'open',
        createdAt: old?.createdAt || nowIso(),
        updatedAt: nowIso()
      };
      if (!task.title) return toast('عنوان تسک الزامی است.');
      tasks = old ? tasks.map((item) => item.id === id ? task : item) : [task, ...tasks];
      saveTasks();
      addActivity(task.candidateId || null, 'task', `تسک ذخیره شد: ${task.title}`);
      closeTaskModal();
      renderAll();
      toast('تسک ذخیره شد.');
    });
  }

  function openTaskModal(task) {
    $('#taskModalTitle').textContent = task ? 'ویرایش تسک' : 'افزودن تسک';
    $('#taskId').value = task?.id || '';
    $('#taskTitle').value = task?.title || '';
    $('#taskCandidate').value = task?.candidateId || '';
    $('#taskDueDate').value = task?.dueDate || todayPlus(1);
    $('#taskOwner').value = task?.owner || settings.hrName;
    $('#taskPriority').value = task?.priority || 'متوسط';
    $('#taskNotes').value = task?.notes || '';
    openModal('#taskModal');
  }

  function closeTaskModal() { closeModal('#taskModal'); }

  function bindTemplates() {
    $('#templateForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const id = $('#templateId').value || uid();
      const item = { id, title: $('#templateTitle').value.trim(), body: $('#templateBody').value.trim() };
      if (!item.title || !item.body) return toast('عنوان و متن قالب الزامی است.');
      templates = templates.some((template) => template.id === id) ? templates.map((template) => template.id === id ? item : template) : [item, ...templates];
      saveTemplates();
      renderTemplates();
      renderTemplateSelect();
      toast('قالب ذخیره شد.');
    });
    $('#newTemplateBtn').addEventListener('click', () => editTemplate({ id: '', title: '', body: '' }));
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

  function bindReports() {
    $('#exportCandidatesBtn').addEventListener('click', exportCandidates);
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
      persistSettingsFromForm();
    });

    ['companyName','panelTitle','hrName','defaultLocation','locationLink','hrPhone','interviewers','apiToken','clientDryRun'].forEach((id) => {
      const el = $('#' + id);
      el.addEventListener('change', () => {
        $('#settingsSaveState').textContent = 'تغییرات ذخیره‌نشده';
        $('#settingsSaveState').className = 'pill yellow';
      });
    });

    $('#resetSettingsBtn').addEventListener('click', () => {
      if (!confirm('تنظیمات به حالت پیش‌فرض برگردد؟')) return;
      settings = { ...DEFAULT_SETTINGS };
      saveSettings(true);
      applySettingsToUi();
      renderSettings();
      renderAll();
      toast('تنظیمات پیش‌فرض اعمال شد.');
    });

    $('#testStorageBtn').addEventListener('click', () => {
      const test = { at: nowIso(), value: Math.random() };
      try {
        store.set('iho_ats_storage_test', test);
        const read = store.get('iho_ats_storage_test', null);
        const ok = read && read.value === test.value;
        toast(ok ? 'ذخیره‌سازی مرورگر سالم است.' : 'ذخیره‌سازی مرورگر درست خوانده نشد.');
      } catch (error) {
        toast('ذخیره‌سازی مرورگر خطا دارد: ' + error.message);
      }
    });
  }

  function bindBackup() {
    $('#backupBtn').addEventListener('click', exportAllJson);
    $('#exportAllBtn').addEventListener('click', exportAllJson);
    $('#importAllInput').addEventListener('change', importAllJson);
    $('#clearAllBtn').addEventListener('click', () => {
      if (!confirm('کل دیتای ATS از همین مرورگر پاک شود؟ این کار قابل برگشت نیست.')) return;
      Object.values(KEYS).forEach((key) => store.remove(key));
      settings = { ...DEFAULT_SETTINGS };
      jobs = [];
      candidates = [];
      templates = DEFAULT_TEMPLATES;
      tasks = [];
      logs = [];
      activities = [];
      saveTemplates();
      applySettingsToUi();
      fillStaticSelects();
      renderAll();
      toast('کل دیتای محلی پاک شد.');
    });
  }

  function bindMisc() {
    $('#seedBtn').addEventListener('click', () => {
      if ((jobs.length || candidates.length) && !confirm('دیتای نمونه به دیتای فعلی اضافه شود؟')) return;
      const seededJobs = DEFAULT_JOBS.map((job) => ({ ...job, id: uid(), createdAt: nowIso() }));
      jobs = [...seededJobs, ...jobs];
      candidates = [...sampleCandidates(seededJobs), ...candidates];
      tasks = [...sampleTasks(), ...tasks];
      addActivity(null, 'seed', 'دیتای نمونه ATS اضافه شد.');
      saveJobs(); saveCandidates(); saveTasks();
      fillStaticSelects(); renderAll();
      toast('دیتای نمونه ATS اضافه شد.');
    });
  }

  function persistSettingsFromForm() {
    const next = {
      companyName: $('#companyName').value.trim() || DEFAULT_SETTINGS.companyName,
      panelTitle: $('#panelTitle').value.trim() || DEFAULT_SETTINGS.panelTitle,
      hrName: $('#hrName').value.trim() || DEFAULT_SETTINGS.hrName,
      defaultLocation: $('#defaultLocation').value.trim() || DEFAULT_SETTINGS.defaultLocation,
      locationLink: $('#locationLink').value.trim(),
      hrPhone: $('#hrPhone').value.trim(),
      interviewers: $('#interviewers').value.trim(),
      apiToken: $('#apiToken').value.trim(),
      clientDryRun: $('#clientDryRun').value
    };
    settings = { ...DEFAULT_SETTINGS, ...next };
    const ok = saveSettings(true);
    settings = loadSettings();
    applySettingsToUi();
    fillStaticSelects();
    renderAll();
    $('#settingsSaveState').textContent = ok ? 'ذخیره و اعمال شد' : 'خطا در ذخیره';
    $('#settingsSaveState').className = ok ? 'pill green' : 'pill red';
    toast(ok ? 'تنظیمات ذخیره شد، دوباره خوانده شد و روی پنل اعمال شد.' : 'ذخیره تنظیمات با خطا مواجه شد.');
  }

  function renderAll() {
    applySettingsToUi();
    renderStats();
    renderUpcoming();
    renderPipelineChart();
    renderActivityFeed();
    renderJobs();
    renderCandidatesTable();
    renderPipelineBoard();
    renderInterviews();
    renderScorecardPanel();
    renderTasks();
    renderCandidatePicker();
    renderTemplateSelect();
    renderTemplates();
    renderReports();
    renderLogs();
    renderSettings();
    updateSelectedCount();
    updateSmsLength();
  }

  function applySettingsToUi() {
    $('#brandTitle').textContent = settings.panelTitle || 'IHO ATS';
    $('#brandSubTitle').textContent = settings.companyName || 'ایران‌هتل آنلاین';
    $('#storageBadge').textContent = store.available ? 'ذخیره‌سازی فعال' : 'ذخیره‌سازی غیرفعال';
    $('#dryRunBadge').textContent = settings.clientDryRun === 'false' ? 'حالت ارسال: واقعی از پنل' : 'حالت ارسال: تستی داخل پنل';
  }

  function renderStats() {
    const total = candidates.length;
    const openJobs = jobs.filter((job) => job.status === 'باز').length;
    const upcoming = getUpcoming(3).length;
    const openTasks = tasks.filter((task) => task.status !== 'done').length;
    const accepted = candidates.filter((item) => item.stage === 'پذیرفته شده').length;
    const conversion = total ? Math.round((accepted / total) * 100) : 0;
    const items = [
      ['کل کاندیداها', total],
      ['فرصت‌های شغلی باز', openJobs],
      ['مصاحبه‌های ۳ روز آینده', upcoming],
      ['تسک‌های باز', openTasks],
      ['نرخ پذیرش', conversion + '%']
    ];
    $('#statsGrid').innerHTML = items.map(([label, value]) => `<div class="stat"><b>${toFa(value)}</b><span>${label}</span></div>`).join('');
  }

  function renderUpcoming() {
    const list = getUpcoming(3).slice(0, 7);
    $('#upcomingList').innerHTML = list.length ? list.map((item) => `
      <div class="list-item">
        <div>
          <h4>${escapeHtml(item.name)} <span class="pill ${stageClass(item.stage)}">${escapeHtml(item.stage)}</span></h4>
          <p>${escapeHtml(candidateJobTitle(item))} | ${formatDate(item.date)} ساعت ${toFa(item.time || '-')} | ${escapeHtml(item.location || settings.defaultLocation)}</p>
        </div>
        <div class="actions-row compact">
          <button class="btn ghost small" data-edit-candidate="${item.id}">پرونده</button>
          <button class="btn ghost small" data-send-one="${item.id}">پیامک</button>
        </div>
      </div>
    `).join('') : '<p class="muted">مصاحبه نزدیک ثبت نشده است.</p>';

    bindCandidateActionButtons();
    $$('[data-send-one]').forEach((btn) => btn.addEventListener('click', () => {
      selectedCandidates = new Set([btn.dataset.sendOne]);
      setView('messages');
    }));
  }

  function renderPipelineChart() {
    const counts = STAGES.map((stage) => [stage, candidates.filter((item) => item.stage === stage).length]);
    const max = Math.max(1, ...counts.map(([, count]) => count));
    $('#pipelineChart').innerHTML = counts.map(([stage, count]) => `
      <div class="pipeline-row">
        <span>${escapeHtml(stage)}</span>
        <div class="bar"><span style="width:${Math.round((count / max) * 100)}%"></span></div>
        <b>${toFa(count)}</b>
      </div>
    `).join('');
  }

  function renderActivityFeed() {
    const list = activities.slice(0, 8);
    $('#activityFeed').innerHTML = list.length ? list.map((item) => `
      <div class="timeline-item">
        <div>
          <h4>${escapeHtml(item.text)}</h4>
          <p>${formatDateTime(item.at)} ${item.candidateId ? ' | ' + escapeHtml(candidateNameById(item.candidateId)) : ''}</p>
        </div>
        <span class="pill gray">${escapeHtml(item.type)}</span>
      </div>
    `).join('') : '<p class="muted">هنوز فعالیتی ثبت نشده است.</p>';
  }

  function renderJobs() {
    const q = ($('#jobSearch')?.value || '').trim().toLowerCase();
    const status = $('#jobStatusFilter')?.value || 'all';
    const rows = jobs.filter((job) => {
      const text = `${job.title} ${job.department} ${job.city} ${job.owner}`.toLowerCase();
      return (!q || text.includes(q)) && (status === 'all' || job.status === status);
    });
    $('#jobsGrid').innerHTML = rows.length ? rows.map((job) => {
      const count = candidates.filter((c) => c.jobId === job.id).length;
      const accepted = candidates.filter((c) => c.jobId === job.id && c.stage === 'پذیرفته شده').length;
      return `
        <article class="job-card">
          <div>
            <h4>${escapeHtml(job.title)}</h4>
            <p class="muted">${escapeHtml(job.department || 'بدون واحد')} | ${escapeHtml(job.city || 'بدون شهر')} | مالک: ${escapeHtml(job.owner || '-')}</p>
          </div>
          <div class="job-meta">
            <span class="pill ${job.status === 'باز' ? 'green' : job.status === 'متوقف' ? 'yellow' : 'gray'}">${escapeHtml(job.status)}</span>
            <span class="pill blue">اولویت ${escapeHtml(job.priority)}</span>
            <span class="pill gray">ظرفیت ${toFa(job.openings || 1)}</span>
            <span class="pill gray">${escapeHtml(job.type || 'تمام‌وقت')}</span>
          </div>
          <p class="muted">${escapeHtml(job.description || 'شرح نیازمندی ثبت نشده است.')}</p>
          <div class="score-mini">
            <div class="muted">کاندیدا: ${toFa(count)} | پذیرفته: ${toFa(accepted)}</div>
            <div class="score-line"><span style="width:${Math.min(100, count * 12)}%"></span></div>
          </div>
          <div class="job-actions">
            <button class="btn ghost small" data-edit-job="${job.id}">ویرایش</button>
            <button class="btn ghost small" data-new-candidate-job="${job.id}">کاندیدای جدید</button>
            <button class="btn danger small" data-delete-job="${job.id}">حذف</button>
          </div>
        </article>
      `;
    }).join('') : '<p class="muted">فرصت شغلی پیدا نشد.</p>';

    $$('[data-edit-job]').forEach((btn) => btn.addEventListener('click', () => {
      const job = jobs.find((item) => item.id === btn.dataset.editJob);
      if (job) openJobModal(job);
    }));
    $$('[data-new-candidate-job]').forEach((btn) => btn.addEventListener('click', () => {
      const job = jobs.find((item) => item.id === btn.dataset.newCandidateJob);
      openCandidateModal({ jobId: job?.id || '', role: job?.title || '', stage: 'رزومه دریافت شد', location: settings.defaultLocation });
    }));
    $$('[data-delete-job]').forEach((btn) => btn.addEventListener('click', () => {
      const job = jobs.find((item) => item.id === btn.dataset.deleteJob);
      if (!job || !confirm(`فرصت شغلی «${job.title}» حذف شود؟ اتصال کاندیداها حفظ ولی بدون فرصت می‌شود.`)) return;
      jobs = jobs.filter((item) => item.id !== job.id);
      candidates = candidates.map((candidate) => candidate.jobId === job.id ? { ...candidate, jobId: '' } : candidate);
      saveJobs(); saveCandidates();
      fillStaticSelects(); renderAll();
      toast('فرصت شغلی حذف شد.');
    }));
  }

  function renderCandidatesTable() {
    const q = ($('#searchInput')?.value || '').trim().toLowerCase();
    const stage = $('#statusFilter')?.value || 'all';
    const jobId = $('#jobFilter')?.value || 'all';
    const rows = candidates.filter((item) => {
      const text = `${item.name} ${item.phone} ${item.email} ${item.role} ${item.source} ${item.tags} ${candidateJobTitle(item)}`.toLowerCase();
      return (!q || text.includes(q)) && (stage === 'all' || item.stage === stage) && (jobId === 'all' || item.jobId === jobId);
    });

    $('#candidateRows').innerHTML = rows.length ? rows.map((item) => `
      <tr>
        <td>
          <div class="person">
            <div class="avatar">${escapeHtml(initials(item.name))}</div>
            <div><strong>${escapeHtml(item.name)}</strong><div class="muted">${escapeHtml(item.source || 'بدون منبع')} ${item.tags ? ' | ' + escapeHtml(item.tags) : ''}</div></div>
          </div>
        </td>
        <td>${toFa(item.phone)}</td>
        <td>${escapeHtml(candidateJobTitle(item))}</td>
        <td><span class="pill ${stageClass(item.stage)}">${escapeHtml(item.stage)}</span></td>
        <td>${item.date ? `${formatDate(item.date)}<br><span class="muted">ساعت ${toFa(item.time || '-')}</span>` : '<span class="muted">ثبت نشده</span>'}</td>
        <td>${toFa(item.score || 0)}</td>
        <td>
          <div class="actions-row compact">
            <button class="btn ghost small" data-edit-candidate="${item.id}">ویرایش</button>
            <button class="btn ghost small" data-stage-next="${item.id}">مرحله بعد</button>
            <button class="btn danger small" data-delete-candidate="${item.id}">حذف</button>
          </div>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="7" class="muted">کاندیدایی پیدا نشد.</td></tr>';

    bindCandidateActionButtons();
  }

  function renderPipelineBoard() {
    const jobId = $('#pipelineJobFilter')?.value || 'all';
    const rows = candidates.filter((candidate) => jobId === 'all' || candidate.jobId === jobId);
    $('#pipelineBoard').innerHTML = STAGES.map((stage) => {
      const stageItems = rows.filter((candidate) => candidate.stage === stage);
      return `
        <div class="kanban-col">
          <div class="kanban-head"><h4>${escapeHtml(stage)}</h4><span class="pill gray">${toFa(stageItems.length)}</span></div>
          ${stageItems.length ? stageItems.map((candidate) => pipelineCard(candidate)).join('') : '<p class="muted">خالی</p>'}
        </div>
      `;
    }).join('');

    bindCandidateActionButtons();
  }

  function pipelineCard(candidate) {
    return `
      <div class="candidate-card">
        <label class="pick-item" style="padding:0;border:0;background:transparent"><input type="checkbox" data-pipeline-select="${candidate.id}" /><span><strong>${escapeHtml(candidate.name)}</strong><span>${escapeHtml(candidateJobTitle(candidate))}</span></span></label>
        <div class="job-meta">
          <span class="pill gray">${toFa(candidate.phone)}</span>
          <span class="pill blue">امتیاز ${toFa(candidate.score || 0)}</span>
        </div>
        <p class="muted">${candidate.date ? formatDate(candidate.date) + ' ساعت ' + toFa(candidate.time || '-') : 'بدون زمان مصاحبه'}</p>
        <div class="candidate-card-actions">
          <button class="btn ghost small" data-stage-prev="${candidate.id}">قبل</button>
          <button class="btn ghost small" data-stage-next="${candidate.id}">بعد</button>
          <button class="btn ghost small" data-edit-candidate="${candidate.id}">پرونده</button>
        </div>
      </div>
    `;
  }

  function renderInterviews() {
    const list = candidates.filter((item) => item.date && item.time).sort((a, b) => interviewDate(a) - interviewDate(b));
    $('#interviewList').innerHTML = list.length ? list.map((item) => `
      <div class="list-item">
        <div>
          <h4>${escapeHtml(item.name)} | ${escapeHtml(candidateJobTitle(item))}</h4>
          <p>${formatDate(item.date)} ساعت ${toFa(item.time)} | ${escapeHtml(item.location || settings.defaultLocation)} | مصاحبه‌کننده: ${escapeHtml(item.interviewer || '-')}</p>
        </div>
        <div class="actions-row compact">
          <button class="btn ghost small" data-reminder="24" data-id="${item.id}">۲۴ ساعت قبل</button>
          <button class="btn ghost small" data-reminder="3" data-id="${item.id}">۳ ساعت قبل</button>
          <button class="btn ghost small" data-reminder="1" data-id="${item.id}">۱ ساعت قبل</button>
          <button class="btn ghost small" data-edit-candidate="${item.id}">پرونده</button>
        </div>
      </div>
    `).join('') : '<p class="muted">برای کاندیداها تاریخ و ساعت مصاحبه ثبت کن.</p>';

    $$('[data-reminder]').forEach((btn) => btn.addEventListener('click', () => {
      const candidate = candidates.find((item) => item.id === btn.dataset.id);
      if (candidate) scheduleReminder(candidate, Number(btn.dataset.reminder));
    }));
    bindCandidateActionButtons();
  }

  function renderScorecardPanel() {
    const top = candidates.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
    $('#scorecardPanel').innerHTML = top.length ? top.map((candidate) => {
      const scorecard = candidate.scorecard || {};
      const rows = [
        ['فنی', scorecard.technical || 0], ['ارتباطی', scorecard.communication || 0], ['فرهنگ', scorecard.culture || 0], ['انگیزه', scorecard.motivation || 0], ['دسترسی', scorecard.availability || 0]
      ];
      return `
        <div class="score-person">
          <h4>${escapeHtml(candidate.name)} <span class="pill blue">${toFa(candidate.score || 0)}</span></h4>
          <p class="muted">${escapeHtml(candidateJobTitle(candidate))} | ${escapeHtml(candidate.stage)}</p>
          <div class="score-bars">
            ${rows.map(([label, value]) => `<div class="score-row"><span>${label}</span><div class="score-line"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div><b>${toFa(value)}</b></div>`).join('')}
          </div>
        </div>`;
    }).join('') : '<p class="muted">کاندیدایی برای امتیازدهی ثبت نشده است.</p>';
  }

  function renderTasks() {
    const filter = $('#taskStatusFilter')?.value || 'open';
    const rows = tasks.filter((task) => filter === 'all' || task.status === filter);
    $('#tasksList').innerHTML = rows.length ? rows.map((task) => `
      <div class="task-item">
        <div>
          <h4>${escapeHtml(task.title)} <span class="pill ${task.priority === 'بالا' ? 'red' : task.priority === 'متوسط' ? 'yellow' : 'gray'}">${escapeHtml(task.priority)}</span></h4>
          <p>${task.candidateId ? 'کاندیدا: ' + escapeHtml(candidateNameById(task.candidateId)) + ' | ' : ''}سررسید: ${task.dueDate ? formatDate(task.dueDate) : '-'} | مسئول: ${escapeHtml(task.owner || '-')}</p>
          ${task.notes ? `<p>${escapeHtml(task.notes)}</p>` : ''}
        </div>
        <div class="actions-row compact">
          <button class="btn ghost small" data-toggle-task="${task.id}">${task.status === 'done' ? 'باز کردن' : 'انجام شد'}</button>
          <button class="btn ghost small" data-edit-task="${task.id}">ویرایش</button>
          <button class="btn danger small" data-delete-task="${task.id}">حذف</button>
        </div>
      </div>
    `).join('') : '<p class="muted">تسکی وجود ندارد.</p>';

    $$('[data-toggle-task]').forEach((btn) => btn.addEventListener('click', () => {
      tasks = tasks.map((task) => task.id === btn.dataset.toggleTask ? { ...task, status: task.status === 'done' ? 'open' : 'done', updatedAt: nowIso() } : task);
      saveTasks(); renderAll(); toast('وضعیت تسک تغییر کرد.');
    }));
    $$('[data-edit-task]').forEach((btn) => btn.addEventListener('click', () => {
      const task = tasks.find((item) => item.id === btn.dataset.editTask);
      if (task) openTaskModal(task);
    }));
    $$('[data-delete-task]').forEach((btn) => btn.addEventListener('click', () => {
      const task = tasks.find((item) => item.id === btn.dataset.deleteTask);
      if (!task || !confirm('این تسک حذف شود؟')) return;
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks(); renderAll(); toast('تسک حذف شد.');
    }));
  }

  function renderCandidatePicker() {
    $('#candidatePicker').innerHTML = candidates.length ? candidates.map((item) => `
      <label class="pick-item">
        <input type="checkbox" value="${item.id}" ${selectedCandidates.has(item.id) ? 'checked' : ''} />
        <span>
          <strong>${escapeHtml(item.name)} - ${toFa(item.phone)}</strong>
          <span>${escapeHtml(candidateJobTitle(item))} | ${escapeHtml(item.stage)} | ${item.date ? formatDate(item.date) + ' ساعت ' + toFa(item.time || '-') : 'بدون زمان مصاحبه'}</span>
        </span>
      </label>
    `).join('') : '<p class="muted">ابتدا کاندیدا ثبت کن.</p>';

    $$('#candidatePicker input[type="checkbox"]').forEach((input) => input.addEventListener('change', () => {
      if (input.checked) selectedCandidates.add(input.value);
      else selectedCandidates.delete(input.value);
      updateSelectedCount();
    }));
  }

  function renderTemplateSelect() {
    const select = $('#templateSelect');
    const current = select.value;
    select.innerHTML = templates.map((template) => `<option value="${template.id}">${escapeHtml(template.title)}</option>`).join('');
    select.value = templates.some((template) => template.id === current) ? current : (templates[0]?.id || '');
    const selected = templates.find((template) => template.id === select.value) || templates[0];
    if (!$('#messageText').value && selected) $('#messageText').value = selected.body;
  }

  function renderTemplates() {
    $('#templateList').innerHTML = templates.map((template) => `
      <div class="template-item" data-template-item="${template.id}">
        <h4>${escapeHtml(template.title)}</h4>
        <p>${escapeHtml(template.body.slice(0, 160))}${template.body.length > 160 ? '...' : ''}</p>
      </div>
    `).join('');
    $$('[data-template-item]').forEach((el) => el.addEventListener('click', () => {
      const template = templates.find((item) => item.id === el.dataset.templateItem);
      if (template) editTemplate(template);
    }));
    if (!$('#templateId').value && templates[0]) editTemplate(templates[0]);
  }

  function renderReports() {
    const total = candidates.length;
    const accepted = candidates.filter((c) => c.stage === 'پذیرفته شده').length;
    const rejected = candidates.filter((c) => c.stage === 'عدم همکاری').length;
    const interviews = candidates.filter((c) => c.date && c.time).length;
    const avgScore = total ? Math.round(candidates.reduce((sum, c) => sum + Number(c.score || 0), 0) / total) : 0;
    const smsOk = logs.filter((log) => log.ok).length;
    const cards = [
      ['کل کاندیداها', total], ['مصاحبه ثبت‌شده', interviews], ['پذیرفته شده', accepted], ['عدم همکاری', rejected], ['میانگین امتیاز', avgScore], ['پیامک موفق/تستی', smsOk]
    ];
    $('#reportsGrid').innerHTML = cards.map(([label, value]) => `<div class="report-card"><span>${label}</span><b>${toFa(value)}</b></div>`).join('');
  }

  function renderLogs() {
    $('#logRows').innerHTML = logs.length ? logs.slice(0, 60).map((log) => `
      <tr>
        <td>${formatDateTime(log.createdAt)}</td>
        <td>${escapeHtml(log.recipient || '-')}</td>
        <td>${escapeHtml(log.kind || '-')}</td>
        <td><span class="pill ${log.ok ? 'green' : 'red'}">${log.ok ? 'موفق' : 'خطا'}</span></td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="muted">لاگی ثبت نشده است.</td></tr>';
  }

  function renderSettings() {
    $('#companyName').value = settings.companyName;
    $('#panelTitle').value = settings.panelTitle;
    $('#hrName').value = settings.hrName;
    $('#defaultLocation').value = settings.defaultLocation;
    $('#locationLink').value = settings.locationLink;
    $('#hrPhone').value = settings.hrPhone;
    $('#interviewers').value = settings.interviewers;
    $('#apiToken').value = settings.apiToken;
    $('#clientDryRun').value = settings.clientDryRun;
    if ($('#settingsSaveState').textContent === 'تغییرات ذخیره‌نشده') return;
    $('#settingsSaveState').textContent = 'ذخیره‌شده';
    $('#settingsSaveState').className = 'pill green';
  }

  function bindCandidateActionButtons() {
    $$('[data-edit-candidate]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.editCandidate);
      if (item) openCandidateModal(item);
    }));
    $$('[data-delete-candidate]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.deleteCandidate);
      if (!item || !confirm(`کاندیدای ${item.name} حذف شود؟`)) return;
      candidates = candidates.filter((candidate) => candidate.id !== item.id);
      tasks = tasks.map((task) => task.candidateId === item.id ? { ...task, candidateId: '' } : task);
      selectedCandidates.delete(item.id);
      saveCandidates(); saveTasks();
      addActivity(item.id, 'candidate_delete', `کاندیدا حذف شد: ${item.name}`);
      fillStaticSelects(); renderAll(); toast('کاندیدا حذف شد.');
    }));
    $$('[data-stage-next]').forEach((btn) => btn.addEventListener('click', () => moveStage(btn.dataset.stageNext, 1)));
    $$('[data-stage-prev]').forEach((btn) => btn.addEventListener('click', () => moveStage(btn.dataset.stagePrev, -1)));
  }

  function moveStage(id, direction) {
    const item = candidates.find((c) => c.id === id);
    if (!item) return;
    const index = STAGES.indexOf(item.stage);
    const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, index + direction))];
    candidates = candidates.map((candidate) => candidate.id === id ? { ...candidate, stage: next, updatedAt: nowIso() } : candidate);
    saveCandidates();
    addActivity(id, 'stage', `مرحله ${item.name} به «${next}» تغییر کرد.`);
    renderAll();
    toast(`مرحله به «${next}» تغییر کرد.`);
  }

  function selectedCandidateIdsFromPipeline() {
    return $$('[data-pipeline-select]:checked').map((input) => input.dataset.pipelineSelect);
  }

  function editTemplate(template) {
    $('#templateId').value = template.id;
    $('#templateTitle').value = template.title;
    $('#templateBody').value = template.body;
  }

  function updateSelectedCount() { $('#selectedCount').textContent = `${toFa(selectedCandidates.size)} نفر انتخاب شده`; }
  function updateSmsLength() { $('#smsLength').textContent = `${toFa(($('#messageText').value || '').length)} کاراکتر`; }

  function selectUpcomingCandidates() {
    selectedCandidates = new Set(getUpcoming(3).map((item) => item.id));
    renderCandidatePicker(); updateSelectedCount(); toast('مصاحبه‌های نزدیک انتخاب شدند.');
  }

  function previewFirstMessage() {
    const selected = selectedCandidateObjects();
    if (!selected.length) return toast('اول حداقل یک کاندیدا انتخاب کن.');
    alert(applyTemplate($('#messageText').value, selected[0]));
  }

  async function sendSelectedMessages() {
    const selected = selectedCandidateObjects();
    if (!selected.length) return toast('هیچ گیرنده‌ای انتخاب نشده است.');
    const body = $('#messageText').value.trim();
    if (!body) return toast('متن پیامک خالی است.');
    $('#sendSmsBtn').disabled = true;
    $('#sendSmsBtn').textContent = 'در حال ارسال...';
    try {
      let okCount = 0;
      for (const candidate of selected) {
        const message = applyTemplate(body, candidate);
        const result = await callSmsApi({ mobiles: [candidate.phone], messageText: message, sendDateTime: normalizeSendDateTime($('#sendDateTime').value) });
        if (result.ok) okCount += 1;
        logs.unshift({ id: uid(), createdAt: nowIso(), recipient: `${candidate.name} - ${candidate.phone}`, kind: $('#sendDateTime').value ? 'زمان‌بندی‌شده' : 'ارسال مستقیم', ok: Boolean(result.ok), message, response: result });
        addActivity(candidate.id, 'sms', `پیامک ${result.ok ? 'پردازش شد' : 'خطا خورد'}: ${candidate.name}`);
      }
      saveLogs(); saveActivities(); renderAll();
      toast(`${toFa(okCount)} پیامک از ${toFa(selected.length)} مورد پردازش شد.`);
    } catch (error) {
      toast(error.message || 'ارسال با خطا روبه‌رو شد.');
    } finally {
      $('#sendSmsBtn').disabled = false;
      $('#sendSmsBtn').textContent = 'ارسال / زمان‌بندی پیامک';
    }
  }

  async function scheduleReminder(candidate, hoursBefore) {
    const interview = interviewDate(candidate);
    if (!interview) return toast('زمان مصاحبه این کاندیدا کامل نیست.');
    const sendAt = new Date(interview.getTime() - hoursBefore * 60 * 60 * 1000);
    const template = templates.find((item) => item.title.includes(hoursBefore === 24 ? '۲۴' : hoursBefore === 3 ? '۳' : '۳')) || templates[1] || templates[0];
    const message = applyTemplate(template.body, candidate);
    const result = await callSmsApi({ mobiles: [candidate.phone], messageText: message, sendDateTime: sendAt > new Date() ? sendAt.toISOString() : undefined });
    logs.unshift({ id: uid(), createdAt: nowIso(), recipient: `${candidate.name} - ${candidate.phone}`, kind: `یادآوری ${toFa(hoursBefore)} ساعت قبل`, ok: Boolean(result.ok), message, response: result });
    saveLogs(); addActivity(candidate.id, 'reminder', `یادآوری ${hoursBefore} ساعت قبل پردازش شد.`); renderAll();
    toast(result.ok ? 'یادآوری پردازش شد.' : 'پردازش یادآوری با خطا مواجه شد.');
  }

  async function scheduleAllReminders() {
    const list = candidates.filter((item) => item.date && item.time && ['دعوت به مصاحبه', 'مصاحبه اول', 'مصاحبه دوم'].includes(item.stage));
    if (!list.length) return toast('مصاحبه‌ای برای زمان‌بندی پیدا نشد.');
    if (!confirm(`برای ${list.length} مصاحبه یادآوری ۲۴ ساعت قبل زمان‌بندی شود؟`)) return;
    for (const candidate of list) await scheduleReminder(candidate, 24);
  }

  async function callSmsApi(payload) {
    if (settings.clientDryRun === 'true') {
      return { ok: true, dryRun: true, message: 'حالت تست داخل پنل فعال است؛ درخواست به API ارسال نشد.' };
    }
    const response = await fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(settings.apiToken ? { 'X-HR-Token': settings.apiToken } : {}) },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({ ok: false, message: 'پاسخ نامعتبر از سرور.' }));
    if (!response.ok || !data.ok) return { ok: false, status: response.status, ...data };
    return data;
  }

  function selectedCandidateObjects() { return candidates.filter((item) => selectedCandidates.has(item.id)); }

  function applyTemplate(template, candidate) {
    const jobTitle = candidateJobTitle(candidate);
    return String(template || '')
      .replaceAll('{name}', candidate.name || '')
      .replaceAll('{role}', candidate.role || '')
      .replaceAll('{job}', jobTitle || candidate.role || '')
      .replaceAll('{date}', formatDate(candidate.date || ''))
      .replaceAll('{time}', toFa(candidate.time || ''))
      .replaceAll('{location}', candidate.location || settings.defaultLocation || '')
      .replaceAll('{company}', settings.companyName || '')
      .replaceAll('{hrName}', settings.hrName || '')
      .replaceAll('{link}', settings.locationLink || '')
      .replaceAll('{hrPhone}', settings.hrPhone || '');
  }

  function getUpcoming(days) {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setDate(end.getDate() + days + 1);
    return candidates.filter((item) => item.date && interviewDate(item) >= now && interviewDate(item) < end).sort((a, b) => interviewDate(a) - interviewDate(b));
  }

  function interviewDate(candidate) {
    if (!candidate || !candidate.date) return null;
    const date = new Date(`${candidate.date}T${candidate.time || '00:00'}:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function normalizeCandidate(item) {
    const stage = item.stage || item.status || 'رزومه دریافت شد';
    const scorecard = item.scorecard || {};
    return {
      id: item.id || uid(), name: item.name || '', phone: normalizeMobile(item.phone || item.mobile || ''), email: item.email || '',
      jobId: item.jobId || '', role: item.role || item.job || '', source: item.source || '', stage, date: item.date || '', time: item.time || '',
      interviewer: item.interviewer || '', expectedSalary: item.expectedSalary || '', availability: item.availability || '', resumeUrl: item.resumeUrl || '',
      location: item.location || settings.defaultLocation || DEFAULT_SETTINGS.defaultLocation, tags: item.tags || '', notes: item.notes || '', score: Number(item.score || 0),
      scorecard: {
        technical: Number(scorecard.technical || 0), communication: Number(scorecard.communication || 0), culture: Number(scorecard.culture || 0), motivation: Number(scorecard.motivation || 0), availability: Number(scorecard.availability || 0)
      },
      createdAt: item.createdAt || nowIso(), updatedAt: item.updatedAt || nowIso()
    };
  }

  function sampleCandidates(seedJobs) {
    const j1 = seedJobs[0]?.id || '';
    const j2 = seedJobs[1]?.id || '';
    const j3 = seedJobs[2]?.id || '';
    return [
      { id: uid(), name: 'مریم احمدی', phone: '09151234567', email: 'maryam@example.com', jobId: j1, role: 'کارشناس منابع انسانی', source: 'جابینجا', stage: 'دعوت به مصاحبه', date: todayPlus(1), time: '10:30', interviewer: 'مدیر منابع انسانی', location: settings.defaultLocation, score: 82, tags: 'HR، مصاحبه', notes: 'رزومه خوب، سابقه جذب و مصاحبه دارد.', scorecard: { technical: 75, communication: 90, culture: 85, motivation: 80, availability: 80 }, createdAt: nowIso(), updatedAt: nowIso() },
      { id: uid(), name: 'علی رضایی', phone: '09351234567', email: 'ali@example.com', jobId: j2, role: 'کارشناس پشتیبانی هتل', source: 'معرفی همکار', stage: 'مصاحبه اول', date: todayPlus(2), time: '14:00', interviewer: 'مدیر عملیات', location: settings.defaultLocation, score: 76, tags: 'شیفت، پشتیبانی', notes: 'فن بیان مناسب، نیاز به بررسی شیفت کاری.', scorecard: { technical: 70, communication: 82, culture: 75, motivation: 78, availability: 74 }, createdAt: nowIso(), updatedAt: nowIso() },
      { id: uid(), name: 'سارا محمدی', phone: '09121234567', email: 'sara@example.com', jobId: j3, role: 'کارشناس فروش سازمانی', source: 'سایت شرکت', stage: 'ارزیابی نهایی', date: todayPlus(-1), time: '11:00', interviewer: 'مدیر فروش', location: 'مصاحبه آنلاین', score: 88, tags: 'B2B، فروش', notes: 'برای پیشنهاد همکاری مناسب است.', scorecard: { technical: 84, communication: 92, culture: 88, motivation: 90, availability: 86 }, createdAt: nowIso(), updatedAt: nowIso() }
    ].map(normalizeCandidate);
  }

  function sampleTasks() {
    return [
      { id: uid(), title: 'تماس با کاندیداهای مصاحبه فردا', candidateId: '', dueDate: todayPlus(0), owner: settings.hrName, priority: 'بالا', notes: 'تأیید حضور و ارسال آدرس.', status: 'open', createdAt: nowIso() },
      { id: uid(), title: 'آماده‌سازی فرم ارزیابی مصاحبه دوم', candidateId: '', dueDate: todayPlus(1), owner: settings.hrName, priority: 'متوسط', notes: '', status: 'open', createdAt: nowIso() }
    ];
  }

  function addActivity(candidateId, type, text) {
    activities.unshift({ id: uid(), candidateId, type, text, at: nowIso() });
    activities = activities.slice(0, 200);
    saveActivities();
  }

  function saveSettings(verify) {
    try {
      store.set(KEYS.settings, settings);
      if (verify) {
        const read = store.get(KEYS.settings, null);
        return Boolean(read && read.companyName === settings.companyName && read.clientDryRun === settings.clientDryRun);
      }
      return true;
    } catch (error) { console.error(error); return false; }
  }
  function saveJobs() { store.set(KEYS.jobs, jobs); }
  function saveCandidates() { store.set(KEYS.candidates, candidates); }
  function saveTemplates() { store.set(KEYS.templates, templates); }
  function saveTasks() { store.set(KEYS.tasks, tasks); }
  function saveLogs() { store.set(KEYS.logs, logs); }
  function saveActivities() { store.set(KEYS.activities, activities); }

  function exportCandidates() {
    const rows = [['name','phone','email','job','stage','source','date','time','interviewer','score','tags','notes'], ...candidates.map((c) => [c.name, c.phone, c.email, candidateJobTitle(c), c.stage, c.source, c.date, c.time, c.interviewer, c.score, c.tags, c.notes])];
    downloadCsv(rows, `iho-ats-candidates-${dateStamp()}.csv`);
  }

  function exportLogs() {
    const rows = [['time','recipient','kind','ok','message','response'], ...logs.map((log) => [log.createdAt, log.recipient, log.kind, log.ok ? 'ok' : 'failed', (log.message || '').replace(/\n/g, ' '), JSON.stringify(log.response || {})])];
    downloadCsv(rows, `iho-ats-sms-logs-${dateStamp()}.csv`);
  }

  function exportAllJson() {
    const data = { version: '2.0.0', exportedAt: nowIso(), settings, jobs, candidates, templates, tasks, logs, activities };
    downloadText(JSON.stringify(data, null, 2), `iho-ats-backup-${dateStamp()}.json`, 'application/json;charset=utf-8');
  }

  async function importAllJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || !confirm('دیتای بکاپ وارد شود و دیتای فعلی همین مرورگر جایگزین شود؟')) return;
      settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
      jobs = Array.isArray(data.jobs) ? data.jobs : [];
      candidates = Array.isArray(data.candidates) ? data.candidates.map(normalizeCandidate) : [];
      templates = Array.isArray(data.templates) ? data.templates : DEFAULT_TEMPLATES;
      tasks = Array.isArray(data.tasks) ? data.tasks : [];
      logs = Array.isArray(data.logs) ? data.logs : [];
      activities = Array.isArray(data.activities) ? data.activities : [];
      saveSettings(); saveJobs(); saveCandidates(); saveTemplates(); saveTasks(); saveLogs(); saveActivities();
      applySettingsToUi(); fillStaticSelects(); renderAll(); toast('بکاپ با موفقیت وارد شد.');
    } catch (error) { toast('فایل بکاپ معتبر نیست: ' + error.message); }
    event.target.value = '';
  }

  function downloadCsv(rows, filename) {
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    downloadText('\ufeff' + csv, filename, 'text/csv;charset=utf-8;');
  }
  function downloadText(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }
  function csvCell(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }

  function openModal(selector) { const el = $(selector); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); }
  function closeModal(selector) { const el = $(selector); el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }

  function setSelect(selector, items) {
    const el = $(selector);
    const current = el.value;
    el.innerHTML = items.map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join('');
    if (items.some((item) => item.value === current)) el.value = current;
  }
  function fillOptions(selector, items, labelFn) { setSelect(selector, items.map((item) => ({ value: item, label: labelFn ? labelFn(item) : item }))); }

  function candidateJobTitle(candidate) {
    const job = jobs.find((item) => item.id === candidate.jobId);
    return job?.title || candidate.role || 'بدون عنوان';
  }
  function candidateJobTitleFromJobId(jobId) { return jobs.find((job) => job.id === jobId)?.title || ''; }
  function candidateNameById(id) { return candidates.find((candidate) => candidate.id === id)?.name || '-'; }
  function stageClass(stage) { return STAGE_CLASS[stage] || 'gray'; }
  function parseList(value) { return String(value || '').split(/[،,]/).map((part) => part.trim()).filter(Boolean); }
  function normalizeMobile(value) {
    let mobile = String(value || '').trim().replace(/[\s\-()]/g, '');
    if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
    if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2);
    return mobile;
  }
  function normalizeSendDateTime(value) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString(); }
  function nowIso() { return new Date().toISOString(); }
  function uid() { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9); }
  function todayPlus(days) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); }
  function dateStamp() { return new Date().toISOString().slice(0, 10); }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return toFa(value);
    try { return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
    catch (_) { return toFa(value); }
  }
  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    try { return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date); }
    catch (_) { return toFa(date.toLocaleString()); }
  }
  function toFa(value) { return String(value ?? '').replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[digit]); }
  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function initials(name) { return String(name || 'HR').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('') || 'HR'; }
  function toast(message) {
    const el = $('#toast');
    el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 4200);
  }
})();
