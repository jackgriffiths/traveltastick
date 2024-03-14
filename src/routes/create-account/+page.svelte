<script lang="ts">
  import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { Alert } from "$lib/components";
  import { postJson, readError } from "$lib/fetch";

  let alert: Alert;
  let accountName: string;
  let isBusy = false;

  const createAccount = async () => {
    if (!browserSupportsWebAuthn()) {
      alert.show("Not supported", "Your browser does not support passkeys. Please try a different browser.");
      return;
    }

    if (isBusy) {
      return;
    }

    isBusy = true;

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
      isBusy = false;
    }
  }
</script>

<svelte:head>
  <title>Create account | Traveltastick</title>
  <meta name="description" content="Collect and trade stickers of famous landmarks" />
</svelte:head>

<div class="content">
  <section>
    <h1>Create Account</h1>

    <p>Traveltastick uses <span class="italic">passkeys</span>, not <span class="italic">passwords</span>, to secure your account.</p>

    <p>First, choose an account name. It doesn't need to be unique and it is only ever seen by you.</p>

    <form on:submit={createAccount}>
      <label for="name">Account name</label>
      <input id="name" name="name" type="text" bind:value={accountName} required autocomplete="given-name" />
      <button type="submit">Next</button>
      {#if isBusy}
        <p class="wait-text">Waiting for passkey...</p>
      {/if}
    </form>
  </section>

  <p class="sign-in">
    Already have an account? <a href="/sign-in">Sign in</a>
  </p>
</div>

<Alert bind:this={alert} />

<style>
  .content {
    padding-inline: var(--page-gutter);
  }

  section {
    max-inline-size: 40ch;
    border-radius: 0.25rem;
    margin-block-start: var(--page-gutter);
    margin-inline: auto;
    background: var(--card-background-color);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
  }

  h1 {
    margin-block-end: 1.25rem;
    font-size: 2rem;
    font-weight: bold;
  }

  .italic {
    font-style: italic;
  }

  form {
    margin-block: 1.0rem 0rem;
    inline-size: 100%;

    & > label {
      display: block;
      margin-block-end: 0.25em;
    }

    & > input {
      display: block;
      inline-size: 100%;
      margin-block-end: 1rem;
    }

    & .wait-text {
      margin-block-start: 0.5rem;
      text-align: center;
    }
  }

  button {
    inline-size: 100%;
  }

  .sign-in {
    margin-block-start: 2rem;
    max-inline-size: 40ch;
    margin-inline: auto;
    padding-inline: 1.5rem;
    text-align: center;
  }
</style>