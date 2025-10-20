## Solana MCP Integration for Cursor

This config enables Solana developer MCP tools inside Cursor for assisted coding and docs.

### 1) Add Global MCP Server (Cursor Settings)
- Open Cursor → Settings (Cmd+,) → MCP.
- Add Global MCP Server:
  - Name: `solana-mcp`
  - Command: `npx`
  - Args: `["mcp-remote", "https://mcp.solana.com/mcp"]`

### 2) Usage Guideline (paste into Cursor MCP guidelines)
```
<MCP_USE_GUIDELINE>
  <INSTRUCTION>
    If Solana-related, use tools: 'Ask Solana Expert' for concepts/APIs/errors,
    'Solana Doc Search' for queries, 'Ask Anchor Expert' for Anchor specifics.
  </INSTRUCTION>
  <TOOLS>Solana Expert, Doc Search, Anchor Expert</TOOLS>
</MCP_USE_GUIDELINE>
```

### 3) Quick Test
- Open `programs/vamano-program/programs/vamano-program/src/lib.rs` (or new program `lib.rs`).
- Press Cmd+I → Ask: "Anchor v0.28.0 CPI syntax?" → Expect tool response.

### 4) Anchored Queries to Try
- "How to CPI MPL-404 capture in v0.28.0?"
- "Metaplex Core createV1 accounts for royalties rule (v1.7.0)?"
- "SPL Token v4 transfer_checked from PDA escrow?"

### Notes
- Keep CLI and lang aligned (Anchor 0.28.0) per `Anchor.toml`.
- Prefer devnet for all flows; record tx signatures for demos.


