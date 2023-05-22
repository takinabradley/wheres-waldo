import app from "./firebaseApp"
import { getFirestore, doc, getDoc } from "firebase/firestore"

const db = getFirestore(app)

const characterListDoc = doc(db, "characters/characterList")

async function readCharacterList() {
  const snapshot = await getDoc(characterListDoc)
  if (snapshot.exists()) {
    return snapshot.data()
  }
}
export { readCharacterList }
