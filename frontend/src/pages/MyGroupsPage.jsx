import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyGroups } from '../store/groupSlice';
import GroupCard from '../components/groups/GroupCard';
import { Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const MyGroupsPage = () => {
  const dispatch = useDispatch();
  const { myGroups, loading } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchMyGroups());
  }, [dispatch]);

  const activeGroups = myGroups?.filter((g) => g.status === 'ACTIVE') || [];
  const formingGroups = myGroups?.filter((g) => g.status === 'FORMING') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Communities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Communities where you have accepted invitations and are an active member.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : myGroups?.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Communities Joined Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Whenever our AI discovers 3 or more compatible peers around your interests, it automatically creates a community and sends you an invitation. Check your Invitations tab or explore existing communities!
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/invitations">
              <Button variant="outline" size="sm">
                Check Invitations
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="sm">Explore Groups</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Communities */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-bold text-slate-800">
                Active Communities ({activeGroups.length})
              </h2>
            </div>
            {activeGroups.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active communities currently.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeGroups.map((group) => (
                  <GroupCard key={group._id} group={group} isMember={true} />
                ))}
              </div>
            )}
          </div>

          {/* Forming Communities */}
          {formingGroups.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Forming Communities ({formingGroups.length})
                </h2>
                <span className="text-xs text-slate-400">
                  (Activates when 3 members accept)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {formingGroups.map((group) => (
                  <GroupCard key={group._id} group={group} isMember={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyGroupsPage;
