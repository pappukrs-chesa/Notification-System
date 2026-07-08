# Fixing the two startup warnings — run on EC2

## Warning 1: `DEP0060 util._extend is deprecated`

Harmless (a dependency uses an old Node API), but let's identify the culprit so we can
upgrade the right package. Run this on the server — it starts a throwaway copy on a
different port for a few seconds and prints the stack trace of the warning:

```bash
cd /var/www/html/notification-service
PORT=4699 timeout 8 node --trace-deprecation --env-file=.env dist/server.js 2>&1 | grep -A 12 "DEP0060"
```

Paste the output back — the trace names the package (e.g. `node_modules/<culprit>/...`),
and the fix is usually a one-line dependency bump. Until then it is safe to ignore:
it is a warning about a *future* Node release, nothing is broken today.

## Warning 2: `Redis >= 6.2.0 recommended, current 6.0.16`

BullMQ works on 6.0 (your production smoke proved the full queue round-trip), but the
box's Redis is from Ubuntu 20.04's archive and is end-of-life. Upgrading to Redis 7.x
removes the warning and gets security fixes. **This Redis is shared with the API
gateway's cache**, so do it in a quiet window — the cache is ephemeral, so a restart
just means a few cold-cache minutes.

### Upgrade steps (official Redis APT repo)

```bash
# 1. Snapshot current state (rollback info)
redis-server --version
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.bak.$(date +%F)

# 2. Add the official Redis repository
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

# 3. Upgrade (keeps /etc/redis/redis.conf — answer "keep local version" if asked)
sudo apt update
sudo apt install redis-server -y

# 4. Restart + verify
sudo systemctl restart redis-server
redis-server --version                                  # expect 7.x
redis-cli -a '<REDIS_PASSWORD>' ping                         # expect PONG

# 5. Verify consumers
pm2 restart notify-api notify-worker
pm2 logs notify-worker --lines 5                        # Redis warning should be GONE
curl -s localhost:4600/health/ready                     # mysql ok
pm2 logs Api-Gateway --lines 10                         # gateway cache reconnected, no errors
```

### Rollback (if anything misbehaves)

```bash
sudo apt install redis-server=5:6.0.16* -y --allow-downgrades   # or: remove /etc/apt/sources.list.d/redis.list, apt update, reinstall
sudo cp /etc/redis/redis.conf.bak.<date> /etc/redis/redis.conf
sudo systemctl restart redis-server
```

Checks after upgrade: gateway responses still fast (cache working), notification smoke
(POST → SENT) still passes, `redis-cli -a '<REDIS_PASSWORD>' info keyspace` shows keys being
written again.
