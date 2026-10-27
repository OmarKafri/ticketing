import { useState } from "react";
import axios from "axios";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

export default function SharedForm({finalRoute}){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: `/api/users/${finalRoute}`,
    body: { email, password },
    method: "post",
    onSuccess: () => Router.push("/"),
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    doRequest();
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label> Email Address:</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label> Password:</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">{finalRoute}</button>
      </form>
    </div>
  );
};
