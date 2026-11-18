import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Globe, Sparkles, MessageSquare } from 'lucide-react';
import MatchBadge from '../common/MatchBadge';

const GroupCard = ({ group, matchScore, distanceKm, isMember = false }) => {
  const isOnline = group.groupType === 'ONLINE';
  const acceptedCount = group.acceptedCount || group.members?.filter((m) => m.status === 'ACCEPTED').length || 0;
  const isForming = group.status === 'FORMING';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isForming
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {group.status}
            </span>
            {group.createdByAI && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                <Sparkles className="w-3 h-3" /> AI Created
              </span>
            )}
          </div>
          {matchScore && <MatchBadge score={matchScore} size="sm" />}
        </div>

        {/* Group Name & Description */}
        <Link to={`/groups/${group._id}`}>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors mb-1.5 line-clamp-1">
            {group.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {group.description || 'An active community for shared passions and real connections.'}
        </p>

        {/* Interest tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {group.interests?.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
            >
              {interest}
            </span>
          ))}
          {group.interests?.length > 3 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400">
              +{group.interests.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {acceptedCount}/{group.maxMembers || 10}
          </span>
          <span className="flex items-center gap-1">
            {isOnline ? (
              <>
                <Globe className="w-3.5 h-3.5 text-blue-500" /> Online
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {distanceKm !== undefined && distanceKm !== null
                  ? `${Math.round(distanceKm)} km`
                  : group.location?.city || 'Local'}
              </>
            )}
          </span>
        </div>

        <Link
          to={`/groups/${group._id}`}
          className="font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {isMember ? (
            <>
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </>
          ) : (
            'View'
          )}
        </Link>
      </div>
    </div>
  );
};

export default GroupCard;
