INSERT INTO templates (template_key, channel, subject, body)
SELECT 'engineer-no-schedule-first', 'email',
'Reminder: No Calls Scheduled Yet Today - {{recipient.name}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #1F4E79; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Schedule Reminder</h1>
    <p style="margin: 4px 0 0; color: #a9c4e0; font-size: 13px;">Chesa Dental Care &middot; Service Team</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      This is a friendly reminder that <strong>you have not scheduled or registered any service calls for today</strong>.
    </p>
    <div style="background: #FFF8E1; border-left: 4px solid #FFC107; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #555;">
        <strong>Action Required:</strong> Please log into the system and schedule your visits for today immediately.
        Unscheduled days are recorded and reflected in your <strong>monthly performance report</strong>.
      </p>
    </div>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      If you have already visited a customer today, please make sure your visit is properly registered in the system.
    </p>
    <p style="font-size: 15px; color: #444;">
      For any issues accessing the system, contact your coordinator immediately.
    </p>
    <p style="font-size: 15px; color: #333; margin-top: 24px;">
      Regards,<br/>
      <strong>Service Operations Team</strong><br/>
      Chesa Dental Care
    </p>
  </div>
  <div style="background: #f5f5f5; padding: 14px 30px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #999;">This is an automated reminder. &copy; Chesa Dental Care</p>
  </div>
</div>'
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'engineer-no-schedule-first' AND channel = 'email');

INSERT INTO templates (template_key, channel, subject, body)
SELECT 'engineer-no-schedule-final', 'email',
'Final Warning: No Activity Recorded Today - {{recipient.name}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #C00000; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Final Warning &mdash; No Activity Recorded</h1>
    <p style="margin: 4px 0 0; color: #ffaaaa; font-size: 13px;">Chesa Dental Care &middot; Service Team</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      As of <strong>5:00 PM today</strong>, our records show that <strong>you have not scheduled or completed any service calls</strong>.
      Despite the earlier reminder sent at 1:00 PM, no activity has been recorded against your name.
    </p>
    <div style="background: #FFEBEE; border-left: 4px solid #C00000; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #C00000; font-weight: bold;">This is your second and final warning for today.</p>
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #555; line-height: 1.8;">
        <li>Zero activity days are flagged in your performance record</li>
        <li>Repeated occurrences will be reviewed by management</li>
        <li>This may result in disciplinary action or salary deduction</li>
      </ul>
    </div>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      If you have a valid reason for no activity today (leave, travel, emergency), please inform your coordinator <strong>immediately</strong> so it can be recorded properly.
    </p>
    <p style="font-size: 15px; color: #333; margin-top: 24px;">
      Regards,<br/>
      <strong>Service Operations Team</strong><br/>
      Chesa Dental Care
    </p>
  </div>
  <div style="background: #f5f5f5; padding: 14px 30px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #999;">This is an automated reminder. &copy; Chesa Dental Care</p>
  </div>
</div>'
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'engineer-no-schedule-final' AND channel = 'email');

INSERT INTO templates (template_key, channel, subject, body)
SELECT 'technician-idle-manager-escalation', 'email',
'No activity today: {{technicianName}} ({{stateName}})',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #7C2D12; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">Territory Alert &mdash; Idle Technician</h1>
    <p style="margin: 4px 0 0; color: #fdba74; font-size: 13px;">Chesa Dental Care &middot; Service Operations</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      As the owner of the <strong>{{stateName}}</strong> territory, please note that your technician
      <strong>{{technicianName}}</strong> has <strong>no scheduled visits and no logged activity today ({{date}})</strong>,
      despite two automated reminders sent to them at 1:00 PM and 5:00 PM.
    </p>
    <div style="background: #FFF7ED; border-left: 4px solid #EA580C; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 6px; font-size: 14px; color: #555;"><strong>Technician:</strong> {{technicianName}}</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #555;"><strong>Territory:</strong> {{stateName}}</p>
      <p style="margin: 0; font-size: 14px; color: #555;"><strong>Phone:</strong> {{technicianPhone}}</p>
    </div>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      Please follow up with them directly to understand the reason (customer visit not registered, leave not applied, or genuinely idle)
      and ensure the day is accounted for. You can review their full activity history in the Sales Dashboard under
      <strong>Service &rarr; Manager View &rarr; Team Activity</strong>.
    </p>
    <p style="font-size: 15px; color: #333; margin-top: 24px;">
      Regards,<br/>
      <strong>Service Operations Team</strong><br/>
      Chesa Dental Care
    </p>
  </div>
  <div style="background: #f5f5f5; padding: 14px 30px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #999;">This is an automated escalation. &copy; Chesa Dental Care</p>
  </div>
</div>'
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'technician-idle-manager-escalation' AND channel = 'email');
