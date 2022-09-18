import { useChain, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import { gql, useQuery } from "@apollo/client";
import contractAddress from "../constants/contractAddress.json";
import { useEffect, useState } from "react";

export default function Home() {
    const ACTIVE_ITEMS = gql`
        {
            activeItems(
                first: 5
                where: { buyer: "0x0000000000000000000000000000000000000000" }
            ) {
                id
                buyer
                sender
                nftAddress
                tokenId
                price
            }
        }
    `;

    const { isWeb3Enabled } = useMoralis();
    const { chainId: chainHexId, account } = useChain();
    const { loading, error, data: listedNfts } = useQuery(ACTIVE_ITEMS);
    const chainId = chainHexId ? parseInt(chainHexId) : "31337";
    const nftmarketPlaceAddress = contractAddress[chainId]["NFTMarketPlace"];

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap">
                {isWeb3Enabled ? (
                    loading || !listedNfts ? (
                        <div>Loading ...</div>
                    ) : (
                        listedNfts.activeItems.map((nft) => {
                            const key = nft.nftAddress + "_" + nft.tokenId;
                            return (
                                <NFTBox
                                    attributes={nft}
                                    NFTMarketPlaceAddress={
                                        nftmarketPlaceAddress
                                    }
                                    key={key}
                                />
                            );
                        })
                    )
                ) : (
                    <div>Not connected ...</div>
                )}
            </div>
        </div>
    );
}
