export const post = async (url: string, body: object | undefined) => {
  return await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
