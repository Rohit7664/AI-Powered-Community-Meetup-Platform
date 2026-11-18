import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Sparkles,
  Users,
  Compass,
  Calendar,
  Mail,
  ArrowRight,
  MapPin,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import {
  fetchMyGroups,
  fetchRecommendedGroups,
  fetchInvitations,
  acceptInvitationAction,
  rejectInvitationAction,
} from '../store/groupSlice';
import api from '../services/api';
import GroupCard from '../components/groups/GroupCard';
import MatchBadge from '../components/common/MatchBadge';
import Button from '../components/common/Button';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myGroups, recommendedGroups, invitations, loading } = useSelector(
    (state) => state.groups
  );
  const [nearbyActivities, setNearbyActivities] = useState([]);
  const [pendingPoolStatus, setPendingPoolStatus] = useState(null);

  useEffect(() => {
    dispatch(fetchMyGroups());
    dispatch(fetchRecommendedGroups());
    dispatch(fetchInvitations());

    // Fetch user matches & pending pool status
    const loadMatches = async () => {
      try {
        const res = await api.get('/users/matches');
        setPendingPoolStatus(res.data.pendingStatus);
      } catch (err) {
        console.error('Failed to load user match status', err);
      }
    };

    // Fetch nearby activities
    const loadActivities = async () => {
      try {
        const res = await api.get('/activities/nearby');
        setNearbyActivities(res.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load activities', err);
      }
    };

    loadMatches();
    loadActivities();
  }, [dispatch]);

  const handleAccept = (id) => {
    dispatch(acceptInvitationAction(id));
  };

  const handleReject = (id) => {
    dispatch(rejectInvitationAction(id));
  };

  return (
    <div className="space-y-8">
      {/* Welcome & AI Engine Status Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-primary-500/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              AI Matching Engine Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Explorer'}! 👋
            </h1>
            <p className="text-sm text-slate-100 max-w-xl mt-1 leading-relaxed">
              InterestHub is actively matching your passions across{' '}
              <span className="font-bold underline decoration-accent-300">
                {user?.interests?.join(', ') || 'your interests'}
              </span>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/explore">
              <button className="px-5 py-2.5 rounded-xl bg-white text-primary-700 font-bold text-sm shadow-md hover:bg-slate-50 transition-colors">
                Explore All
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pending Invitations Alert Card */}
      {invitations?.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-amber-900">
                You have {invitations.length} Community Invitation{invitations.length > 1 ? 's' : ''}!
              </h2>
            </div>
            <Link to="/invitations" className="text-xs font-bold text-amber-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invitations.slice(0, 2).map((inv) => (
              <div
                key={inv._id}
                className="bg-white rounded-xl p-4 border border-amber-100 flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800">{inv.groupName}</h3>
                    <MatchBadge score={inv.matchScore} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {inv.interests?.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <button
                    onClick={() => handleAccept(inv._id)}
                    className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(inv._id)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    title="Decline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: My Communities & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Communities */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Communities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-slate-900">My Communities</h2>
              </div>
              <Link to="/my-groups" className="text-xs font-bold text-primary-600 hover:underline">
                View all ({myGroups?.length || 0})
              </Link>
            </div>

            {myGroups?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No Active Communities Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  The AI matching engine is currently pairing you with compatible members. You will automatically receive group invitations!
                </p>
                <Link to="/explore">
                  <Button size="sm">Explore Existing Communities</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myGroups.slice(0, 4).map((group) => (
                  <GroupCard key={group._id} group={group} isMember={true} />
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended Communities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-slate-900">AI Recommended For You</h2>
              </div>
              <Link to="/explore" className="text-xs font-bold text-primary-600 hover:underline">
                Explore more
              </Link>
            </div>

            {recommendedGroups?.length === 0 ? (
              <p className="text-xs text-slate-400">Scanning for new communities...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedGroups.slice(0, 4).map((item) => (
                  <GroupCard
                    key={item.group._id}
                    group={item.group}
                    matchScore={item.matchScore}
                    distanceKm={item.distanceKm}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Activities & Status */}
        <div className="space-y-6">
          {/* Upcoming Activities Widget */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" />
                <h3 className="font-bold text-sm text-slate-800">Nearby Meetups</h3>
              </div>
              <Link to="/activities" className="text-xs text-primary-600 hover:underline font-bold">
                Map View
              </Link>
            </div>

            {nearbyActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No meetups scheduled nearby yet. Join a community to plan one!
              </p>
            ) : (
              <div className="space-y-3">
                {nearbyActivities.map((act) => (
                  <div
                    key={act._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                  >
                    <h4 className="text-xs font-bold text-slate-800 mb-1">{act.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {act.location?.address || 'Local park'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-primary-700 font-semibold">
                      <span>
                        {act.date} • {act.time}
                      </span>
                      <span>{act.participants?.length || 1} joined</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Matching Pool Card */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-accent-300 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Search Pool
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              When 3 or more compatible members share your passions, our AI immediately forms a new group and invites you!
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">Engine Radius</span>
              <span className="font-bold text-white">10 km Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
