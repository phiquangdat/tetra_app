export async function GetAPITest(): Promise<any> {
  try {
    const response = await fetch("http://localhost:8080/api/modules");
    const resData = await response.json();

    if (!response.ok) throw new Error("Failed to fetch database");

    return resData;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching transactions:", error.message);
    } else {
      console.error("Unknown error fetching transactions", error);
    }
    return [];
  }
}
