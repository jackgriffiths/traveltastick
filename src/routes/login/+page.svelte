<script lang="ts">
  import { goto } from "$app/navigation";
  import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
  import { Alert } from "$lib/components";

  let alert: Alert;
  let accountName: string;

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
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    const beginResponse = await post("/api/auth/begin-registration", { userName: accountName });
    if (!beginResponse.ok) {
      const error = (await beginResponse.json()).message;
      alert.show("Error", error || "Something went wrong. Please try again.");
      return;
    }

    const registrationOptions = await beginResponse.json();
    const registration = await startRegistration(registrationOptions);

    const verificationResponse = await post("/api/auth/complete-registration", registration);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      const error = (await verificationResponse.json()).message;
      alert.show("Error", error || "Something went wrong while creating your account. Please try again.");
    }
  }

  const login = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    const beginResponse = await post("/api/auth/begin-authentication", undefined);
    if (!beginResponse.ok) {
      const error = (await beginResponse.json()).message;
      alert.show("Error", error || "Something went wrong. Please try again.");
      return;
    }

    const authenticationOptions = await beginResponse.json();
    const authentication = await startAuthentication(authenticationOptions);

    const verificationResponse = await post("/api/auth/complete-authentication", authentication);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      const error = (await verificationResponse.json()).message;
      alert.show("Error", error || "Something went wrong while logging you in. Please try again.");
    }
  }
</script>

<svelte:head>
  <title>Login | StickerAlbum</title>
</svelte:head>


<div class="content">
  <h1>StickerAlbum</h1>

  <ul class="features">
    <li>Collect stickers of famous landmarks</li>
    <li>Open a sticker packet every day</li>
    <li>Trade stickers with your friends</li>
  </ul>

  <button on:click={login}>
    Log in
  </button>

  <h2>Don't have an account?</h2>

  <form on:submit={createAccount}>
    <label for="name">Account name</label>
    <input id="name" type="text" bind:value={accountName} required autocomplete="off" />
    <p>You can choose any name you like. The name is only saved on your device and it helps you select the right account when logging in.</p>
    <button type="submit">Create account</button>
  </form>
</div>

<Alert bind:this={alert} />

<style>
  .content {
    margin-inline: auto;
    max-inline-size: 300px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  h1 {
    margin-block-end: 1.5rem;
    font-size: 2rem;
    text-align: center;
  }

  @counter-style features-symbols {
    system: fixed;
    symbols: "🌎" "📆" "🤝";
    suffix: " ";
  }

  .features {
    margin-block-end: 1.5rem;
    list-style-type: features-symbols;
    list-style-position: inside;

    & li:not(:last-of-type) {
      margin-block-end: 0.25em;
    }
  }

  h2 {
    font-size: 1.25rem;
    margin-block-start: 2rem;
    margin-block-end: 1rem;
    text-align: center;
  }

  button {
    inline-size: 100%;
  }

  form {
    inline-size: 100%;

    & > label {
      display: block;
      margin-block-end: 0.25em;
    }

    & > input {
      display: block;
      inline-size: 100%;
    }

    & p {
      margin-block-start: 0.5rem;
      margin-block-end: 1.5rem;
      text-wrap: pretty;
    }
  }
</style>