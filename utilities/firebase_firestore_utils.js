//firebase admin firestore
var admin = require("firebase-admin");
var serviceAccount = require("./service_account.json");
var firestore = require("firebase-admin/firestore");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = firestore.getFirestore();

const docref = db.collection("users").doc("alovelace").set({
    first: "Ada",
    last: "Lovelace",
    born: 1815
})

docref.then(function () {
    console.log("Document successfully written!");
})

//firestore create listening party
async function createFirestoreParty(host_prof, party_id) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).set({
            host: host_prof
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

async function getFirestoreParty(party_id) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).get().then(function (doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data());
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
        db.collection("active_party").doc(party_id).update({
            members: firestore.FieldValue.arrayUnion(user_prof)
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

async function deleteFirestoreParty(party_id) {
    return new Promise((resolve, reject) => {
        db.collection("active_party").doc(party_id).delete().then(function () {
            console.log("Document successfully deleted!");
            resolve(true)
        }).catch(function (error) {
            console.error("Error removing document: ", error);
            reject(false)
        });
    }).then(function (result) {
        return result
    }).catch(function (error) {
        return error
    });
}

const firestore = {
    createFirestoreParty,
    getFirestoreParty,
    joinFirestoreParty,
    leaveFirestoreParty,
    deleteFirestoreParty
}

module.exports = firestore;