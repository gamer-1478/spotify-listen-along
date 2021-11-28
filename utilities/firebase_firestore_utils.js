//firebase admin firestore
var admin = require("firebase-admin");
var serviceAccount = require("./service_account.json");
var firestore = require("firebase-admin/firestore");
const cons = require("consolidate");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = firestore.getFirestore();

//firestore create listening party
async function createFirestoreParty(host_prof, party_id) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).set({
            host: host_prof
        }).then(function () {
            console.log("Party with host succesfully started!");
            resolve(true)
        }).catch(function (error) {
            console.error("Error starting party with host: ", error);
            reject(false)
        });
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

async function getFirestoreParty(party_id) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).get().then(function (doc) {
            if (doc.exists) {
                console.log("Document data:");
                resolve(doc.data())
            } else {
                console.log("No such document!");
                reject(false)
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
            reject(error)
        });
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

async function joinFirestoreParty(party_id, user_prof) {
    return new Promise((resolve, reject) => {
        getFirestoreParty(party_id).then(function (party) {
            if (containsObject(user_prof, party) === false && user_prof !== party.host) {
                db.collection("active_party").doc(party_id).update({
                    members: firestore.FieldValue.arrayUnion(user_prof)
                }).then(function () {
                    console.log("Document successfully written!");
                    resolve(true)
                }).catch(function (error) {
                    console.error("Error writing document: ", error);
                    reject(false)
                });
            }
            else {
                reject("User already in party");
            }
        })
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

async function leaveFirestoreParty(party_id, user_prof) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).update({
            members: firestore.FieldValue.arrayRemove(user_prof)
        }).then(function () {
            console.log("Document successfully written!");
            resolve(true)
        }).catch(function (error) {
            console.error("Error writing document: ", error);
            reject(false)
        });
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

async function deleteFirestoreParty(party_id, email) {
    return new Promise(async (resolve, reject) => {
        await getFirestoreParty(party_id).then(function (party) {
            if (email === party.host.emails[0].value || true) {
                db.collection("active_party").doc(party_id).delete().then(function () {
                    console.log("Document successfully deleted!");
                    resolve(true)
                }).catch(function (error) {
                    console.error("Error removing document: ", error);
                    reject(false)
                });
            } else {
                reject(email)
            }
        })
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

const firestore_utils = {
    createFirestoreParty,
    getFirestoreParty,
    joinFirestoreParty,
    leaveFirestoreParty,
    deleteFirestoreParty
}

module.exports = firestore_utils;