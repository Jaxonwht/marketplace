import { Button } from "antd";
import { refreshSignInStatus } from "../../reduxSlices/identitySlice";
import { useAppDispatch } from "../../store/hooks";
import { authenticatedAxiosInstance } from "../../utils/network";
import { removeCredentialsIfDev } from "../../utils/storage";

const CryptoSignOut = () => {
  const dispatch = useAppDispatch();

  const handleClick = async () => {
    removeCredentialsIfDev();
    try {
      await authenticatedAxiosInstance().post("/auth/sign-out");
    } catch (e) {
      console.error(e);
    }
    await dispatch(refreshSignInStatus);
  };

  return (
    <Button onClick={handleClick} type="primary">
      Sign out
    </Button>
  );
};

export default CryptoSignOut;
