'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Stage = 'new' | 'screening' | 'interview' | 'second' | 'offer' | 'hired' | 'rejected' | 'hold';
type TabKey = 'dashboard' | 'candidates' | 'interviews' | 'sms' | 'templates' | 'logs' | 'settings';
type MessageCategory = 'مصاحبه' | 'یادآوری' | 'نتیجه' | 'مدارک' | 'عمومی';

type Candidate = {
  id: string;
  fullName: string;
  mobile: string;
  position: string;
  source: string;
  city: string;
  stage: Stage;
  interviewDate: string;
  interviewTime: string;
  location: string;
  hrOwner: string;
  score: number;
  result: string;
  notes: string;
  createdAt: string;
  lastContactAt?: string;
  consent: boolean;
};

type SmsTemplate = {
  id: string;
  name: string;
  category: MessageCategory;
  text: string;
};

type SmsLog = {
  id: string;
  candidateId?: string;
  candidateName: string;
  mobile: string;
  templateName: string;
  message: string;
  status: 'sent' | 'scheduled' | 'failed' | 'dry-run';
  createdAt: string;
  scheduledAt?: string;
  providerResponse?: string;
};

type PanelSettings = {
  companyName: string;
  hrName: string;
  defaultLocation: string;
  interviewMapLink: string;
  defaultLineNumber: string;
  signature: string;
};

const stageMeta: Record<Stage, { label: string; className: string; emoji: string }> = {
  new: { label: 'جدید', className: 'bg-sky-50 text-sky-700', emoji: '🆕' },
  screening: { label: 'غربالگری', className: 'bg-cyan-50 text-cyan-700', emoji: '📞' },
  interview: { label: 'مصاحبه اول', className: 'bg-amber-50 text-amber-700', emoji: '🗓️' },
  second: { label: 'مصاحبه دوم', className: 'bg-indigo-50 text-indigo-700', emoji: '🔁' },
  offer: { label: 'پیشنهاد همکاری', className: 'bg-emerald-50 text-emerald-700', emoji: '🤝' },
  hired: { label: 'جذب شده', className: 'bg-green-50 text-green-700', emoji: '✅' },
  rejected: { label: 'رد شده', className: 'bg-rose-50 text-rose-700', emoji: '⛔' },
  hold: { label: 'در انتظار', className: 'bg-slate-100 text-slate-600', emoji: '⏳' }
};

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'داشبورد', icon: '📊' },
  { key: 'candidates', label: 'کاندیداها', icon: '👥' },
  { key: 'interviews', label: 'مصاحبه‌ها', icon: '🗓️' },
  { key: 'sms', label: 'مرکز پیامک', icon: '💬' },
  { key: 'templates', label: 'قالب‌ها', icon: '🧩' },
  { key: 'logs', label: 'گزارش ارسال', icon: '📜' },
  { key: 'settings', label: 'تنظیمات', icon: '⚙️' }
];

const defaultSettings: PanelSettings = {
  companyName: 'ایران‌هتل‌آنلاین',
  hrName: 'واحد منابع انسانی ایران‌هتل',
  defaultLocation: 'مشهد، دفتر مرکزی ایران‌هتل‌آنلاین',
  interviewMapLink: '',
  defaultLineNumber: '',
  signature: 'منابع انسانی ایران‌هتل‌آنلاین'
};

const defaultCandidates: Candidate[] = [
  {
    id: 'cand-1',
    fullName: 'نگار رضایی',
    mobile: '09151234567',
    position: 'کارشناس پشتیبانی مشتریان',
    source: 'جابینجا',
    city: 'مشهد',
    stage: 'interview',
    interviewDate: futureDate(1),
    interviewTime: '10:30',
    location: 'دفتر مرکزی ایران‌هتل‌آنلاین',
    hrOwner: 'واحد HR',
    score: 72,
    result: 'در انتظار مصاحبه',
    notes: 'رزومه مرتبط با پشتیبانی و گردشگری دارد.',
    createdAt: new Date().toISOString(),
    consent: true
  },
  {
    id: 'cand-2',
    fullName: 'امیرحسین کرمی',
    mobile: '09153456789',
    position: 'کارشناس نرخ و ظرفیت هتل',
    source: 'لینکدین',
    city: 'مشهد',
    stage: 'screening',
    interviewDate: futureDate(3),
    interviewTime: '12:00',
    location: 'مصاحبه آنلاین',
    hrOwner: 'واحد HR',
    score: 64,
    result: 'نیاز به تماس اولیه',
    notes: 'نیازمند بررسی تسلط اکسل و مذاکره.',
    createdAt: new Date().toISOString(),
    consent: true
  },
  {
    id: 'cand-3',
    fullName: 'مریم محمدی',
    mobile: '09159876543',
    position: 'اکانت منیجر هتل',
    source: 'معرفی داخلی',
    city: 'تهران',
    stage: 'offer',
    interviewDate: futureDate(5),
    interviewTime: '15:00',
    location: 'مصاحبه آنلاین',
    hrOwner: 'واحد HR',
    score: 88,
    result: 'تایید مدیر واحد، آماده ارسال پیشنهاد',
    notes: 'مذاکره قوی و تجربه هتلداری دارد.',
    createdAt: new Date().toISOString(),
    consent: true
  }
];

