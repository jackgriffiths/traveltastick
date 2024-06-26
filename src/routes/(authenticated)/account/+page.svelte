<script lang="ts">
  import { startRegistration } from "@simplewebauthn/browser";
  import { invalidateAll } from "$app/navigation";
  import { Alert, Confirm, Dialog } from "$lib/components";
  import { postJson, readError } from "$lib/fetch";

  export let data;

  // Users should only be able to delete credentials if they have
  // an alternative credential that they could sign in with.
  $: canDeleteCredentials = data.credentials.length >= 2;

  let alert: Alert;
  let confirm: Confirm;
  let createCredentialDialog: Dialog;
  let accountName = "";
  let isCreatingCredential = false;

  const confirmDeleteCredential = (credentialId: string) => {
    confirm.show({
      titleIcon: "⚠️",
      title: "Warning",
      message: "Are you sure you want to delete this passkey? Any devices signed in using this passkey will be signed out. You will not be able to use this passkey to sign in to your account again.",
      confirmButtonIcon: "⚠️",
      confirmButtonText: "Delete",
      cancelButtonIcon: null,
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

  const beginCreateCredential = () => {
    if (isCreatingCredential) {
      return;
    }

    createCredentialDialog.showModal();
  } 

  const onCreateCredentialDialogClosed = async (e: CustomEvent<{ returnValue: string }>) => {
    const name = accountName;
    accountName = "";

    if (e.detail.returnValue === "create" && name != "") {
      await registerCredential(name);
    }
  }

  const registerCredential = async (accountName: string) => {
    if (isCreatingCredential) {
      return;
    }
  
    isCreatingCredential = true;

    try {
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
    } catch {
      alert.show("Failed", "Could not finish adding a new passkey to your account.");
    } finally {
      isCreatingCredential = false;
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

    <form method="post" action="?/signOut">
      <button type="submit">
        <span aria-hidden="true">👋</span> Sign out
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
            <p class="italic">This device is signed in using this passkey.</p>
          {/if}

          {#if credential.isBackedUp}
            <p class="italic">Synced by your passkey provider.</p>
          {/if}
  
          {#if canDeleteCredentials}
            <button on:click={() => confirmDeleteCredential(credential.credentialId)}>
              <span aria-hidden="true">🗑️</span> Delete
            </button>
          {/if}
        </li>
      {/each}
      </ul>

    <button id="create-credential-button" on:click={beginCreateCredential}>
      <span aria-hidden="true">🔑</span> Add passkey
    </button>

    {#if isCreatingCredential}
      <p id="create-credential-status">Adding passkey...</p>
    {/if}
  </section>
</div>

<Alert bind:this={alert} />
<Confirm bind:this={confirm} />

<Dialog bind:this={createCredentialDialog} on:close={onCreateCredentialDialogClosed}>
  <div id="create-credential-dialog-content">
    <p class="title">Add passkey</p>

    <form method="dialog">
      <label for="account-name">Account name</label>
      <input id="account-name" name="name" type="text" required autocomplete="given-name" bind:value={accountName} />
      <p>You can choose any name you like. It doesn't need to be unique and it is only ever seen by you.</p>

      <div class="buttons">
        <button type="button" on:click={() => createCredentialDialog.close("cancel")}>
          Cancel
        </button>
        <button type="submit" value="create">
          <span aria-hidden="true">🔑</span> Add passkey
        </button>
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
    gap: 2rem;
    max-width: fit-content;
    margin-inline: auto;
  }

  section {
    background: var(--card-background-color);
    padding: 1.5rem;
    border-radius: 0.25rem;
    inline-size: 100%;
  }

  #section-user-id {
    display: grid;

    & #user-id {
      font-size: 3rem;
      text-align: center;
    }

    & > form {
      justify-self: center;
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

  #create-credential-status {
    margin-block-start: 0.5rem;
    text-align: center;
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