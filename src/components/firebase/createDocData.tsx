import { firebase_app } from "./config";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore(firebase_app);
export default async function createDocData(
  colllection: string,
  id: string,
  data: any
) {
  let result = null;
  let error = null;
  let user = getAuth().currentUser?.email;
  let datas = { ...data };
  datas.email = user;
  datas.createdAt = new Date();

  try {
    result = await setDoc(doc(db, colllection, id), datas, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}
