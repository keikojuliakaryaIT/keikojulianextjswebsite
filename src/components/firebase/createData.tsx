import { app } from "./config";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore(app);
export default async function createData(colllection: string, data: any) {
  let result = null;
  let error = null;

  try {
    result = await addDoc(collection(db, colllection), data);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
