# BEX Cartio Documentation

## Overview
Documentation for the Balancer-based Cartio pools in BEX (Berachain Exchange). This directory contains detailed information about the protocol, its contracts, and implementation details.

> **Important Note**: This implementation (`bex-cartio`) is designed for the new Balancer V2-based pools that will be replacing the previous CrocSwap implementation. For the older CrocSwap-based implementation, see the `bex-tracker` directory.

### Version Differences
- **bex-tracker/**: Original implementation using CrocSwap
  - Uses CrocQuery contract
  - Concentrated liquidity pools
  - Fee tiers: 0.05%, 0.3%, 1%

- **bex-cartio/**: New implementation using Balancer V2
  - Uses Vault contract architecture
  - Weighted and stable pools
  - Integrated reward system
  - More flexible pool types

## Documentation Structure

### Core Information
- [Network.md](./Network.md) - Network details, RPC endpoints, and chain information
- [Contract-Registry.md](./Contract-Registry.md) - Comprehensive list of all deployed contracts and addresses
- [Contracts.md](./Contracts.md) - Core contract interfaces and verified methods
- [Pools.md](./Pools.md) - Active pools, their configurations, and pool types

### Implementation & Progress
- [Progress.md](./Progress.md) - Current progress, findings, and next steps
- [TVL-Tracking.md](./TVL-Tracking.md) - TVL calculation strategy and implementation status
- [APR-Tracking.md](./APR-Tracking.md) - APR calculation methods and reward tracking

### Technical Reference
- [API-Reference.md](./API-Reference.md) - API endpoints and response formats
- [Query-Reference.md](./Query-Reference.md) - RPC query structures and common interactions
- [Events-Reference.md](./Events-Reference.md) - Event signatures and monitoring strategies 