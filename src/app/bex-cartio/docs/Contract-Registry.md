# BEX Contract Registry

## Core Protocol

### BEX Core
| Contract | Address | Description |
| --- | --- | --- |
| Vault | `0x9C8a5c82e797e074Fe3f121B326b140CEC4bcb33` | Main protocol vault - Holds all pool tokens and handles swaps |
| BalancerHelpers | `0xf3F2d2D5706543Dc17584835647A98C34cE54cc3` | Helper functions for querying pool data |
| BalancerQueries | `0x48B1A1A28F5600CAD50dB19c6fECBe9F2458cc8a` | Query interface for pool information |
| Authorizer | `0x010aD13DFa9eFf1241eeEa7bb620278b56E72ebe` | Access control |
| BatchRelayerLibrary | `0x8a8CdE433a5AF656dDAa5E54D1a3D073C172B422` | Batch transaction handling |
| BatchRelayerQueryLibrary | `0x8616628dab93Ac83b9328E31aB0a90aa817c4c95` | Batch query handling |
| BalancerRelayer | `0xb6f80CD1053316172e12F35F4235dC9cE998A3B8` | Transaction relayer |

### Pool Factories & Helpers
| Contract | Address | Description |
| --- | --- | --- |
| WeightedPoolFactory | `0x09836Ff4aa44C9b8ddD2f85683aC6846E139fFBf` | Creates weighted pools |
| ComposableStablePoolFactory | `0xfD772657FC8c4Ed3884AfF151b680883814052FA` | Creates stable pools |
| PoolCreationHelper | `0x00b4626883A3b4566A061372C93168fbE2020D8a` | Pool deployment helper |

### Fee Management
| Contract | Address | Description |
| --- | --- | --- |
| ProtocolFeesCollector | `0x91bBB98F6cf7F8DC6598653c2793B0bC78DfA18B` | Collects protocol fees |
| ProtocolFeePercentagesProvider | `0xC7c981ADcDC5d48fed0CD52807fb2bAB22676C8f` | Fee calculation |
| ProtocolFeesWithdrawer | `0xdB6E5B0F0465C87049768bD8cD2Cf03d1B6A1242` | Fee withdrawal |

## Active Pools

### Pool Structure
Each pool has three key components:
1. Pool Contract: Handles pool-specific logic and parameters
2. Pool ID: Unique identifier used by vault for token operations
3. Reward Vault: Manages rewards for liquidity providers

### Weighted Pools with Rewards
| Pool | Address | Pool ID | Reward Vault | Current TVL |
| --- | --- | --- | --- | --- |
| BERA-HONEY | `0x3ad1699779ef2c5a4600e649484402dfbd3c503c` | `0x3ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004` | `0x0cc03066a3a06F3AC68D3A0D36610F52f7C20877` | ~644K BERA, ~12.3M HONEY |
| BERA-WETH | `0x12b792cd01234134feb9b71ec105a90abb8f36e8` | `0x12b792cd01234134feb9b71ec105a90abb8f36e8000200000000000000000002` | `0x842c6cc319de7af0cd43f55009b5c1519cb06800` | ~129K BERA, ~2.1 WETH |
| BERA-WBTC | `0x4A782a6bA2e47367A4b2A1551815c27dc15F4795` | `0x4a782a6ba2e47367a4b2a1551815c27dc15f479500020000000000000000000e` | `0x67993Fc90A8EC45625447Ad2ff454cfD3fbE9d79` | ~362K BERA, ~0.000008 WBTC |
| BERA-USDC | `0x4f9d20770732f10df42921effa62eb843920a48a` | `0x4f9d20770732f10df42921effa62eb843920a48a00020000000000000000000a` | `0x7C5F8a0C7AD47ABc8A00d34fcEd2b4e0D67AcE85` | ~3.4M BERA, ~0.000016 USDC |
| USDC-WETH | `0x8d12622cb99d98285ed6e2b1a5433e48f9e70d05` | `0x8d12622cb99d98285ed6e2b1a5433e48f9e70d05000200000000000000000003` | `0xEDF2729A25EDA8116D240eb672F10d2E48D982d5` | ~0.0000003 USDC, ~4.4 WETH |

