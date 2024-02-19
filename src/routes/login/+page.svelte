<script lang="ts">
  import { goto } from "$app/navigation";
  import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
  import { Alert } from "$lib/components";

  let alert: Alert;

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

    const beginResponse = await post("/api/auth/begin-registration", { userName: "Jack" });
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

<h1>StickerAlbum</h1>

<div class="content">

  <div class="actions">
    <button on:click={login}>
      Log in
    </button>
    <button on:click={createAccount}>
      Create account
    </button>
  </div>
</div>

<Alert bind:this={alert} />

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  .content {
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>