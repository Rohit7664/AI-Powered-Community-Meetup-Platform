import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  MapPin,
  Globe,
  Sparkles,
  Calendar,
  MessageSquare,
  Plus,
  Shield,
  User,
} from 'lucide-react';
import api from '../services/api';
import ChatBox from '../components/chat/ChatBox';
import CreateActivityModal from '../components/activities/CreateActivityModal';
import Button from '../components/common/Button';

const GroupDetailsPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [groupData, setGroupData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // chat, members, activities
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [grpRes, actRes] = await Promise.all([
          api.get(`/groups/${id}`),
          api.get(`/activities/group/${id}`),
        ]);
        setGroupData(grpRes.data);
        setActivities(actRes.data);
      } catch (err) {
        console.error('Failed to load group details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleJoinActivity = async (activityId) => {
    try {
      await api.post(`/activities/${activityId}/join`);
      const actRes = await api.get(`/activities/group/${id}`);
      setActivities(actRes.data);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Community Not Found</h2>
        <Link to="/explore" className="text-primary-600 underline text-sm mt-2 block">
          Back to Explore
        </Link>
      </div>
    );
  }

  const { group, isMember, isInvited, acceptedMembersCount } = groupData;
  const isForming = group.status === 'FORMING';

  return (
    <div className="space-y-6">
      {/* Group Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isForming
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {group.status}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {group.groupType === 'ONLINE' ? 'Virtual Community' : 'Local Community'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {group.name}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed mb-4">
              {group.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {group.interests?.map((i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  {i}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Users className="w-4 h-4 text-primary-600" />
                {acceptedMembersCount} / {group.maxMembers} Members Accepted
              </span>
              <span className="flex items-center gap-1.5">
                {group.groupType === 'ONLINE' ? (
                  <>
                    <Globe className="w-4 h-4 text-blue-500" /> Global Online
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-rose-500" /> {group.location?.city || 'Local area'}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isMember && (
              <Button onClick={() => setIsActivityModalOpen(true)} size="md" className="gap-2">
                <Plus className="w-4 h-4" /> Plan a Meetup
              </Button>
            )}
            {!isMember && isInvited && (
              <Link to="/invitations">
                <Button variant="accent">Review Invitation</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Live Community Chat
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'activities'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Planned Meetups ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Member Profiles ({acceptedMembersCount})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'chat' && (
        <div>
          {isMember ? (
            <ChatBox groupId={id} />
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 mb-1">Members-Only Chat Room</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                To protect member privacy, real-time messaging is exclusively available to verified members who accepted community invitations.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800">Scheduled Meetups</h3>
            {isMember && (
              <Button size="sm" onClick={() => setIsActivityModalOpen(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> New Meetup
              </Button>
            )}
          </div>

          {activities.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No meetups planned yet. Be the first to organize one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.map((act) => {
                const isJoined = act.participants?.some(
                  (p) => p.user?._id === user?.id || p.user === user?.id
                );
                return (
                  <div
                    key={act._id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                          {act.activityType}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {act.date} • {act.time}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1">{act.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{act.description}</p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {act.location?.address}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {act.participants?.length || 1} / {act.maxParticipants} attending
                      </span>
                      {isMember && !isJoined && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleJoinActivity(act._id)}
                        >
                          Join Meetup
                        </Button>
                      )}
                      {isJoined && (
                        <span className="text-xs font-bold text-emerald-600">Attending ✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {group.members
            ?.filter((m) => m.status === 'ACCEPTED')
            .map((m) => (
              <div
                key={m.user?._id || Math.random()}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {m.user?.name ? m.user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-800 truncate">
                    {m.user?.name || 'Member'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {m.user?.city || 'Community Member'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {m.user?.interests?.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      <CreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        groupId={id}
        onActivityCreated={(newAct) => setActivities((prev) => [...prev, newAct])}
      />
    </div>
  );
};

export default GroupDetailsPage;
