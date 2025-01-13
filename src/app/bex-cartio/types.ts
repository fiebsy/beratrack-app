export interface TokenBalance {
    symbol: string;
    rawBalance: string;
    decimalBalance: string;
    humanReadable: string;
    formattedBalance: string;
}

export interface PoolData {
    name: string;
    address: string;
    rewardVault: string;
    tokenBalances: TokenBalance[];
}

export interface Pool {
    name: string;
    address: string;
    poolId: string;
    rewardVault: string;
    tokens: [string, string][];
} 