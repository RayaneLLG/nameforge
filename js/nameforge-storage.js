```javascript
/* =========================================================
   NAMEFORGE STORAGE
   ---------------------------------------------------------
   Central storage system for:
   • Saved names
   • Liked names
   • Private notes
   • Generator information
   • Name metadata

   IMPORTANT:
   This file is GENERIC.

   Do NOT add generator names here.

   A new generator can use this system simply by calling:

       saveName(name, "new-generator", style);
       likeName(name, "new-generator", style);
       updateNameNote(name, note);

   No modification to this file is required.
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const NAMEFORGE_STORAGE_KEY =
    "nameforge_saved_names";

const NAMEFORGE_STORAGE_VERSION =
    2;


/* =========================================================
   INTERNAL HELPERS
========================================================= */


/*
 * Safely convert a value to a string.
 */
function nfString(value, fallback = ""){

    if(
        value === null ||
        typeof value === "undefined"
    ){

        return fallback;

    }

    return String(value);

}


/*
 * Trim a value safely.
 */
function nfTrim(value){

    return nfString(value).trim();

}


/*
 * Generate a reliable unique ID.

 * crypto.randomUUID()
 * is preferred when available.

 * A fallback is provided for older browsers.
 */
function generateNameForgeId(){

    try{

        if(
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ){

            return crypto.randomUUID();

        }

    }

    catch(error){

        console.warn(
            "NameForge: crypto.randomUUID unavailable.",
            error
        );

    }


    return (

        Date.now().toString(36) +

        "-" +

        Math.random()
            .toString(36)
            .substring(2,11) +

        "-" +

        Math.random()
            .toString(36)
            .substring(2,11)

    );

}


/*
 * Safely determine whether a note contains text.
 */
function hasNameForgeNote(note){

    return (
        nfTrim(note) !== ""
    );

}


/*
 * Determine whether an entry is still useful.

 * An entry should remain in storage if it is:
 * • saved
 * • liked
 * • or contains a note
 */
function isNameForgeEntryActive(item){

    return (

        item.saved === true ||

        item.liked === true ||

        hasNameForgeNote(item.note)

    );

}


/*
 * Dispatch an internal event.

 * This allows pages to refresh their UI immediately
 * after storage changes.

 * Example:

 * window.addEventListener(
 *     "nameforge:storage",
 *     () => renderNames()
 * );
 */
function notifyNameForgeStorage(){

    try{

        window.dispatchEvent(
            new CustomEvent(
                "nameforge:storage"
            )
        );

    }

    catch(error){

        /*
         * CustomEvent is not available in some very
         * old browsers. Storage itself still works.
         */

        console.warn(
            "NameForge: unable to dispatch storage event.",
            error
        );

    }

}


/* =========================================================
   NORMALIZE STORAGE ENTRY
========================================================= */


/*
 * Convert any stored object into a valid NameForge entry.

 * This is especially important for:
 * • old data
 * • manually modified localStorage
 * • future storage upgrades
 */
function normalizeNameForgeEntry(item){

    if(
        !item ||
        typeof item !== "object"
    ){

        return null;

    }


    const normalized = {

        id:
            nfTrim(item.id) ||
            generateNameForgeId(),

        name:
            nfTrim(item.name),

        generator:
            nfTrim(item.generator) ||
            "unknown",

        style:
            nfTrim(item.style),

        saved:
            item.saved === true,

        liked:
            item.liked === true,

        note:
            nfString(item.note).trim(),

        createdAt:
            nfTrim(item.createdAt) ||
            new Date().toISOString()

    };


    /*
     * A name is required.

     * Invalid entries are ignored rather than
     * being allowed to break the complete storage.
     */
    if(!normalized.name){

        return null;

    }


    return normalized;

}


/* =========================================================
   NORMALIZE COMPLETE STORAGE
========================================================= */

function normalizeNameForgeStorage(data){

    if(!Array.isArray(data)){

        return [];

    }


    const normalized = [];

    const usedIds = new Set();


    data.forEach(item => {

        const entry =
            normalizeNameForgeEntry(item);


        if(!entry){

            return;

        }


        /*
         * Guarantee unique IDs.
         */
        if(
            usedIds.has(entry.id)
        ){

            entry.id =
                generateNameForgeId();

        }


        usedIds.add(entry.id);


        normalized.push(entry);

    });


    return normalized;

}


/* =========================================================
   GET RAW STORAGE
========================================================= */

function getRawNameForgeStorage(){

    try{

        const data =
            localStorage.getItem(
                NAMEFORGE_STORAGE_KEY
            );


        if(!data){

            return [];

        }


        const parsed =
            JSON.parse(data);


        return parsed;

    }

    catch(error){

        console.error(
            "NameForge Storage Error: unable to read storage.",
            error
        );


        /*
         * Do NOT automatically delete corrupted data.

         * This prevents accidental data loss.
         */
        return [];

    }

}


/* =========================================================
   GET ALL NAMEFORGE DATA
========================================================= */


/*
 * MAIN STORAGE ACCESS FUNCTION.

 * All other functions use this function.

 * This guarantees that stored entries always have
 * a consistent structure.
 */
function getSavedNames(){

    try{

        const raw =
            getRawNameForgeStorage();


        const normalized =
            normalizeNameForgeStorage(raw);


        /*
         * Detect whether normalization changed
         * the stored structure.
         */
        const rawString =
            JSON.stringify(raw);

        const normalizedString =
            JSON.stringify(normalized);


        if(
            rawString !== normalizedString
        ){

            saveAllNames(
                normalized,
                false
            );

        }


        return normalized;

    }

    catch(error){

        console.error(
            "NameForge Storage Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE ALL DATA
========================================================= */


/*
 * Internal storage writer.

 * notify defaults to true.

 * During migration/normalization we can disable
 * notifications to avoid unnecessary events.
 */
function saveAllNames(
    names,
    notify = true
){

    try{

        const normalized =
            normalizeNameForgeStorage(
                names
            );


        localStorage.setItem(

            NAMEFORGE_STORAGE_KEY,

            JSON.stringify(
                normalized
            )

        );


        /*
         * Store the current version separately.

         * This does not affect compatibility with
         * the existing data structure.
         */
        localStorage.setItem(

            NAMEFORGE_STORAGE_KEY +
            "_version",

            String(
                NAMEFORGE_STORAGE_VERSION
            )

        );


        if(notify){

            notifyNameForgeStorage();

        }


        return true;

    }

    catch(error){

        console.error(
            "NameForge Storage Error: unable to save data.",
            error
        );


        return false;

    }

}


/* =========================================================
   FIND NAME
========================================================= */


/*
 * Finds an entry by name.

 * This preserves compatibility with the existing
 * NameForge generators and My Names page.
 */
function findSavedName(name){

    const target =
        nfTrim(name);


    if(!target){

        return undefined;

    }


    const names =
        getSavedNames();


    return names.find(

        item =>
            item.name === target

    );

}


/* =========================================================
   FIND NAME WITH OPTIONAL GENERATOR
========================================================= */


/*
 * More precise lookup for future generators.

 * Existing code does NOT need to change.

 * Example:

 * findNameForgeEntry(
 *     "Arthas",
 *     "fantasy"
 * );
 */
function findNameForgeEntry(
    name,
    generator
){

    const targetName =
        nfTrim(name);

    const targetGenerator =
        nfTrim(generator);


    if(!targetName){

        return undefined;

    }


    const names =
        getSavedNames();


    /*
     * If a generator is supplied,
     * prefer an exact name + generator match.
     */
    if(targetGenerator){

        const exact =
            names.find(

                item =>

                    item.name === targetName &&

                    item.generator === targetGenerator

            );


        if(exact){

            return exact;

        }

    }


    /*
     * Fallback for old NameForge calls that
     * only provide the name.
     */
    return names.find(

        item =>
            item.name === targetName

    );

}


/* =========================================================
   CREATE NAME ENTRY
========================================================= */

function createNameEntry(
    name,
    generator,
    style
){

    return {

        id:
            generateNameForgeId(),

        name:
            nfTrim(name),

        generator:
            nfTrim(generator) ||
            "unknown",

        style:
            nfTrim(style),

        saved:false,

        liked:false,

        note:"",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================================
   SAVE / BOOKMARK NAME
========================================================= */


/*
 * Saves a name.

 * IMPORTANT:
 * Saving does NOT automatically like the name.

 * Liking does NOT automatically save the name.
 */
function saveName(
    name,
    generator,
    style
){

    const cleanName =
        nfTrim(name);


    if(!cleanName){

        return null;

    }


    const names =
        getSavedNames();


    let existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    /*
     * Existing entry.
     */
    if(existing){

        existing.saved = true;


        if(generator){

            existing.generator =
                nfTrim(generator);

        }


        if(style){

            existing.style =
                nfTrim(style);

        }


        saveAllNames(names);


        return existing;

    }


    /*
     * New entry.
     */
    const newName =
        createNameEntry(
            cleanName,
            generator,
            style
        );


    newName.saved = true;


    names.unshift(
        newName
    );


    saveAllNames(names);


    return newName;

}


/* =========================================================
   UNSAVE NAME
========================================================= */


/*
 * Removes ONLY the saved state.

 * Like and note remain untouched.
 */
function unsaveName(
    name,
    generator
){

    const cleanName =
        nfTrim(name);


    if(!cleanName){

        return false;

    }


    const names =
        getSavedNames();


    const existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    if(!existing){

        return false;

    }


    existing.saved = false;


    /*
     * Remove the entry completely only when
     * nothing else is associated with it.
     */
    if(
        !isNameForgeEntryActive(existing)
    ){

        const filtered =
            names.filter(

                item =>
                    item.id !== existing.id

            );


        saveAllNames(
            filtered
        );


        return true;

    }


    saveAllNames(
        names
    );


    return true;

}


/* =========================================================
   TOGGLE LIKE
========================================================= */


/*
 * Like / Unlike a name.

 * IMPORTANT:
 * Liking NEVER automatically saves the name.
 */
function likeName(
    name,
    generator,
    style
){

    const cleanName =
        nfTrim(name);


    if(!cleanName){

        return null;

    }


    const names =
        getSavedNames();


    let existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    /*
     * If the name does not exist,
     * create a temporary entry.
     */
    if(!existing){

        existing =
            createNameEntry(
                cleanName,
                generator,
                style
            );


        existing.liked = true;


        names.unshift(
            existing
        );

    }

    else{

        existing.liked =
            !existing.liked;


        /*
         * Update metadata if supplied.
         */
        if(generator){

            existing.generator =
                nfTrim(generator);

        }


        if(style){

            existing.style =
                nfTrim(style);

        }

    }


    /*
     * If unliked and nothing else remains,
     * remove the entry.
     */
    if(
        !isNameForgeEntryActive(
            existing
        )
    ){

        const filtered =
            names.filter(

                item =>
                    item.id !== existing.id

            );


        saveAllNames(
            filtered
        );


        return null;

    }


    saveAllNames(
        names
    );


    return existing;

}


/* =========================================================
   EXPLICIT LIKE
========================================================= */


/*
 * Explicitly sets Like = true.

 * Useful for future interfaces where the button
 * has separate Like / Unlike actions.
 */
function setNameLiked(
    name,
    liked = true,
    generator,
    style
){

    const cleanName =
        nfTrim(name);


    if(!cleanName){

        return null;

    }


    const names =
        getSavedNames();


    let existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    if(!existing){

        existing =
            createNameEntry(
                cleanName,
                generator,
                style
            );


        names.unshift(
            existing
        );

    }


    existing.liked =
        liked === true;


    if(generator){

        existing.generator =
            nfTrim(generator);

    }


    if(style){

        existing.style =
            nfTrim(style);

    }


    if(
        !isNameForgeEntryActive(
            existing
        )
    ){

        const filtered =
            names.filter(

                item =>
                    item.id !== existing.id

            );


        saveAllNames(
            filtered
        );


        return null;

    }


    saveAllNames(
        names
    );


    return existing;

}


/* =========================================================
   UPDATE NOTE
========================================================= */


/*
 * Creates or updates a private note.

 * A note does NOT automatically save the name.
 */
function updateNameNote(
    name,
    note,
    generator,
    style
){

    const cleanName =
        nfTrim(name);

    const cleanNote =
        nfTrim(note);


    if(!cleanName){

        return false;

    }


    const names =
        getSavedNames();


    let existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    /*
     * Create an entry if necessary.
     */
    if(!existing){

        existing =
            createNameEntry(
                cleanName,
                generator,
                style
            );


        names.unshift(
            existing
        );

    }


    existing.note =
        cleanNote;


    if(generator){

        existing.generator =
            nfTrim(generator);

    }


    if(style){

        existing.style =
            nfTrim(style);

    }


    /*
     * Empty note + no Like + no Save
     * means there is nothing to keep.
     */
    if(
        !isNameForgeEntryActive(
            existing
        )
    ){

        const filtered =
            names.filter(

                item =>
                    item.id !== existing.id

            );


        saveAllNames(
            filtered
        );


        return true;

    }


    saveAllNames(
        names
    );


    return true;

}


/* =========================================================
   REMOVE NAME COMPLETELY
========================================================= */


/*
 * Completely removes a name.

 * This removes:
 * • Saved
 * • Like
 * • Note
 */
function removeSavedName(
    name,
    generator
){

    const cleanName =
        nfTrim(name);


    if(!cleanName){

        return false;

    }


    const names =
        getSavedNames();


    const existing =
        findNameForgeEntry(
            cleanName,
            generator
        );


    if(!existing){

        return false;

    }


    const filtered =
        names.filter(

            item =>
                item.id !== existing.id

        );


    const result =
        saveAllNames(
            filtered
        );


    return result;

}


/*
 * Alias for future code.

 * removeName() is easier to understand than
 * removeSavedName() when an entry can also be liked
 * or contain a note.
 */
function removeName(
    name,
    generator
){

    return removeSavedName(
        name,
        generator
    );

}


/* =========================================================
   IS SAVED?
========================================================= */

function isNameSaved(
    name,
    generator
){

    const existing =
        findNameForgeEntry(
            name,
            generator
        );


    return !!(
        existing &&
        existing.saved === true
    );

}


/* =========================================================
   IS LIKED?
========================================================= */

function isNameLiked(
    name,
    generator
){

    const existing =
        findNameForgeEntry(
            name,
            generator
        );


    return !!(
        existing &&
        existing.liked === true
    );

}


/* =========================================================
   HAS NOTE?
========================================================= */

function hasNameNote(
    name,
    generator
){

    const existing =
        findNameForgeEntry(
            name,
            generator
        );


    return !!(
        existing &&
        hasNameForgeNote(
            existing.note
        )
    );

}


/* =========================================================
   GET ONLY SAVED NAMES
========================================================= */

function getOnlySavedNames(){

    return getSavedNames()
        .filter(

            item =>
                item.saved === true

        );

}


/* =========================================================
   GET LIKED NAMES
========================================================= */

function getLikedNames(){

    return getSavedNames()
        .filter(

            item =>
                item.liked === true

        );

}


/* =========================================================
   GET NAMES WITH NOTES
========================================================= */

function getNamesWithNotes(){

    return getSavedNames()
        .filter(

            item =>
                hasNameForgeNote(
                    item.note
                )

        );

}


/* =========================================================
   GET ALL ACTIVE NAMES
========================================================= */


/*
 * Returns all entries that contain at least one
 * active state.
 */
function getActiveNames(){

    return getSavedNames()
        .filter(

            item =>
                isNameForgeEntryActive(
                    item
                )

        );

}


/* =========================================================
   GET GENERATOR NAMES
========================================================= */


/*
 * Useful for future pages.

 * Example:

 * getNamesByGenerator("pirate")
 */
function getNamesByGenerator(
    generator
){

    const target =
        nfTrim(generator);


    if(!target){

        return [];

    }


    return getSavedNames()
        .filter(

            item =>
                item.generator === target

        );

}


/* =========================================================
   GET NAME BY ID
========================================================= */

function getNameById(id){

    const target =
        nfTrim(id);


    if(!target){

        return undefined;

    }


    return getSavedNames()
        .find(

            item =>
                item.id === target

        );

}


/* =========================================================
   GET STORAGE STATISTICS
========================================================= */


/*
 * Centralized statistics.

 * Useful for My Names and future dashboards.
 */
function getNameForgeStats(){

    const names =
        getSavedNames();


    return {

        total:
            names.length,

        saved:
            names.filter(
                item =>
                    item.saved === true
            ).length,

        liked:
            names.filter(
                item =>
                    item.liked === true
            ).length,

        notes:
            names.filter(
                item =>
                    hasNameForgeNote(
                        item.note
                    )
            ).length,

        generators:
            new Set(

                names
                    .map(
                        item =>
                            item.generator
                    )
                    .filter(Boolean)

            ).size

    };

}


/* =========================================================
   CLEAR EVERYTHING
========================================================= */


/*
 * Completely removes NameForge local data.

 * Used by the "Clear all local names" button.
 */
function clearNameForgeStorage(){

    try{

        localStorage.removeItem(
            NAMEFORGE_STORAGE_KEY
        );


        localStorage.removeItem(
            NAMEFORGE_STORAGE_KEY +
            "_version"
        );


        notifyNameForgeStorage();


        return true;

    }

    catch(error){

        console.error(
            "NameForge Storage Error: unable to clear storage.",
            error
        );


        return false;

    }

}


/* =========================================================
   EXPORT DATA
========================================================= */


/*
 * Returns a JSON string containing the user's
 * NameForge data.

 * Useful if you later want an "Export My Names"
 * feature.
 */
function exportNameForgeData(){

    const names =
        getSavedNames();


    return JSON.stringify(

        {

            version:
                NAMEFORGE_STORAGE_VERSION,

            exportedAt:
                new Date().toISOString(),

            names:
                names

        },

        null,

        2

    );

}


/* =========================================================
   IMPORT DATA
========================================================= */


/*
 * Imports NameForge data.

 * This function is intentionally separate from
 * localStorage so future UI can add an
 * Import button without changing the storage system.
 */
function importNameForgeData(
    data,
    merge = true
){

    try{

        let parsed =
            data;


        /*
         * Accept either:
         *
         * JSON string
         *
         * or
         *
         * already parsed object.
         */
        if(
            typeof data === "string"
        ){

            parsed =
                JSON.parse(data);

        }


        let imported;


        /*
         * Support exported NameForge files.
         */
        if(
            parsed &&
            Array.isArray(parsed.names)
        ){

            imported =
                parsed.names;

        }

        /*
         * Also support a plain array.
         */
        else if(
            Array.isArray(parsed)
        ){

            imported =
                parsed;

        }

        else{

            return false;

        }


        const normalizedImported =
            normalizeNameForgeStorage(
                imported
            );


        if(!merge){

            return saveAllNames(
                normalizedImported
            );

        }


        const existing =
            getSavedNames();


        /*
         * Merge by ID first and then by name.
         *
         * This avoids unnecessary duplicates.
         */
        normalizedImported.forEach(
            importedItem => {

                const existingById =
                    existing.find(

                        item =>
                            item.id ===
                            importedItem.id

                    );


                const existingByName =
                    existing.find(

                        item =>
                            item.name ===
                            importedItem.name

                    );


                const target =
                    existingById ||
                    existingByName;


                if(target){

                    target.generator =
                        importedItem.generator ||
                        target.generator;

                    target.style =
                        importedItem.style ||
                        target.style;

                    target.saved =
                        importedItem.saved === true ||
                        target.saved === true;

                    target.liked =
                        importedItem.liked === true ||
                        target.liked === true;

                    if(
                        importedItem.note
                    ){

                        target.note =
                            importedItem.note;

                    }

                }

                else{

                    existing.unshift(
                        importedItem
                    );

                }

            }
        );


        return saveAllNames(
            existing
        );

    }

    catch(error){

        console.error(
            "NameForge Storage Error: unable to import data.",
            error
        );


        return false;

    }

}


/* =========================================================
   STORAGE EVENT SYNCHRONIZATION
========================================================= */


/*
 * The browser fires "storage" when another tab/window
 * changes localStorage.

 * This lets NameForge pages react automatically.
 */
window.addEventListener(
    "storage",
    event => {

        if(
            event.key ===
            NAMEFORGE_STORAGE_KEY
        ){

            notifyNameForgeStorage();

        }

    }
);


/* =========================================================
   BACKWARD-COMPATIBILITY ALIASES
========================================================= */


/*
 * Existing NameForge pages can continue using their
 * original function names.

 * Future code can use the clearer aliases.
 */


/* Saved */
const saveNameForgeName =
    saveName;


/* Unsave */
const unsaveNameForgeName =
    unsaveName;


/* Like */
const toggleNameForgeLike =
    likeName;


/* Note */
const saveNameForgeNote =
    updateNameNote;


/* Delete */
const deleteNameForgeName =
    removeSavedName;


/* =========================================================
   NAMEFORGE STORAGE READY
========================================================= */


/*
 * Do not perform unnecessary writes here.

 * Simply make sure the storage can be read.
 */
(function initializeNameForgeStorage(){

    try{

        getSavedNames();

    }

    catch(error){

        console.error(
            "NameForge Storage initialization error:",
            error
        );

    }

})();
```
