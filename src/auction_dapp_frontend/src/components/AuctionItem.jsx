import { Link } from "react-router-dom";

function AuctionItem({ overview, navigate, navigationLink }) {
    const id = Number(overview.id);
    
    
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    
    const base64String = overview.item.image ? 
        `data:image/jpeg;base64,${arrayBufferToBase64(overview.item.image)}` : null;

    console.log("Base64 Image String: ", base64String);

    const handleClick = () => {
        navigate(navigationLink(id));
    };

    return (
        <li 
            className="bg-white list-none p-6 sm:p-8 md:p-12 w-full sm:w-72 md:w-80 border border-dashed border-black rounded-lg m-6 md:m-8 lg:m-12 cursor-pointer transition-all hover:shadow-lg"
            onClick={handleClick}
        >
            <div className="text-2xl sm:text-3xl md:text-4xl leading-tight">{overview.item.title}</div>
            <div className="text-sm sm:text-base md:text-lg py-2 sm:py-3 md:py-4">{overview.item.description}</div>
            {base64String && (
                <img 
                    src={base64String} 
                    alt="Auction item"
                    className="w-full sm:w-64 block p-2.5" 
                    loading="lazy"
                />
            )}
            <div className="text-md sm:text-lg md:text-xl font-medium p-3 sm:p-4 md:p-5">
                <Link to={navigationLink(id)} className="text-blue-500 underline hover:text-blue-700">Auction details</Link>
            </div>
        </li>
    );
}

export default AuctionItem;
