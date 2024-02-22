<script lang="ts">
  import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { Alert } from "$lib/components";
  import { post, postJson, readError } from "$lib/fetch";

  let alert: Alert;
  let accountName: string;

  const createAccount = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    const beginResponse = await postJson("/api/auth/begin-registration", { userName: accountName });
    if (!beginResponse.ok) {
      alert.show("Error", await readError(beginResponse, "Something went wrong. Please try again."));
      return;
    }

    const registrationOptions = await beginResponse.json();
    const registration = await startRegistration(registrationOptions);

    const verificationResponse = await postJson("/api/auth/complete-registration", registration);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      alert.show("Error", await readError(verificationResponse, "Something went wrong while creating your account. Please try again."));
    }
  }

  const login = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    const beginResponse = await post("/api/auth/begin-authentication");
    if (!beginResponse.ok) {
      alert.show("Error", await readError(beginResponse, "Something went wrong. Please try again."));
      return;
    }

    const authenticationOptions = await beginResponse.json();
    const authentication = await startAuthentication(authenticationOptions);

    const verificationResponse = await postJson("/api/auth/complete-authentication", authentication);

    if (verificationResponse.ok) {
      goto("/", { replaceState: true });
    } else {
      alert.show("Error", await readError(verificationResponse, "Something went wrong while logging you in. Please try again."));
    }
  }
</script>

<svelte:head>
  <title>Login | Traveltastick</title>
</svelte:head>


<div class="content">
  <h1>Traveltastick</h1>

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
    <p>You can choose any name you like - it doesn't need to be unique. The name is only saved on your device and it helps you select the right account when logging in.</p>
    <button type="submit">Create account</button>
  </form>
</div>

<Alert bind:this={alert} />

<style>
  .content {
    margin-inline: auto;
    max-inline-size: 35ch;
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