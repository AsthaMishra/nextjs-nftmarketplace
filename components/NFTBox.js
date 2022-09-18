import { useEffect, useState } from "react";
import { useChain, useMoralis } from "react-moralis";
import { useWeb3Contract } from "react-moralis";
import BasicNFTAbi from "../constants/BasicNFT.json";
import NFTMarketPlaceAbi from "../constants/NFTMarketPlace.json";
import Image from "next/image";
import { Card, Illustration, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListing from "./UpdateListing";

function TruncateString(string, truncLength) {
    if (string == "" || string === undefined) return string;

    if (truncLength === undefined) {
        return string;
    }

    if (string.length <= truncLength) {
        return string;
    }

    const middleString = "...";
    const stringLength = truncLength - middleString.length;
    const frontStringLength = Math.ceil(stringLength / 2);
    const endStringLength = Math.floor(stringLength / 2);
    const firstString = string.substring(0, frontStringLength);
    const endString = string.substring(
        string.length - endStringLength,
        string.length
    );
    const final = firstString + middleString + endString;

    return final;
}

export default function NFTBox({ attributes, NFTMarketPlaceAddress }) {
    //to show nft we need image
    // for image we need tokemURI which have image tag that contains our image
    // for that we have to call contract function
    const { chainId, account } = useChain();
    const { isWeb3Enabled } = useMoralis();
    const [imageUri, setImageUri] = useState("0");
    const [nftName, setNftname] = useState("0");
    const [nftDescription, setnftDescription] = useState("0");
    const [showModal, setShowModal] = useState(false);
    const [showSellPage, setShowSellPage] = useState(false);
    const dispatch = useNotification();

    const OwnedBy =
        account == attributes.sender || attributes.sender === undefined;
    const addressToShowOnNFT = OwnedBy
        ? "you"
        : TruncateString(attributes.sender || "", 7);

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: BasicNFTAbi,
        contractAddress: attributes.nftAddress,
        functionName: "tokenURI",
        params: { tokenId: parseInt(attributes.tokenId) },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: NFTMarketPlaceAbi,
        contractAddress: NFTMarketPlaceAddress,
        functionName: "BuyNft",
        msgValue: attributes.price,
        params: {
            nftAddress: attributes.nftAddress,
            tokenId: attributes.tokenId,
        },
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            UpdateUI();
        }
    }, [isWeb3Enabled]);

    async function UpdateUI() {
        await getTokenURI({
            onError: (e) => console.log(e),
            onSuccess: (s) => console.log(s),
        });

        const tokenURIData = await getTokenURI();
        if (tokenURIData) {
            const tokenURIResponse = tokenURIData
                .toString()
                .replace("ipfs://", "https://ipfs.io/ipfs/");

            const getTokenUriData = await (
                await fetch(tokenURIResponse)
            ).json();

            const tokemImageUri = getTokenUriData.image;
            setNftname(getTokenUriData.name);
            setnftDescription(getTokenUriData.description);

            const getTokenUriResponse = tokemImageUri
                .toString()
                .replace("ipfs://", "https://ipfs.io/ipfs/");

            setImageUri(getTokenUriResponse);
        }
    }

    function OnCardClick() {
        OwnedBy
            ? setShowModal(true)
            : buyItem({
                  onSuccess: OnSuccessBuyItem,
                  onError: OnErrorBuyItem,
              });
    }
    function HideModal() {
        setShowModal(false);
    }

    async function OnSuccessBuyItem(tx) {
        await tx.wait(1);
        handleNewNotification(
            "success",
            "Transaction SuccessFull",
            "Transaction Response"
        );
    }

    function OnErrorBuyItem(error) {
        handleNewNotification("error", error.message, "Transaction Response");
    }

    const handleNewNotification = (type, message, title) => {
        dispatch({
            type,
            message: message,
            title: title,
            position: "topR",
        });
    };

    return (
        <div>
            {imageUri ? (
                <div className=" flex space-x-4  space-y-4">
                    <UpdateListing
                        isVisible={showModal}
                        marketPlaceAddress={NFTMarketPlaceAddress}
                        nftAddress={attributes.nftAddress}
                        onClose={HideModal}
                        tokenId={attributes.tokenId}
                    />

                    <Card
                        description={nftDescription}
                        onClick={OnCardClick}
                        setIsSelected={function noRefCheck() {}}
                        title={nftName}
                    >
                        <div className="p-2">
                            <div className="flex flex-col items-end gap-2">
                                <div>#{attributes.tokenId}</div>
                                <div>OwnedBy: {addressToShowOnNFT}</div>
                                <div>
                                    <img
                                        src={imageUri}
                                        width={200}
                                        height={200}
                                    />
                                    {/* <Image
                                        loader={() => imageUri}
                                        src={imageUri}
                                        width={200}
                                        height={200}
                                    /> */}
                                </div>
                                <div>
                                    price :{" "}
                                    {ethers.utils.formatEther(attributes.price)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
}

//100000000000000
//100000000000000
