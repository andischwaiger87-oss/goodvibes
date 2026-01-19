import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, ShieldCheck, User, Lightbulb, Heart, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const steps = [
  { id: 1, title: 'Guidelines', icon: ShieldCheck },
  { id: 2, title: 'The Idea', icon: Lightbulb },
  { id: 3, title: 'Impact', icon: Heart },
  { id: 4, title: 'Identity', icon: User },
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
    let isValid = true;

    if (step === 1) {
      if (!formData.agreed) newErrors.agreed = 'You must agree to the guidelines to proceed.';
    }
    if (step === 2) {
      if (!formData.title.trim() || formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters.';
      if (!formData.category) newErrors.category = 'Please select a category.';
      if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters.';
    }
    if (step === 3) {
      if (!formData.benefit.trim() || formData.benefit.length < 10) newErrors.benefit = 'Please explain the social benefit (min. 10 chars).';
    }
    if (step === 4) {
      if (!formData.username.trim() || formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({}); // Clear errors on success
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
    // Clear error for this field as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const renderError = (field) => errors[field] && (
    <p className="text-red-400 text-xs mt-1 flex items-center">
      <AlertCircle className="w-3 h-3 mr-1" /> {errors[field]}
    </p>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Before we start</h3>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-indigo-200 space-y-4">
              <p>Please ensure your idea meets the following criteria:</p>
              <ul className="list-disc list-inside space-y-2 text-indigo-300">
                <li>Non-profit and social benefit oriented.</li>
                <li>No commercial interest or tracking.</li>
                <li>Technically feasible as a web application.</li>
                <li>Respectful and inclusive content.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <input
                  type="checkbox"
                  id="agree"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="agree" className={errors.agreed ? "text-red-400" : ""}>I confirm that my idea follows these rules.</label>
              </div>
              {renderError('agreed')}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">What's your idea?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. FoodShare Local"
                  value={formData.title}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none",
                    errors.title ? "border-red-500" : "border-slate-700"
                  )}
                />
                {renderError('title')}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={cn(
                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none",
                    errors.category ? "border-red-500" : "border-slate-700"
                  )}
                >
                  <option value="">Select a category</option>
                  <option value="environment">Environment & Sustainability</option>
                  <option value="education">Education & Knowledge</option>
                  <option value="health">Health & Well-being</option>
                  <option value="community">Community & Inclusion</option>
                </select>
                {renderError('category')}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Short Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your idea in simple words..."
                  className={cn(
                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none",
                    errors.description ? "border-red-500" : "border-slate-700"
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
            <h3 className="text-2xl font-bold text-white">Social Impact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Who benefits from this?</label>
                <textarea
                  name="benefit"
                  rows="4"
                  value={formData.benefit}
                  onChange={handleChange}
                  placeholder="Explain how this helps others or solves a social problem..."
                  className={cn(
                    "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none",
                    errors.benefit ? "border-red-500" : "border-slate-700"
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
            <h3 className="text-2xl font-bold text-white">Your Identity</h3>
            <p className="text-slate-400">Choose a username and avatar. No real names required.</p>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: `avatar-${i}` }))}
                  className={cn(
                    "aspect-square rounded-full bg-slate-800 border-2 transition-all hover:scale-110",
                    formData.avatar === `avatar-${i}` ? "border-indigo-500 ring-2 ring-indigo-500/50" : "border-slate-700"
                  )}
                >
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${i}`} alt="Avatar" className="w-full h-full rounded-full" />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. CaptainPlanet"
                className={cn(
                  "w-full bg-slate-800/50 border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none",
                  errors.username ? "border-red-500" : "border-slate-700"
                )}
              />
              {renderError('username')}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Ready to Submit?</h3>
            <p className="text-slate-400">
              Your idea will be reviewed by our team before going live. <br />
              This process prevents spam and ensures quality.
            </p>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-left text-sm text-slate-300">
              <p><strong className="text-slate-100">Project:</strong> {formData.title}</p>
              <p><strong className="text-slate-100">Category:</strong> {formData.category}</p>
              <p><strong className="text-slate-100">User:</strong> {formData.username}</p>
            </div>

            <div className="pt-4">
              {/* Simulating Turnstile */}
              <div className="inline-block bg-slate-800 px-4 py-2 rounded border border-slate-700 text-slate-400 text-xs text-center w-full">
                <div className="flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4 mr-1 text-slate-500" />
                  Security Checked
                </div>
                [Cloudflare Turnstile Widget Placeholder]
              </div>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 pl-1">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/50" :
                      isCompleted ? "bg-indigo-900/50 border-indigo-500 text-indigo-300" :
                        "bg-slate-900 border-slate-700 text-slate-600"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-indigo-400" : isCompleted ? "text-indigo-900" : "text-slate-700"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative w-full h-1 bg-slate-800 rounded-full -mt-9 -z-0">
          <div
            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="mt-12 glass-card rounded-2xl p-6 sm:p-8 min-h-[400px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-grow"
          >
            {renderStepContent(currentStep)}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(
              "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all",
              currentStep === 1 ? "opacity-50 cursor-not-allowed text-slate-500" : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          {currentStep <= steps.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => alert('Implementing submit...')}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
            >
              Submit Idea
              <Check className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
