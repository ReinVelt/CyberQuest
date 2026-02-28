#!/usr/bin/env python3
"""
GitHub Webhook Listener for CyberQuest auto-deploy.

Listens for push events from GitHub and runs `git pull` on the local repo.
Uses only Python stdlib — no dependencies needed.

Usage:
    python3 webhook-pull.py                          # defaults
    python3 webhook-pull.py --port 9000 --secret mysecret
    WEBHOOK_SECRET=mysecret python3 webhook-pull.py  # env var

The --secret / WEBHOOK_SECRET should match the secret you configure in
GitHub → Settings → Webhooks.
"""

import argparse
import hashlib
import hmac
import json
import logging
import os
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

# ---------------------------------------------------------------------------
# Configuration defaults
# ---------------------------------------------------------------------------
DEFAULT_PORT = 9000
DEFAULT_REPO = "/var/www/CyberQuest"
DEFAULT_BRANCH = "main"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("webhook-pull")


# ---------------------------------------------------------------------------
# Git pull logic
# ---------------------------------------------------------------------------
def git_pull(repo_path: str, branch: str) -> dict:
    """Run git pull in the repo directory and return result info."""
    env = os.environ.copy()
    env["GIT_TERMINAL_PROMPT"] = "0"  # never prompt for credentials

    try:
        result = subprocess.run(
            ["git", "-C", repo_path, "pull", "origin", branch],
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
        )
        log.info("git pull stdout: %s", result.stdout.strip())
        if result.returncode != 0:
            log.error("git pull stderr: %s", result.stderr.strip())
        return {
            "ok": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }
    except subprocess.TimeoutExpired:
        log.error("git pull timed out after 60 s")
        return {"ok": False, "stdout": "", "stderr": "timeout"}
    except Exception as exc:
        log.error("git pull failed: %s", exc)
        return {"ok": False, "stdout": "", "stderr": str(exc)}


# ---------------------------------------------------------------------------
# Signature verification
# ---------------------------------------------------------------------------
def verify_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    """Verify the X-Hub-Signature-256 header from GitHub."""
    if not signature_header:
        return False
    try:
        algo, sig = signature_header.split("=", 1)
    except ValueError:
        return False
    if algo != "sha256":
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, sig)


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------
class WebhookHandler(BaseHTTPRequestHandler):
    """Handle incoming GitHub webhook POST requests."""

    # Assigned by the factory
    repo_path: str = DEFAULT_REPO
    branch: str = DEFAULT_BRANCH
    secret: str = ""

    def do_GET(self):
        """Health check endpoint."""
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"CyberQuest webhook listener OK\n")

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        payload = self.rfile.read(content_length)

        # --- Signature check (if a secret is configured) ---
        if self.secret:
            sig = self.headers.get("X-Hub-Signature-256", "")
            if not verify_signature(payload, sig, self.secret):
                log.warning("Invalid signature from %s", self.client_address[0])
                self.send_response(403)
                self.end_headers()
                self.wfile.write(b"Forbidden: bad signature\n")
                return

        # --- Parse event ---
        event = self.headers.get("X-GitHub-Event", "")
        if event == "ping":
            log.info("Received ping event — webhook configured OK")
            self._respond(200, {"status": "pong"})
            return

        if event != "push":
            log.info("Ignoring event: %s", event)
            self._respond(200, {"status": "ignored", "event": event})
            return

        # --- Only pull for the configured branch ---
        try:
            body = json.loads(payload)
        except json.JSONDecodeError:
            self._respond(400, {"error": "invalid JSON"})
            return

        ref = body.get("ref", "")
        if ref != f"refs/heads/{self.branch}":
            log.info("Push to %s — not our branch (%s), skipping", ref, self.branch)
            self._respond(200, {"status": "skipped", "ref": ref})
            return

        pusher = body.get("pusher", {}).get("name", "unknown")
        commits = len(body.get("commits", []))
        log.info("Push from %s: %d commit(s) to %s — pulling…", pusher, commits, self.branch)

        result = git_pull(self.repo_path, self.branch)
        status_code = 200 if result["ok"] else 500
        self._respond(status_code, result)

    def _respond(self, code: int, data: dict):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        """Suppress default stderr logging (we use our own logger)."""
        pass


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="GitHub webhook → git pull")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Listen port (default: 9000)")
    parser.add_argument("--repo", default=DEFAULT_REPO, help="Path to git repo")
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Branch to watch (default: main)")
    parser.add_argument("--secret", default="", help="Webhook secret (or set WEBHOOK_SECRET env)")
    args = parser.parse_args()

    secret = args.secret or os.environ.get("WEBHOOK_SECRET", "")

    # Inject config into handler class
    WebhookHandler.repo_path = args.repo
    WebhookHandler.branch = args.branch
    WebhookHandler.secret = secret

    server = HTTPServer(("127.0.0.1", args.port), WebhookHandler)
    log.info("Listening on 127.0.0.1:%d", args.port)
    log.info("Repo: %s  Branch: %s  Secret: %s", args.repo, args.branch, "yes" if secret else "NO (unsigned)")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down")
        server.server_close()


if __name__ == "__main__":
    main()
