import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../../../declarations/auction_dapp_backend";

const backend = createActor(canisterId);

function Navigation() {
    const [principal, setPrincipal] = useState(undefined);
    const [needLogin, setNeedLogin] = useState(true);
    const [loading, setLoading] = useState(false); 

    const authClientPromise = AuthClient.create();

    const signIn = async () => {
        setLoading(true);
        try {
            const authClient = await authClientPromise;
            const internetIdentityUrl = import.meta.env.PROD
                ? undefined
                : `http://${process.env.CANISTER_ID_INTERNET_ID}.localhost:4943`;

            await new Promise((resolve, reject) => {
                authClient.login({
                    identityProvider: internetIdentityUrl,
                    onSuccess: () => resolve(undefined),
                    onError: (error) => reject(error),
                });
            });

            const identity = authClient.getIdentity();
            updateIdentity(identity);
            setNeedLogin(false);
        } catch (error) {
            console.error("Sign in failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const authClient = await authClientPromise;
            await authClient.logout();
            const identity = authClient.getIdentity();
            updateIdentity(identity);
            setNeedLogin(true);
        } catch (error) {
            console.error("Sign out failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateIdentity = (identity) => {
        setPrincipal(identity.getPrincipal());
        const agent = Actor.agentOf(backend);
        if (agent instanceof HttpAgent) {
            agent.replaceIdentity(identity);
        } else {
            console.error("Agent is not an instance of HttpAgent");
        }
    };

    const setInitialIdentity = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            updateIdentity(identity);
            setNeedLogin(!await authClient.isAuthenticated());
        } catch (error) {
            console.error("Error retrieving initial identity:", error);
        }
    };

    useEffect(() => {
        setInitialIdentity();
    }, []);

    return (
        <>
            <div className="bg-indigo-500 p-1 w-full">
                <div className="flex flex-wrap justify-center md:justify-start">
                    <div className="bg-white p-3 m-2 text-lg md:text-xl font-medium border border-black text-black rounded-lg cursor-pointer transition-all hover:shadow-lg">
                        <Link to="/">List auctions</Link>
                    </div>
                    <div className="bg-white p-3 m-2 text-lg md:text-xl font-medium border border-black text-black rounded-lg cursor-pointer transition-all hover:shadow-lg">
                        <Link to="/newAuction">New auction</Link>
                    </div>
                    {needLogin ? (
                        <div
                            className={`bg-white p-3 m-2 text-lg md:text-xl font-medium border border-black text-black rounded-lg cursor-pointer transition-all hover:shadow-lg hover:text-indigo-400 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={loading ? null : signIn} 
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </div>
                    ) : (
                        <div
                            className={`bg-white p-3 m-2 text-lg md:text-xl font-medium border border-black text-black rounded-lg cursor-pointer transition-all hover:shadow-lg hover:text-indigo-400 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={loading ? null : signOut}
                        >
                            {loading ? "Signing out..." : "Sign Out"}
                        </div>
                    )}
                </div>
            </div>
            {!needLogin && (
                <div className="principal p-2 text-center text-sm md:text-base">
                    Logged in as: {principal?.toString()}
                </div>
            )}
        </>
    );
}

export default Navigation;
