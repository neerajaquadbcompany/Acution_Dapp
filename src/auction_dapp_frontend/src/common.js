import { Actor, HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../../declarations/auction_dapp_backend";

export function getImageSource(imageData) {
    if (imageData != null) {
        const array = Uint8Array.from(imageData);
        const blob = new Blob([array.buffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
    } else {
        return "";
    }
}

export const backend = createActor(canisterId);

export function setActorIdentity(identity) {
    Actor.agentOf(backend).replaceIdentity(identity);
}
