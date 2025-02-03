import { initializeApp } from "firebase-admin/app";
import admin = require("firebase-admin");

export const firebaseApp = initializeApp();
export const database = admin.firestore();
export const auth = admin.auth();
