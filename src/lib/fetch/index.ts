export const postJson = async (url: string, body: object) => {
  return await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export const post = async (url: string) => {
  return await fetch(url, {
    method: "post",
    headers: {
      "Accept": "application/json",
    },
  });
}

export const readError = async (response: Response, defaultError: string = "Unspecified error") => {
  if (response.ok) {
    throw Error("Response does not have error.");
  }

  if (response.headers.get("Content-Type") === "application/json") {
    const body = await response.json();
    return body.message ?? defaultError;
  }

  return defaultError;
}