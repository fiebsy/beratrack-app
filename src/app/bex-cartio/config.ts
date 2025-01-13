import { Pool } from './types';

export const VAULT_ADDRESS = '0x9C8a5c82e797e074Fe3f121B326b140CEC4bcb33';
export const RPC_URL = 'https://snake-eth.berachain.com/';

export const POOLS: Pool[] = [
    {
        name: 'BERA-HONEY',
        address: '0x3ad1699779ef2c5a4600e649484402dfbd3c503c',
        poolId: '0x3ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004',
        rewardVault: '0x0cc03066a3a06F3AC68D3A0D36610F52f7C20877',
        tokens: [
            ['WBERA', '0x6969696969696969696969696969696969696969'],
            ['HONEY', '0xd137593CDB341CcC78426c54Fb98435C60Da193c']
        ]
    },
    {
        name: 'BERA-WETH',
        address: '0x12b792cd01234134feb9b71ec105a90abb8f36e8',
        poolId: '0x12b792cd01234134feb9b71ec105a90abb8f36e8000200000000000000000002',
        rewardVault: '0x842c6cc319de7af0cd43f55009b5c1519cb06800',
        tokens: [
            ['WBERA', '0x6969696969696969696969696969696969696969'],
            ['WETH', '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3']
        ]
    },
    {
        name: 'BERA-WBTC',
        address: '0x4A782a6bA2e47367A4b2A1551815c27dc15F4795',
        poolId: '0x4a782a6ba2e47367a4b2a1551815c27dc15f479500020000000000000000000e',
        rewardVault: '0x67993Fc90A8EC45625447Ad2ff454cfD3fbE9d79',
        tokens: [
            ['WBERA', '0x6969696969696969696969696969696969696969'],
            ['WBTC', '0xFa5bf670A92AfF186E5176aA55690E0277010040']
        ]
    },
    {
        name: 'BERA-USDC',
        address: '0x4f9d20770732f10df42921effa62eb843920a48a',
        poolId: '0x4f9d20770732f10df42921effa62eb843920a48a00020000000000000000000a',
        rewardVault: '0x7C5F8a0C7AD47ABc8A00d34fcEd2b4e0D67AcE85',
        tokens: [
            ['WBERA', '0x6969696969696969696969696969696969696969'],
            ['USDC', '0x015fd589F4f1A33ce4487E12714e1B15129c9329']
        ]
    },
    {
        name: 'USDC-WETH',
        address: '0x8d12622cb99d98285ed6e2b1a5433e48f9e70d05',
        poolId: '0x8d12622cb99d98285ed6e2b1a5433e48f9e70d05000200000000000000000003',
        rewardVault: '0xEDF2729A25EDA8116D240eb672F10d2E48D982d5',
        tokens: [
            ['USDC', '0x015fd589F4f1A33ce4487E12714e1B15129c9329'],
            ['WETH', '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3']
        ]
    },
    {
        name: 'USDC-HONEY',
        address: '0xf7f214a9543c1153ef5df2edcd839074615f248c',
        poolId: '0xf7f214a9543c1153ef5df2edcd839074615f248c000000000000000000000005',
        rewardVault: '0x7d949a79259d55da7da18ef947468b6e0b34f5cf',
        tokens: [
            ['USDC', '0x015fd589F4f1A33ce4487E12714e1B15129c9329'],
            ['HONEY', '0xd137593CDB341CcC78426c54Fb98435C60Da193c']
        ]
    },
    {
        name: 'BEE-HONEY',
        address: '0xa694a92a1e23b8aaee6b81edf5302f7227e7f274',
        poolId: '0xa694a92a1e23b8aaee6b81edf5302f7227e7f274000000000000000000000006',
        rewardVault: '0xb930dCBfB60B5599836f7aB4B7053fB4D881940E',
        tokens: [
            ['BEE', '0xa694a92a1e23b8aaee6b81edf5302f7227e7f274'],
            ['HONEY', '0xd137593CDB341CcC78426c54Fb98435C60Da193c']
        ]
    }
]; 