```javascript
/* =========================================
   NAMEFORGE STORAGE
   Separate Saved, Liked and Notes
========================================= */

const NAMEFORGE_STORAGE_KEY = "nameforge_saved_names";


/* =========================================
   GET ALL SAVED DATA
========================================= */

function getSavedNames(){

    try{

        const data =
            localStorage.getItem(
                NAMEFORGE_STORAGE_KEY
            );

        if(!data){

            return [];

        }

        const names =
            JSON.parse(data);

        if(!Array.isArray(names)){

            return [];

        }


        /*
         * MIGRATION OF OLD DATA
         *
         * Old NameForge entries did not have
         * a "saved" property.
         *
         * They are considered saved so
         * existing user data is preserved.
         */

        let changed = false;


        names.forEach(item => {

            if(
                typeof item.saved === "undefined"
            ){

                item.saved = true;

                changed = true;

            }


            if(
                typeof item.liked === "undefined"
            ){

                item.liked = false;

                changed = true;

            }


            if(
                typeof item.note === "undefined"
            ){

                item.note = "";

                changed = true;

            }

        });


        if(changed){

            saveAllNames(names);

        }


        return names;

    }

    catch(error){

        console.error(
            "NameForge Storage Error:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE ALL DATA
========================================= */

function saveAllNames(names){

    try{

        localStorage.setItem(
            NAMEFORGE_STORAGE_KEY,
            JSON.stringify(names)
        );

        return true;

    }

    catch(error){

        console.error(
            "NameForge Storage Error:",
            error
        );

        return false;

    }

}


/* =========================================
   FIND NAME
========================================= */

function findSavedName(name){

    const names =
        getSavedNames();

    return names.find(
        item => item.name === name
    );

}


/* =========================================
   CREATE NAME ENTRY
========================================= */

function createNameEntry(
    name,
    generator,
    style
){

    return {

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2,9),

        name:name,

        generator:
            generator || "unknown",

        style:
            style || "",

        saved:false,

        liked:false,

        note:"",

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================
   SAVE NAME
========================================= */

function saveName(
    name,
    generator,
    style
){

    const names =
        getSavedNames();


    let existing =
        names.find(
            item => item.name === name
        );


    /*
     * If the name already exists,
     * simply mark it as saved.
     */

    if(existing){

        existing.saved = true;

        if(generator){

            existing.generator =
                generator;

        }

        if(style){

            existing.style =
                style;

        }

        saveAllNames(names);

        return existing;

    }


    /*
     * Create a new saved entry.
     */

    const newName =
        createNameEntry(
            name,
            generator,
            style
        );


    newName.saved = true;


    names.unshift(newName);

    saveAllNames(names);

    return newName;

}


/* =========================================
   UNSAVE NAME
========================================= */

function unsaveName(name){

    const names =
        getSavedNames();


    const existing =
        names.find(
            item => item.name === name
        );


    if(!existing){

        return false;

    }


    /*
     * Only remove the Saved status.
     *
     * The Like and Note remain.
     */

    existing.saved = false;


    /*
     * If the name is no longer saved,
     * liked and has no note, there is
     * no reason to keep it in storage.
     */

    if(
        existing.liked !== true &&
        (!existing.note ||
         existing.note.trim() === "")
    ){

        const filtered =
            names.filter(
                item => item.name !== name
            );

        saveAllNames(filtered);

        return true;

    }


    saveAllNames(names);

    return true;

}


/* =========================================
   LIKE / UNLIKE NAME
========================================= */

function likeName(
    name,
    generator,
    style
){

    const names =
        getSavedNames();


    let existing =
        names.find(
            item => item.name === name
        );


    /*
     * IMPORTANT:
     *
     * Liking a name does NOT automatically
     * save it anymore.
     */

    if(!existing){

        existing =
            createNameEntry(
                name,
                generator,
                style
            );


        existing.liked = true;


        names.unshift(existing);

    }

    else{

        existing.liked =
            !existing.liked;

    }


    /*
     * If the user unlikes a name and it is
     * neither saved nor has a note anymore,
     * remove it completely.
     */

    if(
        existing.liked !== true &&
        existing.saved !== true &&
        (!existing.note ||
         existing.note.trim() === "")
    ){

        const filtered =
            names.filter(
                item => item.name !== name
            );

        saveAllNames(filtered);

        return null;

    }


    saveAllNames(names);

    return existing;

}


/* =========================================
   UPDATE NOTE
========================================= */

function updateNameNote(
    name,
    note
){

    const names =
        getSavedNames();


    let existing =
        names.find(
            item => item.name === name
        );


    /*
     * If the name doesn't exist,
     * create it without automatically
     * marking it as saved.
     */

    if(!existing){

        existing =
            createNameEntry(
                name,
                "unknown",
                ""
            );

        names.unshift(existing);

    }


    existing.note =
        String(note || "").trim();


    /*
     * If the entry has no saved status,
     * no like and no note, remove it.
     */

    if(
        existing.saved !== true &&
        existing.liked !== true &&
        existing.note === ""
    ){

        const filtered =
            names.filter(
                item => item.name !== name
            );

        saveAllNames(filtered);

        return true;

    }


    saveAllNames(names);

    return true;

}


/* =========================================
   REMOVE NAME COMPLETELY
========================================= */

function removeSavedName(name){

    const names =
        getSavedNames()
            .filter(
                item => item.name !== name
            );


    saveAllNames(names);

}


/* =========================================
   IS SAVED?
========================================= */

function isNameSaved(name){

    const existing =
        findSavedName(name);


    return existing
        ? existing.saved === true
        : false;

}


/* =========================================
   IS LIKED?
========================================= */

function isNameLiked(name){

    const existing =
        findSavedName(name);


    return existing
        ? existing.liked === true
        : false;

}


/* =========================================
   GET SAVED NAMES
========================================= */

function getOnlySavedNames(){

    return getSavedNames()
        .filter(
            item => item.saved === true
        );

}


/* =========================================
   GET LIKED NAMES
========================================= */

function getLikedNames(){

    return getSavedNames()
        .filter(
            item => item.liked === true
        );

}


/* =========================================
   GET NAMES WITH NOTES
========================================= */

function getNamesWithNotes(){

    return getSavedNames()
        .filter(
            item =>
                item.note &&
                item.note.trim() !== ""
        );

}


/* =========================================
   CLEAR EVERYTHING
========================================= */

function clearNameForgeStorage(){

    localStorage.removeItem(
        NAMEFORGE_STORAGE_KEY
    );

}
```