const defaultTemplates: SmsTemplate[] = [
  {
    id: 'tpl-invite',
    name: 'دعوت به مصاحبه',
    category: 'مصاحبه',
    text:
      'سلام {candidateName} عزیز\nاز طرف {companyName} برای موقعیت «{position}» به مصاحبه دعوت شده‌اید.\nزمان: {interviewDate} ساعت {interviewTime}\nمحل/لینک: {location}\n{mapLink}\nلطفاً حضور خود را اعلام فرمایید.\n{signature}'
  },
  {
    id: 'tpl-reminder-24',
    name: 'یادآوری ۲۴ ساعت قبل مصاحبه',
    category: 'یادآوری',
    text:
      'سلام {candidateName} عزیز\nیادآوری مصاحبه شما برای موقعیت «{position}» فردا، {interviewDate} ساعت {interviewTime} در {location} برگزار می‌شود.\nدر صورت نیاز به تغییر زمان، با HR هماهنگ فرمایید.\n{signature}'
  },
  {
    id: 'tpl-reminder-3',
    name: 'یادآوری ۳ ساعت قبل مصاحبه',
    category: 'یادآوری',
    text:
      'سلام {candidateName} عزیز\nمصاحبه شما با {companyName} امروز ساعت {interviewTime} برگزار می‌شود.\nمحل/لینک: {location}\nبا تشکر\n{signature}'
  },
  {
    id: 'tpl-reschedule',
    name: 'تغییر زمان مصاحبه',
    category: 'مصاحبه',
    text:
      'سلام {candidateName} عزیز\nزمان مصاحبه شما برای موقعیت «{position}» به {interviewDate} ساعت {interviewTime} تغییر کرد.\nمحل/لینک: {location}\nبا تشکر از همراهی شما\n{signature}'
  },
  {
    id: 'tpl-accepted',
    name: 'نتیجه مثبت مصاحبه',
    category: 'نتیجه',
    text:
      'سلام {candidateName} عزیز\nبا خوشحالی اعلام می‌کنیم نتیجه مصاحبه شما برای موقعیت «{position}» مثبت بوده است.\nبرای ادامه فرایند همکاری، همکاران منابع انسانی با شما در ارتباط خواهند بود.\n{signature}'
  },
  {
    id: 'tpl-waiting',
    name: 'در انتظار بررسی نهایی',
    category: 'نتیجه',
    text:
      'سلام {candidateName} عزیز\nفرایند بررسی نتیجه مصاحبه شما برای موقعیت «{position}» هنوز در حال انجام است. نتیجه نهایی به محض تکمیل بررسی‌ها اطلاع‌رسانی می‌شود.\nاز صبوری شما سپاسگزاریم.\n{signature}'
  },
  {
    id: 'tpl-rejected',
    name: 'عدم همکاری محترمانه',
    category: 'نتیجه',
    text:
      'سلام {candidateName} عزیز\nاز زمانی که برای مصاحبه موقعیت «{position}» در {companyName} اختصاص دادید سپاسگزاریم.\nدر این مرحله امکان ادامه همکاری فراهم نشد، اما رزومه شما برای فرصت‌های آینده نزد ما محفوظ خواهد بود.\nبا آرزوی موفقیت\n{signature}'
  },
  {
    id: 'tpl-documents',
    name: 'درخواست مدارک',
    category: 'مدارک',
    text:
      'سلام {candidateName} عزیز\nبرای تکمیل فرایند جذب در موقعیت «{position}»، لطفاً تصویر کارت ملی، شناسنامه، آخرین مدرک تحصیلی و شماره شبا را برای واحد منابع انسانی ارسال فرمایید.\n{signature}'
  }
];

const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function toFaDate(date?: string) {
  if (!date) return 'ثبت نشده';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' }).format(d);
}

function toFaDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d);
}

function normalizeMobile(input: string) {
  const en = input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[^0-9+]/g, '');
  if (en.startsWith('+98')) return `0${en.slice(3)}`;
  if (en.startsWith('98')) return `0${en.slice(2)}`;
  return en;
}

