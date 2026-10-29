import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, ChevronRight, ChevronLeft, ShieldCheck, User, Lightbulb, Heart,
  AlertCircle, Loader2, Sparkles, Shuffle, Leaf, GraduationCap, Stethoscope,
  Users, Shapes, Send, PartyPopper,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../utils/security';
import { avatarUrl } from '../utils/avatar';
import { getCategoryLabel } from '../utils/categories';
import { getJSON, setJSON } from '../utils/storage';

// -------------------------------------------------------------
// Schritte des Einreichens
// -------------------------------------------------------------
const steps = [
  { id: 1, title: 'Regeln', icon: ShieldCheck },
  { id: 2, title: 'Idee', icon: Lightbulb },
  { id: 3, title: 'Nutzen', icon: Heart },
  { id: 4, title: 'Avatar', icon: User },
  { id: 5, title: 'Absenden', icon: Send },
];
const TOTAL = steps.length;

const RULES = [
  { title: 'Hilft der Allgemeinheit', text: 'Die Idee unterstützt Menschen oder die Umwelt.' },
  { title: 'Gemeinnützig', text: 'Ohne Profit – es geht ums Gemeinwohl, nicht ums Geldverdienen.' },
  { title: 'Als Handy-App machbar', text: 'Sie lässt sich als App fürs Smartphone umsetzen.' },
  { title: 'Für alle', text: 'Sie grenzt niemanden aus und beleidigt niemanden.' },
];

const CATEGORIES = [
  { id: 'environment', icon: Leaf },
  { id: 'education', icon: GraduationCap },
  { id: 'health', icon: Stethoscope },
  { id: 'community', icon: Users },
  { id: 'other', icon: Shapes },
];

const AVATAR_STYLES = [
  { id: 'bottts', label: 'Roboter' },
  { id: 'fun-emoji', label: 'Gesichter' },
  { id: 'shapes', label: 'Formen' },
];

const LIMITS = { title: 80, description: 2000, benefit: 1000, username: 30 };
const DRAFT_KEY = 'gv_idea_draft';

const EMPTY = {
  agreed: false, title: '', category: '', description: '', benefit: '',
  username: '', avatar: '',
};

/** 12 verschiedene Avatare eines Stils (keine doppelten Bilder). */
function makeAvatarOptions(style, count = 12) {
  const seen = new Set();
  const out = [];
  let guard = 0;
  while (out.length < count && guard < 400) {
    guard++;
    const seed = `${style}:${Math.random().toString(36).slice(2, 10)}`;
    const url = avatarUrl(seed);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(seed);
  }
  return out;
}

