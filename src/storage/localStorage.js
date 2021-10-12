import { writable } from "svelte/store";

const debug = false;

export const error = {
    callback: (err) => {}, 
};

export function save(path, value) {
    try {
        localStorage.setItem(path, JSON.stringify(value));
        debug && console.log("save", value, "to", path);
    } catch (e) {
        error.callback({message: `Failed to store ${path} in local storage`, error: e});
    }
}

export function load(path, def) {
    try {
        let valueStr = localStorage.getItem(path);
        if (valueStr === "undefined") {
            return def;
        }

        let value = JSON.parse(valueStr);
        if (value == undefined)
            value = def;
        debug && console.log("load", value, "from", path);
        return value;
    } catch (e) {
        console.log("Failed to load", path, e);
        save(path, def);
        return def;
    }
}

export function writableLStored(path, def, value) {
    if (value == undefined) value = load(path, def)
    let writ = writable(value);
    let first = true;
    writ.subscribe(v => {
        writ.value = v;
        if (first) {
            first = false;
            return;
        }
        save(path, v);
    });
    return writ;
}
