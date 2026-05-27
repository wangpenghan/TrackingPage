import json, os, re
from collections import Counter

def fix_path(p):
    m = re.match(r'^/([a-zA-Z])/(.*)', p)
    if m:
        return f"{m.group(1).upper()}:/{m.group(2)}"
    return p

with open("recent_transcripts.txt", "r") as f:
    files = [line.strip() for line in f if line.strip()]

bash_counter = Counter()
mcp_counter = Counter()

cd_pattern = re.compile(r"^(?:cd\s+\S+\s*(?:&&|\|\||;)\s*)*(.*)$")

for fp_raw in files:
    fp = fix_path(fp_raw)
    if not os.path.isfile(fp):
        continue
    try:
        with open(fp, "r", encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except:
                    continue
                if obj.get("type") not in ("assistant",):
                    continue
                msg = obj.get("message", {})
                if not isinstance(msg, dict):
                    continue
                content = msg.get("content", [])
                if not isinstance(content, list):
                    continue
                for block in content:
                    if not isinstance(block, dict):
                        continue
                    if block.get("type") != "tool_use":
                        continue
                    name = block.get("name", "")
                    inp = block.get("input", {})
                    if name == "Bash" and isinstance(inp, dict):
                        cmd = inp.get("command", "").strip()
                        if cmd:
                            m = cd_pattern.match(cmd)
                            if m:
                                cmd = m.group(1).strip()
                            bash_counter[cmd] += 1
                    elif name.startswith("mcp__") or name.startswith("mcp_"):
                        mcp_counter[name] += 1
    except Exception as e:
        pass

def get_cmd_pattern(cmd):
    cmd = cmd.strip()
    tokens = cmd.split()
    result = []
    for t in tokens:
        if "=" in t and not t.startswith("-"):
            continue
        result.append(t)
        if not t.startswith("-"):
            break
    if not result:
        return None
    full_cmd = result[0]
    if len(result) >= 2 and result[0] in ("git", "gh", "docker", "npm", "pnpm", "bun", "make", "just", "kubectl", "npx"):
        full_cmd = f"{result[0]} {result[1]}"
    return full_cmd

auto_allowed_cmds = {
    "cal", "uptime", "cat", "head", "tail", "wc", "stat", "strings", "hexdump", "od", "nl",
    "id", "uname", "free", "df", "du", "locale", "groups", "nproc", "basename", "dirname",
    "realpath", "cut", "paste", "tr", "column", "tac", "rev", "fold", "expand", "unexpand",
    "fmt", "comm", "cmp", "numfmt", "readlink", "diff", "true", "false", "sleep", "which",
    "type", "expr", "test", "getconf", "seq", "tsort", "pr", "echo", "printf", "ls", "cd", "find",
    "xargs", "file", "sed", "sort", "man", "help", "netstat", "ps", "base64", "grep", "egrep",
    "fgrep", "sha256sum", "sha1sum", "md5sum", "tree", "date", "hostname", "info", "lsof",
    "pgrep", "tput", "ss", "fd", "fdfind", "aki", "rg", "jq", "uniq", "history", "arch",
    "ifconfig", "pyright", "pwd", "whoami", "alias",
}

auto_allowed_subcmds = {
    ("git", "status"), ("git", "log"), ("git", "diff"), ("git", "show"), ("git", "blame"),
    ("git", "branch"), ("git", "tag"), ("git", "remote"), ("git", "ls-files"),
    ("git", "ls-remote"), ("git", "config"), ("git", "rev-parse"), ("git", "describe"),
    ("git", "stash"), ("git", "reflog"), ("git", "shortlog"), ("git", "cat-file"),
    ("git", "for-each-ref"), ("git", "worktree"), ("git", "config"),
    ("gh", "pr"), ("gh", "issue"), ("gh", "run"), ("gh", "workflow"), ("gh", "repo"),
    ("gh", "release"), ("gh", "auth"),
    ("docker", "ps"), ("docker", "images"), ("docker", "logs"), ("docker", "inspect"),
}

current_session_prefixes = (
    "find ~/.claude/projects/", "ls -t ~/.claude/projects/",
    "head -20 /tmp/", "head -c 2000", "cat /tmp/", 'cat "D:/',
    "wc -c recent_transcripts", 'head -5 "$HOME', 'head -1 "$HOME',
    "grep ", 'OUTPUT="$HOME', "which jq",
)

# Also skip: non read-only commands
non_readonly_first_tokens = {
    "pip", "npm", "pnpm", "bun", "yarn", "cd", "mkdir", "cp", "mv", "rm",
    "touch", "chmod", "chown", "git", "gh", "docker", "kubectl", "make",
    "npx", "sudo", "code", "vim", "nano", "ssh",
}

# Read-only subcommand patterns
readonly_subcmds = {
    "git": {"status", "log", "diff", "show", "branch", "ls-files", "config", "rev-parse",
            "describe", "reflog", "shortlog", "cat-file", "worktree", "tag", "remote",
            "for-each-ref", "stash", "blame"},
    "gh": {"pr", "issue", "run", "workflow", "repo", "release", "auth", "api", "search",
           "secret", "codespace", "gist"},
    "docker": {"ps", "images", "logs", "inspect", "network", "volume", "info", "version"},
    "npm": {"list", "view", "search", "pack", "doctor"},
    "pnpm": {"list", "view", "search"},
    "bun": {"run", "--version"},
    "kubectl": {"get", "describe", "logs", "top"},
}

def is_readonly(cmd, pat):
    """Determine if a command pattern is read-only."""
    first = cmd.split()[0] if cmd.split() else ""

    # Interpreters are never read-only in allowlist (too broad)
    if first in ("python", "python3", "node", "ruby", "perl", "php", "lua", "bash", "sh", "zsh"):
        return False

    tokens = pat.split()
    if len(tokens) >= 2:
        cmd0, cmd1 = tokens[0], tokens[1]
        if cmd0 in readonly_subcmds and cmd1 in readonly_subcmds[cmd0]:
            return True
        # For npm/pnpm/bun run, could be read-only if it's typecheck/lint
        if cmd0 in ("bun",) and cmd1 == "run":
            # We'll handle this specially
            return True

    # Tokens that are always read-only
    if first in ("curl", "which", "jq", "rg", "awk", "tsc", "claude", "gh"):
        return True

    return False

pattern_counts = Counter()
pattern_examples = {}

for cmd, cnt in bash_counter.most_common(500):
    skip = False
    for prefix in current_session_prefixes:
        if cmd.startswith(prefix):
            skip = True
            break
    if skip:
        continue

    first_token = cmd.split()[0] if cmd.split() else ""

    if first_token == "cd":
        parts = re.split(r"(?:&&|\|\||;)", cmd)
        final = parts[-1].strip()
        if final:
            cmd = final
            first_token = cmd.split()[0] if cmd.split() else ""

    pat = get_cmd_pattern(cmd)
    if pat is None:
        continue

    tokens = pat.split()
    if len(tokens) == 1 and tokens[0] in auto_allowed_cmds:
        continue
    if len(tokens) >= 2 and (tokens[0], tokens[1]) in auto_allowed_subcmds:
        continue
    if first_token in auto_allowed_cmds and len(tokens) == 1:
        continue

    if not is_readonly(cmd, pat):
        continue

    pattern_counts[pat] += cnt
    if pat not in pattern_examples:
        pattern_examples[pat] = cmd[:120]

print("=== READ-ONLY COMMAND PATTERNS ===")
for pat, cnt in pattern_counts.most_common(60):
    ex = pattern_examples[pat]
    print(f"{cnt:>6}  {pat}")

if mcp_counter:
    print("\n=== MCP TOOLS (read-only candidates) ===")
    for name, cnt in mcp_counter.most_common(30):
        print(f"{cnt:>6}  {name}")
