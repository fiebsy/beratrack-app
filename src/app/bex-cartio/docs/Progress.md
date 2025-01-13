# Progress Tracking

> **Context**: This tracks progress on implementing TVL and APR tracking for the new Balancer V2-based pools. This is a separate implementation from the original CrocSwap-based pools (`bex-tracker`), as BEX is transitioning to use Balancer V2 for improved functionality and flexibility.

## Current Status

### ✅ Completed
1. Network Configuration
   - RPC endpoint verified
   - Chain ID confirmed
   - Block height tracking

2. Contract Discovery
   - Vault contract identified
   - Pool types categorized
   - Token contracts mapped

3. Basic Functionality
   - Pool ID queries working
   - Total supply queries working
   - Vault address verification

4. Token Balance Queries
   - Direct ERC20 balanceOf() calls to token contracts work
   - Successfully queried WBERA and HONEY balances in vault
   - Token decimals confirmed (all 18)

### 🔄 In Progress
1. Token Balance Retrieval
   - ~~Standard methods not working~~ Using direct token contract queries instead
   - Need to implement for all pools
   - Need to track historical changes

2. Price Discovery
   - Looking for price oracles
   - Investigating pool ratios
   - Need stable price references

3. Reward Tracking
   - Reward vault integration unclear
   - Distribution mechanics unknown
   - Need to monitor events

### ❌ Blocked/Issues
1. Standard Balancer Methods (All Reverting)
   - getPoolTokens()
   - getReserves()
   - getBalance()
   - getNormalizedWeights()
   - getRate()

2. Event Monitoring
   - No Transfer events found
   - No PoolCreated events found
   - Limited historical data

3. Multicall Issues
   - Multicall3 reverts on batch queries
   - Need to make individual calls

## Next Steps

### Immediate Actions
1. Implement Balance Tracking
   ```typescript
   // Working balance query format
   const balanceOf = "0x70a08231" + address.padStart(64, "0");
   ```

2. Investigate Price Sources
   - Try Pyth price feeds
   - Check stable pool rates
   - Map price relationships

3. Document Reward Mechanics
   - Monitor reward vault transactions
   - Track distribution events
   - Calculate historical rates

### Open Questions
1. Token Balances
   - ~~Why are standard queries failing?~~ Using alternative method
   - How to efficiently query all pools?
   - How to track historical changes?

2. Price Data
   - What's the source of truth?
   - How are stable pools priced?
   - What about external references?

3. Reward System
   - How are rates determined?
   - What triggers distributions?
   - How to calculate APR?

## Recent Findings
1. Pool Implementation
   - Standard Balancer V2 query methods don't work
   - Direct token queries to vault work
   - All tokens use 18 decimals

2. Token Integration
   - All tokens use 18 decimals
   - Metadata available via API
   - Logo URIs standardized

3. Contract Behavior
   - Vault controls all tokens
   - Pools have unique IDs
   - Some methods customized 