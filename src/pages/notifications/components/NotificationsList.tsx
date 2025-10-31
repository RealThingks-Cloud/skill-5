import { motion } from "framer-motion";
import { 
  Mail, 
  MailOpen, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Info,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../hooks/useNotifications";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
  isAdmin: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "info":
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case "success":
      return "Success";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    case "info":
    default:
      return "Info";
  }
};

export const NotificationsList = ({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onNotificationClick,
  isAdmin,
}: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Notifications
        </h3>
        <p className="text-muted-foreground max-w-md">
          You're all caught up! Check back later for new updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`
            border rounded-lg p-4 transition-all duration-200 cursor-pointer
            ${
              notification.read
                ? "bg-background border-border hover:border-primary/30"
                : "bg-primary/5 border-primary/30 hover:border-primary/50"
            }
          `}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-semibold ${notification.read ? "text-foreground/80" : "text-foreground"}`}>
                    {notification.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {getNotificationTypeLabel(notification.type)}
                  </Badge>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>

              <p className={`text-sm mb-3 ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                {notification.message}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  {isAdmin && notification.performer && (
                    <span className="font-medium">
                      By: {notification.performer.full_name}
                    </span>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {notification.read ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsUnread(notification.id)}
                      className="h-8 px-2"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Mark Unread
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-8 px-2"
                    >
                      <MailOpen className="w-4 h-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
