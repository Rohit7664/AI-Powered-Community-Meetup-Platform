import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, MapPin, Users, Filter, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import ActivityMap from '../components/activities/ActivityMap';
import Button from '../components/common/Button';

const ActivitiesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radiusFilter, setRadiusFilter] = useState(25);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/activities/nearby?radius=${radiusFilter}`);
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [radiusFilter]);

  const handleJoin = async (id) => {
    try {
      await api.post(`/activities/${id}/join`);
      fetchActivities();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (id) => {
    try {
      await api.post(`/activities/${id}/leave`);
      fetchActivities();
    } catch (err) {
      alert(err.message);
    }
  };

  const userCenter = user?.location?.coordinates
    ? [user.location.coordinates[1], user.location.coordinates[0]]
    : [28.6139, 77.2090];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Meetups & Activities
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-world activities planned by members in your local communities.
          </p>
        </div>

        {/* Radius filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Search Radius:</span>
          <select
            value={radiusFilter}
            onChange={(e) => setRadiusFilter(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="10">Within 10 km (Local)</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
          </select>
        </div>
      </div>

      {/* Interactive OpenStreetMap */}
      <ActivityMap activities={activities} center={userCenter} zoom={12} />

      {/* Activities Grid */}
      <div className="pt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Upcoming Meetups ({activities.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">No Meetups In This Area</h3>
            <p className="text-xs text-slate-400 mt-1">
              Join or open a community group to organize the first meetup with peers!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((act) => {
              const isJoined = act.participants?.some(
                (p) => p.user?._id === user?.id || p.user === user?.id
              );
              return (
                <div
                  key={act._id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                        {act.activityType}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {act.date} • {act.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{act.title}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{act.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{act.location?.address}</span>
                      </p>
                      {act.distanceKm !== null && act.distanceKm !== undefined && (
                        <p className="text-[11px] text-slate-400 pl-5">
                          ~ {Math.round(act.distanceKm)} km from your location
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {act.participants?.length || 1} / {act.maxParticipants} Attending
                    </span>

                    {isJoined ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLeave(act._id)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleJoin(act._id)}>
                        Join Meetup
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
