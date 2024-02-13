<script lang="ts">
  import { goto } from "$app/navigation";
  import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

  // TODO: check passkeys are supported
  // TODO: get better error messages back from server and log them, displaying something to the user

  const post = async (url: string, body: object | undefined) => {
    return await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  const createAccount = async () => {
    const beginResponse = await post("/api/auth/begin-registration", { userName: "Jack" });
    if (!beginResponse.ok) {
      console.error(beginResponse);
      return;
    }

    const registrationOptions = await beginResponse.json();
    const registration = await startRegistration(registrationOptions);

    const verificationResponse = await post("/api/auth/complete-registration", registration);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      console.error(verificationResponse);
    }
  }

  const login = async () => {
    const beginResponse = await post("/api/auth/begin-authentication", undefined);
    if (!beginResponse.ok) {
      console.error(beginResponse);
      return;
    }

    const authenticationOptions = await beginResponse.json();
    const authentication = await startAuthentication(authenticationOptions);

    const verificationResponse = await post("/api/auth/complete-authentication", authentication);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      console.error(verificationResponse);
    }
  }
</script>

<h1>Login</h1>

<button on:click={createAccount}>
  Create account
</button>

<button on:click={login}>
  Log in
</button>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }
</style>