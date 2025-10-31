import { useState } from "react";
import { Bell, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsList } from "./components/NotificationsList";
import { useNotifications } from "./hooks/useNotifications";

export type NotificationFilter = "all" | "unread" | "read" | "system" | "user_actions";

const Notifications = () => {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    handleNotificationClick,
  } = useNotifications(isAdmin);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    if (filter === "system") return notif.type === "info" || notif.type === "success";
    if (filter === "user_actions") return notif.type === "warning" || notif.type === "error";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl tracking-tight text-foreground font-medium">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {unreadCount} Unread
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Admin Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-sidebar-border">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as NotificationFilter)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="user_actions">User Actions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List - Scrollable */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <NotificationsList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAsUnread={markAsUnread}
            onDelete={deleteNotification}
            onNotificationClick={handleNotificationClick}
            isAdmin={isAdmin}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Notifications;
