import React from "react"

import Spectrum from "/src/components/Spectrum";

const Spectrums = ({ players }) => {
    // const previewTetrominoes = tetrominoes
    //     .slice(1 - tetrominoes.length)
    //     .reverse();
    return (
        <>
            {/* {previewTetrominoes.map((tetromino, index) => ( */}
            <Spectrum player={1} index={2} key={1} />
            <Spectrum player={1} index={2} key={2} />
            <Spectrum player={1} index={2} key={3} />

            {/* ))} */}
        </>
    );
};


export default React.memo(Spectrums)
