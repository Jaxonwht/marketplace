import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Radio, Checkbox, Upload } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SmileOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import style from "./style.module.css";
import { request } from "../../utils/request";
import intl from "react-intl-universal";

const Signup = (props: any) => {
  const [email, setEmail] = useState("");
  const [type, setType] = useState(1);

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [admin, setAdmin] = useState(false);
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onFinish = async (values: any) => {
    console.log("Received values of form: ", values);

    // let res = await request(
    //   '/v2/nft/signUp',
    //   {
    //     username: values.email,
    //     password: values.password,
    //     exchange: "DEMO",
    //     userAttributes: [
    //       {
    //         name: "custom:given_name",
    //         value: values.firstName
    //       },
    //       {
    //         name: "custom:surname",
    //         value: values.lastName
    //       }
    //     ]
    //   },
    //   'post',
    // )
    // if (res && res.result) {
    //   message.success("please validate your code");
    //   navigate("/");
    // } else {
    //   message.error(res.message);
    // }
  };

  return (
    <div className={style.container}>
      <div className={style.caption}>{intl.get("createYourAccount")}</div>
      <Form
        name="normal_register"
        layout="vertical"
        className={style.signupWrapper}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <div className={style.descfont}>
          {intl.get("RequiredFiledsHaveAnAsterisk")}:*
        </div>
        <div className={style.row}>
          <Form.Item
            label={intl.get("FirstName")}
            style={{ flex: 1, marginRight: 30 }}
            required={true}
            name="firstName"
            rules={[
              {
                required: true,
                message: "Please input your first name!",
              },
            ]}
          >
            <input placeholder={intl.get("FirstName")} />
          </Form.Item>

          <Form.Item
            label={intl.get("LastName")}
            name="lastName"
            style={{ flex: 1 }}
            required={true}
            rules={[
              {
                required: true,
                message: "Please input your last name!",
              },
            ]}
          >
            <input placeholder={intl.get("LastName")} />
          </Form.Item>
        </div>

        <Form.Item
          label={intl.get("Email")}
          name="email"
          required={true}
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input your email!",
            },
          ]}
        >
          <input placeholder={intl.get("Email")} />
        </Form.Item>

        <Form.Item
          label={intl.get("Password")}
          name="password"
          required={true}
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <input type="password" placeholder="Password" />
        </Form.Item>

        <Form.Item style={{ marginTop: 10 }}>
          <button className="button">{intl.get("signup")}</button>
        </Form.Item>
      </Form>
      <div className={style.tailfont}>
        {" "}
        {intl.get("home.already")}?{" "}
        <Link to="/signin">{intl.get("home.loginHere")}</Link>
      </div>
      <div className={style.tailfont}>
        {intl.get("home.needMerchant")}?
        <a
          href="https://otc.aissigateway.exchange/register"
          target="new"
          style={{ marginLeft: 10 }}
        >
          {intl.get("home.signupHere")}
        </a>
      </div>
    </div>
  );
};

export default Signup;
