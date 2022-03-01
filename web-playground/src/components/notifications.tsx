import React, { useState, useEffect } from "react";
import { useTheme } from "styled-components";
import { useNotifications } from "@usedapp/core";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notifications = () => {
  const [pastNotifications, setPastNotifications] = useState<string[]>([]);
  const { notifications } = useNotifications();
  const theme = useTheme();
  useEffect(() => {
    const notified = [];
    for (const { type, id } of notifications) {
      console.log(type, id)
      const msg =
        type === "walletConnected"
          ? "Welcome, wallet connected!"
          : type === "transactionSucceed"
          ? "Yeah! Transaction succeeded."
          : type === "transactionFailed"
          ? "Oops... Transaction failed."
          : undefined;
      if (msg && !pastNotifications.includes(id)) {
        toast(msg, {
          toastId: id,
          position: toast.POSITION.TOP_CENTER,
          autoClose: 750,
          style: {
            background: theme.primaryBlue,
            color: theme.whiteBackground,
          },
          draggable: false,
          hideProgressBar: true,
        });
        notified.push(id);
      }
    }
    setPastNotifications(pastNotifications.concat(notified));
  }, [notifications]);
  return <ToastContainer />;
};

export default Notifications;
