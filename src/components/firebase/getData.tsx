import { firebase_app } from "./config";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);
export default async function getData(collection: string, id: string) {
  let docRef = doc(db, collection, id);

  let result = null;
  let error = null;

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      result = docSnap.data();
    } else {
      // docSnap.data() will be undefined in this case
      error = "Data Tidak Di Temukan";
    }
  } catch (e) {
    error = e;
  }

  return { result, error };
}
