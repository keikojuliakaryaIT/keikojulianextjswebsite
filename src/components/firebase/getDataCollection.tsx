import { firebase_app } from "./config";
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";

const db = getFirestore(firebase_app);
export default async function getDataCollection(colllection: string) {
  let result: any = null;
  let error = null;

  try {
    let unsubscribed = false;
    await getDocs(collection(db, colllection))
      .then((querySnapshot) => {
        if (unsubscribed) return; // unsubscribed? do nothing.
        let numbering = 0;
        const datas: any[] = [];
        querySnapshot.docs.map((doc, index) => {
          if (doc.data().visible === false || doc.data() === undefined) {
            return;
          } else {
            numbering += 1;
            datas.push({
              ...doc.data(),
              nomor: numbering.toString(),
              id: doc.id,
            });
          }
        });

        result = datas;
      })
      .catch((err) => {
        if (unsubscribed) return; // unsubscribed? do nothing.

        // TODO: Handle errors
        console.error("Failed to retrieve data", err);
        error = err;
      });
  } catch (e) {
    error = e;
  }

  return { result, error };
}
