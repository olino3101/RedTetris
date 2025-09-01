import React from "react"

import Spectrum from "/src/components/Spectrum";

const Spectrums = ({ players }) => {
    return (
        < div className="Spectrum-dock" >
            {/* {previewTetrominoes.map((tetromino, index) => ( */}
            <Spectrum player={players} index={1} key={1} />
            <Spectrum player={players} index={2} key={2} />
            <Spectrum player={players} index={3} key={3} />


            {/* ))} */}
        </div>
    );
};


export default React.memo(Spectrums)
