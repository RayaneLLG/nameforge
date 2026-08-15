```javascript
/* =========================================
   NAMEFORGE LOCAL STORAGE SYSTEM
   ========================================= */

const NAMEFORGE_STORAGE_KEY = "nameforge_saved_names";


/* =========================================
   GET SAVED NAMES
   ========================================= */

function getSavedNames() {

    try {

        const data =
            localStorage.getItem(
                NAMEFORGE_STORAGE_KEY
            );

        if (!data) {
            return [];
        }

        const names = JSON.parse(data);

        return Array.isArray(names)
            ? names
            : [];

    }

    catch (error) {

        console.error(
            "NameForge storage error:",
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

    }

    catch (error) {

        console.error(
            "NameForge save error:",
            error
        );

        return false;

    }

}


/* =========================================
   SAVE A NAME
   ========================================= */

function saveName(data) {

    const names =
        getSavedNames();


    /* Avoid duplicate names */

    const alreadySaved =
        names.some(
            item =>
                item.name === data.name &&
                item.generator === data.generator
        );


    if (alreadySaved) {

        return false;

    }


    const newName = {

        id:
            Date.now().toString()
            + "-"
            + Math.random()
                .toString(36)
                .substring(2,9),

        name:
            data.name || "Unnamed",

        generator:
            data.generator || "Unknown",

        style:
            data.style || "",

        length:
            data.length || "",

        description:
            data.description || "",

        bestFor:
            data.bestFor || "",

        favorite:
            false,

        note:
            "",

        savedAt:
            new Date().toISOString()

    };


    names.unshift(newName);


    return saveAllNames(names);

}


/* =========================================
   DELETE A NAME
   ========================================= */

function deleteSavedName(id) {

    const names =
        getSavedNames();


    const filtered =
        names.filter(
            item =>
                item.id !== id
        );


    return saveAllNames(filtered);

}


/* =========================================
   TOGGLE FAVORITE
   ========================================= */

function toggleFavorite(id) {

    const names =
        getSavedNames();


    const item =
        names.find(
            name =>
                name.id === id
        );


    if (!item) {

        return false;

    }


    item.favorite =
        !item.favorite;


    return saveAllNames(names);

}


/* =========================================
   UPDATE NOTE
   ========================================= */

function updateNote(id, note) {

    const names =
        getSavedNames();


    const item =
        names.find(
            name =>
                name.id === id
        );


    if (!item) {

        return false;

    }


    item.note =
        note;


    return saveAllNames(names);

}


/* =========================================
   CHECK IF NAME IS SAVED
   ========================================= */

function isNameSaved(name, generator) {

    const names =
        getSavedNames();


    return names.some(
        item =>
            item.name === name &&
            item.generator === generator
    );

}


/* =========================================
   GET ONE NAME
   ========================================= */

function getSavedName(id) {

    const names =
        getSavedNames();


    return names.find(
        item =>
            item.id === id
    ) || null;

}


/* =========================================
   CLEAR EVERYTHING
   ========================================= */

function clearAllSavedNames() {

    localStorage.removeItem(
        NAMEFORGE_STORAGE_KEY
    );

}


/* =========================================
   EXPORT DATA
   ========================================= */

function exportSavedNames() {

    const names =
        getSavedNames();


    const data =
        JSON.stringify(
            names,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "nameforge-saved-names.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================
   IMPORT DATA
   ========================================= */

function importSavedNames(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    try {

                        const imported =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !Array.isArray(
                                imported
                            )
                        ) {

                            reject(
                                "Invalid NameForge file."
                            );

                            return;

                        }


                        saveAllNames(
                            imported
                        );


                        resolve(
                            imported
                        );

                    }

                    catch {

                        reject(
                            "Could not read the file."
                        );

                    }

                };


            reader.onerror =
                function() {

                    reject(
                        "Could not read the file."
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}
```
