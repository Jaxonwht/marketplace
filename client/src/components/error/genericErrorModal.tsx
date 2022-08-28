import { Modal } from "antd";
import ReactJson from "@textea/json-viewer";

export const genericErrorModal = (title: string, error: any) => {
  if (error.response) {
    return Modal.error({
      title: title,
      content: (
        <ReactJson
          displayDataTypes={false}
          displayObjectSize={false}
          name={false}
          src={{
            data: error.response.data,
            status: error.response.status,
            request: error.response.request,
          }}
        />
      ),
    });
  } else {
    return Modal.error({
      title: title,
      content: <div>{error.message}</div>,
    });
  }
};
