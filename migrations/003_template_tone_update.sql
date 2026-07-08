UPDATE templates SET body = REPLACE(body, 'This is an automated reminder. &copy; Chesa Dental Care', 'Service Operations Team &middot; Chesa Dental Care')
WHERE channel = 'email' AND body LIKE '%This is an automated reminder%';

UPDATE templates SET body = REPLACE(body, 'This is an automated escalation. &copy; Chesa Dental Care', 'Service Operations Team &middot; Chesa Dental Care')
WHERE channel = 'email' AND body LIKE '%This is an automated escalation%';

UPDATE templates SET
subject = 'FINAL WARNING: Contact Your Coordinator Now - {{recipient.name}}',
body = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #C00000; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">FINAL WARNING &mdash; No Activity Recorded</h1>
    <p style="margin: 4px 0 0; color: #ffaaaa; font-size: 13px;">Chesa Dental Care &middot; Service Team</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <p style="font-size: 15px; color: #444; line-height: 1.6;">
      As of <strong>5:00 PM today</strong>, our records show that <strong>you have not scheduled or completed any service calls</strong>.
      Despite the earlier reminder sent at 1:00 PM, no activity has been recorded against your name.
    </p>
    <div style="background: #C00000; padding: 20px 18px; border-radius: 6px; margin: 22px 0; text-align: center;">
      <p style="margin: 0; font-size: 22px; color: #ffffff; font-weight: bold; letter-spacing: 0.5px;">LOSS OF PAY TODAY &mdash; MARKED ABSENT?</p>
    </div>
    <p style="font-size: 16px; color: #C00000; line-height: 1.7; font-weight: bold;">
      You may be MARKED ABSENT for today, and this will result in LOSS OF PAY.
      Contact your coordinator IMMEDIATELY &mdash; otherwise you WILL be marked absent for today.
    </p>
    <div style="background: #FFEBEE; border-left: 4px solid #C00000; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #555; line-height: 1.8;">
        <li>Zero activity days are flagged in your performance record</li>
        <li>Repeated occurrences will be reviewed by management</li>
        <li>If you have a valid reason (leave, travel, emergency), your coordinator must record it TODAY</li>
      </ul>
    </div>
    <p style="font-size: 15px; color: #333; margin-top: 24px;">
      Regards,<br/>
      <strong>Service Operations Team</strong><br/>
      Chesa Dental Care
    </p>
  </div>
  <div style="background: #f5f5f5; padding: 14px 30px; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #999;">Service Operations Team &middot; Chesa Dental Care</p>
  </div>
</div>'
WHERE template_key = 'engineer-no-schedule-final' AND channel = 'email';
