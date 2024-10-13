
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backend } from '../common';

function CreateAuction() {
    const [title, setTitle] = useState("My Auction");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null); 
    const [imagePreview, setImagePreview] = useState(""); 
    const [duration, setDuration] = useState(120);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const newAuction = async () => {
        setSaving(true);
        try {
            let imageData = null;
            if (image) {
                const arrayBuffer = await image.arrayBuffer();
                imageData = new Uint8Array(arrayBuffer);
            }

            const newAuctionData = {
                title,
                description,
                image: imageData, 
            };
            await backend.newAuction(newAuctionData, BigInt(duration));
            navigate("/");
        } catch (error) {
            console.error("Error creating auction:", error);
        } finally {
            setSaving(false);
        }
    };

    const changeFile = (file) => {
        if (file) {
            if (file.type !== 'image/png') {
                alert('Only PNG images are allowed.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const blob = new Blob([reader.result], { type: file.type });
                setImage(blob);
                setImagePreview(image); 
            };
            reader.readAsArrayBuffer(file); 
        } else {
            setImage(null);
            setImagePreview(""); 
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Start New Auction</h1>
            <div className={` ${saving ? 'opacity-50' : 'opacity-100'}`}>
                <div className=" mb-4">
                    <div className=" text-lg sm:text-xl inline-block pr-4 min-w-[150px] sm:min-w-[200px]">Title: </div>
                    <div className="">
                        <input 
                            className="border p-2 w-full sm:w-[600px] lg:w-[800px]" 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                    </div>
                </div>
                <div className=" mb-4">
                    <div className=" text-lg sm:text-xl inline-block pr-4 min-w-[150px] sm:min-w-[200px]">Description: </div>
                    <div className="">
                        <textarea 
                            className="border p-2 w-full sm:w-[600px] lg:w-[800px] h-[150px] sm:h-[200px]" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                        />
                    </div>
                </div>
                <div className=" mb-4">
                    <div className=" text-lg sm:text-xl inline-block pr-4 min-w-[150px] sm:min-w-[200px]">Picture (PNG only): </div>
                    <div className="">
                        <input 
                            className="border p-2 w-full sm:w-[600px] lg:w-[800px]" 
                            type="file" 
                            accept='.png' 
                            onChange={(e) => changeFile(e.target.files?.[0])} 
                        />
                    </div>
                </div>
                
                
                {imagePreview && (
                    <div className="mb-4">
                        <div className="text-lg sm:text-xl inline-block pr-4 min-w-[150px] sm:min-w-[200px]">Image Preview: </div>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="border border-black p-2 w-[200px] h-[200px] object-contain" 
                        />
                    </div>
                )}

                <div className=" mb-4">
                    <div className=" text-lg sm:text-xl inline-block pr-4 min-w-[150px] sm:min-w-[200px]">Duration: </div>
                    <div className="">
                        <input 
                            className="w-full sm:w-[600px] lg:w-[800px]" 
                            type="range" 
                            min={60} 
                            max={600} 
                            value={duration} 
                            onChange={(e) => setDuration(parseInt(e.target.value))} 
                        />
                        <p className="text-center">{duration} seconds</p>
                    </div>
                </div>
                <div className=" text-center sm:text-right">
                    <button 
                        className='auction-form-button bg-indigo-500 text-white p-4 text-lg sm:text-xl font-medium border border-black rounded-md w-full sm:w-auto' 
                        onClick={newAuction} 
                        disabled={saving}
                    >
                        Create new auction
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateAuction;



