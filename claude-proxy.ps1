param([string]$prompt)
$env:ANTHROPIC_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding"
$env:ANTHROPIC_API_KEY = "f0ab24c1-5e48-4c0a-917b-8019e44ec9c2"

if ($prompt) {
    echo $prompt | claude --print
} else {
    claude
}
