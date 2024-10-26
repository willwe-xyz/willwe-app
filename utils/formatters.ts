import { getAddress, hexlify } from "ethers";


export const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  export const calculateDailyGrowth = (inflation: string): string => {
    const inflationRate = parseFloat(inflation);
    const dailyGrowth = inflationRate * 86400; // seconds in a day
    return formatBalance(dailyGrowth.toString());
  };



// Function to convert an address to a uint160 string with error handling
export const addressToNodeId = (address: string): string => {
    try {
        // Validate and normalize the address to checksum format
        const checksummedAddress = getAddress(address);

        // Convert the checksummed address to a Uint8Array for byte manipulation
        const addressBytes = Uint8Array.from(Buffer.from(checksummedAddress.slice(2), "hex"));

        // Parse the address bytes into a BigInt (uint160) and convert it to a decimal string
        const uint160Value = BigInt(hexlify(addressBytes));

        return uint160Value.toString();

    } catch (error) {
        throw new Error("Invalid address provided.");
    }
}

// Example usage
try {
    const rootToken = "0xInvalidAddress";
    console.log(addressToNodeId(rootToken));
} catch (error) {
    console.error(error.message);  // Will output "Invalid address provided." if the address is invalid
}
