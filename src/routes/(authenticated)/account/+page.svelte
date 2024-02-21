<script lang="ts">
  import { startRegistration } from "@simplewebauthn/browser";
  import { invalidateAll } from "$app/navigation";
  import { Alert, Confirm } from "$lib/components";
  import { post } from "$lib/json";

  export let data;

  // Users should only be able to delete credentials if they have
  // an alternative credential that they could log in with.
  $: canDeleteCredentials = data.credentials.length >= 2;

  let alert: Alert;
  let confirm: Confirm;

  const confirmDeleteCredential = (credentialId: string) => {
    confirm.show({
      title: "⚠️ Warning",
      message: "Are you sure you want to delete this passkey? Any devices logged in using this passkey will be logged out. You will not be able to use this passkey to log in to your account again.",
      confirmButtonText: "⚠️ Delete",
      cancelButtonText: "Cancel",
      onConfirm: async () => await deleteCredential(credentialId),
      onCancel: null,
    });
  }

  const deleteCredential = async (credentialId: string) => {
    const response = await post("/api/auth/delete-credential", {
      credentialId: credentialId,
    });

    if (response.ok) {
      await invalidateAll();
    } else {
      const error = (await response.json()).message;
      alert.show("Error", error);
    }
  }

  const registerCredential = async () => {
    const beginResponse = await post("/api/auth/begin-credential-creation", { userName: "test" });
    if (!beginResponse.ok) {
      const error = (await beginResponse.json()).message;
      alert.show("Error", error || "Something went wrong. Please try again.");
      return;
    }

    const registrationOptions = await beginResponse.json();
    const registration = await startRegistration(registrationOptions);

    const verificationResponse = await post("/api/auth/complete-credential-creation", registration);

    if (verificationResponse.ok) {
      alert.show("Success", "A new passkey has been created on your device.");
      await invalidateAll();
    } else {
      const error = (await verificationResponse.json()).message;
      alert.show("Error", error || "Something went wrong while creating your passkey. Please try again.");
    }
  }
</script>

<svelte:head>
  <title>Account | StickerAlbum</title>
</svelte:head>

<h1>Account</h1>

<div class="content">
  <section id="section-user-id">
    <h2>User ID</h2>
  
    <p id="user-id">
      {data.userId}
    </p>

    <form method="post" action="?/logout">
      <button type="submit">
        👋 Logout
      </button>
    </form>
  </section>

  <section id="section-credentials">
    <h2>Passkeys</h2>
  
    <div class="credentials">
      {#each data.credentials as credential, index}
        <div class="credential">
          <p>Passkey #{index + 1}</p>
          <p>Created on {credential.createdUtc.toLocaleString()}</p>
          <p>Last used on {credential.lastUsedUtc.toLocaleString()}</p>
          <p>Backed up? {credential.isBackedUp ? "Yes" : "No"}</p>
  
          {#if canDeleteCredentials}
            <button on:click={() => confirmDeleteCredential(credential.credentialId)}>
              🗑️ Delete
            </button>
          {/if}
        </div>
      {/each}
    </div>

    <button id="create-credential-button" on:click={registerCredential}>
      🔑 Create passkey
    </button>
  </section>
</div>

<Alert bind:this={alert} />
<Confirm bind:this={confirm} />

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  h2 {
    font-size: 1.5rem;
    text-align: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
    max-width: fit-content;
    margin-inline: auto;
  }

  #section-user-id {
    & #user-id {
      font-size: 3rem;
      text-align: center;
    }

    & > form {
      margin-block-start: 2rem;
    }
  }

  #section-credentials {
    & h2 {
      margin-block-end: 0.75em;
    }
  }

  .credentials {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .credential {
    border-radius: 4px;
    border: 2px solid gray;
    padding: 1rem;

    & > :first-child {
      font-size: 1.25rem;
    }

    & > button {
      margin-block-start: 1.5rem;
    }
  }

  #create-credential-button {
    margin-block-start: 1.5rem;
  }
</style>