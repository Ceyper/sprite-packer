import { writable } from "svelte/store";


const debug = false;
let available = false;


export const options = {
    name: "db",
    version: 1,
    stores: [
    ],
}

export const error = {
    callback: (err) => {}, 
};

let queuedDatabaseRequests = [];
export function initialize() {
    if (!indexedDB) {
        error.callback({ message: `Browser doesn't support indexedDB.`, e: "Time for an upgrade perhaps?" });
        return;
    }

    let request = indexedDB.open(options.name, options.version);
    let db;

    request.onerror = (event) => {
        // Do something with request.errorCode!
        error.callback({message: `Failed to open database.`, e: request.errorCode});
        debug && console.log("Failed to open database.", request.error);
    };
    request.onsuccess = (event) => {
        db = event.target.result;
        queuedDatabaseRequests.forEach((fn) => fn());
        available = true;
        debug && console.log("Database initialization successful");
    };
    request.onupgradeneeded = function(event) {
        db = event.target.result;

        db.onerror = (event) => {
            error.callback({ message: `Failed to upgrade database.`, event });
        }
        
        options.stores.forEach((store) => {
            let objectStore = db.createObjectStore(store.name, store.options);
            // todo create index
        });
    };
}

function writeIndexedDB(store, id, value) {
    let object =  { "key": id, "data": value };
    return new Promise((resolve, reject) => {
        let dbr = indexedDB.open(options.name);
  
        dbr.onerror = function(event) {
            reject(Error("IndexedDB database error"));
        };
  
        dbr.onupgradeneeded = function(event) {
            let database    = event.target.result;
            let storeOptions = options.stores.find((s) => s.name == store);
            if (!storeOptions) {
                reject(Error("Missing store options"));
            }
            let objectStore = database.createObjectStore(store, storeOptions.options);
        };
  
        dbr.onsuccess = function(event) {
            let database      = event.target.result;
            let transaction   = database.transaction([store], 'readwrite');
            let objectStore   = transaction.objectStore(store);
            let objectRequest = objectStore.put(object); // Overwrite if exists

            objectRequest.onerror = function(event) {
                reject(Error(`Error text ${objectRequest.error}`));
            };

            objectRequest.onsuccess = function(event) {
                resolve(objectRequest.result.data);
            };
        };
    });
}

function readIndexedDB(store, id) {
    return new Promise((resolve, reject) => {
        let dbr = indexedDB.open(options.name);
        dbr.onerror = function(event) {
            reject(Error("Error text"));
        };
        dbr.onupgradeneeded = function(event) {
            // Objectstore does not exist. Nothing to load
            event.target.transaction.abort();
            reject(Error("Not found"));
        };
        dbr.onsuccess = function(event) {
            let database      = event.target.result;
            let transaction   = database.transaction([store]);
            let objectStore   = transaction.objectStore(store);
            let objectRequest = objectStore.get(id);
    
            dbr.onerror = function(event) {
                reject(Error("Error text"));
            };
    
            objectRequest.onsuccess = function(event) {
                if (objectRequest.result) {
                    resolve(objectRequest.result.data);
                }
                else {
                    resolve(undefined);
                }
            };
        };
    });
}

async function runWhenReady(fn) {
    return new Promise((resolve, reject) => {
        if (available) {
            Promise.resolve(fn()).then((val) => {
                resolve(val);
            });
        } else {
            queuedDatabaseRequests.push(() => {
                Promise.resolve(fn()).then((val) => {
                    resolve(val);
                });
            });
        }
    });
}

export async function save(path, id, value) {
    try {
        await runWhenReady(() => writeIndexedDB(path, id, value));
        debug && console.log(`Wrote`, value, `to ${path}#${id}`);
    } catch (e) {
        error.callback({message: `Failed to store ${path}#${id} in local storage`, error: e});
    }
}

export async function load(path, id, def) {
    try {
        let result = await runWhenReady(() => readIndexedDB(path, id));
        debug && console.log(`Read`, result, `from ${path}#${id}`);
        return result;
    } catch (e) {
        console.log("Failed to load", path, e);
        //save(path, def);
        return def;
    }
}

/* 

writable {
    loaded: bool

    subscribe: (callback)
    set: (value)
    update: (value) => new value

    options: {
        delay: number
    }

    save: ()
    onSave: (callback)
}

*/

export function writableDBStored(store, path, def, options) {
    let writ = writable(def);
    writ.options = options || {};
    writ.loaded = false;
    let doneLoading;
    writ.await = new Promise((resolve, reject) => doneLoading = resolve);

    writ.timeout = undefined;
    let skip = false;
    load(store, path, def).then((value) => {
        writ.loaded = true;
        if (value !== undefined) {
            skip = true;
            writ.set(value);
        } else {
            skip = true;
            writ.set(def);
        }
        doneLoading();
    });
    let saveCallbacks = [];
    writ.onSave = (callback) => {
        saveCallbacks.push(callback);
    };

    writ.save = () => {
        if (writ.options.delay) {
            saveCallbacks.forEach((cb) => cb(false));
            clearTimeout(writ.timeout);
            writ.timeout = setTimeout(() => {
                save(store, path, writ.value);
                saveCallbacks.forEach((cb) => cb(true));
                clearTimeout(writ.timeout);
            }, writ.options.delay);
        } else {
            save(store, path, writ.value);
            saveCallbacks.forEach((cb) => cb(true));
        }
    };

    writ.subscribe(v => {
        writ.value = v;
        if (!writ.loaded) {
            return;
        }
        if (skip) {
            skip = false;
            return;
        }
        writ.save();
    });
    return writ;
}
