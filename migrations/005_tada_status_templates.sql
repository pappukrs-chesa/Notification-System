INSERT INTO templates (template_key, channel, subject, body)
SELECT 'tada-approved', 'email',
'TADA Approved: {{amount}} for {{visitDate}} - {{recipient.name}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #1B7A3D; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">TADA Claim Approved</h1>
    <p style="margin: 4px 0 0; color: #a8e0bb; font-size: 13px;">Chesa Dental Care &middot; Service Team</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <div style="background: #EAF7EF; border-radius: 6px; padding: 20px 18px; margin: 18px 0; text-align: center;">
      <p style="margin: 0; font-size: 24px; color: #1B7A3D; font-weight: bold;">{{amount}} Approved</p>
      <p style="margin: 6px 0 0; font-size: 14px; color: #2e6b45;">by your coordinator &mdash; payment is confirmed and will be processed</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555; width: 40%;"><strong>Service Call</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">SC {{serviceCallId}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Doctor / Customer</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{doctorName}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Date of Visit</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{visitDate}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Station Type</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{stationType}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Approved Amount</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #1B7A3D; font-weight: bold;">{{amount}}</td>
      </tr>
    </table>
    <p style="font-size: 14px; color: #666; line-height: 1.6;">
      No action is needed from you. The amount will reflect in your account after accounts processing.
    </p>
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
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'tada-approved' AND channel = 'email');

INSERT INTO templates (template_key, channel, subject, body)
SELECT 'tada-rejected', 'email',
'TADA Rejected: {{amount}} for {{visitDate}} - {{recipient.name}}',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <div style="background: #C00000; padding: 24px 30px;">
    <h1 style="margin: 0; color: #ffffff; font-size: 20px;">TADA Claim Rejected</h1>
    <p style="margin: 4px 0 0; color: #ffaaaa; font-size: 13px;">Chesa Dental Care &middot; Service Team</p>
  </div>
  <div style="padding: 28px 30px;">
    <p style="font-size: 16px; color: #333;">Dear <strong>{{recipient.name}}</strong>,</p>
    <div style="background: #FDECEC; border-radius: 6px; padding: 20px 18px; margin: 18px 0; text-align: center;">
      <p style="margin: 0; font-size: 24px; color: #C00000; font-weight: bold;">{{amount}} Rejected</p>
      <p style="margin: 6px 0 0; font-size: 14px; color: #8f3030;">by your coordinator</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555; width: 40%;"><strong>Service Call</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">SC {{serviceCallId}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Doctor / Customer</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{doctorName}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Date of Visit</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{visitDate}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Station Type</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #333;">{{stationType}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #f8f9fa; color: #555;"><strong>Claimed Amount</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #C00000; font-weight: bold;">{{amount}}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; background: #FDECEC; color: #8f3030;"><strong>Reason</strong></td>
        <td style="padding: 10px 12px; border: 1px solid #e0e0e0; color: #8f3030;">{{reason}}</td>
      </tr>
    </table>
    <p style="font-size: 15px; color: #C00000; font-weight: bold; line-height: 1.6;">
      Please contact your coordinator to understand the reason and re-submit with the correct details if applicable.
    </p>
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
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'tada-rejected' AND channel = 'email');
