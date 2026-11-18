import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Heart,
  Activity,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { updateUser } from '../store/authSlice';
import Button from '../components/common/Button';

const CATEGORIES = {
  Sports: ['Cricket', 'Football', 'Basketball', 'Badminton', 'Chess', 'Cycling'],
  Travel: ['Travelling', 'Trekking', 'Adventure', 'Road Trips', 'Camping', 'Exploring Places'],
  Technology: ['Programming', 'Artificial Intelligence', 'Web Development', 'Machine Learning', 'Startups', 'Technology Discussions'],
  Creative: ['Photography', 'Videography', 'Music', 'Dance', 'Art', 'Writing'],
  Lifestyle: ['Fitness', 'Gym', 'Yoga', 'Cooking', 'Reading', 'Movies', 'Gaming'],
  Social: ['Networking', 'Volunteering', 'Business', 'Entrepreneurship', 'Skill Sharing'],
};

const ACTIVITY_OPTIONS = [
  'Indoor activities',
  'Outdoor activities',
  'Online communities',
  'Weekend activities',
  'Learning activities',
  'Professional networking',
  'Social gatherings',
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal
  const [personal, setPersonal] = useState({
    ageRange: user?.ageRange || '18-25',
    city: user?.city || 'Delhi',
    preferredLanguage: user?.preferredLanguage || 'English',
    bio: user?.bio || '',
  });

  // Step 2: Interests
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);
  const [customDescription, setCustomDescription] = useState('');

  // Step 3: Activities
  const [selectedActivities, setSelectedActivities] = useState([
    'Outdoor activities',
    'Weekend activities',
  ]);
  const [indoorOutdoor, setIndoorOutdoor] = useState('Both');

  // Step 4: Location
  const [locationPref, setLocationPref] = useState({
    city: user?.city || 'Delhi',
    coordinates: user?.location?.coordinates || [77.2090, 28.6139], // [lng, lat]
    preferredRadiusKm: 10,
    allowOnline: true,
  });

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleActivity = (act) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 2 && selectedInterests.length === 0 && !customDescription.trim()) {
      setError('Please select at least one interest or describe your passions.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Update personal details & preferences
      await api.put('/users/profile', {
        ageRange: personal.ageRange,
        city: personal.city,
        preferredLanguage: personal.preferredLanguage,
        bio: personal.bio,
        preferences: {
          activityTypes: selectedActivities,
          indoorOutdoor,
          allowOnline: locationPref.allowOnline,
        },
        onboardingCompleted: true,
      });

      // 2. Update Location
      await api.put('/users/location', {
        city: locationPref.city,
        coordinates: locationPref.coordinates,
        preferredRadiusKm: locationPref.preferredRadiusKm,
      });

      // 3. Update Interests and trigger AI semantic matching
      const customList = customDescription.trim() ? [customDescription.trim()] : [];
      await api.put('/users/interests', {
        interests: selectedInterests,
        customInterests: customList,
        customDescription,
      });

      dispatch(
        updateUser({
          ...personal,
          interests: selectedInterests,
          onboardingCompleted: true,
        })
      );

      // Move to success screen
      setStep(5);
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>STEP {step} OF 4</span>
            <span>
              {step === 1 && 'Personal Info'}
              {step === 2 && 'Interests & Passions'}
              {step === 3 && 'Activity Style'}
              {step === 4 && 'Location & Matching'}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Tell Us About Yourself</h2>
                <p className="text-sm text-slate-500">
                  This helps AI connect you with compatible people who share your vibe.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Age Range
                </label>
                <select
                  value={personal.ageRange}
                  onChange={(e) => setPersonal({ ...personal, ageRange: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="18-24">18 - 24 years</option>
                  <option value="25-34">25 - 34 years</option>
                  <option value="35-44">35 - 44 years</option>
                  <option value="45+">45+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Current City
                </label>
                <input
                  type="text"
                  value={personal.city}
                  onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                  placeholder="e.g. Delhi, Mumbai, Bengaluru"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Preferred Language
                </label>
                <input
                  type="text"
                  value={personal.preferredLanguage}
                  onChange={(e) => setPersonal({ ...personal, preferredLanguage: e.target.value })}
                  placeholder="e.g. English, Hindi, Spanish"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Short Introduction / Bio
                </label>
                <textarea
                  rows={3}
                  value={personal.bio}
                  onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  placeholder="What excites you? E.g., Weekend trekker, tech enthusiast, and love playing cricket on Sundays."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={handleNextStep} size="lg">
                Continue to Interests <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Interests & Natural Language Custom Interests */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Select Your Interests</h2>
                <p className="text-sm text-slate-500">
                  Pick passions across categories. The AI builds semantic embeddings for deep matching.
                </p>
              </div>
            </div>

            {/* Category Pillars */}
            <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
              {Object.entries(CATEGORIES).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const isSelected = selectedInterests.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleInterest(item)}
                          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Natural Language Prompt */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Describe custom interests in your own words (AI Semantic Understanding)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Example: "I love exploring mountains, taking photographs, travelling on weekends and meeting new people."
                </p>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Express your passions naturally..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleNextStep} size="lg">
                Continue ({selectedInterests.length} selected) <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Activity Preferences */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Activity Preferences</h2>
                <p className="text-sm text-slate-500">
                  How do you like to engage and socialize with group members?
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Environment Preference
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Indoor', 'Outdoor', 'Both'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIndoorOutdoor(opt)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        indoorOutdoor === opt
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Activity Types
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACTIVITY_OPTIONS.map((opt) => {
                    const isSelected = selectedActivities.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleActivity(opt)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 text-primary-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleNextStep} size="lg">
                Continue to Location <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Location Preferences */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Location & Matching Radius</h2>
                <p className="text-sm text-slate-500">
                  Default local matching radius is 10 km. Online communities connect globally.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Matching City
                </label>
                <input
                  type="text"
                  value={locationPref.city}
                  onChange={(e) => setLocationPref({ ...locationPref, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-800">
                    Preferred Local Radius
                  </label>
                  <span className="text-sm font-bold text-primary-600">
                    {locationPref.preferredRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={locationPref.preferredRadiusKm}
                  onChange={(e) =>
                    setLocationPref({
                      ...locationPref,
                      preferredRadiusKm: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Recommended: 10 km for local offline meetups.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-slate-800 block">
                    Allow Online Communities
                  </span>
                  <span className="text-xs text-slate-500">
                    Participate in virtual groups regardless of physical distance
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={locationPref.allowOnline}
                  onChange={(e) =>
                    setLocationPref({ ...locationPref, allowOnline: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleFinalSubmit} loading={loading} size="lg">
                Complete Onboarding & Find Matches
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Beautiful Success Screen */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-2xl"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30 animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Welcome to InterestHub!
            </h2>
            <p className="text-lg text-primary-600 font-semibold mb-2">
              "We're finding people who share your interests."
            </p>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Our AI is currently running semantic vector embeddings on your passions and evaluating compatible groups and users in your area.
            </p>

            <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto px-8">
              Go to My Dashboard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
