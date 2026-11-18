import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { fetchInvitations, fetchMyGroups } from '../../store/groupSlice';
import { fetchNotifications, addLiveNotification } from '../../store/notificationSlice';
import { getSocket } from '../../services/socket';

const AppLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchInvitations());
      dispatch(fetchMyGroups());
      dispatch(fetchNotifications());

      const socket = getSocket();
      if (socket) {
        socket.on('notification', (notif) => {
          dispatch(addLiveNotification(notif));
          dispatch(fetchInvitations());
        });

        return () => {
          socket.off('notification');
        };
      }
    }
  }, [dispatch, isAuthenticated, token]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
