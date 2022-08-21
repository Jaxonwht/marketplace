import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import style from "./style.module.css";
import { request } from "../../utils/request";
import { getUser, saveUser } from "../../utils/storage";
import intl from "react-intl-universal";

export default function LoginForm(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onFinish = async (values: any) => {
    console.log("Received values of form: ", values);
    saveUser(values);

    message.success("Signin success");

    window.location.href = "/";
  };
  return (
    <div className={style.container}>
      <div className={style.caption}>{intl.get("signInTitle")}</div>
      <Form
        name="normal_login"
        className={style.siginWrapper}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your email!",
            },
          ]}
        >
          <input autoComplete="false" placeholder={intl.get("Email")} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <input
            type="password"
            autoComplete="false"
            placeholder={intl.get("Password")}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <button className="button">Signin</button>
        </Form.Item>
      </Form>
      <div className={style.tail}>
        {" "}
        no account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  login: PropTypes.func,
};
