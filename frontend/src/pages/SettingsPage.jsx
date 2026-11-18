import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { Shield, Bell, Lock, UserX, LogOut, Check } from 'lucide-react';
import Button from '../components/common/Button';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [onlineMatchingEnabled, setOnlineMatchingEnabled] = useState(true);
  const [approxLocationOnly, setApproxLocationOnly] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage privacy, safety, notifications and account preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          Settings preferences saved!
        </div>
      )}

      {/* Privacy & Safety */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Privacy & Geospatial Safety</h3>
            <p className="text-xs text-slate-400">
              Control how your location is shared during AI matching.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                Approximate Location Sharing
              </span>
              <span className="text-xs text-slate-500">
                Only show approximate distance in km (never exact GPS coordinates)
              </span>
            </div>
            <input
              type="checkbox"
              checked={approxLocationOnly}
              onChange={(e) => setApproxLocationOnly(e.target.checked)}
              className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800 block">
                Enable Virtual & Online Matching
              </span>
              <span className="text-xs text-slate-500">
                Allow matching with virtual communities beyond 10 km
              </span>
            </div>
            <input
              type="checkbox"
              checked={onlineMatchingEnabled}
              onChange={(e) => setOnlineMatchingEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Notification Preferences</h3>
            <p className="text-xs text-slate-400">
              Receive alerts when new groups are formed or activities are planned.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-sm font-semibold text-slate-800 block">
              In-App & Real-Time Alerts
            </span>
            <span className="text-xs text-slate-500">
              Receive instant alerts for group invites, chat messages, and meetups
            </span>
          </div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Button onClick={handleSave} size="md">
            Save Preferences
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            size="md"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            <LogOut className="w-4 h-4 mr-2" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
