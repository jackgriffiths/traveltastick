<script lang="ts">
  import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { Alert } from "$lib/components";
  import { post, postJson, readError } from "$lib/fetch";

  let alert: Alert;
  let accountName: string;

  let isBusy = false; // Creating account or signing in
  let isCreatingAccount = false;

  const createAccount = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    if (isBusy) {
      return;
    }

    isBusy = true;
    isCreatingAccount = true;

    try {
      const beginResponse = await postJson("/api/auth/begin-registration", { userName: accountName });
      if (!beginResponse.ok) {
        alert.show("Error", await readError(beginResponse, "Something went wrong. Please try again."));
        return;
      }

      const registrationOptions = await beginResponse.json();
      const registration = await startRegistration(registrationOptions);
      const verificationResponse = await postJson("/api/auth/complete-registration", registration);

      if (verificationResponse.ok) {
        // Wrap this in a try catch just in case navigation fails.
        // It's important to let the user know that actually an
        // account was successfully created.
        try {
          await goto("/", { replaceState: true });
        } catch (e) {
          // Once the authenticated user refreshes, they'll be redirected to the home page.
          alert.show("Account created", "Please refresh the page.");
        }
      } else {
        alert.show("Error", await readError(verificationResponse, "Something went wrong while creating your account. Please try again."));
      }
    } catch {
      alert.show("Failed", "Could not create account.");
    } finally {
      isCreatingAccount = false;
      isBusy = false;
    }
  }

  const signIn = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    if (isBusy) {
      return;
    }

    isBusy = true;

    try {
      const beginResponse = await post("/api/auth/begin-authentication");
      if (!beginResponse.ok) {
        alert.show("Error", await readError(beginResponse, "Something went wrong. Please try again."));
        return;
      }
  
      const authenticationOptions = await beginResponse.json();
      const authentication = await startAuthentication(authenticationOptions);
  
      const verificationResponse = await postJson("/api/auth/complete-authentication", authentication);
  
      if (verificationResponse.ok) {
        // Wrap this in a try catch just in case navigation fails.
        // It's important to let the user know that they have
        // actually been signed in.
        try {
          await goto("/", { replaceState: true });
        } catch {
          // Once the authenticated user refreshes, they'll be redirected to the home page.
          alert.show("Signed in", "Please refresh the page.")
        }
      } else {
        alert.show("Error", await readError(verificationResponse, "Something went wrong while signing you in. Please try again."));
      }
    } finally {
      isBusy = false;
    }
  }
</script>

<svelte:head>
  <title>Sign in | Traveltastick</title>
</svelte:head>

<div class="content">
  <h1>Traveltastick</h1>

  <ul class="features">
    <li>Collect stickers of famous landmarks</li>
    <li>Open a packet of stickers every day</li>
    <li>Trade stickers with your friends</li>
  </ul>

  <button on:click={signIn}>
    Sign in
  </button>

  <h2>Don't have an account?</h2>

  <form on:submit={createAccount}>
    <label for="name">Account name</label>
    <input id="name" type="text" bind:value={accountName} required autocomplete="off" />
    <p class="help-text">You can choose any name you like - it doesn't need to be unique. The name is only saved on your device and it helps you select the right account when signing in.</p>
    <button type="submit">Create account</button>
    {#if isCreatingAccount}
      <p class="wait-text">Waiting for passkey...</p>
    {/if}
  </form>
</div>

<Alert bind:this={alert} />

<style>
  .content {
    border-radius: 0.25rem;
    margin-block-start: 2rem;
    margin-inline: auto;
    max-inline-size: 40ch;
    padding-block: 2rem;
    padding-inline: var(--page-gutter);
    background: var(--card-background-color);
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

    & .help-text {
      margin-block: 0.5rem 1.5rem;
      text-wrap: pretty;
    }

    & .wait-text {
      margin-block-start: 0.5rem;
      text-align: center;
    }
  }
</style>