'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoolCard, LoadingPoolCard } from './components/PoolCard';
import { PoolData } from './types';
import { POOLS, VAULT_ADDRESS, RPC_URL } from './config';
import { formatNumber } from './utils';

export default function BexCartioPage() {
    const [poolsData, setPoolsData] = useState<PoolData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function queryVault() {
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const poolsData: PoolData[] = [];

            for (const pool of POOLS) {
                const tokenBalances = [];

                for (const [symbol, address] of pool.tokens) {
                    const poolInterface = new ethers.Interface([
                        'function getPoolTokens(bytes32) view returns (address[], uint256[], uint256)'
                    ]);
                    
                    const data = poolInterface.encodeFunctionData('getPoolTokens', [pool.poolId]);
                    try {
                        const result = await provider.call({
                            to: VAULT_ADDRESS,
                            data
                        });
                        
                        const [tokens, balances] = poolInterface.decodeFunctionResult('getPoolTokens', result);
                        const tokenIndex = tokens.findIndex((t: string) => t.toLowerCase() === address.toLowerCase());
                        const balance = balances[tokenIndex];
                        
                        const rawBigInt = BigInt(balance);
                        const rawDecimalStr = rawBigInt.toString();
                        
                        const decimalPlaces = 18;
                        const wholePart = rawDecimalStr.slice(0, -decimalPlaces) || '0';
                        const fractionalPart = rawDecimalStr.slice(-decimalPlaces).padStart(decimalPlaces, '0');
                        const humanReadable = `${wholePart}.${fractionalPart}`;
                        
                        tokenBalances.push({
                            symbol,
                            rawBalance: `0x${balance.toString(16)}`,
                            decimalBalance: rawDecimalStr,
                            humanReadable: `${humanReadable} ${symbol}`,
                            formattedBalance: formatNumber(rawDecimalStr)
                        });
                    } catch (error) {
                        console.error(`Error querying ${symbol} balance for pool ${pool.name}:`, error);
                        tokenBalances.push({
                            symbol,
                            rawBalance: 'Error',
                            decimalBalance: 'Error',
                            humanReadable: 'Failed to query balance',
                            formattedBalance: 'Error'
                        });
                    }
                }

                poolsData.push({
                    name: pool.name,
                    address: pool.address,
                    rewardVault: pool.rewardVault,
                    tokenBalances
                });
            }

            setPoolsData(poolsData);
            setIsLoading(false);
        }

        queryVault().catch(error => {
            console.error('Failed to query vault:', error);
            setError('Failed to load pool data. Please try again later.');
            setIsLoading(false);
        });
    }, []);

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="bg-N920/50 border-RNEON/50">
                    <CardHeader>
                        <CardTitle className="text-RNEON">Error</CardTitle>
                        <CardDescription className="text-N400">{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-N0">BEX Cartio Pools</h1>
                    <p className="text-N400 mt-2">
                        Real-time pool information from the Balancer V2-based implementation
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        Array(8).fill(0).map((_, i) => (
                            <LoadingPoolCard key={i} />
                        ))
                    ) : (
                        poolsData.map((pool, index) => (
                            <PoolCard key={index} pool={pool} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 