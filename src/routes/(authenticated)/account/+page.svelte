<script lang="ts">
  import { startRegistration } from "@simplewebauthn/browser";
  import { invalidateAll } from "$app/navigation";
  import { Alert, Confirm, Dialog } from "$lib/components";
  import { postJson, readError } from "$lib/fetch";

  export let data;

  // Users should only be able to delete credentials if they have
  // an alternative credential that they could log in with.
  $: canDeleteCredentials = data.credentials.length >= 2;

  let alert: Alert;
  let confirm: Confirm;
  let createCredentialDialog: Dialog;
  let accountName = "";

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
    const response = await postJson("/api/auth/delete-credential", {
      credentialId: credentialId,
    });

    if (response.ok) {
      await invalidateAll();
    } else {
      alert.show("Error", await readError(response));
    }
  }

  const onCreateCredentialDialogClosed = async (e: CustomEvent<{ returnValue: string }>) => {
    const name = accountName;
    accountName = "";

    if (e.detail.returnValue === "create" && name != "") {
      await registerCredential(name);
    }
  }

  const registerCredential = async (accountName: string) => {
    const beginResponse = await postJson("/api/auth/begin-credential-creation", { userName: accountName });
    if (!beginResponse.ok) {
      alert.show("Error", await readError(beginResponse));
      return;
    }

    const registrationOptions = await beginResponse.json();
    const registration = await startRegistration(registrationOptions);

    const verificationResponse = await postJson("/api/auth/complete-credential-creation", registration);

    if (verificationResponse.ok) {
      alert.show("Success", "A new passkey has been created for your account.");
      await invalidateAll();
    } else {
      alert.show("Error", await readError(verificationResponse, "Something went wrong while creating your passkey. Please try again."));
    }
  }
</script>

<svelte:head>
  <title>Account | Traveltastick</title>
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
  
    <ul class="credentials">
      {#each data.credentials as credential, index (credential.credentialId)}
        <li class="credential">
          <p>Passkey #{index + 1}</p>
          <p>Created on {credential.createdUtc.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
          <p>Last used on {credential.lastUsedUtc.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>

          {#if credential.credentialId === data.currentCredentialId}
            <p class="italic">This device is logged in using this passkey.</p>
          {/if}

          {#if credential.isBackedUp}
            <p class="italic">Synced by your passkey provider.</p>
          {/if}
  
          {#if canDeleteCredentials}
            <button on:click={() => confirmDeleteCredential(credential.credentialId)}>
              🗑️ Delete
            </button>
          {/if}
        </li>
      {/each}
      </ul>

    <button id="create-credential-button" on:click={() => createCredentialDialog.showModal()}>
      🔑 Create passkey
    </button>
  </section>
</div>

<Alert bind:this={alert} />
<Confirm bind:this={confirm} />

<Dialog bind:this={createCredentialDialog} on:close={onCreateCredentialDialogClosed}>
  <div id="create-credential-dialog-content">
    <p class="title">Create passkey</p>

    <form method="dialog">
      <label for="account-name">Account name</label>
      <input id="account-name" type="text" required autocomplete="off" bind:value={accountName} />
      <p>You can choose any name you like - it doesn't need to be unique. The name is only saved on your device and it helps you select the right account when logging in.</p>

      <div class="buttons">
        <button type="button" on:click={() => createCredentialDialog.close("cancel")}>Cancel</button>
        <button type="submit" value="create">🔑 Create passkey</button>
      </div>
    </form>
  </div>
</Dialog>

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
    gap: 4rem;
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
      margin-block-end: 1em;
    }
  }

  .credentials {
    list-style-type: none;
  }

  .credential {
    &:not(:last-of-type) {
      margin-block-end: 2.5rem;
    }

    & p {
      --paragraph-spacing: 0.5em;

      &:first-of-type {
        font-weight: var(--fw-bold);
        font-size: 1.1em;
      }

      &.italic {
        font-style: italic;
      }
    }

    & > button {
      margin-block-start: 1rem;
    }
  }

  #create-credential-button {
    inline-size: 100%;
    margin-block-start: 3rem;
  }

  #create-credential-dialog-content {
    & .title {
      font-size: 1.5rem;
      font-weight: var(--fw-bold);
      margin-block-end: 0.5rem;
    }

    & label {
      display: block;
      margin-block-end: 0.25rem;
    }

    & input {
      display: block;
      inline-size: 100%;
    }

    & p {
      max-inline-size: 40ch;
      margin-block-start: 0.5rem;
      margin-block-end: 1.5rem;
      text-wrap: pretty;
    }

    & .buttons {
      margin-block-start: 1.5rem;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: end;
      gap: 0.5rem;
    }
  }
</style>