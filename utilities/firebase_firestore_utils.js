//firebase admin firestore
var admin = require("firebase-admin");
var firestore = require("firebase-admin/firestore");
// Load the full build.
var _ = require('lodash');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "spotify-listen-along",
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
    })
}
);

const db = firestore.getFirestore();

//firestore create listening party
async function createFirestoreParty(host_prof, party_id) {
    return await new Promise((resolve, reject) => {
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
                console.log("Document found, cool");
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
    return new Promise(async (resolve, reject) => {
        getFirestoreParty(party_id).then(async function (party) {
            if (await containsObject(user_prof, party) === false && !_.isEqual(user_prof, party.host)) {
                db.collection("active_party").doc(party_id).update({
                    members: firestore.FieldValue.arrayUnion(user_prof)
                }).then(function () {
                    console.log("Document successfully written!");
                    console.log(user_prof, party.host);
                    resolve(true)
                }).catch(function (error) {
                    console.error("Error writing document: ", error);
                    reject(false)
                });
            }
            else {
                console.log("User already in party!");
                reject("User already in party");
            }
        })
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

//lodash contains object function
async function containsObject(obj, party) {
    return new Promise((resolve, reject) => {
        resolve(_.some(party.members, obj));
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
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