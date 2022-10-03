// components/layout.js
import React, { useState } from "react";
import styles from "./index.module.css";
import menus from "../../config/menus";
import { useNavigate } from "react-router-dom";
import { Typography } from "antd";
import intl from "react-intl-universal";

export default function Layout(props: any) {
  const navigate = useNavigate();
  const [selectMenu, setSelectMenu] = useState(menus[0]);
  const { Text } = Typography;

  return (
    <div className={styles.menu}>
      {menus.map((item, i) => (
        <div
          onClick={() => {
            setSelectMenu(item);
            navigate(item.path);
            if (props.clickItem) {
              props.clickItem(item);
            }
          }}
          key={i}
        >
          <div
            className={`${styles.menuItem} ${
              item.children && item.children.length > 0 ? styles.arrowDown : ""
            }`}
          >
            <div
              className={`${styles.menuItemName} ${
                selectMenu === item ? styles.selectMenuItemName : ""
              }`}
            >
              <Text>{item.name}</Text>
            </div>
            {item.children && item.children.length > 0 ? (
              <div className={styles.menuChildren}>
                {item.children.map((it: any, j) => (
                  <div
                    key={j}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectMenu(it);
                      navigate(it.path);
                    }}
                    className={`${styles.menuChildrenItem}`}
                  >
                    {intl.get(it.name)}
                  </div>
                ))}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
