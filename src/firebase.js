import firebase from 'firebase'

const firebaseApp = firebase.initializeApp({
    apiKey: 'AIzaSyCJEx2Mjr6LhgTZJ5Mli8a0QpPNe9oeH2U',
    authDomain: 'blackjack-dc274.firebaseapp.com',
    databaseURL: 'https://blackjack-dc274.firebaseio.com',
    projectId: 'blackjack-dc274',
    storageBucket: 'blackjack-dc274.appspot.com',
    messagingSenderId: '789338368096',
    appId: '1:789338368096:web:85e14e83e70389f544bb05'
})

const db = firebaseApp.firestore()

export { db }
