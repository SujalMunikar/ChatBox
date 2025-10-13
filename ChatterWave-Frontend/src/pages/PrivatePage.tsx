import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { increment } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import Button from "../components/UI/Button/Button";
import api from "../config/axiosConfig";
import { UserType } from "../Types/user.type";
import useAuth from "../hooks/useAuth";

function PrivatePage() {
  const authSlice = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { authState } = useAuth();
  const [data, setData] = useState<Array<UserType> | null>(null);
  console.log(authSlice);

  const callApi = async () => {
    try {
      const req = await api.get("http://localhost:8000/user");

      setData(req?.data?.data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   callApi();
  // }, []);

  return (
    <div>
      This is Private page{" "}
      <button type="button" onClick={() => dispatch(increment())}>
        CLICK ME
      </button>
      <code>{JSON.stringify(authSlice)}</code>
      <Button text="GET DATA" onClick={callApi} />
      <Button text="Clear DATA" onClick={() => setData(null)} />
      {/* <code>{JSON.stringify(data)}</code> */}
      <div className=" grid gap-5 grid-cols-4 w-[1200px]  m-auto mt-5">
        {data?.map((item: UserType) => {
          return (
            <div
              className={`${
                authState.user.id === item.id ? "bg-green-400" : "bg-slate-300"
              } shadow-2xl p-5 flex-1 mb-4`}
            >
              <div className="text-[8px]">{item.id}</div>
              <div>{item.name}</div>
              <div>{item.email}</div>
              <div>{item.verified ? "TRUE" : "FALSE"}</div>
              <div>{item.createdAt}</div>
              <div>{item.updatedAt}</div>
            </div>
          );
        })}
        {}
      </div>
    </div>
  );
}

export default PrivatePage;
