UPDATE templates SET body = REPLACE(body, 'two automated reminders', 'two reminders')
WHERE template_key = 'technician-idle-manager-escalation' AND channel = 'email';
