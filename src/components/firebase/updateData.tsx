import { firebase_app } from "./config";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore(firebase_app);
export default async function updateData(
  colllection: string,
  id: string,
  data: any
) {
  let result: any = null;
  let error: any = null;
  const docRef = doc(db, colllection, id);
  try {
    result = await updateDoc(docRef, data);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
