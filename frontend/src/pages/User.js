import React from "react";
import { Button } from "antd";

// Можно также получать из localStorage любые другие поля, которые вы сохраняете после логина
export default function UserInfo() {
    const userLogin = localStorage.getItem("userLogin");
    const userFirstName = localStorage.getItem("userFirstName");
    const userLastName = localStorage.getItem("userLastName");

    if (!userLogin) return null; // Если пользователь не вошёл, ничего не показываем

    return (
        <div style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 16
        }}>
            <span style={{ marginRight: 8 }}>
                Вы вошли как: <b>{userFirstName} {userLastName}</b> ({userLogin})
            </span>
            <Button
                type="link"
                danger
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                }}
            >
                Выйти
            </Button>
        </div>
    );
}
