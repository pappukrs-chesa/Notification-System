CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  channel VARCHAR(16) NOT NULL,
  recipient JSON NOT NULL,
  template_key VARCHAR(120) NOT NULL,
  data JSON NOT NULL,
  idempotency_key VARCHAR(120) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_client_idempotency (client_id, idempotency_key),
  KEY idx_status_created (status, created_at),
  KEY idx_client_created (client_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notification_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  notification_id CHAR(36) NOT NULL,
  attempt_no INT NOT NULL,
  status VARCHAR(16) NOT NULL,
  error TEXT NULL,
  provider_message_id VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notification (notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS templates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_key VARCHAR(120) NOT NULL,
  channel VARCHAR(16) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_template_channel (template_key, channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_clients (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  api_key_hash CHAR(64) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_api_key_hash (api_key_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO api_clients (name, api_key_hash)
SELECT 'dev-local', SHA2('dev-local-key', 256)
WHERE NOT EXISTS (SELECT 1 FROM api_clients WHERE name = 'dev-local');

INSERT INTO templates (template_key, channel, subject, body)
SELECT 'test-message', 'email', 'Test from Chesa Notification Service — {{title}}',
       '<p>Hello {{recipient.name}},</p><p>{{message}}</p><p>— Chesa Notification Service</p>'
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'test-message' AND channel = 'email');

INSERT INTO templates (template_key, channel, subject, body)
SELECT 'test-message', 'fcm', '{{title}}', '{{message}}'
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE template_key = 'test-message' AND channel = 'fcm');
