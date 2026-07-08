# Deploy Notification Service to Chesa EC2 — copy-paste steps

> Run these in MobaXterm on the server, one block at a time.
> Replace `<YOUR_PAT>` with your GitHub Personal Access Token (pappukrs-chesa account —
> same one as GITHUB_PAT in service_dashboard/deploy.config.sh).

## 1. Clone (creates the folder automatically — no mkdir needed)

```bash
cd /var/www/html
git clone https://pappukrs-chesa:<YOUR_PAT>@github.com/pappukrs-chesa/Notification-System.git notification-service
cd notification-service
```

## 2. Install + build

```bash
npm ci
npm run build
```

## 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Set these values (everything else can stay default):

```
NODE_ENV=production
PORT=4600
DB_HOST=localhost
DB_USER=chesa
DB_PASSWORD="<DB_PASSWORD>"
DB_NAME=notification_service
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD="<REDIS_PASSWORD>"
SMTP_HOST=<copy from /var/www/html/chesa_api_gateway/.env>
SMTP_PORT=<same>
SMTP_SECURE=<same>
SMTP_USER=<same>
SMTP_PASS="<same — quote it if it has # or spaces>"
SMTP_FROM=<same>
NOTIFY_DRY_RUN=1
```

IMPORTANT: passwords containing `#` MUST be wrapped in double quotes,
otherwise Node treats everything after `#` as a comment.
Leave `NOTIFY_DRY_RUN=1` for the first test — channels log instead of sending.

## 4. Migrate database (tables already created — should print "skip 001_init.sql")

```bash
npm run migrate
```

## 5. Start under pm2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs notify-api --lines 20
```

Expect: `notify-api listening` with port 4600, and `notify-worker started` in
`pm2 logs notify-worker`.

## 6. Expose through Apache (one time)

```bash
sudo cp /etc/apache2/sites-available/api-gateway.conf /etc/apache2/sites-available/api-gateway.conf.bak.$(date +%F)
sudo nano /etc/apache2/sites-available/api-gateway.conf
```

Add these two lines ABOVE the catch-all `ProxyPass /  http://localhost:4000/`:

```apache
ProxyPass        /notify/ http://localhost:4600/
ProxyPassReverse /notify/ http://localhost:4600/
```

Apply:

```bash
sudo apachectl configtest
sudo systemctl reload apache2
```

## 7. Smoke test

```bash
curl https://api.chesadentalcare.com/notify/health
# {"status":"ok","service":"notification-service"}

curl https://api.chesadentalcare.com/notify/health/ready
# {"status":"ready","checks":{"mysql":"ok","channels":"email,fcm"}}

curl -X POST https://api.chesadentalcare.com/notify/api/v1/notifications \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: dev-local-key' \
  -d '{"channel":"email","to":{"email":"test@chesadentalcare.com","name":"Test"},"templateKey":"test-message","data":{"title":"Server Smoke","message":"Deployed and working."},"idempotencyKey":"ec2-smoke-001"}'
# → 202 {"id":"...","status":"PENDING"}
# copy the id, then:

curl https://api.chesadentalcare.com/notify/api/v1/notifications/<id> -H 'X-API-Key: dev-local-key'
# → "status":"SENT" with attempt history (dry-run)
```

## 8. Go live (after smoke passes)

```bash
nano .env            # set NOTIFY_DRY_RUN=0
pm2 restart notify-api notify-worker
```

Send yourself a real email using the same curl as step 7 (change idempotencyKey
and use your real email address).

## 9. Register real client apps (one INSERT per app)

```sql
INSERT INTO notification_service.api_clients (name, api_key_hash)
VALUES ('sales-final', SHA2('<paste-a-long-random-key>', 256));
```

Give that key to the app; it authenticates with header `X-API-Key: <key>`.
Generate a random key locally with:  openssl rand -hex 24

## Later updates (redeploy)

```bash
cd /var/www/html/notification-service
git pull
npm ci && npm run build && npm run migrate
pm2 restart notify-api notify-worker
```
