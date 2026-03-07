# CyberQuest: Security Audit Report
**Date:** March 7, 2026  
**Version audited:** 1.2  
**Auditor:** GitHub Copilot (static analysis)  
**Status:** ✅ All findings resolved
**Scope:** All client-side JS/HTML, all server-side scripts in `scripts/`

---

## Executive Summary

CyberQuest has a **small attack surface** by design. It is a fully client-side game with no back-end, no user accounts, no external dependencies, and no network calls from the game itself. The overwhelming majority of potential web vulnerabilities simply do not apply.

**Overall risk: LOW**

No critical vulnerabilities were found. Four low-severity findings and two medium-severity findings in the optional server-side webhook scripts are documented below.

---

## Scope & Methodology

| Component | Files audited |
|-----------|--------------|
| Game engine | `engine/game.js`, `engine/voice.js`, `engine/player.js`, `engine/evidence-viewer.js`, `engine/chat-interface.js`, `engine/puzzles/password-puzzle.js` |
| Scene scripts | All `scenes/*/scene.js` + mancave sub-modules (41 files) |
| HTML entry point | `index.html` |
| Server scripts | `scripts/webhook-pull.py`, `scripts/apache-webhook.conf`, `scripts/setup-webhook.sh` |

Checks performed: eval/code injection, XSS via innerHTML, URL/hash injection, network exfiltration, save-data deserialisation, dependency security, information disclosure, server-side webhook security.

---

## Findings

### F-01 — No Content Security Policy (CSP) ✅ Fixed
**Severity:** 🟡 Low (resolved)  
**Location:** `index.html` line 4

**Fix applied:** Added CSP `<meta>` tag:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors 'none';">
```
This also resolves F-04 (`frame-ancestors 'none'` blocks framing).

---

### F-02 — Inventory / Quest Data Rendered as Raw HTML ✅ Fixed
**Severity:** 🟡 Low (resolved)  
**Location:** `engine/game.js`

**Fix applied:** Added `_esc(str)` helper method to `CyberQuestEngine`. All item/quest fields (`item.icon`, `item.name`, `item.description`, `quest.name`, `quest.description`, `quest.hint`) now pass through `_esc()` before insertion into `innerHTML` templates.

---

### F-03 — `message.from` Not Sanitized in Chat Interface ✅ Fixed
**Severity:** 🟡 Low (resolved)  
**Location:** `engine/chat-interface.js`

**Fix applied:** `message.from` now passes through `this._sanitizeHTML()` before insertion, consistent with how `message.text` is handled.

---

### F-04 — No `X-Frame-Options` / Clickjacking Protection ✅ Fixed
**Severity:** 🟡 Low (resolved)  
**Location:** `index.html`, `scripts/apache-webhook.conf`

**Fix applied (two layers):**
- CSP `frame-ancestors 'none'` added to `index.html` (see F-01)
- Security headers block added to `scripts/apache-webhook.conf`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

### F-05 — Webhook: No Secret Enforcement ✅ Fixed
**Severity:** 🟠 Medium (resolved)  
**Location:** `scripts/webhook-pull.py`

**Fix applied (two parts):**
- `main()` now calls `sys.exit(1)` if `WEBHOOK_SECRET` is not set — the service will not start without a secret
- `do_POST()` signature check is now unconditional (the `if self.secret:` guard removed) — every request must carry a valid signature

---

### F-06 — Webhook: No Rate Limiting ✅ Fixed
**Severity:** 🟠 Medium (resolved)  
**Location:** `scripts/webhook-pull.py`

**Fix applied:** Added a 30-second cooldown using a module-level `_last_pull_time` timestamp. Requests arriving within 30 seconds of the last successful pull receive a `429 Too Many Requests` response with a `retry_after` field.

---

## Confirmed Non-Issues

The following were explicitly checked and found **safe**:

| Check | Result |
|-------|--------|
| `eval()` / `new Function()` calls | ✅ None found |
| External network calls from game | ✅ None (`fetch()` is local SVG assets only) |
| URL hash injection | ✅ Safe — hash validated against `this.scenes[hash]` whitelist before `loadScene()` |
| `document.write()` | ✅ None found |
| `window.location.href =` / redirect injection | ✅ None found |
| Third-party scripts (CDN, analytics) | ✅ None — all scripts are local |
| Hardcoded credentials or API keys | ✅ None found |
| Prototype pollution via JSON.parse | ✅ Low risk — inventory/quest data merged into known defaults with type-guards |
| JSON.parse error handling | ✅ Entire `loadGame()` is wrapped in `try/catch` |
| Password puzzle — user answer to innerHTML | ✅ Answer is only compared (`===`), never rendered |
| Chat interface — user message to innerHTML | ✅ User-typed messages go through `_sanitizeHTML()` before display |
| `git pull` command injection | ✅ Safe — branch and repo path come from server config, not HTTP request |
| Webhook — HMAC constant-time comparison | ✅ Uses `hmac.compare_digest()` (no timing attack) |
| Information disclosure via webhook | ✅ Error responses return no file paths, stack traces, or config values |

---

## Risk Summary

| ID | Description | Severity | Effort to fix |
|----|-------------|----------|--------------|
| F-01 | No Content Security Policy | 🟡 Low | ✅ Fixed — CSP meta tag added to `index.html` |
| F-02 | Item/quest data not HTML-escaped in innerHTML | 🟡 Low | ✅ Fixed — `_esc()` helper added to engine |
| F-03 | `message.from` not sanitized in chat | 🟡 Low | ✅ Fixed — `_sanitizeHTML()` applied |
| F-04 | No X-Frame-Options / clickjacking header | 🟡 Low | ✅ Fixed — CSP `frame-ancestors` + Apache headers |
| F-05 | Webhook secret is optional, not required | 🟠 Medium | ✅ Fixed — server refuses to start without secret |
| F-06 | Webhook has no rate limiting | 🟠 Medium | ✅ Fixed — 30s cooldown, returns 429 |

---

## Threat Model

Because of the game's architecture, the threat model is narrow:

- **No server-side game logic** — there is nothing to attack on the server beyond the webhook
- **No user accounts** — no credential theft, no session hijacking, no privilege escalation
- **No external data input** — all game content is hardcoded; no player-controlled content flows into the DOM from untrusted sources
- **Offline-capable** — the game runs fully without network access; no CDN supply chain risk
- **localStorage only** — save data is local; the only party who can tamper with it is the player themselves (self-XSS only)

The realistic threat actors for this project are:

1. **A player who edits their own localStorage** — can corrupt their own save (self-harm only)
2. **An unauthenticated actor with network access to the webhook port** — can trigger git pull if F-05 is not fixed
3. **A site that frames the game** — cosmetic/reputational issue only if F-04 is not fixed

---

*Audit performed via static analysis of source code. No dynamic testing (fuzzing, browser automation) was performed.*