### Stable Pools
| Pool | Address | Pool ID | Reward Vault | Current TVL |
| --- | --- | --- | --- | --- |
| USDC-HONEY | `0xf7f214a9543c1153ef5df2edcd839074615f248c` | `0xf7f214a9543c1153ef5df2edcd839074615f248c000000000000000000000005` | `0x7d949a79259d55da7da18ef947468b6e0b34f5cf` | ~0.000025 USDC, ~25.2M HONEY |
| BEE-HONEY | `0xa694a92a1e23b8aaee6b81edf5302f7227e7f274` | `0xa694a92a1e23b8aaee6b81edf5302f7227e7f274000000000000000000000006` | `0xb930dCBfB60B5599836f7aB4B7053fB4D881940E` | ~2.6T BEE, ~14.9M HONEY |
| USDs-HONEY | `0x41acf96d0ca6a8f07d10fe9115add99b23eb9e4e` | `0x41acf96d0ca6a8f07d10fe9115add99b23eb9e4e00000000000000000000000b` | `0x79DC1bd33e5F6437e103ba321395C4d4629d580e` | ~0.000025 USDC, ~25.2M HONEY |
| BEE-HONEY-USDC | `0xd75ab18f4422282562fb27d79cb90c6ccfddac3b` | `0xd75ab18f4422282562fb27d79cb90c6ccfddac3b000000000000000000000007` | `0xb9a3fc508dE5Bc8D027b9c11ACb7a71ed3807205` | ~0.000025 USDC, ~25.2M HONEY |

## Protocol Governance

### Core Governance
| Contract | Address | Description |
| --- | --- | --- |
| Berachain Governance | `0x547e22c34A4D168B18af1f39dafe14ec0d969452` | Main governance contract |
| TimeLock | `0xFb1F4f4012e1C37a692BaB26B9aE4e054c32D039` | Governance timelock |
| BGT ERC20 | `0x289274787bAF083C15A45a174b7a8e44F0720660` | Governance token |

### Reward Management
| Contract | Address | Description |
| --- | --- | --- |
| BeraChef | `0x2C2F301f380dDc9c36c206DC3df8EA8688419cC1` | Reward allocations |
| BlockRewardController | `0x25A37b8E0a090Aa952F037B8534ace17AC3DbC60` | Block reward control |
| Distributor | `0x211bE45338B7C6d5721B5543Eb868547088Aca39` | Reward distribution |
| RewardVaultFactory | `0xE2257F3C674a7CBBFFCf7C01925D5bcB85ea0367` | Creates reward vaults |
| RewardVault | `0xBED0D947E914C499877162cA01E44ca3173CB74B` | Main reward vault |
| BGTStaker | `0x7B4fba14B2eae33Dd9E780E4bD406fC0429c96af` | Staking contract |
| FeeCollector | `0x7B7aae85E651285f754830506086120621A04031` | Fee collection |

## Core Tokens
| Token | Address | Decimals | Bridge Asset |
| --- | --- | --- | --- |
| WBERA | `0x6969696969696969696969696969696969696969` | 18 | N/A |
| HONEY | `0xd137593CDB341CcC78426c54Fb98435C60Da193c` | 18 | N/A |
| WETH | `0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3` | 18 | Sepolia (Native) |
| USDC | `0x015fd589F4f1A33ce4487E12714e1B15129c9329` | 18 | Sepolia: `0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590` |
| WBTC | `0xFa5bf670A92AfF186E5176aA55690E0277010040` | 18 | Arb Sepolia: `0x955E0DD3CC0E9864464de78A10545E711e7EBF87` |
| USDT | `0x164A2dE1bc5dc56F329909F7c97Bae929CaE557B` | 18 | `0xf3f2b4815a58152c9be53250275e8211163268ba` |

## Infrastructure

### Network Details
- Network: cArtio Testnet
- Chain ID: `0x13880` (80000)
- RPC URL: `https://snake-eth.berachain.com`
- Block Explorer: [Routescan](https://80000.testnet.routescan.io/)

### Oracle Services
| Service | Address | Description |
| --- | --- | --- |
| Pyth Price Feeds | `0x2880aB155794e7179c9eE2e38200202908C17B43` | Oracle service |
| Pyth Entropy | `0x36825bf3Fbdf5a29E2d5148bfe7Dcf7B5639e320` | RNG service |

### Cross-Chain Infrastructure
| Service | Address | Description |
| --- | --- | --- |
| LayerZero Endpoint | `0x6C7Ab2202C98C4227C5c46f1417D81144DA716Ff` | LZ Endpoint V2 |
| LayerZero Asset Bridge | `0xE1AD845D93853fff44990aE0DcecD8575293681e` | Wrapped Asset Bridge |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` | Batch calls |

### StakeStone Contracts
| Contract | Address | Description |
| --- | --- | --- |
| STONE | `0x1da4dF975FE40dde074cBF19783928Da7246c515` | StakeStone Ether |
| SBTC | `0x5d417e7798208E9285b5157498bBF23A23E421E7` | StakeStone Bitcoin |
| STONEBTC | `0x11d304AecFe0291eF1558bDd0F0869600C8Fb748` | StakeStone BTC Vault | 