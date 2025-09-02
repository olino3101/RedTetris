import React from "react"

import Spectrum from "/src/components/Spectrum";

const Spectrums = ({ opponents }) => {
    // console.log("Rendering Spectrums with opponents:", opponents);
    if (!opponents || opponents.size === 0) {
        return <div className="Spectrums no-opponents">No opponents connected</div>;
    }

    // for (let [key, value] of opponents) {
    //     console.log(`${key}: ${value}`);
    // }

    opponents.forEach((board, name) => {
        console.log(`Opponent ${name} has board:`, board);
    });

    return (
        < div className="Spectrums" >
            {[...opponents.entries()].map(([name, board]) => (
                <Spectrum board={board} name={name} />
            ))}
        </div>
    );
};


export default Spectrums
