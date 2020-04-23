const syncToFirebase = () => {
    db.collection('games')
        .doc(GAME_ID)
        .set({ state: state })
        .then(() =>
            console.log(
                'Firebase state successfully synced! Current player is',
                state.currentPlayerIndex
            )
        )
        .catch(error => console.error('Error syncing to Firebase: ', error))
}

const syncFromFirebase = () => {
    db.collection('games')
        .doc(GAME_ID)
        .get()
        .then(res => {
            console.log('syncing FROM firebase data', res.data())
            dispatch({ type: 'UPDATE_STATE', payload: res.data() })
        })
}
