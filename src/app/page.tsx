"use client";
import React, { useState } from "react";
import { Checkbox, Input, Button } from "@nextui-org/react";
import signIn from "@/components/firebase/signin";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { firebase_app } from "@/components/firebase/config";
import { toast } from "sonner";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaCheck } from "react-icons/fa";

const auth = getAuth(firebase_app);

// export const AuthContext = React.createContext({});

// export const useAuthContext = () => React.useContext(AuthContext);
type Inputs = {
  email: string;
  password: string;
};

function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loaded, setloaded] = useState(false);
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  // const toggleVisibility = () => setIsVisible(!isVisible);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // return router.push("/dashboard");
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const submitsignIn = async () => {
    setloaded(true);
    const { result, error } = await signIn(email, password);
    // console.log("error ", error);
    if (error) {
      setloaded(false);
      // return console.log("error ", error);
      return toast("ERROR, Please Try Again !");
    }

    setloaded(false);
    toast("Success, Welcome");
    // else successful
    return router.push("/dashboard/home");
  };

  if (loading) {
    return <div className="bg-white">Loading</div>;
  } else {
    return (
      <div className="flex flex-col justify-center min-h-screen w-100v items-center p-5">
        {/* <div className="flex md:w-3/4">
          <Image
            alt="Login"
            src="/login.png"
            radius="none"
            removeWrapper={true}
            width={"100%"}
          />
        </div> */}
        <div className="flex flex-col px-10">
          <div className="flex flex-col items-center ">
            {/* <Image alt="Logo" src="/logopuskesmas.png" radius="none" /> */}
            <div>Login untuk melanjutkan</div>
          </div>
          <div className="flex flex-col mt-6 px-8 ">
            {/* <Input
              // classNames={{ base: "light" }}
              type="email"
              name="email"
              label="Email"
              onValueChange={setEmail}
              value={email}
							fullWidth={false}
							labelPlacement="outside"
							classNames={{input:'bg-black'}}
            /> */}
            <h2>Email</h2>
            <input onChange={(item) => setEmail(item.target.value)} />
            <h2>Password</h2>
            <input
              onChange={(item) => setPassword(item.target.value)}
              type={isVisible ? "text" : "password"}
            />
            {/* <Input
              classNames={{ base: "light" }}
              label="Password"
              name="password"
              // placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              className="mb-5 mt-2 bg-white rounded-xl"
              onValueChange={setPassword}
              value={password}
							labelPlacement="outside"
            /> */}
            <Checkbox
              isSelected={isVisible}
              onValueChange={setIsVisible}
              classNames={{ icon: "text-black bg-white" }}
              icon={<FaCheck className="bg-black " />}
              size="lg"
            >
              Show Password
            </Checkbox>
            <Button
              className="mt-5 bg-ungu text-white p-3"
              onPress={submitsignIn}
              isLoading={loaded}
              id="submit"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
