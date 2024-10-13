import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { backend, setActorIdentity } from '../common';
import { AuthClient } from '@dfinity/auth-client';


function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function AuctionDetail() {
    const { id } = useParams();
    const auctionId = BigInt(id);

    const [auctionDetails, setAuctionDetails] = useState(undefined);
    const [newPrice, setNewPrice] = useState(0);
    const [lastError, setLastError] = useState(undefined);
    const [saving, setSaving] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    const fetchFromBackend = async () => {
        setAuctionDetails(await backend.getAuctionDetails(auctionId));
        const authClient = await AuthClient.create();
        setAuthenticated(await authClient.isAuthenticated());
    };

    useEffect(() => {
        fetchFromBackend();
        const interval = setInterval(fetchFromBackend, 1000);
        return () => clearInterval(interval);
    }, [auctionId]);

    const makeNewOffer = async () => {
        try {
            setSaving(true);
            const client = await AuthClient.create();
            setActorIdentity(client.getIdentity());
            await backend.makeBid(auctionId, BigInt(newPrice));
            setLastError(undefined);
            setNewPrice(newPrice + 1);
            fetchFromBackend();
        } catch (error) {
            const errorText = error.toString();
            if (errorText.indexOf("Price too low") >= 0) {
                setLastError("Price too low");
            } else if (errorText.indexOf("Auction closed") >= 0) {
                setLastError("Auction closed");
            } else {
                setLastError(errorText);
            }
        } finally {
            setSaving(false);
        }
    };

    const historyElements = auctionDetails?.bidHistory.map(bid => (
        <tr key={bid.price.toString()}>
            <td className="px-2 py-1 text-center">{bid.price.toString()} ICP</td>
            <td className="px-2 py-1 text-center">{bid.time.toString()} seconds</td>
            <td className="px-2 py-1 text-center">{bid.originator.toString()}</td>
        </tr>
    ));

    const getLastBid = () => {
        if (!auctionDetails || auctionDetails.bidHistory.length === 0) return null;
        return auctionDetails.bidHistory[auctionDetails.bidHistory.length - 1];
    };

    if (newPrice === 0) {
        const currentBid = getLastBid();
        const proposedPrice = currentBid == null ? 1 : +currentBid.price.toString() + 1;
        setNewPrice(proposedPrice);
    }

    const handleNewPriceInput = (input) => {
        const value = parseInt(input);
        if (!isNaN(value) && value >= 0) setNewPrice(value);
    };

    
    const displayItem = (item) => {
        const base64String = item.image ? `data:image/jpeg;base64,${arrayBufferToBase64(item.image)}` : null;

        return (
            <div className="w-full">
                <h1 className="text-2xl md:text-3xl py-2 md:py-4">{item.title}</h1>
                <div className="pt-4 md:pt-12">
                    <div className="text-base md:text-lg p-2 md:p-4">{item.description}</div>
                    {!!base64String && (
                        <div className="p-2 md:p-4">
                            <img
                                src={base64String}
                                alt="Auction image"
                                className="w-full md:w-64 mx-auto"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const showHistory = () => (
        <div className="py-4">
            <h2 className="text-xl md:text-2xl">History</h2>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm md:text-lg">
                    <thead>
                        <tr>
                            <th className="px-2 py-1">Price</th>
                            <th className="px-2 py-1">Time before end</th>
                            <th className="px-2 py-1">Originator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyElements}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const showBidForm = () => {
        if (!authenticated) {
            return <h2 className="text-red-500">Need to sign in to bid</h2>;
        }
        return (
            <div className="py-4">
                <h2 className="text-xl md:text-2xl">New Bid</h2>
                <h3 className="text-sm md:text-base">Remaining time: {auctionDetails?.remainingTime.toString()}</h3>
                <div className="py-4 flex flex-col md:flex-row items-center">
                    <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => handleNewPriceInput(e.target.value)}
                        className="m-2 p-2 w-20 text-lg border border-black rounded-lg"
                    />
                    <button
                        onClick={makeNewOffer}
                        disabled={saving}
                        className={`m-2 p-2 w-full md:w-auto text-lg text-white rounded-lg font-semibold ${saving ? "bg-gray-400" : "bg-indigo-500"}`}
                        style={{ opacity: saving ? 0.5 : 1 }}
                    >
                        Bid {newPrice} ICP
                    </button>
                </div>
                {lastError && <p className="text-red-500">{lastError}</p>}
            </div>
        );
    };

    const showAuction = () => {
        if (!auctionDetails) throw new Error("undefined auction");

        const currentBid = getLastBid();
        return (
            <div className="w-full">
                {displayItem(auctionDetails.item)}
                {currentBid && (
                    <div className="py-4">
                        <h2 className="text-xl md:text-2xl">{isClosed ? "Final Deal" : "Current Bid"}</h2>
                        <p className="text-2xl md:text-3xl font-bold">{currentBid.price.toString()} ICP</p>
                        <p className="text-base md:text-lg">by {currentBid.originator.toString()}</p>
                        <p className="text-sm md:text-base">{currentBid.time.toString()} seconds before end</p>
                    </div>
                )}
                {!isClosed && showBidForm()}
                {showHistory()}
            </div>
        );
    };

    const isClosed = auctionDetails && +auctionDetails.remainingTime.toString() === 0;

    return (
        <div className="p-4 md:p-8 w-full max-w-3xl mx-auto">
            {!auctionDetails ? <div>Loading...</div> : showAuction()}
        </div>
    );
}

export default AuctionDetail;
