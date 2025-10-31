-- Add performed_by column to notifications table to track who triggered the notification
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;