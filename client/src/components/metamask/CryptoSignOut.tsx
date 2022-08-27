import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { useAppDispatch } from "../../store/hooks";
import { authenticatedAxiosInstance } from "../../utils/network";
import { removeCredentialsIfDev } from "../../utils/storage";

const CryptoSignOut = () => {
  const dispatch = useAppDispatch();

  const signOut = async () => {
    removeCredentialsIfDev();
    try {
      await authenticatedAxiosInstance().post("/auth/sign-out");
    } catch (e) {
      console.error(e);
    }
    await dispatch(refreshSignInStatus);
  };

  return (
    <button className="button" onClick={signOut}>
      Sign out
    </button>
  );
};

export default CryptoSignOut;
