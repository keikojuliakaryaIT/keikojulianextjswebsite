import { getAuth } from "firebase/auth";
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
  let user = getAuth().currentUser?.email;
  let datas = {...data};
  datas.email = user;
  const docRef = doc(db, colllection, id);
  try {
    result = await updateDoc(docRef, datas);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
