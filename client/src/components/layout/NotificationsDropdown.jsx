import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ShoppingCart, Info, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch recent activity for notification preview
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/orders?limit=4');
        if (res.success && res.data) {
          const items = res.data.slice(0, 4).map((ord) => ({
            id: ord._id,
            title: `Order ${ord.orderNumber}`,
            message: `Order for ${ord.customer?.name || 'Customer'} is currently ${ord.status}`,
            time: new Date(ord.updatedAt || ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
          }));
          setNotifications(items);
          setUnreadCount(items.length);
        }
      } catch (err) {
        // Fallback demo notifications
        setNotifications([
          { id: 1, title: 'New Order Created', message: 'Order ORD-000105 was created in Draft status', time: '10m ago', unread: true },
          { id: 2, title: 'Order Submitted', message: 'Order ORD-000103 was submitted for processing', time: '1h ago', unread: true },
          { id: 3, title: 'System Notice', message: 'System settings and prefix updated successfully', time: '3h ago', unread: false }
        ]);
        setUnreadCount(2);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    item.unread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground truncate">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