function getInterviewDateTime(candidate: Candidate) {
  if (!candidate.interviewDate || !candidate.interviewTime) return null;
  const d = new Date(`${candidate.interviewDate}T${candidate.interviewTime}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function scheduleBefore(candidate: Candidate, minutesBefore: number) {
  const base = getInterviewDateTime(candidate);
  if (!base) return '';
  const d = new Date(base.getTime() - minutesBefore * 60 * 1000);
  return d.toISOString();
}

function smsLength(text: string) {
  return text.length;
}

function renderTemplate(templateText: string, candidate: Candidate, settings: PanelSettings) {
  const mapLine = settings.interviewMapLink ? `نقشه/لینک: ${settings.interviewMapLink}` : '';
  const values: Record<string, string> = {
    candidateName: candidate.fullName,
    mobile: candidate.mobile,
    position: candidate.position,
    source: candidate.source,
    city: candidate.city,
    stage: stageMeta[candidate.stage].label,
    interviewDate: toFaDate(candidate.interviewDate),
    interviewTime: candidate.interviewTime || 'ثبت نشده',
    location: candidate.location || settings.defaultLocation,
    result: candidate.result || 'در انتظار بررسی',
    notes: candidate.notes || '',
    companyName: settings.companyName,
    hrName: settings.hrName,
    signature: settings.signature,
    mapLink: mapLine
  };
  return templateText.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv<T extends Record<string, unknown>>(filename: string, rows: T[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n');
  downloadText(filename, `\ufeff${csv}`, 'text/csv;charset=utf-8');
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
      <div className="text-4xl">🗂️</div>
      <h3 className="mt-3 text-lg font-black text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, desc, action, children }: { title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[2rem] p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          {desc ? <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button className="btn btn-secondary" onClick={onClose} type="button">
            بستن ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const meta = stageMeta[stage];
  return <span className={cx('badge', meta.className)}>{meta.emoji} {meta.label}</span>;
}

function AppSidebar({ active, setActive }: { active: TabKey; setActive: (tab: TabKey) => void }) {
  return (
    <aside className="glass sticky top-4 h-fit rounded-[2rem] p-4 lg:w-72">
      <div className="mb-6 rounded-[1.5rem] bg-gradient-to-br from-teal-700 to-sky-500 p-5 text-white shadow-soft">
        <div className="text-3xl">🏨</div>
        <h1 className="mt-3 text-xl font-black">HR SMS Center</h1>
        <p className="mt-2 text-sm leading-6 text-white/80">پنل اطلاع‌رسانی مصاحبه و جذب ایران‌هتل</p>
      </div>
      <nav className="grid gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cx(
              'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition',
              active === tab.key ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/20' : 'bg-white/60 text-slate-600 hover:bg-white'
            )}
          >
            <span className="flex items-center gap-2"><span>{tab.icon}</span>{tab.label}</span>
            <span>←</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function StatCard({ icon, label, value, hint }: { icon: string; label: string; value: string | number; hint: string }) {
  return (
    <div className="glass rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-bold text-slate-400">{hint}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-2xl">{icon}</div>
      </div>
    </div>
  );
}

function DashboardView({ candidates, logs, setActive }: { candidates: Candidate[]; logs: SmsLog[]; setActive: (tab: TabKey) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = candidates
    .filter((c) => c.interviewDate >= today && !['rejected', 'hired'].includes(c.stage))
    .sort((a, b) => `${a.interviewDate}${a.interviewTime}`.localeCompare(`${b.interviewDate}${b.interviewTime}`))
    .slice(0, 5);
  const interviewCount = candidates.filter((c) => c.stage === 'interview' || c.stage === 'second').length;
  const hired = candidates.filter((c) => c.stage === 'hired').length;
  const sentThisWeek = logs.filter((log) => Date.now() - new Date(log.createdAt).getTime() < 7 * 86400000).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[2.2rem] bg-gradient-to-br from-slate-950 via-teal-900 to-sky-800 p-6 text-white shadow-soft lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="badge bg-white/12 text-white">نسخه MVP عملیاتی منابع انسانی</span>
            <h2 className="mt-4 max-w-3xl text-2xl font-black leading-10 lg:text-4xl">
              مدیریت ارتباط با کاندیداها؛ از دعوت مصاحبه تا اعلام نتیجه، با پیامک زمان‌بندی‌شده.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
              این پنل برای HR ایران‌هتل طراحی شده تا تمام پیام‌های قبل از مصاحبه، تغییر زمان، یادآوری، درخواست مدارک و نتیجه نهایی از یک جای واحد مدیریت شود.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-80">
            <button className="btn bg-white text-teal-800" type="button" onClick={() => setActive('candidates')}>افزودن کاندیدا</button>
            <button className="btn bg-white/10 text-white ring-1 ring-white/20" type="button" onClick={() => setActive('sms')}>ارسال پیامک</button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="👥" label="کل کاندیداها" value={candidates.length} hint="همه مراحل جذب" />
        <StatCard icon="🗓️" label="در مرحله مصاحبه" value={interviewCount} hint="نیازمند هماهنگی و یادآوری" />
        <StatCard icon="✅" label="جذب شده" value={hired} hint="موفقیت نهایی فرایند" />
        <StatCard icon="💬" label="پیامک‌های هفته" value={sentThisWeek} hint="ارسال، زمان‌بندی یا تست" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="مصاحبه‌های نزدیک" desc="کاندیداهایی که باید برایشان یادآوری یا پیام هماهنگی ارسال شود.">
          <div className="space-y-3">
            {upcoming.map((c) => (
              <div key={c.id} className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-900">{c.fullName}</h3>
                    <StageBadge stage={c.stage} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{c.position} · {toFaDate(c.interviewDate)} ساعت {c.interviewTime}</p>
                  <p className="mt-1 text-xs text-slate-400">{c.location}</p>
                </div>
                <button className="btn btn-secondary" type="button" onClick={() => setActive('sms')}>ارسال یادآوری</button>
              </div>
            ))}
            {!upcoming.length ? <EmptyState title="مصاحبه نزدیکی ثبت نشده" text="با ثبت تاریخ و ساعت مصاحبه برای کاندیداها، این بخش فعال می‌شود." /> : null}
          </div>
        </Section>

        <Section title="قیف جذب" desc="توزیع کاندیداها در مراحل مختلف فرایند HR.">
          <div className="space-y-3">
            {(Object.keys(stageMeta) as Stage[]).map((stage) => {
              const count = candidates.filter((c) => c.stage === stage).length;
              const pct = candidates.length ? Math.round((count / candidates.length) * 100) : 0;
              return (
                <div key={stage} className="rounded-2xl bg-white/65 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span>{stageMeta[stage].emoji} {stageMeta[stage].label}</span>
                    <span className="text-slate-500">{count} نفر</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-l from-teal-600 to-sky-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function CandidateForm({ candidate, onSubmit, onCancel, settings }: { candidate?: Candidate; onSubmit: (candidate: Candidate) => void; onCancel: () => void; settings: PanelSettings }) {
  const [form, setForm] = useState<Candidate>(
    candidate ?? {
      id: makeId('cand'),
      fullName: '',
      mobile: '',
      position: '',
      source: '',
      city: 'مشهد',
      stage: 'new',
      interviewDate: '',
      interviewTime: '',
      location: settings.defaultLocation,
      hrOwner: settings.hrName,
      score: 50,
      result: '',
      notes: '',
      createdAt: new Date().toISOString(),
      consent: true
    }
  );

  const update = <K extends keyof Candidate>(key: K, value: Candidate[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, mobile: normalizeMobile(form.mobile) });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="نام و نام خانوادگی">
          <input className="input" required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
        </Field>
        <Field label="شماره موبایل">
          <input className="input" required value={form.mobile} onChange={(e) => update('mobile', e.target.value)} placeholder="0915..." />
        </Field>
        <Field label="موقعیت شغلی">
          <input className="input" required value={form.position} onChange={(e) => update('position', e.target.value)} />
        </Field>
        <Field label="منبع جذب">
          <input className="input" value={form.source} onChange={(e) => update('source', e.target.value)} placeholder="جابینجا، لینکدین، معرفی داخلی..." />
        </Field>
        <Field label="شهر">
          <input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
        </Field>
        <Field label="مرحله جذب">
          <select className="input" value={form.stage} onChange={(e) => update('stage', e.target.value as Stage)}>
            {(Object.keys(stageMeta) as Stage[]).map((stage) => <option key={stage} value={stage}>{stageMeta[stage].label}</option>)}
          </select>
        </Field>
        <Field label="تاریخ مصاحبه">
          <input className="input" type="date" value={form.interviewDate} onChange={(e) => update('interviewDate', e.target.value)} />
        </Field>
        <Field label="ساعت مصاحبه">
          <input className="input" type="time" value={form.interviewTime} onChange={(e) => update('interviewTime', e.target.value)} />
        </Field>
        <Field label="محل/لینک مصاحبه">
          <input className="input" value={form.location} onChange={(e) => update('location', e.target.value)} />
        </Field>
        <Field label="مسئول پیگیری">
          <input className="input" value={form.hrOwner} onChange={(e) => update('hrOwner', e.target.value)} />
        </Field>
        <Field label="امتیاز اولیه">
          <input className="input" type="number" min={0} max={100} value={form.score} onChange={(e) => update('score', Number(e.target.value))} />
        </Field>
        <Field label="نتیجه/وضعیت توضیحی">
          <input className="input" value={form.result} onChange={(e) => update('result', e.target.value)} />
        </Field>
      </div>
      <Field label="یادداشت HR">
        <textarea className="input min-h-28" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} />
        اجازه ارتباط پیامکی با کاندیدا ثبت شده است.
      </label>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>انصراف</button>
        <button type="submit" className="btn btn-primary">ذخیره کاندیدا</button>
      </div>
    </form>
  );
}

function CandidatesView({ candidates, setCandidates, settings, openSms }: { candidates: Candidate[]; setCandidates: (c: Candidate[]) => void; settings: PanelSettings; openSms: () => void }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<Stage | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | undefined>();

  const filtered = candidates.filter((c) => {
    const matchesQuery = `${c.fullName} ${c.mobile} ${c.position} ${c.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stage === 'all' || c.stage === stage;
    return matchesQuery && matchesStage;
  });

  function upsert(candidate: Candidate) {
    const exists = candidates.some((c) => c.id === candidate.id);
    setCandidates(exists ? candidates.map((c) => (c.id === candidate.id ? candidate : c)) : [candidate, ...candidates]);
    setModalOpen(false);
    setEditing(undefined);
  }

  function remove(id: string) {
    if (!confirm('این کاندیدا حذف شود؟')) return;
    setCandidates(candidates.filter((c) => c.id !== id));
  }

  return (
    <Section
      title="بانک کاندیداها"
      desc="ثبت اطلاعات کاندیدا، زمان مصاحبه، وضعیت جذب، امتیاز اولیه و یادداشت‌های HR."
      action={
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary" type="button" onClick={() => exportCsv('hr-candidates.csv', candidates as unknown as Record<string, unknown>[])}>خروجی CSV</button>
          <button className="btn btn-primary" type="button" onClick={() => { setEditing(undefined); setModalOpen(true); }}>+ کاندیدای جدید</button>
        </div>
      }
    >
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_140px]">
        <input className="input" placeholder="جستجو بر اساس نام، موبایل، موقعیت یا شهر..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={stage} onChange={(e) => setStage(e.target.value as Stage | 'all')}>
          <option value="all">همه مراحل</option>
          {(Object.keys(stageMeta) as Stage[]).map((s) => <option key={s} value={s}>{stageMeta[s].label}</option>)}
        </select>
        <button className="btn btn-secondary" type="button" onClick={openSms}>ارسال پیام</button>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>کاندیدا</th>
                <th>موقعیت</th>
                <th>مصاحبه</th>
                <th>مرحله</th>
                <th>امتیاز</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="font-black text-slate-900">{c.fullName}</div>
                    <div className="mt-1 text-xs text-slate-500">{c.mobile} · {c.city}</div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-700">{c.position}</div>
                    <div className="mt-1 text-xs text-slate-400">منبع: {c.source || '—'}</div>
                  </td>
                  <td>
                    <div className="text-sm font-bold text-slate-700">{toFaDate(c.interviewDate)}</div>
                    <div className="mt-1 text-xs text-slate-500">ساعت {c.interviewTime || '—'} · {c.location || '—'}</div>
                  </td>
                  <td><StageBadge stage={c.stage} /></td>
                  <td><span className="badge bg-slate-100 text-slate-700">{c.score}/100</span></td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-secondary !px-3 !py-2" onClick={() => { setEditing(c); setModalOpen(true); }}>ویرایش</button>
                      <button type="button" className="btn btn-danger !px-3 !py-2" onClick={() => remove(c.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="کاندیدایی پیدا نشد" text="فیلترها را تغییر دهید یا کاندیدای جدید ثبت کنید." />}

      <Modal title={editing ? 'ویرایش کاندیدا' : 'افزودن کاندیدا'} open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined); }}>
        <CandidateForm candidate={editing} settings={settings} onSubmit={upsert} onCancel={() => { setModalOpen(false); setEditing(undefined); }} />
      </Modal>
    </Section>
  );
}

