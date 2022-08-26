import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { useAppDispatch } from "../../store/hooks";
import { removeCredentialsIfDev } from "../../utils/storage";

const CryptoSignOut = () => {
  const dispatch = useAppDispatch();

  const signOut = async () => {
    removeCredentialsIfDev();
    await dispatch(refreshSignInStatus);
  };

  return (
    <button className="button" onClick={signOut}>
      Sign out
    </button>
  );
};

export default CryptoSignOut;
