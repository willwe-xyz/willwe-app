import React from 'react';
import logo from './logo.svg';
import './App.css';

// @ts-ignore
import { DM3 } from '@dm3-org/dm3-messenger-widget';

// .dm3-container {
//     border-radius: 25px;  /* Optional property */
//     overflow: hidden;  /* Optional property only if wanted set border radius */
//     height: 100vh; /* If the container has no height, then it is mandatory to set some height*/
//     width: 100vw; /* If the container has no width, then it is mandatory to set some width */
//  }

  export function DM3Widget() {
    const props: any = {
        defaultContact: 'help.dm3.eth',
        defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE,
        ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC,
        walletConnectProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID,
        hideFunction: "attachments", // OPTINAL PARAMETER : 'attachments,edit,delete' or undefined
        showContacts: true, // true for all contacts / false for default contact
        theme: undefined, // OPTINAL PARAMETER : undefined/themeColors
    };

    return (
        <div className="dm3-container">
              <DM3 {...props} />
        </div>
    );
}