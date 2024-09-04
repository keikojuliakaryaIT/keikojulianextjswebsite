import { firebase_app } from "./config";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadString,
} from "firebase/storage";

const storage = getStorage(firebase_app);
export default async function uploadFoto(
  colllection: string,
  filename: any,
  files: string
) {
  let result = null;
  let error = null;

  try {
    const reference = ref(storage, colllection + "/" + filename);
    await uploadString(reference, files, "data_url").then(async (snapshot) => {
      await getDownloadURL(snapshot.ref).then((downloadURL) => {
        result = downloadURL;
        // console.log("download url ", downloadURL);
      });
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}
