
import { Stack, Box, Button, HStack, Image, Icon } from "@chakra-ui/react";
import { cols } from "../const/colors"
import { SocialData } from "../lib/chainData";
import { userAgent } from "next/server";
import { RiLogoutCircleRFill } from "react-icons/ri";


interface FD {
    userAddress: string;
    SC: SocialData;
}



export const UserAvatar: React.FC<FD> = (FD) =>  {
   

    if (FD.SC) {
      return <p>
        <HStack>
            <Button>
                <Image 
                src={FD.SC.profileImage}
                alt={FD.SC.profileDisplayName}
                width={30}
                height={30}
                border={1}
                borderRadius={100}
                                />
                logout
            </Button>
        <Box >
        Data: {JSON.stringify(FD.SC)}
        </Box>        
        </HStack> 
        </p>;
    } else {
        return <div className="logOutDiv">
    <p className="user-address text-sm text-gray-500 ease-in-out duration-300 hover:text-gray-700">{FD.userAddress}     <Icon as={RiLogoutCircleRFill} boxSize={6} color={'red'} />
    </p>
</div>
    }
 
};