function InterviewsView({ candidates, setCandidates }: { candidates: Candidate[]; setCandidates: (candidates: Candidate[]) => void }) {
  const [windowDays, setWindowDays] = useState(14);
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + windowDays);
  const list = candidates
    .filter((c) => {
      const dt = getInterviewDateTime(c);
      return dt && dt >= new Date(now.toDateString()) && dt <= end;
    })
    .sort((a, b) => `${a.interviewDate}${a.interviewTime}`.localeCompare(`${b.interviewDate}${b.interviewTime}`));

  function quickStage(id: string, stage: Stage) {
    setCandidates(candidates.map((c) => (c.id === id ? { ...c, stage } : c)));
  }

  return (
    <Section title="تقویم و پیگیری مصاحبه‌ها" desc="نمای عملیاتی برای HR تا بداند امروز و روزهای آینده با چه افرادی باید هماهنگ شود." action={
      <select className="input w-44" value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))}>
        <option value={7}>۷ روز آینده</option>
        <option value={14}>۱۴ روز آینده</option>
        <option value={30}>۳۰ روز آینده</option>
      </select>
    }>
      <div className="grid gap-4">
        {list.map((c) => {
          const dt = getInterviewDateTime(c);
          const isToday = c.interviewDate === new Date().toISOString().slice(0, 10);
          return (
            <div key={c.id} className="rounded-[1.6rem] border border-slate-100 bg-white/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isToday ? <span className="badge bg-rose-50 text-rose-700">امروز</span> : null}
                    <h3 className="text-lg font-black text-slate-900">{c.fullName}</h3>
                    <StageBadge stage={c.stage} />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-600">{c.position}</p>
                  <p className="mt-1 text-sm text-slate-500">{dt ? toFaDateTime(dt.toISOString()) : 'بدون زمان'} · {c.location}</p>
                  <p className="mt-1 text-xs text-slate-400">مسئول پیگیری: {c.hrOwner || '—'} · موبایل: {c.mobile}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-secondary !px-3 !py-2" type="button" onClick={() => quickStage(c.id, 'second')}>مصاحبه دوم</button>
                  <button className="btn btn-secondary !px-3 !py-2" type="button" onClick={() => quickStage(c.id, 'offer')}>پیشنهاد همکاری</button>
                  <button className="btn btn-secondary !px-3 !py-2" type="button" onClick={() => quickStage(c.id, 'rejected')}>رد محترمانه</button>
                </div>
              </div>
            </div>
          );
        })}
        {!list.length ? <EmptyState title="مصاحبه‌ای در این بازه نیست" text="با ثبت تاریخ و ساعت مصاحبه، لیست این بخش کامل می‌شود." /> : null}
      </div>
    </Section>
  );
}

