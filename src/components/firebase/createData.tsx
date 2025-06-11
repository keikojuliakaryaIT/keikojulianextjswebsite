import { getAuth } from "firebase/auth";
import { app } from "./config";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = getFirestore(app);
export default async function createData(colllection: string, data: any) {
  let result = null;
  let error = null;
  let user = getAuth().currentUser?.email;
  let datas = {...data};
  datas.email = user;
  datas.createdAt = new Date();
  try {
    result = await addDoc(collection(db, colllection), datas);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
