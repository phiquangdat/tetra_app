import React, { useState, useEffect } from "react";
import { GetAPITest } from "../api/http";

const EndpointTesting: React.FC = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await GetAPITest();
        setData(resData);
        console.log("Response data:", resData);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Endpoint Testing</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default EndpointTesting;