function SmsCenterView({ candidates, templates, settings, logs, setLogs, setCandidates }: { candidates: Candidate[]; templates: SmsTemplate[]; settings: PanelSettings; logs: SmsLog[]; setLogs: (logs: SmsLog[]) => void; setCandidates: (candidates: Candidate[]) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(candidates.slice(0, 1).map((c) => c.id));
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [mode, setMode] = useState<'now' | 'custom' | '24h' | '3h' | '1h'>('now');
  const [customSchedule, setCustomSchedule] = useState('');
  const [manualText, setManualText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!templateId && templates[0]) setTemplateId(templates[0].id);
  }, [templates, templateId]);

  const selected = candidates.filter((c) => selectedIds.includes(c.id));
  const template = templates.find((t) => t.id === templateId);
  const previewCandidate = selected[0] ?? candidates[0];
  const preview = previewCandidate ? renderTemplate(manualText || template?.text || '', previewCandidate, settings) : '';

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function selectByStage(stage: Stage) {
    setSelectedIds(candidates.filter((c) => c.stage === stage).map((c) => c.id));
  }

  function getSchedule(candidate: Candidate) {
    if (mode === 'now') return undefined;
    if (mode === 'custom') return customSchedule ? new Date(customSchedule).toISOString() : undefined;
    if (mode === '24h') return scheduleBefore(candidate, 24 * 60);
    if (mode === '3h') return scheduleBefore(candidate, 3 * 60);
    if (mode === '1h') return scheduleBefore(candidate, 60);
    return undefined;
  }

  async function send() {
    if (!selected.length) {
      setStatusText('حداقل یک کاندیدا انتخاب کنید.');
      return;
    }
    if (!template && !manualText.trim()) {
      setStatusText('یک قالب انتخاب کنید یا متن دستی بنویسید.');
      return;
    }
    setSending(true);
    setStatusText('در حال ارسال...');
    const newLogs: SmsLog[] = [];
    const touchedIds: string[] = [];

    for (const candidate of selected) {
      const message = renderTemplate(manualText || template?.text || '', candidate, settings);
      const scheduledAt = getSchedule(candidate);
      try {
        const res = await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobiles: [candidate.mobile],
            messageText: message,
            scheduledAt,
            lineNumber: settings.defaultLineNumber || undefined
          })
        });
        const data = await res.json();
        const dryRun = Boolean(data?.dryRun);
        const ok = res.ok && (data?.status === 1 || dryRun || data?.ok);
        newLogs.push({
          id: makeId('log'),
          candidateId: candidate.id,
          candidateName: candidate.fullName,
          mobile: candidate.mobile,
          templateName: manualText ? 'متن دستی' : template?.name ?? 'بدون قالب',
          message,
          status: ok ? (scheduledAt ? 'scheduled' : dryRun ? 'dry-run' : 'sent') : 'failed',
          createdAt: new Date().toISOString(),
          scheduledAt,
          providerResponse: JSON.stringify(data)
        });
        if (ok) touchedIds.push(candidate.id);
      } catch (error) {
        newLogs.push({
          id: makeId('log'),
          candidateId: candidate.id,
          candidateName: candidate.fullName,
          mobile: candidate.mobile,
          templateName: manualText ? 'متن دستی' : template?.name ?? 'بدون قالب',
          message,
          status: 'failed',
          createdAt: new Date().toISOString(),
          scheduledAt,
          providerResponse: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setLogs([...newLogs, ...logs]);
    setCandidates(candidates.map((c) => (touchedIds.includes(c.id) ? { ...c, lastContactAt: new Date().toISOString() } : c)));
    setSending(false);
    setStatusText(`ارسال انجام شد. تعداد رکورد لاگ: ${newLogs.length}`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Section title="ارسال و زمان‌بندی پیامک" desc="انتخاب کاندیداها، قالب پیام، زمان ارسال و ثبت خودکار لاگ.">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn btn-secondary" onClick={() => selectByStage('interview')}>انتخاب مصاحبه اول</button>
            <button type="button" className="btn btn-secondary" onClick={() => selectByStage('offer')}>انتخاب پیشنهاد همکاری</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedIds(candidates.map((c) => c.id))}>انتخاب همه</button>
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedIds([])}>حذف انتخاب‌ها</button>
          </div>

          <Field label="کاندیداهای هدف">
            <div className="max-h-72 space-y-2 overflow-auto rounded-3xl border border-slate-100 bg-white/55 p-3">
              {candidates.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-2xl p-3 hover:bg-white">
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span className="flex-1">
                    <span className="block font-black text-slate-800">{c.fullName}</span>
                    <span className="text-xs text-slate-500">{c.position} · {c.mobile}</span>
                  </span>
                  <StageBadge stage={c.stage} />
                </label>
              ))}
            </div>
          </Field>

          <Field label="قالب پیامک">
            <select className="input" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name} · {tpl.category}</option>)}
            </select>
          </Field>

          <Field label="متن دستی اختیاری؛ در صورت پر بودن جای قالب را می‌گیرد">
            <textarea className="input min-h-28" value={manualText} onChange={(e) => setManualText(e.target.value)} placeholder="برای ارسال خاص یا فوری می‌توانید متن را دستی بنویسید..." />
          </Field>

          <Field label="زمان ارسال">
            <select className="input" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="now">ارسال فوری</option>
              <option value="24h">زمان‌بندی ۲۴ ساعت قبل از مصاحبه</option>
              <option value="3h">زمان‌بندی ۳ ساعت قبل از مصاحبه</option>
              <option value="1h">زمان‌بندی ۱ ساعت قبل از مصاحبه</option>
              <option value="custom">زمان دلخواه</option>
            </select>
          </Field>
          {mode === 'custom' ? (
            <Field label="تاریخ و ساعت دلخواه">
              <input type="datetime-local" className="input" value={customSchedule} onChange={(e) => setCustomSchedule(e.target.value)} />
            </Field>
          ) : null}

          <button type="button" className="btn btn-primary w-full" onClick={send} disabled={sending}>
            {sending ? 'در حال ارسال...' : `ارسال/زمان‌بندی برای ${selected.length} نفر`}
          </button>
          {statusText ? <div className="rounded-2xl bg-slate-100 p-3 text-sm font-bold text-slate-700">{statusText}</div> : null}
        </div>
      </Section>

      <Section title="پیش‌نمایش پیام" desc="متغیرها بر اساس اولین کاندیدای انتخاب‌شده جایگزین می‌شوند.">
        <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <span className="font-black">پیش‌نمایش SMS</span>
            <span className="badge bg-white/10 text-white">{smsLength(preview)} کاراکتر</span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-8 text-white/90">{preview || 'هنوز متنی برای نمایش وجود ندارد.'}</pre>
        </div>
        <div className="mt-5 rounded-[1.6rem] border border-teal-100 bg-teal-50/60 p-4 text-sm leading-8 text-teal-900">
          <b>متغیرهای قابل استفاده:</b> {'{candidateName}'}، {'{mobile}'}، {'{position}'}، {'{interviewDate}'}، {'{interviewTime}'}، {'{location}'}، {'{companyName}'}، {'{hrName}'}، {'{result}'}، {'{signature}'}، {'{mapLink}'}.
        </div>
        <div className="mt-5 grid gap-3">
          {selected.slice(0, 6).map((c) => {
            const scheduled = getSchedule(c);
            return (
              <div key={c.id} className="rounded-2xl bg-white/65 p-3 text-sm">
                <div className="font-black text-slate-800">{c.fullName}</div>
                <div className="mt-1 text-slate-500">{scheduled ? `زمان‌بندی: ${toFaDateTime(scheduled)}` : 'ارسال فوری'}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function TemplatesView({ templates, setTemplates }: { templates: SmsTemplate[]; setTemplates: (templates: SmsTemplate[]) => void }) {
  const [editing, setEditing] = useState<SmsTemplate | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  function openNew() {
    setEditing({ id: makeId('tpl'), name: '', category: 'عمومی', text: '' });
    setModalOpen(true);
  }

  function save(template: SmsTemplate) {
    const exists = templates.some((t) => t.id === template.id);
    setTemplates(exists ? templates.map((t) => (t.id === template.id ? template : t)) : [template, ...templates]);
    setModalOpen(false);
    setEditing(undefined);
  }

  function remove(id: string) {
    if (!confirm('این قالب حذف شود؟')) return;
    setTemplates(templates.filter((t) => t.id !== id));
  }

  return (
    <Section title="مدیریت قالب‌های HR" desc="تمام سناریوهای ارتباطی منابع انسانی را به قالب تبدیل کنید تا خطای انسانی کم شود." action={<button className="btn btn-primary" type="button" onClick={openNew}>+ قالب جدید</button>}>
      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-[1.6rem] border border-slate-100 bg-white/70 p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <span className="badge bg-teal-50 text-teal-700">{tpl.category}</span>
                <h3 className="mt-3 text-lg font-black text-slate-900">{tpl.name}</h3>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary !px-3 !py-2" type="button" onClick={() => { setEditing(tpl); setModalOpen(true); }}>ویرایش</button>
                <button className="btn btn-danger !px-3 !py-2" type="button" onClick={() => remove(tpl.id)}>حذف</button>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">{tpl.text}</p>
          </div>
        ))}
      </div>
      <Modal title="قالب پیامک" open={modalOpen} onClose={() => setModalOpen(false)}>
        {editing ? <TemplateForm template={editing} onSubmit={save} onCancel={() => setModalOpen(false)} /> : null}
      </Modal>
    </Section>
  );
}

function TemplateForm({ template, onSubmit, onCancel }: { template: SmsTemplate; onSubmit: (template: SmsTemplate) => void; onCancel: () => void }) {
  const [form, setForm] = useState(template);
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="نام قالب">
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="دسته‌بندی">
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MessageCategory })}>
            {(['مصاحبه', 'یادآوری', 'نتیجه', 'مدارک', 'عمومی'] as MessageCategory[]).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </Field>
      </div>
      <Field label="متن قالب">
        <textarea className="input min-h-64" required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
      </Field>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-8 text-slate-600">
        متغیرها: {'{candidateName}'}، {'{position}'}، {'{interviewDate}'}، {'{interviewTime}'}، {'{location}'}، {'{result}'}، {'{companyName}'}، {'{signature}'}.
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>انصراف</button>
        <button type="submit" className="btn btn-primary">ذخیره قالب</button>
      </div>
    </form>
  );
}

