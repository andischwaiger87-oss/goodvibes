import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, ShieldCheck, User, Lightbulb, Heart, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDeviceId } from '../utils/security';

const steps = [
  { id: 1, title: 'Regeln', icon: ShieldCheck },
  { id: 2, title: 'Idee', icon: Lightbulb },
  { id: 3, title: 'Nutzen', icon: Heart },
  { id: 4, title: 'Avatar', icon: User },
];

export default function Stepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New Success State
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    agreed: false,
    title: '',
    category: '',
    description: '',
    benefit: '',
    username: '',
    avatar: 'avatar-1'
  });
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.agreed) newErrors.agreed = 'Bitte stimme den Regeln zu.';
    }
    if (step === 2) {
      if (!formData.title.trim() || formData.title.length < 3) newErrors.title = 'Der Name ist zu kurz (mind. 3 Zeichen).';
      if (!formData.category) newErrors.category = 'Bitte wähle einen Bereich aus.';
      if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Bitte beschreibe deine Idee etwas genauer.';
    }
    if (step === 3) {
      if (!formData.benefit.trim() || formData.benefit.length < 10) newErrors.benefit = 'Bitte erkläre kurz, wem das Projekt hilft.';
    }
    if (step === 4) {
      if (!formData.username.trim() || formData.username.length < 3) newErrors.username = 'Der Wunschname ist zu kurz.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, steps.length + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll top on step change for mobile
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFormError(null);

    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setIsSuccess(true);
        setIsSubmitting(false);
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.from('projects').insert({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        benefit: formData.benefit,
        username: formData.username,
        avatar_seed: formData.avatar,
        status: 'pending',
        owner_id: getDeviceId()
      });

      if (error) throw error;

      setIsSuccess(true); // Show Success UI instead of alert

    } catch (err) {
      console.error("Submission error:", err);
      setFormError("Es gab ein Problem beim Senden. Bitte versuche es später noch einmal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field) => errors[field] && (
    <p className="text-red-600 text-sm mt-2 flex items-center font-medium bg-red-50 p-2 rounded-md">
      <AlertCircle className="w-4 h-4 mr-2" /> {errors[field]}
    </p>
  );

  // Success View
  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto py-10 px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="elgato-card p-8 sm:p-12 text-center"
        >
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-green-100 shadow-xl">
            <Sparkles className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Idee erfolgreich eingereicht!</h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
            Vielen Dank! Deine Idee wird nun kurz geprüft und dann für das Voting freigeschaltet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/voting'}
              className="btn-primary"
            >
              Zur Abstimmung
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-secondary"
            >
              Zur Startseite
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Kurz vorab</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-slate-800 space-y-4">
              <p className="font-semibold text-base sm:text-lg">Damit wir deine Idee prüfen können, sollte sie:</p>
              <ul className="list-disc list-inside space-y-2 sm:space-y-3 text-slate-700 text-sm sm:text-base leading-relaxed">
                <li>Anderen Menschen oder der Umwelt helfen.</li>
                <li>Keine Gewinnabsichten haben.</li>
                <li>Als Webseite oder App machbar sein.</li>
                <li>Niemanden ausgrenzen oder beleidigen.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200" onClick={() => setFormData(prev => ({ ...prev, agreed: !prev.agreed }))}>
                <input
                  type="checkbox"
                  id="agree"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <label htmlFor="agree" className={cn("text-base sm:text-lg cursor-pointer select-none", errors.agreed ? "text-red-600 font-medium" : "text-slate-700")}>
                  Ja, meine Idee passt zu diesen Punkten.
                </label>
              </div>
              {renderError('agreed')}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Erzähl von deiner Idee</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Wie soll das Projekt heißen?</label>
                <input
                  type="text"
                  name="title"
                  placeholder="z.B. Essensretter App"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white border-2 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none",
                    errors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('title')}
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Worum geht es?</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white border-2 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none cursor-pointer appearance-none",
                    errors.category ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                >
                  <option value="">Bitte wählen...</option>
                  <option value="environment">Umwelt & Natur</option>
                  <option value="education">Bildung & Lernen</option>
                  <option value="health">Gesundheit</option>
                  <option value="community">Zusammenleben</option>
                  <option value="other">Sonstiges</option>
                </select>
                {renderError('category')}
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Beschreibung</label>
                <textarea
                  name="description"
                  rows="12"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Beschreibe kurz was deine Idee macht..."
                  className={cn(
                    "w-full bg-white border-2 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none",
                    errors.description ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('description')}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Warum ist das wichtig?</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Wem hilft das Projekt?</label>
                <textarea
                  name="benefit"
                  rows="8"
                  value={formData.benefit}
                  onChange={handleChange}
                  placeholder="Erkläre kurz, welches Problem gelöst wird..."
                  className={cn(
                    "w-full bg-white border-2 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none",
                    errors.benefit ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('benefit')}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Über dich</h3>
            <p className="text-slate-600 text-base sm:text-lg">Damit alles anonym bleibt, such dir bitte einen Fantasienamen und ein Bild aus.</p>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-4 mb-8">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((i) => (
                <button
                  key={i}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: `avatar-${i}` }))}
                  className={cn(
                    "aspect-square rounded-2xl bg-gray-50 border-4 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200",
                    formData.avatar === `avatar-${i}` ? "border-blue-500 shadow-lg" : "border-transparent"
                  )}
                  aria-label={`Avatar Option ${i}`}
                >
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${i}`} alt="" className="w-full h-full rounded-xl" />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-2">Dein Fantasiename</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="z.B. CodeWizard"
                className={cn(
                  "w-full bg-white border-2 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none",
                  errors.username ? "border-red-300 bg-red-50" : "border-gray-200"

                )}
              />
              {renderError('username')}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 sm:space-y-8 text-center pt-4 sm:pt-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Fertig zum Absenden?</h3>
            <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto">
              Wir schauen uns deine Idee kurz an.
            </p>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 text-left text-sm sm:text-base text-slate-600 max-w-md mx-auto shadow-sm">
              <p className="mb-3 border-b border-gray-100 pb-2 flex justify-between"><span className="text-slate-900 font-semibold">Projekt:</span> <span className="truncate ml-2">{formData.title}</span></p>
              <p className="mb-3 border-b border-gray-100 pb-2 flex justify-between"><span className="text-slate-900 font-semibold">Bereich:</span> <span className="truncate ml-2">{formData.category === 'other' ? 'Sonstiges' : formData.category}</span></p>
              <p className="flex justify-between"><span className="text-slate-900 font-semibold">Von:</span> <span className="truncate ml-2">{formData.username}</span></p>
            </div>

            {formError && (
              <div className="max-w-md mx-auto mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
                {formError}
              </div>
            )}
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Progress Bar (Desktop) */}
      <div className="mb-10 px-2 hidden sm:block">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 w-24">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white shadow-sm",
                    isActive ? "border-blue-600 text-blue-600 ring-4 ring-blue-100" :
                      isCompleted ? "border-blue-600 bg-blue-600 text-white" :
                        "border-gray-200 text-gray-300"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  "absolute -bottom-8 text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-gray-300"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative w-full h-1 bg-gray-200 rounded-full -mt-9 -z-0 top-[-14px] mx-auto" style={{ width: 'calc(100% - 6rem)' }}>
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Mobile Step Indicator & Title */}
      <div className="mb-6 sm:hidden">
        <div className="flex items-center justify-between text-slate-500 text-sm font-medium mb-2">
          <span>Schritt {currentStep} von 5</span>
          <span className="text-blue-600 font-semibold">{currentStep <= 4 ? steps[currentStep - 1].title : 'Abschluss'}</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(currentStep / 5) * 100}%` }} />
        </div>
      </div>

      {/* Content Card with optimized padding for mobile */}
      <div className="elgato-card p-4 sm:p-10 min-h-[400px] sm:min-h-[500px] flex flex-col justify-between shadow-xl shadow-gray-200/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="flex-grow"
          >
            {renderStepContent(currentStep)}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 gap-3 sm:gap-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={cn(
              "flex items-center justify-center px-6 py-3 rounded-xl text-base font-semibold transition-all w-full sm:w-auto",
              currentStep === 1 ? "hidden sm:flex sm:opacity-0 sm:cursor-default" : "text-slate-600 bg-gray-50 sm:bg-transparent hover:text-slate-900 hover:bg-gray-100"
            )}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Zurück
          </button>

          {currentStep <= 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:translate-y-[-1px] w-full sm:w-auto"
            >
              Weiter
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Senden...</>
              ) : (
                <>Jetzt absenden <Check className="w-5 h-5 ml-2" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
