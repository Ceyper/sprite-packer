import { writable } from "svelte/store";
// import { load, writableStored, error as localError } from "./storage/localStorage.js";
import { writableDBStored, error as dbError } from "./storage/indexedDB.js";
import { writableLStored, error as lError } from "./storage/localStorage.js";



export const error = writable(undefined);

dbError.callback = (e) => {
    error.set(e);
}

lError.callback = (e) => {
    error.set(e);
}


// let storedSprites = load("sprites", []);
// export const sprites = writableStored("sprites", undefined, storedSprites);

// let storedWidth = load("width", 8);
// export const width = writableStored("width", undefined, storedWidth);

// let storedHeight = load("height", 8);
// export const height = writableStored("height", undefined, storedHeight);

export const width = writableDBStored("sprites", "width", 8);
export const height = writableDBStored("sprites", "height", 8);
export const sprites = writableDBStored("sprites", "data", [], { delay: 1500, deepCompare: true });

export const align = writableLStored("align", {x: "left", y: "bottom"});
