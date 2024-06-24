export function addressToNumericString(address: string): string {
    // Ensure the address is in the correct format
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
        throw new Error('Invalid Ethereum address');
    }

    // Convert the address to a big integer
    const numericValue = BigInt(address);
    
    // Return the numeric value as a string
    return numericValue.toString();
}