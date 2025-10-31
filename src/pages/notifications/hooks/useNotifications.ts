import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  performer?: {
    full_name: string;
    email: string;
  };
}

export const useNotifications = (isAdmin: boolean) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (notificationsError) throw notificationsError;

      // Fetch performer profiles for notifications that have performed_by
      const performerIds = Array.from(
        new Set(
          notificationsData
            ?.filter((n) => n.performed_by)
            .map((n) => n.performed_by) || []
        )
      );

      let performerProfiles: Record<string, { full_name: string; email: string }> = {};
      
      if (performerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", performerIds);

        if (!profilesError && profiles) {
          performerProfiles = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = {
              full_name: profile.full_name,
              email: profile.email,
            };
            return acc;
          }, {} as Record<string, { full_name: string; email: string }>);
        }
      }

      // Combine notifications with performer data
      const notificationsWithPerformers = notificationsData?.map((notif: any) => ({
        ...notif,
        performer: notif.performed_by ? performerProfiles[notif.performed_by] : undefined,
      })) || [];
      
      setNotifications(notificationsWithPerformers);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: false })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );

      toast({
        title: "Success",
        description: "Notification marked as unread",
      });
    } catch (error) {
      console.error("Error marking notification as unread:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as unread",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification content
    // You can expand this logic based on your notification types
    if (notification.message.includes("rating")) {
      navigate("/approvals");
    } else if (notification.message.includes("goal")) {
      navigate("/dashboard");
    } else if (notification.message.includes("skill")) {
      navigate("/skills");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAsUnread,
    deleteNotification,
    handleNotificationClick,
    refreshNotifications: fetchNotifications,
  };
};
