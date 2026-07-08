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
    defaultLocation: 'مشهد - بلوار جانباز - بین ۳ و ۵ - ساختمان ست سنتر - طبقه سوم',
    locationLink: 'https://nshn.ir/a0_b14CuQJGkgJ',
    hrPhone: '05191005105',
    interviewers: 'مدیر منابع انسانی، مدیر واحد مربوطه، مدیر عملیات',
    apiToken: '',
    clientDryRun: 'true',
    logoUrl: '/assets/logo.svg',
    logoDataUrl: '',
    faviconUrl: '/assets/favicon.svg',
    faviconDataUrl: '',
    accentTheme: 'iranhotel',
    uiDensity: 'comfortable',
    fontMode: 'modern'
  };

  const LEGACY_DEFAULT_LOCATIONS = [
    'مشهد، دفتر مرکزی ایران‌هتل آنلاین',
    'مشهد، دفتر مرکزی ایران هتل آنلاین',
    'مشهد، ایران‌هتل آنلاین',
    'مشهد، ایران هتل آنلاین'
  ];

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
    { id: uid(), title: 'دعوت به مصاحبه', body: 'سلام {name} عزیز\nاز طرف {company} برای موقعیت شغلی «{job}» به مصاحبه دعوت شده‌اید.\nزمان مصاحبه: {date} ساعت {time}\nمحل مصاحبه: {location}\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\nلطفاً در صورت عدم امکان حضور، به واحد HR اطلاع دهید.\n{hrName}' },
    { id: uid(), title: 'یادآوری ۲۴ ساعت قبل مصاحبه', body: 'سلام {name} عزیز\nیادآوری می‌شود مصاحبه شما برای موقعیت «{job}» فردا در تاریخ {date} ساعت {time} برگزار می‌شود.\nمحل: {location}\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\nبا آرزوی موفقیت\n{hrName}' },
    { id: uid(), title: 'یادآوری ۳ ساعت قبل مصاحبه', body: 'سلام {name} عزیز\nمصاحبه شما با {company} امروز ساعت {time} برگزار می‌شود.\nلطفاً چند دقیقه زودتر در محل حضور داشته باشید.\nآدرس: {location}\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\n{hrName}' },
    { id: uid(), title: 'تغییر زمان مصاحبه', body: 'سلام {name} عزیز\nزمان مصاحبه شما برای موقعیت «{job}» تغییر کرد.\nزمان جدید: {date} ساعت {time}\nمحل: {location}\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\nاز همراهی شما سپاسگزاریم.\n{hrName}' },
    { id: uid(), title: 'درخواست تکمیل مدارک', body: 'سلام {name} عزیز\nلطفاً برای تکمیل فرایند بررسی موقعیت «{job}»، رزومه به‌روز و مدارک مرتبط را ارسال کنید.\n{hrName}' },
    { id: uid(), title: 'دعوت به مصاحبه دوم', body: 'سلام {name} عزیز\nنتیجه مصاحبه اول شما مثبت بوده و برای مصاحبه مرحله دوم موقعیت «{job}» دعوت می‌شوید.\nزمان: {date} ساعت {time}\nمحل: {location}\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\n{hrName}' },
    { id: uid(), title: 'اعلام نتیجه مثبت', body: 'سلام {name} عزیز\nبا خوشحالی اعلام می‌کنیم نتیجه بررسی شما برای موقعیت «{job}» مثبت بوده است.\nبرای هماهنگی مراحل بعدی، واحد منابع انسانی با شما تماس خواهد گرفت.\n{company}' },
    { id: uid(), title: 'عدم همکاری محترمانه', body: 'سلام {name} عزیز\nاز زمانی که برای فرایند مصاحبه موقعیت «{job}» در {company} گذاشتید سپاسگزاریم.\nدر این مرحله امکان همکاری فراهم نشد، اما اطلاعات شما برای فرصت‌های آینده در بانک منابع انسانی باقی می‌ماند.\nبا آرزوی موفقیت\n{hrName}' },
    { id: uid(), title: 'پیشنهاد همکاری / Offer', body: 'سلام {name} عزیز\nبا توجه به نتیجه مثبت ارزیابی‌ها، برای ادامه فرایند پیشنهاد همکاری موقعیت «{job}» با شما تماس گرفته خواهد شد.\n{company}' },
    { id: uid(), title: 'شروع همکاری / آنبوردینگ', body: 'سلام {name} عزیز\nبه خانواده {company} خوش آمدید.\nبرای شروع همکاری، لطفاً در تاریخ {date} ساعت {time} در محل {location} حضور داشته باشید.\nلینک لوکیشن: {link}\nتلفن هماهنگی: {hrPhone}\n{hrName}' }
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
  let draggedCandidateId = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    checkStorage();
    bindNavigation();
    bindJobs();
    bindCandidateForm();
    bindJobinjaImport();
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
    const merged = { ...DEFAULT_SETTINGS, ...previous };
    if (!merged.defaultLocation || LEGACY_DEFAULT_LOCATIONS.includes(merged.defaultLocation)) {
      merged.defaultLocation = DEFAULT_SETTINGS.defaultLocation;
    }
    if (!merged.locationLink) merged.locationLink = DEFAULT_SETTINGS.locationLink;
    if (!merged.hrPhone) merged.hrPhone = DEFAULT_SETTINGS.hrPhone;
    return merged;
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
    setSelect('#reportJobFilter', [{ value: 'all', label: 'همه فرصت‌های شغلی' }, ...jobOptions]);
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

    $('#candidateForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = $('#candidateId').value || uid();
      const old = candidates.find((item) => item.id === id);
      const candidate = normalizeCandidate({
        id,
        jobinjaId: $('#candidateJobinjaId').value.trim(),
        appliedAt: $('#candidateAppliedAt').value.trim(),
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
        resumeFile: old?.resumeFile || null,
        rawJobinja: old?.rawJobinja || null,
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
      const localResumeFile = $('#candidateResumeFile')?.files?.[0];
      if (localResumeFile) {
        candidate.resumeFile = await saveResumeFileForCandidate(id, localResumeFile);
      }

      candidates = old ? candidates.map((item) => item.id === id ? candidate : item) : [candidate, ...candidates];
      saveCandidates();
      addActivity(candidate.id, old ? 'candidate_update' : 'candidate_create', `${old ? 'کاندیدا ویرایش شد' : 'کاندیدا ثبت شد'}: ${candidate.name}`);
      closeCandidateModal();
      fillStaticSelects();
      renderAll();
      toast('کاندیدا ذخیره شد و تنظیمات فعلی اعمال شد.');
    });

    $('#candidateResumeFile').addEventListener('change', () => {
      const file = $('#candidateResumeFile').files?.[0];
      $('#resumeFileState').textContent = file ? `فایل انتخاب شد: ${file.name} (${formatBytes(file.size)})` : 'فایلی انتخاب نشده است.';
    });
    $('#searchInput').addEventListener('input', renderCandidatesTable);
    $('#statusFilter').addEventListener('change', renderCandidatesTable);
    $('#jobFilter').addEventListener('change', renderCandidatesTable);
  }

  function openCandidateModal(candidate) {
    const item = candidate ? normalizeCandidate(candidate) : null;
    $('#candidateModalTitle').textContent = item ? 'ویرایش کاندیدا' : 'افزودن کاندیدا';
    $('#candidateId').value = item?.id || '';
    $('#candidateJobinjaId').value = item?.jobinjaId || '';
    $('#candidateAppliedAt').value = item?.appliedAt || '';
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
    $('#candidateResumeFile').value = '';
    $('#resumeFileState').textContent = item?.resumeFile?.name ? `پیوست فعلی: ${item.resumeFile.name} (${formatBytes(item.resumeFile.size || 0)})` : 'فایلی انتخاب نشده است.';
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
    $('#reportJobFilter').addEventListener('change', renderReports);
    $('#reportPeriodFilter').addEventListener('change', renderReports);
    $('#exportManagerReportBtn').addEventListener('click', exportManagerReport);
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

    ['companyName','panelTitle','hrName','defaultLocation','locationLink','hrPhone','interviewers','apiToken','clientDryRun','accentTheme','uiDensity','fontMode','logoUrl','faviconUrl'].forEach((id) => {
      const el = $('#' + id);
      el.addEventListener('change', () => {
        $('#settingsSaveState').textContent = 'تغییرات ذخیره‌نشده';
        $('#settingsSaveState').className = 'pill yellow';
      });
    });

    $('#logoFileInput').addEventListener('change', (event) => handleBrandAssetFile(event, 'logo'));
    $('#faviconFileInput').addEventListener('change', (event) => handleBrandAssetFile(event, 'favicon'));
    $('#clearBrandAssetsBtn').addEventListener('click', () => {
      settings.logoDataUrl = '';
      settings.faviconDataUrl = '';
      settings.logoUrl = DEFAULT_SETTINGS.logoUrl;
      settings.faviconUrl = DEFAULT_SETTINGS.faviconUrl;
      saveSettings(true);
      applySettingsToUi();
      renderSettings();
      toast('لوگو و Favicon آپلودی حذف شد و حالت پیش‌فرض برگشت.');
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

  async function handleBrandAssetFile(event, kind) {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxKb = kind === 'favicon' ? 300 : 700;
    if (file.size > maxKb * 1024) {
      toast(`حجم فایل زیاد است. برای ${kind === 'favicon' ? 'Favicon' : 'لوگو'} حداکثر ${toFa(maxKb)} کیلوبایت پیشنهاد می‌شود.`);
      event.target.value = '';
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      if (kind === 'logo') {
        settings.logoDataUrl = dataUrl;
        settings.logoUrl = settings.logoUrl || DEFAULT_SETTINGS.logoUrl;
      } else {
        settings.faviconDataUrl = dataUrl;
        settings.faviconUrl = settings.faviconUrl || DEFAULT_SETTINGS.faviconUrl;
      }
      const ok = saveSettings(true);
      applySettingsToUi();
      renderSettings();
      $('#settingsSaveState').textContent = ok ? 'ذخیره و اعمال شد' : 'خطا در ذخیره';
      $('#settingsSaveState').className = ok ? 'pill green' : 'pill red';
      toast(kind === 'logo' ? 'لوگو آپلود و روی پنل اعمال شد.' : 'Favicon آپلود و اعمال شد.');
    } catch (error) {
      toast('خواندن فایل انجام نشد: ' + error.message);
    }
    event.target.value = '';
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('خطای خواندن فایل'));
      reader.readAsDataURL(file);
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
      clientDryRun: $('#clientDryRun').value,
      logoUrl: $('#logoUrl').value.trim() || DEFAULT_SETTINGS.logoUrl,
      faviconUrl: $('#faviconUrl').value.trim() || DEFAULT_SETTINGS.faviconUrl,
      logoDataUrl: settings.logoDataUrl || '',
      faviconDataUrl: settings.faviconDataUrl || '',
      accentTheme: $('#accentTheme').value || DEFAULT_SETTINGS.accentTheme,
      uiDensity: $('#uiDensity').value || DEFAULT_SETTINGS.uiDensity,
      fontMode: $('#fontMode').value || DEFAULT_SETTINGS.fontMode
    };
    settings = { ...DEFAULT_SETTINGS, ...next };
    const ok = saveSettings(true);
    settings = loadSettings();
    const synced = syncLegacyCandidateLocations();
    if (synced) saveCandidates();
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
    document.title = `${settings.panelTitle || 'IHO ATS'} | ${settings.companyName || 'ایران‌هتل آنلاین'}`;
    applyBrandAssets();
    applyAppearanceSettings();
  }

  function applyBrandAssets() {
    const logoSrc = settings.logoDataUrl || settings.logoUrl || DEFAULT_SETTINGS.logoUrl;
    const faviconSrc = settings.faviconDataUrl || settings.faviconUrl || DEFAULT_SETTINGS.faviconUrl;
    const logo = $('#brandLogo');
    if (logo) {
      logo.src = logoSrc;
      logo.style.display = 'block';
      logo.onerror = () => { logo.style.display = 'none'; };
    }
    const preview = $('#settingsLogoPreview');
    if (preview) preview.src = logoSrc;
    const fav = $('#faviconLink');
    if (fav) fav.href = faviconSrc;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', themePalette(settings.accentTheme).primary);
  }

  function applyAppearanceSettings() {
    const theme = themePalette(settings.accentTheme);
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-2', theme.secondary);
    root.style.setProperty('--primary-soft', theme.soft);
    root.style.setProperty('--sidebar-start', theme.sidebarStart);
    root.style.setProperty('--sidebar-end', theme.sidebarEnd);
    root.style.setProperty('--hero-start', theme.heroStart);
    root.style.setProperty('--hero-end', theme.heroEnd);
    document.body.classList.toggle('density-compact', settings.uiDensity === 'compact');
    document.body.classList.toggle('font-classic', settings.fontMode === 'classic');
    document.body.classList.toggle('font-modern', settings.fontMode !== 'classic');
  }

  function themePalette(name) {
    const palettes = {
      iranhotel: { primary: '#0f3b63', secondary: '#0ea5a3', soft: '#e6f3f7', sidebarStart: '#08233f', sidebarEnd: '#0d9488', heroStart: '#0f3b63', heroEnd: '#0d9488' },
      ocean: { primary: '#1d4ed8', secondary: '#0891b2', soft: '#e0f2fe', sidebarStart: '#172554', sidebarEnd: '#0891b2', heroStart: '#1e40af', heroEnd: '#06b6d4' },
      emerald: { primary: '#047857', secondary: '#16a34a', soft: '#dcfce7', sidebarStart: '#064e3b', sidebarEnd: '#16a34a', heroStart: '#065f46', heroEnd: '#22c55e' },
      luxury: { primary: '#111827', secondary: '#b9852d', soft: '#f8f0df', sidebarStart: '#0f172a', sidebarEnd: '#7c5a1e', heroStart: '#111827', heroEnd: '#b9852d' }
    };
    return palettes[name] || palettes.iranhotel;
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
      const text = `${item.name} ${item.phone} ${item.email} ${item.role} ${item.source} ${item.tags} ${candidateJobTitle(item)} ${item.jobinjaId || ''} ${item.appliedAt || ''}`.toLowerCase();
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
        <td>${escapeHtml(candidateJobTitle(item))}<div class="muted">امتیاز ${toFa(item.score || 0)}</div></td>
        <td>${item.jobinjaId ? `<span class="pill blue">${toFa(item.jobinjaId)}</span>` : '<span class="muted">بدون شناسه</span>'}<br><span class="muted">${escapeHtml(item.appliedAt || item.createdAt?.slice(0,10) || '-')}</span></td>
        <td><span class="pill ${stageClass(item.stage)}">${escapeHtml(item.stage)}</span>${item.date ? `<div class="muted">مصاحبه: ${formatDate(item.date)} ${toFa(item.time || '')}</div>` : ''}</td>
        <td>${resumeActionsHtml(item)}</td>
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
        <div class="kanban-col" data-kanban-stage="${escapeHtml(stage)}">
          <div class="kanban-head"><h4>${escapeHtml(stage)}</h4><span class="pill gray">${toFa(stageItems.length)}</span></div>
          ${stageItems.length ? stageItems.map((candidate) => pipelineCard(candidate)).join('') : '<p class="muted kanban-empty">کارت را اینجا رها کن</p>'}
        </div>
      `;
    }).join('');

    bindCandidateActionButtons();
    bindPipelineDragAndDrop();
  }

  function pipelineCard(candidate) {
    return `
      <div class="candidate-card" draggable="true" data-drag-candidate="${candidate.id}">
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
    const data = getManagerReportData();
    const cards = [
      ['کل کاندیداهای فیلتر شده', data.total, 'تعداد پرونده‌های فعال در بازه انتخابی'],
      ['مصاحبه ثبت‌شده', data.interviews, `${data.interviewRate}% از کل کاندیداها`],
      ['پیشنهاد همکاری', data.offers, `${data.offerRate}% از کل کاندیداها`],
      ['استخدام شده', data.accepted, `${data.acceptRate}% نرخ استخدام`],
      ['عدم همکاری', data.rejected, `${data.rejectRate}% خروج از فرایند`],
      ['میانگین امتیاز', data.avgScore, 'بر اساس Scorecard پرونده‌ها'],
      ['مصاحبه ۷ روز آینده', data.next7Interviews, 'نیازمند یادآوری و هماهنگی'],
      ['تسک معوق HR', data.overdueTasks, 'تسک‌های باز عقب‌افتاده'],
      ['کاندیدای بدون رزومه', data.noResume, 'پرونده‌هایی که لینک یا فایل رزومه ندارند'],
      ['نرخ موفقیت پیامک', `${data.smsSuccessRate}%`, `${toFa(data.smsOk)} موفق از ${toFa(data.smsTotal)} لاگ`]
    ];

    $('#managerSummary').innerHTML = `
      <div>
        <b>خلاصه مدیریتی</b>
        <p>در ${escapeHtml(data.periodLabel)} برای ${escapeHtml(data.jobLabel)}، ${toFa(data.total)} کاندیدا بررسی شده، ${toFa(data.interviews)} مصاحبه ثبت شده و ${toFa(data.accepted)} نفر به مرحله استخدام رسیده‌اند. نرخ تبدیل مصاحبه ${toFa(data.interviewRate)}٪ و نرخ استخدام ${toFa(data.acceptRate)}٪ است.</p>
      </div>
      <span class="pill ${data.overdueTasks ? 'red' : 'green'}">${data.overdueTasks ? `${toFa(data.overdueTasks)} تسک معوق` : 'عملیات بدون تسک معوق'}</span>
    `;

    $('#reportsGrid').innerHTML = cards.map(([label, value, hint]) => `
      <div class="report-card executive-card">
        <span>${escapeHtml(label)}</span>
        <b>${toFa(value)}</b>
        <small>${escapeHtml(hint)}</small>
      </div>
    `).join('');

    $('#funnelReport').innerHTML = STAGES.map((stage) => {
      const count = data.stageCounts[stage] || 0;
      const width = data.total ? Math.max(4, Math.round((count / data.total) * 100)) : 0;
      return `
        <div class="funnel-row">
          <div class="funnel-label"><b>${escapeHtml(stage)}</b><span>${toFa(count)} نفر</span></div>
          <div class="funnel-line"><span style="width:${width}%"></span></div>
          <small>${toFa(data.total ? Math.round((count / data.total) * 100) : 0)}٪</small>
        </div>
      `;
    }).join('');

    $('#jobReportRows').innerHTML = data.jobRows.length ? data.jobRows.map((row) => `
      <tr>
        <td><b>${escapeHtml(row.title)}</b><div class="muted">${escapeHtml(row.department || '-')} | ${escapeHtml(row.status || '-')}</div></td>
        <td>${toFa(row.total)}</td>
        <td>${toFa(row.interviews)} <span class="muted">(${toFa(row.interviewRate)}٪)</span></td>
        <td>${toFa(row.offers)} / ${toFa(row.accepted)}</td>
        <td>${toFa(row.avgScore)}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="muted">برای این فیلتر داده‌ای وجود ندارد.</td></tr>';

    $('#sourceReportRows').innerHTML = data.sourceRows.length ? data.sourceRows.map((row) => `
      <tr>
        <td><b>${escapeHtml(row.source)}</b></td>
        <td>${toFa(row.total)}</td>
        <td>${toFa(row.interviews)}</td>
        <td>${toFa(row.accepted)}</td>
        <td>${toFa(row.conversion)}٪</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="muted">منبع جذبی ثبت نشده است.</td></tr>';

    const healthCards = [
      ['کاندیدای راکد', data.idleCandidates, 'بیش از ۷ روز بدون بروزرسانی'],
      ['تسک باز', data.openTasks, 'پیگیری‌های در جریان'],
      ['فرصت شغلی باز', data.openJobs, 'نیازمندی‌های فعال'],
      ['پرونده لیست انتظار', data.waiting, 'برای فرصت‌های آینده']
    ];
    $('#hrHealthGrid').innerHTML = healthCards.map(([label, value, hint]) => `
      <div class="report-card health-card"><span>${escapeHtml(label)}</span><b>${toFa(value)}</b><small>${escapeHtml(hint)}</small></div>
    `).join('');

    $('#reportRecommendations').innerHTML = data.recommendations.length ? `
      <h4>پیشنهادهای عملیاتی برای مدیر منابع انسانی</h4>
      <ul>${data.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    ` : '<p class="muted">وضعیت عملیات جذب پایدار است و مورد فوری دیده نمی‌شود.</p>';
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
    $('#accentTheme').value = settings.accentTheme || DEFAULT_SETTINGS.accentTheme;
    $('#uiDensity').value = settings.uiDensity || DEFAULT_SETTINGS.uiDensity;
    $('#fontMode').value = settings.fontMode || DEFAULT_SETTINGS.fontMode;
    $('#logoUrl').value = settings.logoUrl || DEFAULT_SETTINGS.logoUrl;
    $('#faviconUrl').value = settings.faviconUrl || DEFAULT_SETTINGS.faviconUrl;
    const preview = $('#settingsLogoPreview');
    if (preview) preview.src = settings.logoDataUrl || settings.logoUrl || DEFAULT_SETTINGS.logoUrl;
    if ($('#settingsSaveState').textContent === 'تغییرات ذخیره‌نشده') return;
    $('#settingsSaveState').textContent = 'ذخیره‌شده';
    $('#settingsSaveState').className = 'pill green';
  }

  function bindCandidateActionButtons() {
    $$('[data-edit-candidate]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.editCandidate);
      if (item) openCandidateModal(item);
    }));
    $$('[data-open-resume-link]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.openResumeLink);
      if (item?.resumeUrl) window.open(item.resumeUrl, '_blank', 'noopener');
    }));
    $$('[data-open-local-resume]').forEach((btn) => btn.addEventListener('click', async () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.openLocalResume);
      if (!item?.resumeFile?.id) return toast('فایل رزومه محلی برای این کاندیدا ثبت نشده است.');
      await openStoredResumeFile(item.resumeFile.id);
    }));
    $$('[data-delete-candidate]').forEach((btn) => btn.addEventListener('click', () => {
      const item = candidates.find((candidate) => candidate.id === btn.dataset.deleteCandidate);
      if (!item || !confirm(`کاندیدای ${item.name} حذف شود؟`)) return;
      candidates = candidates.filter((candidate) => candidate.id !== item.id);
      tasks = tasks.map((task) => task.candidateId === item.id ? { ...task, candidateId: '' } : task);
      selectedCandidates.delete(item.id);
      if (item.resumeFile?.id) deleteStoredResumeFile(item.resumeFile.id).catch(() => {});
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
    updateCandidateStage(id, next, 'button');
  }

  function updateCandidateStage(id, nextStage, source) {
    const item = candidates.find((c) => c.id === id);
    if (!item || !STAGES.includes(nextStage)) return;
    if (item.stage === nextStage) return;
    candidates = candidates.map((candidate) => candidate.id === id ? { ...candidate, stage: nextStage, updatedAt: nowIso() } : candidate);
    saveCandidates();
    addActivity(id, 'stage', `مرحله ${item.name} با ${source === 'drag' ? 'درگ و دراپ' : 'دکمه'} به «${nextStage}» تغییر کرد.`);
    renderAll();
    toast(`مرحله ${item.name} به «${nextStage}» تغییر کرد.`);
  }

  function bindPipelineDragAndDrop() {
    $$('[data-drag-candidate]').forEach((card) => {
      card.addEventListener('dragstart', (event) => {
        draggedCandidateId = card.dataset.dragCandidate;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', draggedCandidateId);
      });
      card.addEventListener('dragend', () => {
        draggedCandidateId = null;
        card.classList.remove('dragging');
        $$('.kanban-col').forEach((col) => col.classList.remove('drag-over'));
      });
    });

    $$('[data-kanban-stage]').forEach((column) => {
      column.addEventListener('dragover', (event) => {
        event.preventDefault();
        column.classList.add('drag-over');
      });
      column.addEventListener('dragleave', (event) => {
        if (!column.contains(event.relatedTarget)) column.classList.remove('drag-over');
      });
      column.addEventListener('drop', (event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/plain') || draggedCandidateId;
        column.classList.remove('drag-over');
        if (id) updateCandidateStage(id, column.dataset.kanbanStage, 'drag');
      });
    });
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

  function isLegacyLocation(value) {
    const text = String(value || '').trim();
    if (!text) return true;
    return LEGACY_DEFAULT_LOCATIONS.includes(text) || text.includes('دفتر مرکزی ایران‌هتل') || text.includes('دفتر مرکزی ایران هتل');
  }

  function effectiveSmsLocation(candidate) {
    // برای پیامک‌ها، آدرس تنظیمات فعلی همیشه اولویت دارد؛ چون کاندیداهای قدیمی ممکن است آدرس پیش‌فرض قبلی را داخل پرونده داشته باشند.
    return settings.defaultLocation || candidate?.location || DEFAULT_SETTINGS.defaultLocation || '';
  }

  function syncLegacyCandidateLocations() {
    let changed = false;
    candidates = candidates.map((item) => {
      if (isLegacyLocation(item.location)) {
        changed = true;
        return { ...item, location: settings.defaultLocation, updatedAt: nowIso() };
      }
      return item;
    });
    return changed;
  }

  function applyTemplate(template, candidate) {
    const jobTitle = candidateJobTitle(candidate);
    return String(template || '')
      .replaceAll('{name}', candidate.name || '')
      .replaceAll('{role}', candidate.role || '')
      .replaceAll('{job}', jobTitle || candidate.role || '')
      .replaceAll('{date}', formatDate(candidate.date || ''))
      .replaceAll('{time}', toFa(candidate.time || ''))
      .replaceAll('{location}', effectiveSmsLocation(candidate))
      .replaceAll('{company}', settings.companyName || '')
      .replaceAll('{hrName}', settings.hrName || '')
      .replaceAll('{link}', settings.locationLink || '')
      .replaceAll('{resumeLink}', candidate.resumeUrl || '')
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
      id: item.id || uid(), jobinjaId: item.jobinjaId || item.jobinja_id || item.applicationId || '', appliedAt: item.appliedAt || item.applied_at || '',
      name: item.name || '', phone: normalizeMobile(item.phone || item.mobile || ''), email: item.email || '',
      jobId: item.jobId || '', role: item.role || item.job || item.adTitle || '', source: item.source || '', stage, date: item.date || '', time: item.time || '',
      interviewer: item.interviewer || '', expectedSalary: item.expectedSalary || '', availability: item.availability || '', resumeUrl: item.resumeUrl || item.resumeLink || '', resumeFile: item.resumeFile || null,
      location: isLegacyLocation(item.location) ? (settings.defaultLocation || DEFAULT_SETTINGS.defaultLocation) : item.location, tags: item.tags || '', notes: item.notes || '', rawJobinja: item.rawJobinja || null, importedAt: item.importedAt || '', score: Number(item.score || 0),
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


  function bindJobinjaImport() {
    const input = $('#jobinjaImportInput');
    if (!input) return;
    input.addEventListener('change', importJobinjaFile);
  }

  async function importJobinjaFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const status = $('#jobinjaImportStatus');
    status.textContent = 'در حال خواندن فایل...';
    status.className = 'pill yellow';
    try {
      const parsed = await readTabularFile(file);
      const result = importJobinjaRows(parsed.rows, parsed.fileType);
      saveJobs(); saveCandidates(); saveActivities();
      fillStaticSelects(); renderAll();
      status.textContent = `ایمپورت شد: ${toFa(result.created)} جدید، ${toFa(result.updated)} بروزرسانی، ${toFa(result.skipped)} رد شده`;
      status.className = 'pill green';
      toast(`خروجی جابینجا وارد شد: ${toFa(result.created)} کاندیدای جدید و ${toFa(result.updated)} بروزرسانی.`);
    } catch (error) {
      console.error(error);
      status.textContent = 'خطا در ایمپورت';
      status.className = 'pill red';
      toast('ایمپورت انجام نشد: ' + (error.message || error));
    }
    event.target.value = '';
  }

  async function readTabularFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      const text = await file.text();
      return { fileType: 'csv', rows: rowsToObjects(parseCsvRows(text)) };
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer();
      const rows = await parseXlsxRows(arrayBuffer);
      return { fileType: 'xlsx', rows: rowsToObjects(rows) };
    }
    throw new Error('فرمت فایل باید xlsx یا csv باشد.');
  }

  function rowsToObjects(rowRecords) {
    const nonEmpty = rowRecords.filter((row) => row && row.cells && row.cells.some((cell) => String(cell || '').trim()));
    if (nonEmpty.length < 2) return [];
    const headers = nonEmpty[0].cells.map(cleanHeader);
    return nonEmpty.slice(1).map((row) => {
      const obj = { __raw: {}, __links: {} };
      headers.forEach((header, index) => {
        if (!header) return;
        const value = String(row.cells[index] ?? '').trim();
        obj[header] = value;
        obj.__raw[header] = value;
        if (row.links && row.links[index]) obj.__links[header] = row.links[index];
      });
      return obj;
    });
  }

  function importJobinjaRows(rows, fileType) {
    let created = 0, updated = 0, skipped = 0;
    rows.forEach((row) => {
      const jobinjaId = pickValue(row, '#شناسه', 'شناسه', 'id', 'application id');
      const adTitle = pickValue(row, 'عنوان آگهی', 'عنوان اگهی', 'عنوان شغلی', 'job', 'job title');
      const name = pickValue(row, 'نام متقاضی', 'نام و نام خانوادگی', 'نام', 'candidate name');
      const phone = normalizeMobile(pickValue(row, 'شماره تماس متقاضی', 'شماره تماس', 'موبایل', 'تلفن', 'mobile', 'phone'));
      const email = pickValue(row, 'ایمیل', 'email');
      const appliedAt = pickValue(row, 'تاریخ ارسال درخواست همکاری', 'تاریخ ارسال', 'تاریخ درخواست', 'applied at');
      const resumeHeader = findHeader(row, 'آدرس فایل رزومه متقاضی', 'رزومه', 'لینک رزومه', 'resume');
      const resumeLink = resumeHeader ? (row.__links?.[resumeHeader] || row[resumeHeader] || '') : '';
      if (!name || !phone) { skipped += 1; return; }
      const jobId = findOrCreateJobFromJobinja(adTitle);
      const old = candidates.find((candidate) => (jobinjaId && candidate.jobinjaId === jobinjaId) || (!jobinjaId && candidate.phone === phone && candidateJobTitle(candidate) === adTitle));
      const merged = normalizeCandidate({
        ...(old || {}),
        id: old?.id || uid(),
        jobinjaId: jobinjaId || old?.jobinjaId || '',
        appliedAt: appliedAt || old?.appliedAt || '',
        name,
        phone,
        email: email || old?.email || '',
        jobId: jobId || old?.jobId || '',
        role: adTitle || old?.role || '',
        source: old?.source || 'جابینجا',
        stage: old?.stage || 'رزومه دریافت شد',
        resumeUrl: resumeLink && /^https?:\/\//i.test(resumeLink) ? resumeLink : (old?.resumeUrl || ''),
        tags: mergeTags(old?.tags, 'جابینجا'),
        rawJobinja: row.__raw || row,
        importedAt: nowIso(),
        createdAt: old?.createdAt || nowIso(),
        updatedAt: nowIso()
      });
      if (old) {
        candidates = candidates.map((candidate) => candidate.id === old.id ? merged : candidate);
        updated += 1;
      } else {
        candidates.unshift(merged);
        created += 1;
      }
    });
    if (created || updated) addActivity(null, 'jobinja_import', `ایمپورت جابینجا انجام شد: ${created} جدید، ${updated} بروزرسانی از فایل ${fileType}.`);
    return { created, updated, skipped };
  }

  function findOrCreateJobFromJobinja(title) {
    const clean = String(title || '').trim();
    if (!clean) return '';
    const existing = jobs.find((job) => normalizeText(job.title) === normalizeText(clean));
    if (existing) return existing.id;
    const job = { id: uid(), title: clean, department: 'منابع انسانی', city: 'مشهد', owner: settings.hrName || 'HR', status: 'باز', priority: 'متوسط', openings: 1, type: '', description: 'ایجاد شده از خروجی جابینجا.', createdAt: nowIso(), source: 'جابینجا' };
    jobs.unshift(job);
    return job.id;
  }

  function pickValue(row, ...names) {
    const key = findHeader(row, ...names);
    return key ? String(row[key] ?? '').trim() : '';
  }

  function findHeader(row, ...names) {
    const keys = Object.keys(row).filter((key) => !key.startsWith('__'));
    const normalizedNames = names.map(normalizeText);
    return keys.find((key) => normalizedNames.includes(normalizeText(key))) || keys.find((key) => normalizedNames.some((name) => normalizeText(key).includes(name) || name.includes(normalizeText(key))));
  }

  function cleanHeader(value) {
    return String(value || '').replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim();
  }

  function mergeTags(oldTags, nextTag) {
    const set = new Set(parseList(oldTags));
    if (nextTag) set.add(nextTag);
    return Array.from(set).join('، ');
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').replace(/[\s\u200c_\-#]+/g, '').trim();
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [], cell = '', inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && inQuotes && next === '"') { cell += '"'; i += 1; continue; }
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { row.push(cell); cell = ''; continue; }
      if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && next === '\n') i += 1;
        row.push(cell); rows.push({ cells: row, links: {} }); row = []; cell = ''; continue;
      }
      cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push({ cells: row, links: {} }); }
    return rows;
  }

  async function parseXlsxRows(arrayBuffer) {
    const entries = await unzipXlsxEntries(arrayBuffer);
    const sharedStrings = parseSharedStrings(entries['xl/sharedStrings.xml'] || '');
    const sheetPath = firstWorksheetPath(entries) || 'xl/worksheets/sheet1.xml';
    const relsPath = sheetPath.replace('/worksheets/', '/worksheets/_rels/') + '.rels';
    const relationships = parseRelationships(entries[relsPath] || '');
    const xml = entries[sheetPath];
    if (!xml) throw new Error('Sheet اصلی فایل xlsx پیدا نشد.');
    return parseWorksheetXml(xml, sharedStrings, relationships);
  }

  function firstWorksheetPath(entries) {
    try {
      const workbook = xmlDoc(entries['xl/workbook.xml']);
      const sheets = Array.from(workbook.getElementsByTagNameNS('*', 'sheet'));
      const first = sheets[0];
      if (!first) return '';
      const rid = first.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || first.getAttribute('r:id');
      const rels = parseRelationships(entries['xl/_rels/workbook.xml.rels'] || '');
      const target = rels[rid];
      if (!target) return '';
      return target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.\//, '');
    } catch (_) { return ''; }
  }

  function parseSharedStrings(xml) {
    if (!xml) return [];
    const doc = xmlDoc(xml);
    return Array.from(doc.getElementsByTagNameNS('*', 'si')).map((si) => Array.from(si.getElementsByTagNameNS('*', 't')).map((t) => t.textContent || '').join(''));
  }

  function parseRelationships(xml) {
    if (!xml) return {};
    const doc = xmlDoc(xml);
    const map = {};
    Array.from(doc.getElementsByTagNameNS('*', 'Relationship')).forEach((rel) => {
      map[rel.getAttribute('Id')] = rel.getAttribute('Target');
    });
    return map;
  }

  function parseWorksheetXml(xml, sharedStrings, relationships) {
    const doc = xmlDoc(xml);
    const hyperlinkByCell = {};
    Array.from(doc.getElementsByTagNameNS('*', 'hyperlink')).forEach((link) => {
      const ref = link.getAttribute('ref') || '';
      const rid = link.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || link.getAttribute('r:id');
      if (!ref || !rid || !relationships[rid]) return;
      expandCellRefs(ref).forEach((cellRef) => { hyperlinkByCell[cellRef] = relationships[rid]; });
    });
    return Array.from(doc.getElementsByTagNameNS('*', 'row')).map((rowNode) => {
      const cells = [];
      const links = {};
      Array.from(rowNode.getElementsByTagNameNS('*', 'c')).forEach((cellNode) => {
        const ref = cellNode.getAttribute('r') || '';
        const colIndex = columnIndex(ref.replace(/\d+/g, ''));
        const type = cellNode.getAttribute('t') || '';
        let value = '';
        if (type === 'inlineStr') {
          value = Array.from(cellNode.getElementsByTagNameNS('*', 't')).map((t) => t.textContent || '').join('');
        } else {
          const v = cellNode.getElementsByTagNameNS('*', 'v')[0]?.textContent || '';
          value = type === 's' ? (sharedStrings[Number(v)] || '') : v;
        }
        cells[colIndex] = value;
        if (hyperlinkByCell[ref]) links[colIndex] = hyperlinkByCell[ref];
      });
      return { cells, links };
    });
  }

  async function unzipXlsxEntries(arrayBuffer) {
    if (!('DecompressionStream' in window)) throw new Error('برای ورود مستقیم xlsx به مرورگر Chrome/Edge جدید نیاز است. راه جایگزین: فایل را از Excel به CSV UTF-8 خروجی بگیر و وارد کن.');
    const view = new DataView(arrayBuffer);
    const decoder = new TextDecoder('utf-8');
    const entries = {};
    let eocd = -1;
    for (let i = view.byteLength - 22; i >= Math.max(0, view.byteLength - 66000); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('ساختار فایل xlsx معتبر نیست.');
    const total = view.getUint16(eocd + 10, true);
    let pos = view.getUint32(eocd + 16, true);
    for (let i = 0; i < total; i += 1) {
      if (view.getUint32(pos, true) !== 0x02014b50) throw new Error('Central directory فایل xlsx خوانده نشد.');
      const method = view.getUint16(pos + 10, true);
      const compressedSize = view.getUint32(pos + 20, true);
      const nameLength = view.getUint16(pos + 28, true);
      const extraLength = view.getUint16(pos + 30, true);
      const commentLength = view.getUint16(pos + 32, true);
      const localOffset = view.getUint32(pos + 42, true);
      const name = decoder.decode(arrayBuffer.slice(pos + 46, pos + 46 + nameLength));
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = arrayBuffer.slice(dataStart, dataStart + compressedSize);
      let data;
      if (method === 0) data = compressed;
      else if (method === 8) data = await inflateRaw(compressed);
      else { pos += 46 + nameLength + extraLength + commentLength; continue; }
      if (name.endsWith('.xml') || name.endsWith('.rels')) entries[name] = decoder.decode(data);
      pos += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  }

  async function inflateRaw(buffer) {
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).arrayBuffer();
  }

  function xmlDoc(xml) { return new DOMParser().parseFromString(xml, 'application/xml'); }
  function columnIndex(letters) { return letters.split('').reduce((sum, ch) => sum * 26 + ch.charCodeAt(0) - 64, 0) - 1; }
  function columnLetters(index) { let s = ''; index += 1; while (index > 0) { const m = (index - 1) % 26; s = String.fromCharCode(65 + m) + s; index = Math.floor((index - 1) / 26); } return s; }
  function expandCellRefs(ref) {
    if (!ref.includes(':')) return [ref];
    const [start, end] = ref.split(':');
    const sc = columnIndex(start.replace(/\d+/g, '')), ec = columnIndex(end.replace(/\d+/g, ''));
    const sr = Number(start.replace(/\D+/g, '')), er = Number(end.replace(/\D+/g, ''));
    const refs = [];
    for (let r = sr; r <= er; r += 1) for (let c = sc; c <= ec; c += 1) refs.push(columnLetters(c) + r);
    return refs;
  }

  function resumeActionsHtml(candidate) {
    const parts = [];
    if (candidate.resumeUrl) parts.push(`<button class="btn ghost small" data-open-resume-link="${candidate.id}">لینک جابینجا</button>`);
    if (candidate.resumeFile?.id) parts.push(`<button class="btn ghost small" data-open-local-resume="${candidate.id}">فایل محلی</button><div class="muted">${escapeHtml(candidate.resumeFile.name || '')}</div>`);
    return parts.length ? `<div class="actions-row compact resume-actions">${parts.join('')}</div>` : '<span class="muted">ندارد</span>';
  }

  function openFileDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('iho_ats_files_v3', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('resumes');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB در دسترس نیست.'));
    });
  }

  async function saveResumeFileForCandidate(candidateId, file) {
    const max = 12 * 1024 * 1024;
    if (file.size > max) throw new Error('حجم فایل رزومه بیشتر از ۱۲ مگابایت است.');
    const fileId = `resume_${candidateId}_${Date.now()}`;
    const db = await openFileDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readwrite');
      tx.objectStore('resumes').put(file, fileId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('ذخیره فایل رزومه انجام نشد.'));
    });
    db.close();
    return { id: fileId, name: file.name, type: file.type, size: file.size, updatedAt: nowIso() };
  }

  async function getStoredResumeFile(fileId) {
    const db = await openFileDb();
    const file = await new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readonly');
      const request = tx.objectStore('resumes').get(fileId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('فایل رزومه پیدا نشد.'));
    });
    db.close();
    return file;
  }

  async function openStoredResumeFile(fileId) {
    const popup = window.open('', '_blank');
    try {
      const file = await getStoredResumeFile(fileId);
      if (!file) throw new Error('فایل رزومه محلی پیدا نشد. شاید کش مرورگر پاک شده باشد.');
      const url = URL.createObjectURL(file);
      if (popup) popup.location.href = url;
      else {
        const a = document.createElement('a');
        a.href = url; a.download = file.name || 'resume'; a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (popup) popup.close();
      toast(error.message || 'باز کردن فایل رزومه انجام نشد.');
    }
  }

  async function deleteStoredResumeFile(fileId) {
    const db = await openFileDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readwrite');
      tx.objectStore('resumes').delete(fileId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('حذف فایل رزومه انجام نشد.'));
    });
    db.close();
  }

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (n < 1024) return `${toFa(n)} بایت`;
    if (n < 1024 * 1024) return `${toFa((n / 1024).toFixed(1))} KB`;
    return `${toFa((n / (1024 * 1024)).toFixed(1))} MB`;
  }

  function addActivity(candidateId, type, text) {
    activities.unshift({ id: uid(), candidateId, type, text, at: nowIso() });
    activities = activities.slice(0, 200);
    saveActivities();
  }

  function getManagerReportData() {
    const period = $('#reportPeriodFilter')?.value || 'all';
    const jobId = $('#reportJobFilter')?.value || 'all';
    const selectedJob = jobs.find((job) => job.id === jobId);
    const rows = candidates.filter((candidate) => (jobId === 'all' || candidate.jobId === jobId) && candidateWithinReportPeriod(candidate, period));
    const total = rows.length;
    const interviews = rows.filter(hasInterview).length;
    const offers = rows.filter((c) => reachedStage(c, 'پیشنهاد همکاری')).length;
    const accepted = rows.filter((c) => c.stage === 'پذیرفته شده').length;
    const rejected = rows.filter((c) => c.stage === 'عدم همکاری').length;
    const waiting = rows.filter((c) => c.stage === 'لیست انتظار').length;
    const avgScore = total ? Math.round(rows.reduce((sum, c) => sum + Number(c.score || 0), 0) / total) : 0;
    const next7Interviews = rows.filter((c) => isInterviewWithinDays(c, 7)).length;
    const noResume = rows.filter((c) => !c.resumeUrl && !c.resumeFile?.name).length;
    const idleCandidates = rows.filter((c) => !['پذیرفته شده','عدم همکاری'].includes(c.stage) && daysSince(c.updatedAt || c.createdAt) > 7).length;
    const openJobs = jobs.filter((job) => job.status === 'باز').length;
    const openTasks = tasks.filter((task) => task.status !== 'done').length;
    const overdueTasks = tasks.filter((task) => task.status !== 'done' && task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date()).length;
    const smsTotal = logs.length;
    const smsOk = logs.filter((log) => log.ok).length;
    const stageCounts = Object.fromEntries(STAGES.map((stage) => [stage, rows.filter((c) => c.stage === stage).length]));
    const jobRows = buildJobReportRows(rows, jobId);
    const sourceRows = buildSourceRows(rows);
    const recommendations = buildRecommendations({ total, interviews, accepted, overdueTasks, idleCandidates, noResume, next7Interviews, smsTotal, smsOk });
    return {
      period, jobId, jobLabel: selectedJob ? `فرصت «${selectedJob.title}»` : 'همه فرصت‌های شغلی', periodLabel: reportPeriodLabel(period),
      rows, total, interviews, offers, accepted, rejected, waiting, avgScore, next7Interviews, noResume,
      idleCandidates, openJobs, openTasks, overdueTasks, smsTotal, smsOk, stageCounts, jobRows, sourceRows, recommendations,
      interviewRate: percent(interviews, total), offerRate: percent(offers, total), acceptRate: percent(accepted, total), rejectRate: percent(rejected, total), smsSuccessRate: percent(smsOk, smsTotal)
    };
  }

  function buildJobReportRows(rows, jobId) {
    const relevantJobs = jobId === 'all' ? jobs : jobs.filter((job) => job.id === jobId);
    return relevantJobs.map((job) => {
      const list = rows.filter((c) => c.jobId === job.id || (!c.jobId && c.role === job.title));
      const total = list.length;
      const interviews = list.filter(hasInterview).length;
      const offers = list.filter((c) => reachedStage(c, 'پیشنهاد همکاری')).length;
      const accepted = list.filter((c) => c.stage === 'پذیرفته شده').length;
      const avgScore = total ? Math.round(list.reduce((sum, c) => sum + Number(c.score || 0), 0) / total) : 0;
      return { title: job.title, department: job.department, status: job.status, total, interviews, offers, accepted, avgScore, interviewRate: percent(interviews, total) };
    }).filter((row) => row.total > 0 || jobId !== 'all').sort((a, b) => b.total - a.total);
  }

  function buildSourceRows(rows) {
    const map = new Map();
    rows.forEach((candidate) => {
      const key = candidate.source || 'نامشخص';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(candidate);
    });
    return Array.from(map.entries()).map(([source, list]) => {
      const total = list.length;
      const interviews = list.filter(hasInterview).length;
      const accepted = list.filter((c) => c.stage === 'پذیرفته شده').length;
      return { source, total, interviews, accepted, conversion: percent(accepted, total) };
    }).sort((a, b) => b.total - a.total || b.conversion - a.conversion);
  }

  function buildRecommendations(data) {
    const items = [];
    if (data.overdueTasks > 0) items.push(`${toFa(data.overdueTasks)} تسک معوق وجود دارد؛ اولویت روزانه HR را روی بستن این پیگیری‌ها بگذارید.`);
    if (data.idleCandidates > 0) items.push(`${toFa(data.idleCandidates)} کاندیدا بیش از ۷ روز بدون بروزرسانی مانده‌اند؛ وضعیتشان باید تعیین تکلیف شود.`);
    if (data.noResume > 0) items.push(`${toFa(data.noResume)} پرونده فاقد رزومه است؛ از کاندیدا لینک یا فایل رزومه دریافت شود.`);
    if (data.total > 0 && percent(data.interviews, data.total) < 25) items.push('نرخ تبدیل به مصاحبه پایین است؛ معیار غربالگری یا کیفیت منابع جذب بررسی شود.');
    if (data.next7Interviews > 0) items.push(`${toFa(data.next7Interviews)} مصاحبه در ۷ روز آینده دارید؛ یادآوری پیامکی و هماهنگی مصاحبه‌کننده‌ها را چک کنید.`);
    if (data.smsTotal > 0 && percent(data.smsOk, data.smsTotal) < 90) items.push('نرخ موفقیت پیامک کمتر از ۹۰٪ است؛ API Key، خط ارسال و اعتبار SMS.ir بررسی شود.');
    if (!items.length && data.total === 0) items.push('برای این فیلتر هنوز دیتای کافی ثبت نشده است.');
    return items;
  }

  function exportManagerReport() {
    const data = getManagerReportData();
    const rows = [
      ['section','metric','value','description'],
      ['summary','period',data.periodLabel,'بازه گزارش'],
      ['summary','job',data.jobLabel,'فیلتر فرصت شغلی'],
      ['summary','total_candidates',data.total,'کل کاندیداهای فیلتر شده'],
      ['summary','interviews',data.interviews,`${data.interviewRate}%`],
      ['summary','offers',data.offers,`${data.offerRate}%`],
      ['summary','accepted',data.accepted,`${data.acceptRate}%`],
      ['summary','rejected',data.rejected,`${data.rejectRate}%`],
      ['summary','avg_score',data.avgScore,'میانگین امتیاز'],
      ['summary','overdue_tasks',data.overdueTasks,'تسک‌های معوق'],
      [],
      ['job','title','candidates','interviews','offers','accepted','avg_score','interview_rate'],
      ...data.jobRows.map((row) => ['job', row.title, row.total, row.interviews, row.offers, row.accepted, row.avgScore, `${row.interviewRate}%`]),
      [],
      ['source','name','candidates','interviews','accepted','conversion_rate'],
      ...data.sourceRows.map((row) => ['source', row.source, row.total, row.interviews, row.accepted, `${row.conversion}%`]),
      [],
      ['recommendation','text'],
      ...data.recommendations.map((item) => ['recommendation', item])
    ];
    downloadCsv(rows, `iho-ats-manager-report-${dateStamp()}.csv`);
  }

  function candidateWithinReportPeriod(candidate, period) {
    if (period === 'all') return true;
    const days = Number(period || 0);
    if (!days) return true;
    const value = candidate.createdAt || candidate.updatedAt || candidate.date;
    if (!value) return true;
    return daysSince(value) <= days;
  }

  function reportPeriodLabel(period) { return period === 'all' ? 'کل دوره' : `${toFa(period)} روز اخیر`; }
  function hasInterview(candidate) { return Boolean(candidate.date && candidate.time) || reachedStage(candidate, 'دعوت به مصاحبه'); }
  function reachedStage(candidate, stage) { return STAGES.indexOf(candidate.stage) >= STAGES.indexOf(stage); }
  function percent(value, total) { return total ? Math.round((Number(value || 0) / Number(total || 1)) * 100) : 0; }
  function daysSince(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 0;
    return Math.floor((Date.now() - date.getTime()) / 86400000);
  }
  function isInterviewWithinDays(candidate, days) {
    if (!candidate.date || !candidate.time) return false;
    const when = interviewDate(candidate);
    if (!when) return false;
    const diff = when.getTime() - Date.now();
    return diff >= 0 && diff <= days * 86400000;
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
    const rows = [['jobinjaId','appliedAt','name','phone','email','job','stage','source','resumeUrl','localResume','date','time','interviewer','score','tags','notes'], ...candidates.map((c) => [c.jobinjaId, c.appliedAt, c.name, c.phone, c.email, candidateJobTitle(c), c.stage, c.source, c.resumeUrl, c.resumeFile?.name || '', c.date, c.time, c.interviewer, c.score, c.tags, c.notes])];
    downloadCsv(rows, `iho-ats-candidates-${dateStamp()}.csv`);
  }

  function exportLogs() {
    const rows = [['time','recipient','kind','ok','message','response'], ...logs.map((log) => [log.createdAt, log.recipient, log.kind, log.ok ? 'ok' : 'failed', (log.message || '').replace(/\n/g, ' '), JSON.stringify(log.response || {})])];
    downloadCsv(rows, `iho-ats-sms-logs-${dateStamp()}.csv`);
  }

  function exportAllJson() {
    const data = { version: '5.0.0', exportedAt: nowIso(), settings, jobs, candidates, templates, tasks, logs, activities };
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
    if (/^9\d{9}$/.test(mobile)) mobile = '0' + mobile;
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
