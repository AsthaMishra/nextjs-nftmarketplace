import { ConnectButton } from "web3uikit";
import Link from "next/link";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-wrap justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">NFT MarketPlace</h1>
            <div className="flex flex-wrap items-end">
                <Link href="/">
                    <a className="mr-4 p-4">Home Page</a>
                </Link>
                <Link href="/sell-nft">
                    <a className="mr-4 p-4">Sell Page</a>
                </Link>

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
//1:01:31:08
