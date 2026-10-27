import axios from "axios";
import { useState } from "react";

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    console.log("doRequest props:", props);
    try {
      setErrors(null);
      const response = await axios[method](url, {...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      const requestErrors = err.response?.data?.errors;
      if (requestErrors) {
        setErrors(
          <div className="alert alert-danger">
            <h4>Ooops....</h4>
            <ul className="my-0">
              {requestErrors.map((x, index) => (
                <li key={index} style={{ color: "red" }}>
                  {x.message}
                </li>
              ))}
            </ul>
          </div>,
        );
      } else {
        console.error("Request failed:", err);

        setErrors(
          <div className="alert alert-danger">
            Something went wrong. Please try again.
          </div>,
        );
      }
    }
  };

  return { doRequest, errors };
};
