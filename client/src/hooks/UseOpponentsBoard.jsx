import { use } from "react";
import { TETROMINOES } from "../utils/Tetrominoes";
import React, { useState, useCallback, useMemo } from "react";


export const useOpponentsBoards = (intialboards = new Map()) => {
    const [map, setMap] = useState(intialboards);

    const set = useCallback((key, value) => {
        setMap(prev => new Map(prev).set(key, value));
    }, [setMap]);

    return {
        map, set
    };
}



