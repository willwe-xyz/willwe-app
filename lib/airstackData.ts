

// import { useQuery } from "@airstack/airstack-react";
// import { SocialData, QueryResponse } from "./chainData";



// export async function getFarcasterProfileData(userAddress: string) : Promise<QueryResponse> {

//     let query = `query GetFarcasterProfileByAddressAndChainId {
//         Socials(
//           input: {filter: {userAssociatedAddresses: {_eq: "${userAddress}"}}, blockchain: base}
//         ) {
//           Social {
//             id
//             profileName
//             profileImage
//             profileUrl
//             dappName
//             userAddress
//             twitterUserName
//             profileTokenUri
//             profileTokenId
//             profileTokenAddress
//             profileMetadata
//             identity
//             isDefault
//             isFarcasterPowerUser
//             metadataURI
//             location
//             profileBio
//             profileHandle
//             profileDisplayName
//           }
//         }
//       }`;
    
//     const data: QueryResponse = useQuery(query);

//     return data;


//   }