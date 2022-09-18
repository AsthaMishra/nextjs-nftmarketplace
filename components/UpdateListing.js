import { ethers } from "ethers";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import { Input, Modal, useNotification } from "web3uikit";
import marketPlaceAbi from "../constants/NFTMarketPlace.json";

export default function UpdateListing({
    isVisible,
    nftAddress,
    tokenId,
    marketPlaceAddress,
    onClose,
}) {
    const [updatedPriceOfListing, setUpdatedPriceOfListing] = useState("0");
    const dispatch = useNotification();

    const { runContractFunction: updateListingPrice } = useWeb3Contract({
        abi: marketPlaceAbi,
        contractAddress: marketPlaceAddress,
        functionName: "UpdateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: ethers.utils.parseEther(updatedPriceOfListing || "0"),
        },
    });

    async function HandleOnSuccess(tx) {
        await tx.wait(1);
        handleNewNotification(
            "success",
            "New Price Updated",
            "Transaction Response"
        );
    }

    async function HandleOnError(error) {
        console.log(error);
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
            <Modal
                title="Listing price in ETH "
                cancelText="Cancel"
                id="regular"
                isVisible={isVisible}
                okText="Ok"
                onCancel={onClose}
                onCloseButtonPressed={onClose}
                onOk={(async) => {
                    updateListingPrice({
                        onError: HandleOnError,
                        onSuccess: HandleOnSuccess,
                    });
                }}
            >
                <div className="pb-6">
                    <Input
                        label="Update Listing Price"
                        type="number"
                        onChange={(event) => {
                            setUpdatedPriceOfListing(event.target.value);
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
}

////BasicNFT:0x04a6d2101dC5C3Ca82BAc677c3B811C0fa78175f
