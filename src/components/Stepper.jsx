import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, ShieldCheck, User, Lightbulb, Heart, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const steps = [
  { id: 1, title: 'Richtlinien', icon: ShieldCheck },
  { id: 2, title: 'Die Idee', icon: Lightbulb },
  { id: 3, title: 'Impact', icon: Heart },
  { id: 4, title: 'Identität', icon: User },
];

export default function Stepper() {
  const [currentStep, setCurrentStep] = useState(1);
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
      if (!formData.agreed) newErrors.agreed = 'Du musst den Richtlinien zustimmen.';
    }
    if (step === 2) {
      if (!formData.title.trim() || formData.title.length < 3) newErrors.title = 'Titel muss mind. 3 Zeichen haben.';
      if (!formData.category) newErrors.category = 'Bitte wähle eine Kategorie.';
      if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Beschreibung muss mind. 10 Zeichen haben.';
    }
    if (step === 3) {
      if (!formData.benefit.trim() || formData.benefit.length < 10) newErrors.benefit = 'Bitte erkläre den sozialen Nutzen (mind. 10 Zeichen).';
    }
    if (step === 4) {
      if (!formData.username.trim() || formData.username.length < 3) newErrors.username = 'Nutzername muss mind. 3 Zeichen haben.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, steps.length + 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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

  const renderError = (field) => errors[field] && (
    <p className="text-red-500 text-xs mt-1 flex items-center font-medium">
      <AlertCircle className="w-3 h-3 mr-1" /> {errors[field]}
    </p>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Bevor wir starten</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-slate-700 space-y-4">
              <p className="font-semibold">Bitte stelle sicher, dass deine Idee folgende Kriterien erfüllt:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                <li>Gemeinnützig und sozial orientiert.</li>
                <li>Kein kommerzielles Interesse oder Tracking.</li>
                <li>Technisch als Web-App umsetzbar.</li>
                <li>Respektvoller und inklusiver Inhalt.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-slate-600">
                <input
                  type="checkbox"
                  id="agree"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agree" className={errors.agreed ? "text-red-500 font-medium" : ""}>Ich bestätige, dass meine Idee diese Regeln befolgt.</label>
              </div>
              {renderError('agreed')}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Was ist deine Idee?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Projekttitel</label>
                <input
                  type="text"
                  name="title"
                  placeholder="z.B. FoodShare Lokal"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none",
                    errors.title ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('title')}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none",
                    errors.category ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                >
                  <option value="">Kategorie wählen</option>
                  <option value="environment">Umwelt & Nachhaltigkeit</option>
                  <option value="education">Bildung & Wissen</option>
                  <option value="health">Gesundheit & Wohlbefinden</option>
                  <option value="community">Gemeinschaft & Inklusion</option>
                </select>
                {renderError('category')}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kurzbeschreibung</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Beschreibe deine Idee mit einfachen Worten..."
                  className={cn(
                    "w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none",
                    errors.description ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('description')}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Sozialer Impact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Wer profitiert davon?</label>
                <textarea
                  name="benefit"
                  rows="4"
                  value={formData.benefit}
                  onChange={handleChange}
                  placeholder="Erkläre, wie die App anderen hilft oder ein soziales Problem löst..."
                  className={cn(
                    "w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none",
                    errors.benefit ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                />
                {renderError('benefit')}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Deine Identität</h3>
            <p className="text-slate-500">Wähle einen Nutzernamen und Avatar. Keine Klarnamen erforderlich.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: `avatar-${i}` }))}
                  className={cn(
                    "aspect-square rounded-full bg-gray-100 border-2 transition-all hover:scale-105",
                    formData.avatar === `avatar-${i}` ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent"
                  )}
                >
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${i}`} alt="Avatar" className="w-full h-full rounded-full" />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nutzername</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="z.B. CaptainPlanet"
                className={cn(
                  "w-full bg-white border rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none",
                  errors.username ? "border-red-500 bg-red-50" : "border-gray-200"

                )}
              />
              {renderError('username')}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Bereit zum Absenden?</h3>
            <p className="text-slate-500">
              Deine Idee wird von unserem Team geprüft, bevor sie live geht. <br />
              Dieser Prozess verhindert Spam und sichert Qualität.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left text-sm text-slate-600 max-w-md mx-auto">
              <p className="mb-2"><strong className="text-slate-900 block">Projekt:</strong> {formData.title}</p>
              <p className="mb-2"><strong className="text-slate-900 block">Kategorie:</strong> {formData.category}</p>
              <p><strong className="text-slate-900 block">Nutzer:</strong> {formData.username}</p>
            </div>

            <div className="pt-4">
              {/* Simulating Turnstile */}
              <div className="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 text-slate-400 text-xs text-center">
                <div className="flex items-center justify-center mb-1">
                  <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                  <span className="text-slate-600 font-medium">Sicherheitscheck bestanden</span>
                </div>
                <span className="opacity-50">[Cloudflare Turnstile]</span>
              </div>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-10">
      {/* Progress Bar */}
      <div className="mb-12 px-2">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                    isActive ? "border-blue-600 text-blue-600 shadow-md" :
                      isCompleted ? "border-blue-600 bg-blue-600 text-white" :
                        "border-gray-200 text-gray-300"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "absolute -bottom-8 text-xs font-semibold whitespace-nowrap transition-colors",
                  isActive ? "text-blue-600" : isCompleted ? "text-slate-900" : "text-gray-300"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Track */}
        <div className="relative w-full h-1 bg-gray-100 rounded-full -mt-7 -z-0 top-[-10px]">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="elgato-card p-8 min-h-[450px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-grow"
          >
            {renderStepContent(currentStep)}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              currentStep === 1 ? "opacity-0 cursor-default" : "text-slate-500 hover:text-slate-900 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zurück
          </button>

          {currentStep <= steps.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              Weiter
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => alert('Idee erfolgreich eingereicht!')}
              className="flex items-center px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-md"
            >
              Kostenlos einreichen
              <Check className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
