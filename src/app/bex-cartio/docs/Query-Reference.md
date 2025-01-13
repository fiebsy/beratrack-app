# Query Reference

## Pool Balance Queries

### 1. Query Pool Tokens via Vault
The main way to query pool balances is through the Vault contract using `getPoolTokens()`. The function has the signature `getPoolTokens(bytes32)` which returns three arrays: token addresses, balances, and the last change block.

```json
{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{
        "to": "0x9C8a5c82e797e074Fe3f121B326b140CEC4bcb33", // Vault address
        "data": "0xf94d4668$POOL_ID" // Function selector (f94d4668) + pool ID as bytes32
    }, "latest"],
    "id": 1
}
```

Important notes:
- The function selector is `0xf94d4668` (generated from `getPoolTokens(bytes32)`)
- The pool ID should be appended directly after the function selector
- No padding or additional encoding is needed for the pool ID
- Example pool ID: `3ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004`

Example curl command:
```bash
curl -X POST -H "Content-Type: application/json" --data '{
    "jsonrpc":"2.0",
    "method":"eth_call",
    "params":[{
        "to":"0x9C8a5c82e797e074Fe3f121B326b140CEC4bcb33",
        "data":"0xf94d46683ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004"
    },"latest"],
    "id":1
}' https://snake-eth.berachain.com/
```

Response format:
```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000410490000000000000000000000000000000000000000000000000000000000000002000000000000000000000000696969696969696969696969696969696969696900000000000000000000000d137593cdb341ccc78426c54fb98435c60da193c0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000008856e080f26025aca6560000000000000000000000000000000000000000000a3471c3cd18b36efba8b4"
}
```

### 2. Decoding Pool Balances
The response contains three arrays encoded in the following format:
1. First array (token addresses) offset: First 32 bytes point to offset `0x60`
2. Second array (balances) offset: Next 32 bytes point to offset `0xc0`
3. Last change block: Next 32 bytes contain the block number
4. First array data: Contains length followed by addresses
5. Second array data: Contains length followed by balances

Example TypeScript decoding using ethers.js:
```typescript
const poolInterface = new ethers.Interface([
    'function getPoolTokens(bytes32) view returns (address[], uint256[], uint256)'
]);

// Encode the function call
const data = poolInterface.encodeFunctionData('getPoolTokens', [poolId]);

// Make the call
const result = await provider.call({
    to: VAULT_ADDRESS,
    data
});

// Decode the result
const [tokens, balances, lastChangeBlock] = poolInterface.decodeFunctionResult(
    'getPoolTokens',
    result
);

// Format a balance for display
const decimals = 18;
const rawBigInt = BigInt(balance);
const rawDecimalStr = rawBigInt.toString();
const wholePart = rawDecimalStr.slice(0, -decimals) || '0';
const fractionalPart = rawDecimalStr.slice(-decimals).padStart(decimals, '0');
const humanReadable = `${wholePart}.${fractionalPart}`;
```

## Pool Structure

### 1. Pool ID Format
Pool IDs are 32 bytes composed of:
- First 20 bytes: Pool address
- Last 12 bytes: Pool type identifier
  - `0x000200...`: Weighted pool with rewards
  - `0x000000...`: Stable pool

Example:
- Pool address: `0x3ad1699779ef2c5a4600e649484402dfbd3c503c`
- Type identifier: `000200000000000000000004`
- Full pool ID: `0x3ad1699779ef2c5a4600e649484402dfbd3c503c000200000000000000000004`

## Best Practices

1. Always use the correct function selector (`0xf94d4668`)
2. Don't add any padding or additional encoding to the pool ID
3. Handle decimals appropriately when displaying balances (most tokens use 18 decimals)
4. Consider caching results to reduce RPC calls
5. Use ethers.js or similar library for proper encoding/decoding in applications
6. Always verify token addresses match expected values before using balances 