import firebase from "firebase";
import "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDbfPKa7WEhf3JGaO6ST2SCC7kB_aQ0R-o",
    authDomain: "formtest-b9e0d.firebaseapp.com",
    databaseURL: "https://formtest-b9e0d.firebaseio.com",
    projectId: "formtest-b9e0d",
    storageBucket: "formtest-b9e0d.appspot.com",
    messagingSenderId: "481731408050",
    appId: "1:481731408050:web:3079a8ed3269b4cc37d9ab",
    measurementId: "G-J5EQ2GTJRG"
  };
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const db = firebaseApp.firestore();
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  export {db, auth, provider};