function LogsView({ logs, setLogs }: { logs: SmsLog[]; setLogs: (logs: SmsLog[]) => void }) {
  const [query, setQuery] = useState('');
  const filtered = logs.filter((log) => `${log.candidateName} ${log.mobile} ${log.templateName} ${log.status}`.toLowerCase().includes(query.toLowerCase()));
  const statusClass: Record<SmsLog['status'], string> = {
    sent: 'bg-green-50 text-green-700',
    scheduled: 'bg-sky-50 text-sky-700',
    failed: 'bg-rose-50 text-rose-700',
    'dry-run': 'bg-amber-50 text-amber-700'
  };
  return (
    <Section title="گزارش ارسال پیامک" desc="هر ارسال موفق، زمان‌بندی‌شده، تستی یا ناموفق اینجا ثبت می‌شود." action={
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-secondary" type="button" onClick={() => exportCsv('hr-sms-logs.csv', logs as unknown as Record<string, unknown>[])}>خروجی CSV</button>
        <button className="btn btn-danger" type="button" onClick={() => confirm('همه لاگ‌ها پاک شوند؟') && setLogs([])}>پاکسازی</button>
      </div>
    }>
      <input className="input mb-5" placeholder="جستجو در لاگ‌ها..." value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((log) => (
            <details key={log.id} className="rounded-[1.4rem] border border-slate-100 bg-white/70 p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cx('badge', statusClass[log.status])}>{log.status}</span>
                      <b className="text-slate-900">{log.candidateName}</b>
                      <span className="text-sm text-slate-500">{log.mobile}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{log.templateName} · ثبت: {toFaDateTime(log.createdAt)} {log.scheduledAt ? `· زمان ارسال: ${toFaDateTime(log.scheduledAt)}` : ''}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">مشاهده متن و پاسخ API</span>
                </div>
              </summary>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 font-sans text-sm leading-7 text-slate-700">{log.message}</pre>
                <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-left text-xs leading-6 text-white" dir="ltr">{log.providerResponse}</pre>
              </div>
            </details>
          ))}
        </div>
      ) : <EmptyState title="لاگی وجود ندارد" text="بعد از اولین ارسال پیامک، گزارش‌ها اینجا نمایش داده می‌شوند." />}
    </Section>
  );
}

