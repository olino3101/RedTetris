import React from "react"

import Spectrum from "/src/components/Spectrum";

const Spectrums = ({ opponents }) => {
    // og("Rendering Spectrums with opponents:", opponents);
    if (!opponents || opponents.size === 0) {
        return <div className="Spectrums no-opponents">No opponents connected</div>;
    }

    return (
        < div className="Spectrums" >
            {[...opponents.entries()].map(([name, board]) => (
                <Spectrum board={board} name={name} key={name} />
            ))}
        </div>
    );
};


export default Spectrums
