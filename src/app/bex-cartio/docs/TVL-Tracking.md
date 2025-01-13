# TVL Tracking

> **Implementation Note**: This TVL tracking implementation is specifically for Balancer V2-based pools, which use a different architecture from CrocSwap pools. The main differences are:
> - Uses a central Vault contract instead of individual pool contracts
> - Supports both weighted and stable pools
> - Includes integrated reward mechanisms
> - Different method signatures and calculation formulas

## Working Query Methods

### 1. Token Balance Queries
```solidity
// Direct token balance query to vault
function balanceOf(address account) external view returns (uint256)
// Function signature: 0x70a08231
// Example for WBERA balance in vault:
const data = "0x70a08231" + vaultAddress.slice(2).padStart(64, "0")
```

Example Response (BERA-HONEY Pool):
```typescript
// WBERA Balance in Vault
Raw: 0x00000000000000000000000000000000000000000003c8919c6bba5a10b450e5
Decimal: 17,392,008,155,437,772,873,957
Human: ~17,392 WBERA

// HONEY Balance in Vault
Raw: 0x000000000000000000000000000000000000000000429b300c745dc88e86cf20
Decimal: 19,137,208,971,181,641,037,584
Human: ~19,137 HONEY
```

### 2. Failed Methods (Do Not Use)
```solidity
// Standard Balancer V2 methods - All reverting
function getPoolTokens(bytes32) external view
function getReserves() external view
function getBalance() external view
function getNormalizedWeights() external view
function getRate() external view

// Multicall attempts - Also reverting
Multicall3.aggregate()
```

## Implementation Strategy

### 1. Token Balance Discovery
```typescript
interface TokenBalance {
    token: string;      // Token address
    balance: BigNumber; // Raw balance
    decimals: number;   // Token decimals (all 18)
    normalized: number; // Balance in human readable form
}

// Example calculation
const normalized = balance.div(10 ** decimals).toNumber();
```

### 2. Price Calculation
```typescript
interface TokenPrice {
    token: string;     // Token address
    price: BigNumber;  // USD price
    source: string;    // Price source (oracle/pool)
    timestamp: number; // Last update time
}

// TVL calculation
const tvl = tokens.reduce((acc, token) => {
    return acc + token.normalized * token.price;
}, 0);
```

## Next Implementation Steps

### 1. Balance Retrieval
- Implement direct token queries for all pools
- Set up balance monitoring system
- Track historical changes

### 2. Price Discovery
- Integrate Pyth price feeds
- Use stable pools as reference
- Calculate cross-pool relationships

### 3. TVL Updates
- Set update frequency
- Track historical values
- Implement health checks

## Error Handling

### 1. Balance Errors
- Handle failed queries
- Validate balance changes
- Set reasonable bounds

### 2. Price Errors
- Multiple price sources
- Staleness checks
- Circuit breakers

### 3. General Safety
- Decimal handling
- Overflow protection
- Sanity checks

## Monitoring Strategy

### 1. Health Metrics
- Query success rate
- Price freshness
- Balance changes

### 2. Alert Conditions
- Sudden TVL changes
- Failed queries
- Price anomalies 