function SettingsView({ settings, setSettings }: { settings: PanelSettings; setSettings: (settings: PanelSettings) => void }) {
  const [form, setForm] = useState(settings);
  const [health, setHealth] = useState('');

  async function checkHealth() {
    setHealth('در حال بررسی...');
    try {
      const res = await fetch('/api/sms/health');
      const data = await res.json();
      setHealth(JSON.stringify(data, null, 2));
    } catch (error) {
      setHealth(error instanceof Error ? error.message : 'خطا در بررسی اتصال');
    }
  }

  return (
    <Section title="تنظیمات پنل و اتصال پیامک" desc="اطلاعات عمومی HR و شماره خط پیامک را تنظیم کنید. API Key فقط در فایل .env سرور قرار می‌گیرد.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setSettings(form); }}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="نام شرکت">
              <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </Field>
            <Field label="نام/امضای HR">
              <input className="input" value={form.hrName} onChange={(e) => setForm({ ...form, hrName: e.target.value })} />
            </Field>
            <Field label="محل پیش‌فرض مصاحبه">
              <input className="input" value={form.defaultLocation} onChange={(e) => setForm({ ...form, defaultLocation: e.target.value })} />
            </Field>
            <Field label="شماره خط پیامک">
              <input className="input" dir="ltr" value={form.defaultLineNumber} onChange={(e) => setForm({ ...form, defaultLineNumber: e.target.value })} placeholder="3000..." />
            </Field>
            <Field label="لینک نقشه یا لینک مصاحبه آنلاین">
              <input className="input" dir="ltr" value={form.interviewMapLink} onChange={(e) => setForm({ ...form, interviewMapLink: e.target.value })} />
            </Field>
            <Field label="امضای انتهای پیامک">
              <input className="input" value={form.signature} onChange={(e) => setForm({ ...form, signature: e.target.value })} />
            </Field>
          </div>
          <button type="submit" className="btn btn-primary w-fit">ذخیره تنظیمات</button>
        </form>

        <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white">
          <h3 className="text-lg font-black">تنظیمات فنی SMS.ir</h3>
          <p className="mt-3 text-sm leading-7 text-white/70">در روت پروژه فایل <code>.env.local</code> بسازید و مقادیر زیر را قرار دهید. در Vercel هم همین‌ها را در Environment Variables ثبت کنید.</p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-white/10 p-4 text-left text-xs leading-6" dir="ltr">{`SMS_IR_API_KEY=...
SMS_IR_LINE_NUMBER=3000...
SMS_IR_BASE_URL=https://api.sms.ir
SMS_DRY_RUN=false`}</pre>
          <button className="btn mt-4 bg-white text-slate-900" type="button" onClick={checkHealth}>تست وضعیت اتصال</button>
          {health ? <pre className="mt-4 overflow-auto rounded-2xl bg-black/30 p-4 text-left text-xs leading-6" dir="ltr">{health}</pre> : null}
        </div>
      </div>
    </Section>
  );
}

function ImportExportPanel({ candidates, setCandidates }: { candidates: Candidate[]; setCandidates: (candidates: Candidate[]) => void }) {
  const [bulk, setBulk] = useState('');

  function importRows() {
    const lines = bulk.split('\n').map((x) => x.trim()).filter(Boolean);
    const created: Candidate[] = lines.map((line) => {
      const [fullName = '', mobile = '', position = '', interviewDate = '', interviewTime = ''] = line.split(',').map((x) => x.trim());
      return {
        id: makeId('cand'),
        fullName,
        mobile: normalizeMobile(mobile),
        position,
        source: 'ورود گروهی',
        city: 'مشهد',
        stage: (interviewDate ? 'interview' : 'new') as Stage,
        interviewDate,
        interviewTime,
        location: defaultSettings.defaultLocation,
        hrOwner: defaultSettings.hrName,
        score: 50,
        result: '',
        notes: '',
        createdAt: new Date().toISOString(),
        consent: true
      };
    }).filter((c) => c.fullName && c.mobile);
    setCandidates([...created, ...candidates]);
    setBulk('');
  }

  return (
    <Section title="ورود سریع اطلاعات" desc="هر خط را با فرمت: نام، موبایل، موقعیت، تاریخ میلادی YYYY-MM-DD، ساعت HH:mm وارد کنید.">
      <textarea className="input min-h-36" value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder="مثال:\nعلی احمدی,09151234567,کارشناس فروش,2026-07-12,10:30" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={importRows}>ورود گروهی</button>
        <button type="button" className="btn btn-secondary" onClick={() => downloadText('hr-panel-backup.json', JSON.stringify({ candidates }, null, 2), 'application/json')}>بکاپ JSON</button>
      </div>
    </Section>
  );
}

export default function HRPanelPage() {
  const [active, setActive] = useState<TabKey>('dashboard');
  const [candidates, setCandidatesState] = useState<Candidate[]>(() => storage.get('iho_hr_candidates', defaultCandidates));
  const [templates, setTemplatesState] = useState<SmsTemplate[]>(() => storage.get('iho_hr_templates', defaultTemplates));
  const [logs, setLogsState] = useState<SmsLog[]>(() => storage.get('iho_hr_logs', []));
  const [settings, setSettingsState] = useState<PanelSettings>(() => storage.get('iho_hr_settings', defaultSettings));

  const setCandidates = (next: Candidate[]) => { setCandidatesState(next); storage.set('iho_hr_candidates', next); };
  const setTemplates = (next: SmsTemplate[]) => { setTemplatesState(next); storage.set('iho_hr_templates', next); };
  const setLogs = (next: SmsLog[]) => { setLogsState(next); storage.set('iho_hr_logs', next); };
  const setSettings = (next: PanelSettings) => { setSettingsState(next); storage.set('iho_hr_settings', next); };

  const content = useMemo(() => {
    if (active === 'dashboard') return <DashboardView candidates={candidates} logs={logs} setActive={setActive} />;
    if (active === 'candidates') return <div className="space-y-6"><CandidatesView candidates={candidates} setCandidates={setCandidates} settings={settings} openSms={() => setActive('sms')} /><ImportExportPanel candidates={candidates} setCandidates={setCandidates} /></div>;
    if (active === 'interviews') return <InterviewsView candidates={candidates} setCandidates={setCandidates} />;
    if (active === 'sms') return <SmsCenterView candidates={candidates} templates={templates} settings={settings} logs={logs} setLogs={setLogs} setCandidates={setCandidates} />;
    if (active === 'templates') return <TemplatesView templates={templates} setTemplates={setTemplates} />;
    if (active === 'logs') return <LogsView logs={logs} setLogs={setLogs} />;
    return <SettingsView settings={settings} setSettings={setSettings} />;
  }, [active, candidates, templates, settings, logs]);

  return (
    <main className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[290px_1fr] lg:p-6">
      <AppSidebar active={active} setActive={setActive} />
      <div className="min-w-0 space-y-5">
        <header className="glass flex flex-col gap-4 rounded-[2rem] p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-teal-700">IranHotel HR Notification Panel</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">پنل مدیریت پیامک مصاحبه و جذب</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <span className="badge bg-white text-slate-600">ذخیره محلی مرورگر</span>
            <span className="badge bg-white text-slate-600">API Server-side</span>
            <span className="badge bg-white text-slate-600">RTL / Mobile Friendly</span>
          </div>
        </header>
        {content}
      </div>
    </main>
  );
}
