import { useState } from "react";

interface UserData {
  email: string;
  options: string;
  walletaddress: string;
}

interface FetchResponse {
  loading: boolean;
  error: Error | null;
  data: any;
}

export const useRelationalDB = () => {
  const [fetchResponse, setFetchResponse] = useState<FetchResponse>({
    loading: false,
    error: null,
    data: null,
  });

  const createUser = async (userData: UserData) => {
    setFetchResponse({ loading: true, error: null, data: null });
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      setFetchResponse({ loading: false, error: null, data: result });
    } catch (err) {
      setFetchResponse({ loading: false, error: err as Error, data: null });
    }
  };

  const getUser = async (walletaddress: string) => {
    setFetchResponse({ loading: true, error: null, data: null });
    try {
      const response = await fetch(`http://localhost:3000/api/users?walletaddress=${walletaddress}`);
      const result = await response.json();
      setFetchResponse({ loading: false, error: null, data: result });
      return result;
    } catch (err) {
      setFetchResponse({ loading: false, error: err as Error, data: null });
    }
  };

  const updateUser = async (walletaddress: string, userData: UserData) => {
    setFetchResponse({ loading: true, error: null, data: null });
    try {
      const response = await fetch(`http://localhost:3000/api/users/${walletaddress}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      setFetchResponse({ loading: false, error: null, data: result });
    } catch (err) {
      setFetchResponse({ loading: false, error: err as Error, data: null });
    }
  };

  return { ...fetchResponse, createUser, getUser, updateUser };
};
