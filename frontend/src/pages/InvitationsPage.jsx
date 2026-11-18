import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchInvitations,
  acceptInvitationAction,
  rejectInvitationAction,
} from '../store/groupSlice';
import { Mail, MapPin, Globe, Sparkles, Check, X, Users } from 'lucide-react';
import MatchBadge from '../components/common/MatchBadge';
import Button from '../components/common/Button';

const InvitationsPage = () => {
  const dispatch = useDispatch();
  const { invitations, loading } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchInvitations());
  }, [dispatch]);

  const handleAccept = (id) => {
    dispatch(acceptInvitationAction(id));
  };

  const handleReject = (id) => {
    dispatch(rejectInvitationAction(id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Community Invitations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review communities curated specifically for your shared passions and local radius.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : invitations?.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Pending Invitations</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You're all caught up! Our AI continuously searches for compatible peers and new community opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {invitations.map((inv) => (
            <div
              key={inv._id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-200">
                    Invitation
                  </span>
                  <MatchBadge score={inv.matchScore} size="md" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{inv.groupName}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {inv.groupDescription || 'Formed automatically around common passions.'}
                </p>

                {/* Shared Interests */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {inv.interests?.map((i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {i}
                    </span>
                  ))}
                </div>

                {/* Location / Radius */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {inv.acceptedMembersCount}/10 Members accepted
                  </span>
                  <span className="flex items-center gap-1">
                    {inv.groupType === 'ONLINE' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-blue-500" /> Online Community
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {inv.approxDistanceKm !== null
                          ? `${Math.round(inv.approxDistanceKm)} km away`
                          : 'Local area'}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <Button
                  onClick={() => handleAccept(inv._id)}
                  size="sm"
                  className="flex-1 gap-1.5"
                >
                  <Check className="w-4 h-4" /> Accept Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(inv._id)}
                  size="sm"
                  className="gap-1.5 text-slate-600 hover:text-rose-600"
                >
                  <X className="w-4 h-4" /> Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvitationsPage;
