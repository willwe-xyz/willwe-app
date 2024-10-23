// import { 
//     ethers,
//     ContractTransactionResponse,
//     TransactionReceipt,
//     TransactionResponse,
//     Contract,
//     EventLog,
//     Log
//   } from 'ethers';
  
//   interface TransactionOptions {
//     confirmations?: number;
//     timeout?: number;
//   }
  
//   export const waitForTransaction = async (
//     tx: ContractTransactionResponse,
//     options: TransactionOptions = {}
//   ): Promise<TransactionReceipt> => {
//     const { confirmations = 1, timeout = 60000 } = options;
  
//     try {
//       const receipt = await tx.wait(confirmations);
//       if (!receipt) {
//         throw new Error('No transaction receipt received');
//       }
//       return receipt;
//     } catch (error: any) {
//       if (error.code === 'TIMEOUT') {
//         throw new Error('Transaction confirmation timed out');
//       }
//       throw error;
//     }
//   };
  
//   export const extractEventFromReceipt = (
//     receipt: TransactionReceipt,
//     eventName: string
//   ): Record<string, any> | null => {
//     // In ethers v6, logs need to be explicitly typed as EventLog
//     const logs = receipt.logs as Array<EventLog | Log>;
//     const event = logs.find((log) => {
//       return 'eventName' in log && log.eventName === eventName;
//     }) as EventLog | undefined;
    
//     if (!event || !event.args) return null;
  
//     // Convert event args to a regular object
//     return Object.fromEntries(
//       Object.entries(event.args).filter(([key]) => isNaN(Number(key)))
//     );
//   };
  
//   export const handleTransactionError = (error: any): string => {
//     // Updated error codes for ethers v6
//     if (error.code === 'TRANSACTION_REPLACED') {
//       return 'Transaction was replaced by another transaction';
//     }
    
//     if (error.code === 'INSUFFICIENT_FUNDS') {
//       return 'Insufficient funds to complete transaction';
//     }
  
//     if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
//       return 'Transaction would fail. Please check your inputs.';
//     }
  
//     // User rejection error in ethers v6
//     if (error.code === 'ACTION_REJECTED' || error.code === 'USER_REJECTED') {
//       return 'Transaction was rejected by user';
//     }
  
//     return error.message || 'Transaction failed';
//   };
  
//   export const monitorTransaction = async (
//     tx: ContractTransactionResponse,
//     callbacks: {
//       onSubmitted?: () => void;
//       onConfirmed?: (receipt: TransactionReceipt) => void;
//       onError?: (error: any) => void;
//     }
//   ) => {
//     try {
//       callbacks.onSubmitted?.();
//       const receipt = await tx.wait();
//       if (receipt) {
//         callbacks.onConfirmed?.(receipt);
//         return receipt;
//       }
//       throw new Error('No receipt received');
//     } catch (error) {
//       const errorMessage = handleTransactionError(error);
//       callbacks.onError?.(errorMessage);
//       throw error;
//     }
//   };