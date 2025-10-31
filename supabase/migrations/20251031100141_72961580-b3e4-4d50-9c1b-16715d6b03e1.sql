-- Add Notifications page to pages table
INSERT INTO pages (name, route, description)
VALUES ('Notifications', '/notifications', 'View and manage all system notifications')
ON CONFLICT (route) DO NOTHING;

-- Grant access to all roles for Notifications page
INSERT INTO page_access (page_id, role_name, has_access)
SELECT 
  p.id,
  r.role_name,
  true
FROM pages p
CROSS JOIN (
  VALUES ('employee'), ('tech_lead'), ('management'), ('admin')
) AS r(role_name)
WHERE p.route = '/notifications'
ON CONFLICT (page_id, role_name) DO UPDATE SET has_access = true;