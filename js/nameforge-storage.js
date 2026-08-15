/* =========================================
   NAMEFORGE STORAGE
   Local favorites, likes and notes
========================================= */

const NAMEFORGE_STORAGE_KEY = "nameforge_saved_names";


/* =========================================
   GET ALL SAVED NAMES
========================================= */

function getSavedNames() {

    try {

        const data =
            localStorage.getItem(
                NAMEFORGE_STORAGE_KEY
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "NameForge Storage Error:",
            error
        );

        return [];

    }

}


/* =========================================
   SAVE ALL NAMES
========================================= */

function saveAllNames(names) {

    try {

        localStorage.setItem(
            NAMEFORGE_STORAGE_KEY,
            JSON.stringify(names)
        );

        return true;

    } catch (error) {

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

function findSavedName(name) {

    const names = getSavedNames();

    return names.find(
        item => item.name === name
    );

}


/* =========================================
   SAVE NAME
========================================= */

function saveName(name, generator, style) {

    const names = getSavedNames();

    const existing =
        names.find(
            item => item.name === name
        );


    if (existing) {

        return existing;

    }


    const newName = {

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 9),

        name: name,

        generator:
            generator || "unknown",

        style:
            style || "",

        liked: false,

        note: "",

        createdAt:
            new Date().toISOString()

    };


    names.unshift(newName);

    saveAllNames(names);

    return newName;

}


/* =========================================
   LIKE NAME
========================================= */

function likeName(name, generator, style) {

    const names = getSavedNames();

    let existing =
        names.find(
            item => item.name === name
        );


    if (!existing) {

        existing =
            saveName(
                name,
                generator,
                style
            );

    }


    existing.liked =
        !existing.liked;


    saveAllNames(names);

    return existing;

}


/* =========================================
   UPDATE NOTE
========================================= */

function updateNameNote(name, note) {

    const names = getSavedNames();

    const existing =
        names.find(
            item => item.name === name
        );


    if (!existing) {

        return false;

    }


    existing.note =
        note.trim();


    saveAllNames(names);

    return true;

}


/* =========================================
   REMOVE NAME
========================================= */

function removeSavedName(name) {

    const names =
        getSavedNames()
            .filter(
                item => item.name !== name
            );


    saveAllNames(names);

}


/* =========================================
   IS LIKED?
========================================= */

function isNameLiked(name) {

    const existing =
        findSavedName(name);


    return existing
        ? existing.liked === true
        : false;

}


/* =========================================
   GET LIKED NAMES
========================================= */

function getLikedNames() {

    return getSavedNames()
        .filter(
            item => item.liked === true
        );

}


/* =========================================
   GET SAVED NAMES WITH NOTES
========================================= */

function getNamesWithNotes() {

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

function clearNameForgeStorage() {

    localStorage.removeItem(
        NAMEFORGE_STORAGE_KEY
    );

}