export default function Stepper() {
  const reduce = useReducedMotion();
  const topRef = useRef(null);

  // Entwurf aus dieser Sitzung wiederherstellen (geht beim Neuladen nicht verloren)
  const draft = getJSON(DRAFT_KEY, null, 'session');
  const [currentStep, setCurrentStep] = useState(draft?.step || 1);
  const [formData, setFormData] = useState({ ...EMPTY, ...(draft?.data || {}) });
  const [avatarStyle, setAvatarStyle] = useState(draft?.style || 'bottts');
  const [avatarOptions, setAvatarOptions] = useState(() => draft?.options || []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState(null);
  const [direction, setDirection] = useState(1);

  // Entwurf laufend sichern
  useEffect(() => {
    if (isSuccess) return;
    setJSON(DRAFT_KEY, { step: currentStep, data: formData, style: avatarStyle, options: avatarOptions }, 'session');
  }, [currentStep, formData, avatarStyle, avatarOptions, isSuccess]);

  // Avatare nur erzeugen, wenn noch keine da sind (Auswahl bleibt beim Zurueckgehen erhalten)
  useEffect(() => {
    if (currentStep === 4 && avatarOptions.length === 0) {
      const opts = makeAvatarOptions(avatarStyle);
      setAvatarOptions(opts);
      setFormData((prev) => (prev.avatar ? prev : { ...prev, avatar: opts[0] }));
    }
  }, [currentStep, avatarOptions.length, avatarStyle]);

  const switchStyle = (style) => {
    setAvatarStyle(style);
    const opts = makeAvatarOptions(style);
    setAvatarOptions(opts);
    setFormData((prev) => ({ ...prev, avatar: opts[0] }));
  };

  const shuffleAvatars = () => {
    const opts = makeAvatarOptions(avatarStyle);
    setAvatarOptions(opts);
    setFormData((prev) => ({ ...prev, avatar: opts[0] }));
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 1 && !formData.agreed) e.agreed = 'Bitte bestätige kurz, dass deine Idee zu diesen Punkten passt.';
    if (step === 2) {
      if (formData.title.trim().length < 3) e.title = 'Der Name ist noch zu kurz (mind. 3 Zeichen).';
      if (!formData.category) e.category = 'Bitte wähle einen Bereich aus.';
      if (formData.description.trim().length < 10) e.description = 'Beschreib deine Idee noch etwas genauer (mind. 10 Zeichen).';
    }
    if (step === 3 && formData.benefit.trim().length < 10) e.benefit = 'Erklär kurz, wem das Projekt hilft (mind. 10 Zeichen).';
    if (step === 4) {
      if (formData.username.trim().length < 3) e.username = 'Der Fantasiename ist noch zu kurz (mind. 3 Zeichen).';
      if (!formData.avatar) e.avatar = 'Bitte wähle ein Bild aus.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setErrors({});
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, TOTAL));
    scrollTop();
  };

  const prevStep = () => {
    setErrors({});
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
    scrollTop();
  };

  const goTo = (step) => {
    if (step >= currentStep) return; // nur zurueckspringen
    setErrors({});
    setDirection(-1);
    setCurrentStep(step);
    scrollTop();
  };

  const update = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const { error } = await supabase.from('projects').insert({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        benefit: formData.benefit.trim(),
        username: formData.username.trim(),
        avatar_seed: formData.avatar,
        status: 'pending',
        owner_id: getDeviceId(),
      });
      if (error) throw error;
      setJSON(DRAFT_KEY, null, 'session');
      setIsSuccess(true);
      scrollTop();
    } catch (err) {
      console.error('Einreichen fehlgeschlagen:', err);
      setFormError('Das Senden hat gerade nicht geklappt. Deine Eingaben sind gespeichert – bitte versuch es gleich noch einmal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasError) => cn(
    'w-full rounded-2xl border bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all',
    'focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
    hasError ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300'
  );

  // ---------- Erfolg ----------
  if (isSuccess) {
    return (
      <div ref={topRef} className="w-full max-w-xl mx-auto scroll-mt-24">
        <motion.div
          initial={reduce ? false : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-200/70 shadow-xl shadow-slate-200/60 p-8 sm:p-12 text-center"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-50 to-transparent" />
          <motion.div
            initial={reduce ? false : { scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <PartyPopper className="w-10 h-10" aria-hidden="true" />
          </motion.div>
          <h2 className="relative text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Danke, {formData.username.trim() || 'für deine Idee'}!
          </h2>
          <p className="relative text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
            Deine Idee ist angekommen. Ich schaue sie mir kurz an und schalte sie dann für die Abstimmung frei.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/voting" className="btn-primary inline-flex items-center justify-center gap-2 min-h-[52px]">
              Zur Abstimmung <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link to="/" className="btn-secondary inline-flex items-center justify-center min-h-[52px]">
              Zur Startseite
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------- Inhalte der Schritte ----------
  const renderStep = (step) => {
    switch (step) {
      case 1:
        return (
          <div>
            <StepHead eyebrow="Schritt 1" title="Kurz vorab" text="Damit deine Idee zur Abstimmung kommt, sollte sie diese vier Punkte erfüllen:" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {RULES.map((r) => (
                <li key={r.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900">{r.title}</span>
                    <span className="block text-sm text-slate-600 leading-relaxed">{r.text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <label
              htmlFor="agree"
              className={cn(
                'mt-6 flex items-center gap-4 rounded-2xl border-2 p-4 sm:p-5 cursor-pointer transition-all select-none',
                formData.agreed
                  ? 'border-blue-500 bg-blue-50/60'
                  : errors.agreed ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-blue-300'
              )}
            >
              <input
                id="agree"
                type="checkbox"
                checked={formData.agreed}
                onChange={(e) => update('agreed', e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-blue-200',
                  formData.agreed ? 'bg-blue-600 border-blue-600 text-white scale-105' : 'bg-white border-slate-300'
                )}
              >
                {formData.agreed && <Check className="w-4 h-4" strokeWidth={3} />}
              </span>
              <span className="text-base sm:text-lg font-medium text-slate-800">Ja, meine Idee passt zu diesen Punkten.</span>
            </label>
            {errors.agreed && (
              <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {errors.agreed}
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <StepHead eyebrow="Schritt 2" title="Erzähl von deiner Idee" text="Ein paar Sätze reichen. Fachwissen brauchst du keines." />
            <div className="space-y-6">
              <Field id="title" label="Wie soll das Projekt heißen?" error={errors.title} count={formData.title.length} max={LIMITS.title}>
                <input
                  id="title" type="text" value={formData.title} maxLength={LIMITS.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="z. B. Essensretter für unser Dorf"
                  aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-fehler' : undefined}
                  className={inputCls(errors.title)}
                />
              </Field>

              <div>
                <p id="cat-label" className="text-sm sm:text-base font-semibold text-slate-800 mb-2">In welchen Bereich passt sie?</p>
                <div role="radiogroup" aria-labelledby="cat-label" className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map(({ id, icon: Icon }) => {
                    const active = formData.category === id;
                    return (
                      <button
                        key={id} type="button" role="radio" aria-checked={active}
                        onClick={() => update('category', id)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-2xl border-2 px-3.5 min-h-[56px] text-left text-sm font-semibold transition-all active:scale-[0.98]',
                          active ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                        )}
                      >
                        <span className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors', active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500')}>
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </span>
                        {getCategoryLabel(id)}
                      </button>
                    );
                  })}
                </div>
                {errors.category && (
                  <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {errors.category}
                  </p>
                )}
              </div>

              <Field
                id="description" label="Was macht deine Idee?"
                hint="Welches Problem gibt es, und wie könnte die App helfen?"
                error={errors.description} count={formData.description.length} max={LIMITS.description}
              >
                <textarea
                  id="description" rows={6} value={formData.description} maxLength={LIMITS.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Viele Menschen in unserem Ort … Eine App könnte …"
                  aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-fehler' : undefined}
                  className={cn(inputCls(errors.description), 'resize-y min-h-[150px]')}
                />
              </Field>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <StepHead eyebrow="Schritt 3" title="Wem hilft das?" text="Beschreib, wer davon profitiert. So können andere besser einschätzen, wie wichtig die Idee ist." />
            <Field id="benefit" label="Wem hilft dein Projekt?" error={errors.benefit} count={formData.benefit.length} max={LIMITS.benefit}>
              <textarea
                id="benefit" rows={6} value={formData.benefit} maxLength={LIMITS.benefit}
                onChange={(e) => update('benefit', e.target.value)}
                placeholder="z. B. Älteren Menschen, die allein leben, weil …"
                aria-invalid={!!errors.benefit} aria-describedby={errors.benefit ? 'benefit-fehler' : undefined}
                className={cn(inputCls(errors.benefit), 'resize-y min-h-[150px]')}
              />
            </Field>
          </div>
        );

      case 4:
        return (
          <div>
            <StepHead eyebrow="Schritt 4" title="Wie möchtest du erscheinen?" text="Alles bleibt anonym. Such dir einen Fantasienamen und ein Bild aus." />

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex p-1 rounded-full bg-slate-100" role="group" aria-label="Bild-Stil">
                {AVATAR_STYLES.map((s) => (
                  <button
                    key={s.id} type="button" onClick={() => switchStyle(s.id)} aria-pressed={avatarStyle === s.id}
                    className={cn('px-3.5 sm:px-4 min-h-[36px] rounded-full text-sm font-semibold transition-all',
                      avatarStyle === s.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                type="button" onClick={shuffleAvatars}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 min-h-[40px] px-2 transition-colors"
              >
                <Shuffle className="w-4 h-4 transition-transform group-active:rotate-180" aria-hidden="true" />
                <span className="hidden sm:inline">Neue Bilder</span>
              </button>
            </div>

            <div role="radiogroup" aria-label="Bild auswählen" className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 sm:gap-3">
              {avatarOptions.map((seed, i) => {
                const active = formData.avatar === seed;
                return (
                  <button
                    key={seed} type="button" role="radio" aria-checked={active} aria-label={`Bild ${i + 1}`}
                    onClick={() => update('avatar', seed)}
                    className={cn(
                      'relative aspect-square rounded-2xl bg-slate-50 overflow-hidden transition-all active:scale-95',
                      active ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/20 scale-[1.03]' : 'ring-1 ring-slate-200 hover:ring-blue-300'
                    )}
                  >
                    <img src={avatarUrl(seed)} alt="" className="w-full h-full" loading="lazy" />
                    {active && (
                      <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-7">
              <Field id="username" label="Dein Fantasiename" error={errors.username} count={formData.username.length} max={LIMITS.username}>
                <div className="relative">
                  {formData.avatar && (
                    <img src={avatarUrl(formData.avatar)} alt="" aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100" />
                  )}
                  <input
                    id="username" type="text" value={formData.username} maxLength={LIMITS.username}
                    onChange={(e) => update('username', e.target.value)}
                    placeholder="z. B. Sonnenblume"
                    autoComplete="off"
                    aria-invalid={!!errors.username} aria-describedby={errors.username ? 'username-fehler' : undefined}
                    className={cn(inputCls(errors.username), formData.avatar && 'pl-14')}
                  />
                </div>
              </Field>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <StepHead eyebrow="Fast geschafft" title="Alles bereit?" text="So erscheint deine Idee nach der Freigabe in der Abstimmung." />

            {/* Vorschau wie auf der Abstimmungsseite */}
            <div className="rounded-3xl ring-1 ring-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <img src={avatarUrl(formData.avatar)} alt="" className="w-12 h-12 rounded-2xl bg-slate-50 ring-1 ring-slate-200 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-lg text-slate-900 leading-tight break-words">{formData.title}</p>
                  <p className="text-xs text-slate-500 mt-1">von {formData.username}</p>
                </div>
                <span className="ml-auto shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {getCategoryLabel(formData.category)}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-4 whitespace-pre-line">{formData.description}</p>
              <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                <p className="text-xs font-bold text-slate-800 mb-1">Gut für:</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{formData.benefit}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" aria-hidden="true" />
              Ich schaue mir jede Idee kurz an, bevor sie sichtbar wird. Du kannst über „Zurück" noch alles ändern.
            </p>

            {formError && (
              <p role="alert" className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">{formError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep - 1) / (TOTAL - 1)) * 100;

  return (
    <div ref={topRef} className="w-full max-w-2xl mx-auto scroll-mt-24">
      {/* ---------- Fortschritt ---------- */}
      <nav aria-label="Fortschritt" className="mb-6 sm:mb-8">
        <ol className="flex items-center justify-between relative">
          <div aria-hidden="true" className="absolute left-5 right-5 top-5 h-1 rounded-full bg-slate-200/80" />
          <div
            aria-hidden="true"
            className="absolute left-5 top-5 h-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-[width] duration-500 ease-out"
            style={{ width: `calc((100% - 2.5rem) * ${progress / 100})` }}
          />
          {steps.map((s) => {
            const Icon = s.icon;
            const done = s.id < currentStep;
            const active = s.id === currentStep;
            return (
              <li key={s.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  disabled={!done}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${s.title}${done ? ' – erledigt, zurückspringen' : active ? ' – aktueller Schritt' : ''}`}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    done && 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 hover:scale-105 cursor-pointer',
                    active && 'bg-white text-blue-600 ring-2 ring-blue-600 shadow-lg shadow-blue-600/20 scale-110',
                    !done && !active && 'bg-white text-slate-300 ring-1 ring-slate-200 cursor-default'
                  )}
                >
                  {done ? <Check className="w-5 h-5" strokeWidth={3} aria-hidden="true" /> : <Icon className="w-[18px] h-[18px]" aria-hidden="true" />}
                </button>
                <span className={cn('mt-2 text-[11px] sm:text-xs font-semibold hidden sm:block', active ? 'text-blue-700' : done ? 'text-slate-700' : 'text-slate-400')}>
                  {s.title}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="sm:hidden mt-3 text-center text-sm text-slate-500">
          Schritt {currentStep} von {TOTAL} · <span className="font-semibold text-blue-700">{steps[currentStep - 1].title}</span>
        </p>
      </nav>

      {/* ---------- Karte ---------- */}
      <div className="rounded-[2rem] bg-white ring-1 ring-slate-200/70 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-5 sm:p-10">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={reduce ? false : { opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {renderStep(currentStep)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---------- Navigation ---------- */}
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-5 sm:px-10 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {currentStep > 1 ? (
            <button
              type="button" onClick={prevStep} disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1 min-h-[52px] px-4 sm:px-5 rounded-xl text-base font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" /> Zurück
            </button>
          ) : <span />}

          <div className="ml-auto flex-1 sm:flex-none">
            {currentStep < TOTAL ? (
              <button
                type="button" onClick={nextStep}
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-h-[52px] px-8 text-base group"
              >
                Weiter <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button" onClick={handleSubmit} disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base"
              >
                {isSubmitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Wird gesendet …</>
                  : <><Sparkles className="w-5 h-5" aria-hidden="true" /> Idee absenden</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Formularfeld mit Label, Zeichenzähler und Fehlermeldung (außerhalb definiert, damit der Fokus beim Tippen bleibt). */
function Field({ id, label, hint, children, error, count, max }) {
  return (
  <div>
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <label htmlFor={id} className="text-sm sm:text-base font-semibold text-slate-800">{label}</label>
      {max && (
        <span className={cn('text-xs tabular-nums', count > max * 0.9 ? 'text-amber-600' : 'text-slate-400')}>
          {count}/{max}
        </span>
      )}
    </div>
    {hint && <p className="text-sm text-slate-500 -mt-1 mb-2.5">{hint}</p>}
    {children}
    {error && (
      <p id={`${id}-fehler`} role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-600">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {error}
      </p>
    )}
  </div>
  );
}

function StepHead({ eyebrow, title, text }) {
  return (
    <div className="mb-6 sm:mb-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">{eyebrow}</p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {text && <p className="mt-2 text-slate-600 leading-relaxed">{text}</p>}
    </div>
  );
}
