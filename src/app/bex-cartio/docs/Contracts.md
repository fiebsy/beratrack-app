# Core Contracts

## Vault Contract
- Address: `0x9c8a5c82e797e074fe3f121b326b140cec4bcb33`
- Implementation: Balancer V2 protocol structure
- Role: Manages all pool tokens and operations

## Pool Types

### 1. Weighted Pools (0002)
- Used for token pairs with different weights
- Example: WBERA-WETH (80/20)
- Features: Configurable token weights

### 2. Weighted Pools with Rewards (0004)
- Similar to weighted pools but with reward distribution
- Example: WBERA-HONEY (50/50) with 30% reward allocation
- Features: Reward vault integration

### 3. Stable Pools (0005, 0006, 0007, 000b)
- Used for stable asset pairs and groups
- Examples: USDC-HONEY, USDT-HONEY-USDC
- Features: Low slippage for similar-valued assets

## Token Contracts
### Core Protocol Tokens
- WBERA: `0x5806E416dA447b267cEA759358cF22Cc41FAE80F`
- HONEY: `0x7EeCA4205fF31f947EdBd49195a7A88E6A91161B`

### Additional Tokens
- KAMI (Origami KAMI): `0x8be575D56756e4307fE6172802E68194187b280c`
- RND (RandomToken): `0xA62269c8AB2E9dCb855cb7B7bD8619f0f82B32b8`
- BGT (Bera Governance Token): `0x289274787bAF083C15A45a174b7a8e44F0720660`

## Verified Methods
### Pool Contract Methods
```solidity
// Basic Info
function getPoolId() external view returns (bytes32)
function getVault() external view returns (address)
function totalSupply() external view returns (uint256)

// Pool Specifics
function getNormalizedWeights() external view returns (uint256[] memory)
function getRate() external view returns (uint256)
function getAmplificationParameter() external view
```

### Vault Contract Methods
```solidity
function getPoolTokens(bytes32 poolId) external view returns (
    address[] memory tokens,
    uint256[] memory balances,
    uint256[] memory lastChangeBlock
)
```

## Contract Relationships
1. Vault → Pools
   - Vault manages all pool tokens
   - Pools must be registered with Vault
   - All token operations go through Vault

2. Pools → Reward Vaults
   - Some pools have associated reward vaults
   - Reward vaults distribute incentive tokens
   - Reward rates set per pool 