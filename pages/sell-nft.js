import { Button, Form, Input, useNotification } from "web3uikit";
import basicNftAbi from "../constants/BasicNFT.json";
import nftMarketPlaceAbi from "../constants/NFTMarketPlace.json";
import contractAddress from "../constants/contractAddress.json";
import { useChain, useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

export default function Home() {
    const dispatch = useNotification();
    const { chainId: chainHexId, account } = useChain();
    const { isWeb3Enabled } = useMoralis();
    const chainId = chainHexId ? parseInt(chainHexId) : "31337";
    const nftmarketPlaceAddress = contractAddress[chainId]["NFTMarketPlace"];

    const [WithdrawAmount, SetWithdrawAmount] = useState(0);

    const { runContractFunction: approveNftMarketPlaceToSellToken } =
        useWeb3Contract();

    const { runContractFunction: listNFTToMarketPlace } = useWeb3Contract();

    const { runContractFunction: WithdrawSellerEarning } = useWeb3Contract();
    const { runContractFunction: GetSellerAmountToWithdraw } =
        useWeb3Contract();

    useEffect(() => {
        if (isWeb3Enabled) {
            GetAmountToBeWithdrawn();
        }
    }, [account, isWeb3Enabled, chainId]);

    async function GetAmountToBeWithdrawn() {
        const options = {
            abi: nftMarketPlaceAbi,
            contractAddress: nftmarketPlaceAddress,
            functionName: "getTotalAmountEarnedFromNFT",
            msgValue: "",
            params: { seller: account },
        };
        const amountTobeWithdrawn = await GetSellerAmountToWithdraw({
            params: options,
            onError: (e) => {
                console.log(`GetAmountToBeWithdrawn error ${e}`);
            },
        });
        if (amountTobeWithdrawn) {
            SetWithdrawAmount(
                ethers.utils.formatEther(amountTobeWithdrawn, "ether")
            );
        }
    }

    async function approveNftMarketPlace(data) {
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const tokenPrice = ethers.utils.parseEther(data.data[2].inputResult);

        const options = {
            abi: basicNftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            msgValue: "",
            params: { to: nftmarketPlaceAddress, tokenId: tokenId },
        };

        await approveNftMarketPlaceToSellToken({
            params: options,
            onSuccess: async (tx) => {
                tx.wait(1);
                await ListNFT(nftAddress, tokenId, tokenPrice);
            },
            onError: (e) => console.log(e),
        });
    }

    async function OnSuccessApprove(tx) {
        await tx.wait(4);
    }

    async function OnSuccessListingNFT(tx) {
        await tx.wait(1);
        handleNewNotification(
            "success",
            "NFT Listed!!!",
            "Transaction Response"
        );
    }

    function OnError(error) {
        console.log(error);
        handleNewNotification("error", error.message, "Transaction Response");
    }

    function OnErrorListingNFT(error) {
        console.log(error);
        handleNewNotification("error", error.message, "Transaction Response");
    }

    async function ListNFT(nftAddress, tokenId, price) {
        const options = {
            abi: nftMarketPlaceAbi,
            contractAddress: nftmarketPlaceAddress,
            functionName: "ListItem",
            msgValue: "",
            params: { nftAddress: nftAddress, tokenId: tokenId, price: price },
        };
        await listNFTToMarketPlace({
            params: options,
            onSuccess: OnSuccessListingNFT,
            onError: OnErrorListingNFT,
        });
    }

    const handleNewNotification = (type, message, title) => {
        dispatch({
            type,
            message: message,
            title: title,
            position: "topR",
        });
    };

    async function WithdrawOnButtonClick() {
        const options = {
            abi: nftMarketPlaceAbi,
            contractAddress: nftmarketPlaceAddress,
            functionName: "WithdrawNft",
            msgValue: "",
            params: {},
        };
        await WithdrawSellerEarning({
            params: options,
            onSuccess: OnSuccessWithdraw,
            onError: OnErrorWithdraw,
        });
    }

    function OnErrorWithdraw(error) {
        console.log(error);
        handleNewNotification("error", error.message, "Transaction Response");
    }

    async function OnSuccessWithdraw(tx) {
        await tx.wait(1);
        handleNewNotification(
            "success",
            "Withdraw Done!!",
            "Transaction Response"
        );
    }

    return (
        <div className="pl-10">
            <Form
                buttonConfig={{
                    text: "Sell",
                    theme: "primary",
                }}
                data={[
                    {
                        key: "tokenAddress",
                        name: "Token Address",
                        type: "text",
                        value: "",
                    },
                    {
                        key: "tokenId",
                        name: "Token Id",
                        type: "text",
                        value: "",
                    },
                    {
                        key: "price",
                        name: "Token Price",
                        type: "number",
                        value: "",
                    },
                ]}
                onSubmit={approveNftMarketPlace}
                title="List NFT on MarketPlace"
            />
            <div>Withdraw Earned Amount is {WithdrawAmount} ETH</div>
            <div className="pb-6">
                <Button
                    color="blue"
                    onClick={WithdrawOnButtonClick}
                    text="Withdraw"
                    theme="colored"
                />
            </div>
        </div>
    );
}
