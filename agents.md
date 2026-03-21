# AGENTS.md — Cloak

Cloak is an MCP (Model Context Protocol) vault server that lets AI agents take authorized actions on external services — GitHub, Stripe, Slack — without ever seeing the secrets they need. Credentials are stored AES-256-GCM encrypted, identity is verified via Self Protocol ZK, and agent reasoning runs through Venice AI's no-data-retention inference. The credential never leaves Cloak; only the result reaches the agent.

**Hackathon:** The Synthesis (March 2026)
**Repo:** https://github.com/TpgGirls/synthesishack
**Team:** tpg's Team — tpg, bb007, Claude Code Agent, Claude
**Live demo:** https://frontend-cyan-nine-88.vercel.app
**Tracks:** Venice AI · Self Protocol · Slice (ERC-8128) · Synthesis Open Track

---

## Repo Structure

```
/
├── src/                  # Core MCP server (TypeScript)
├── cloak-hosted/         # Hosted/cloud version
├── cloak-npm/            # npm-publishable package
├── frontend/             # React + Vite dashboard
├── package.json          # Root — MCP server deps
├── tsconfig.json
├── .gitignore
├── cloak-architecture.png
└── README.md
```

---

## Setup

```bash
# Clone and install
git clone https://github.com/TpgGirls/synthesishack
cd synthesishack
npm install

# Build the MCP server
npm run build

# Run in dev mode
npm run dev

# Start built server
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
# API: http://localhost:3001
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CLOAK_MASTER_SECRET` | Yes | Master passphrase for vault encryption (min 16 chars) |
| `CLOAK_VAULT_PATH` | No | Custom vault file path (default: `~/.cloak/vault.json`) |
| `SELF_STRICT_MODE` | No | Set `true` to require verified Self Agent ID for all executions |

---

## MCP Config (Claude Desktop / Cursor)

Add to your MCP config at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cloak": {
      "command": "node",
      "args": ["/path/to/synthesishack/dist/index.js"],
      "env": {
        "CLOAK_MASTER_SECRET": "your-secret-passphrase-min-16-chars"
      }
    }
  }
}
```

---

## MCP Tools

| Tool | Caller | What it does |
|---|---|---|
| `store_credential` | Human only | Encrypts and vaults an API key for a named service |
| `list_services` | Agent | Lists service names — no keys exposed |
| `execute_with_credential` | Agent | Runs an action against a service; returns result only |
| `remove_credential` | Human only | Deletes a stored credential |

**Rule:** The agent must never receive a raw credential value — only action results. Enforce this at the MCP tool layer, not just in docs.

---

## Supported Services (v1)

- **GitHub** — get user, list repos, create issues
- **Slack** — list channels, post messages
- **Stripe** — get balance, list customers

---

## Tech Stack

| Layer | Technology |
|---|---|
| MCP server | `@modelcontextprotocol/sdk`, TypeScript (ESM) |
| Encryption | AES-256-GCM, scrypt key derivation, Node.js crypto |
| Agent identity | Self Protocol ZK Agent ID |
| Private inference | Venice AI (no-data-retention API) |
| Web auth | Slice ERC-8128 |
| Dashboard | React 18, Vite, Tailwind CSS |
| API server | Express, TypeScript |

---

## Code Style

- TypeScript strict mode
- ESM modules (`"type": "module"` in package.json)
- All credential handling must go through the vault module — never inline secrets
- No credential values in logs, ever
- Keep MCP tool definitions in `src/` — one file per service integration

---

## Security Rules

- The agent must **never** receive a raw credential value — only action results
- `store_credential` and `remove_credential` are human-only — gate at the MCP layer
- AES-256-GCM encryption at rest is non-negotiable — no plaintext in the vault file
- Self Protocol ZK verification must pass before `execute_with_credential` proceeds when `SELF_STRICT_MODE=true`
- All vault access events should be logged (append-only)

---

## Partner Integration Notes

### Venice AI
Route agent reasoning through Venice's OpenAI-compatible API with no-data-retention mode. This ensures the agent's thought process over sensitive data never persists anywhere — Cloak handles the credential side, Venice handles the cognition side.

### Self Protocol
`execute_with_credential` accepts an optional `self_agent_id` parameter. When present, verify the agent's ZK identity before executing. In `SELF_STRICT_MODE=true`, reject unverified agents entirely.

### Slice ERC-8128
ERC-8128 is the auth primitive for both human dashboard access (wallet signing, SIWE-style) and agent API access (signature challenge). Replaces static API tokens for accessing Cloak itself — making the entire stack secret-less end to end.

---

## PR Instructions

- Title format: `[cloak] <what you did>`
- Run `npm run build` before pushing — ensure it compiles clean
- No secrets in any commit — use `.env` and confirm `.gitignore` covers it
- Document any new MCP tool or supported service in this file

---

## Agents Working on This Project

| Agent | Model | Harness | Human Partner |
|---|---|---|---|
| tpg | claude-sonnet-4-6 | openclaw | Gnana Lakshmi (@gyanlakshmi) |
| bb007 | — | — | Bhavya |
| Claude | claude-sonnet-4-6 | claude.ai | Nivedita Vivek (@viveknivedita) |
