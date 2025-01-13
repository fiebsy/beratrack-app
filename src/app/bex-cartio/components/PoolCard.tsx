import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PoolData } from "../types";
import { formatAddress, formatNumber, getPoolEmoji, TOKEN_EMOJIS } from "../utils";

export function PoolCard({ pool }: { pool: PoolData }) {
    return (
        <Card className="bg-N920/50 backdrop-blur-sm hover:bg-N920/80 transition-colors border-N800">
            <CardHeader className="pb-2">
                <div>
                    <CardTitle className="text-xl font-bold text-N0">
                        <span className="mr-2">{getPoolEmoji(pool.name)}</span>
                        {pool.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs mt-1 text-N400">
                        Pool: {formatAddress(pool.address)}
                    </CardDescription>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-N500">Vault</span>
                        <Badge 
                            variant="secondary" 
                            className="font-mono text-xs bg-N900 text-GNEON hover:bg-N800 border border-N700"
                        >
                            {formatAddress(pool.rewardVault)}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {pool.tokenBalances.map((balance, index) => (
                        <div key={index} className="p-3 rounded-lg bg-N900/50 border border-N800">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium text-N200">
                                        {TOKEN_EMOJIS[balance.symbol]}
                                    </span>
                                    <span className="text-sm font-semibold text-N20">
                                        {balance.symbol}
                                    </span>
                                </div>
                                <span className="font-mono text-sm text-N0 ml-auto">
                                    {formatNumber(balance.decimalBalance)}
                                </span>
                            </div>
                            <div className="text-xs font-mono text-N500 break-all">
                                {formatAddress(`0x${BigInt(balance.rawBalance).toString(16)}`)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function LoadingPoolCard() {
    return (
        <Card className="bg-N920/50 backdrop-blur-sm border-N800">
            <CardHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-N800" />
                        <Skeleton className="h-4 w-24 bg-N800" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-8 bg-N800" />
                        <Skeleton className="h-5 w-24 bg-N800" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-N800" />
                        <Skeleton className="h-3 w-full bg-N800" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full bg-N800" />
                        <Skeleton className="h-3 w-full bg-N800" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 