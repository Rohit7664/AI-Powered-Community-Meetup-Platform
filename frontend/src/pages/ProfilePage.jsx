import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Heart, Sparkles, Check } from 'lucide-react';
import api from '../services/api';
import { updateUser } from '../store/authSlice';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    city: user?.city || '',
    preferredLanguage: user?.preferredLanguage || 'English',
    ageRange: user?.ageRange || '18-25',
    preferredRadiusKm: user?.preferredRadiusKm || 10,
  });

  const [interests, setInterests] = useState(user?.interests || []);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        preferredLanguage: user.preferredLanguage || 'English',
        ageRange: user.ageRange || '18-25',
        preferredRadiusKm: user.preferredRadiusKm || 10,
      });
      setInterests(user.interests || []);
    }
  }, [user]);

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterestInput.trim()) return;
    const item = newInterestInput.trim();
    if (!interests.includes(item)) {
      setInterests([...interests, item]);
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (item) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      // 1. Update basic profile
      await api.put('/users/profile', {
        name: form.name,
        bio: form.bio,
        city: form.city,
        preferredLanguage: form.preferredLanguage,
        ageRange: form.ageRange,
      });

      // 2. Update location radius
      await api.put('/users/location', {
        city: form.city,
        preferredRadiusKm: parseInt(form.preferredRadiusKm, 10),
      });

      // 3. Update interests (re-generates embeddings)
      await api.put('/users/interests', {
        interests,
      });

      dispatch(
        updateUser({
          ...form,
          interests,
        })
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your passions and location up to date so the AI can match you accurately.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Profile updated successfully! AI matching models recalibrated.
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Avatar header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {form.name ? form.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{form.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell others what you love doing..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age Range</label>
              <select
                value={form.ageRange}
                onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="18-24">18 - 24 years</option>
                <option value="25-34">25 - 34 years</option>
                <option value="35-44">35 - 44 years</option>
                <option value="45+">45+ years</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Preferred Local Radius</label>
              <span className="text-xs font-bold text-primary-600">{form.preferredRadiusKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={form.preferredRadiusKm}
              onChange={(e) => setForm({ ...form, preferredRadiusKm: e.target.value })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          {/* Interests Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">My Interests</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-xl bg-primary-50 text-primary-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(item)}
                    className="text-primary-400 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom interest..."
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={handleAddInterest} size="sm" variant="secondary">
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" loading={saving} size="md">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
