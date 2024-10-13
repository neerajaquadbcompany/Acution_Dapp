
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from '../common';
import AuctionItem from './AuctionItem'; 

function AuctionList() {
    const [list, setList] = useState([]);
    const navigate = useNavigate();
    const navigationLink = (auctionId) => "/viewAuction/" + auctionId;

    const fetchAuction = async () => {
        try {
            const result = await backend.getOverviewList();
            setList(result);
            console.log("Result in Auction List ==>",result)
        } catch (error) {
            console.error("Error fetching auctions:", error);
        }
    };

    useEffect(() => {
        fetchAuction();
    }, []);

    return (
        <div className="p-4">
            {list == null && (
                <div className="text-center text-lg">Loading...</div>
            )}
            {list?.length === 0 && (
                <div className="text-center text-lg">No auctions created so far</div>
            )}
            {list?.length > 0 && (
                <ul className="flex flex-wrap justify-center">
                    {list.map(overview => (
                        <AuctionItem 
                            key={Number(overview.id)} 
                            overview={overview} 
                            navigate={navigate} 
                            navigationLink={navigationLink} 
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AuctionList;

