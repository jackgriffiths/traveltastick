<script lang="ts">
  import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { Alert } from "$lib/components";
  import { post, postJson, readError } from "$lib/fetch";

  let alert: Alert;
  let isBusy = false;

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
  <meta name="description" content="Collect and trade stickers of famous landmarks" />
</svelte:head>

<div class="content">
  <section>
    <h1>Travel<span class="italic">tastick</span></h1>

    <ul class="features">
      <li>Collect stickers of famous landmarks</li>
      <li>Open a packet of stickers every day</li>
      <li>Trade stickers with your friends</li>
    </ul>

    <button on:click={signIn}>
      Sign in
    </button>

    <p class="create-account">
      <a href="/create-account">
        Create an account
      </a>
    </p>
  </section>
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
    text-align: center;

    & .italic {
      font-style: italic;
    }
  }

  @counter-style features-symbols {
    system: fixed;
    symbols: "🌎" "📆" "🤝";
    suffix: " ";
  }

  .features {
    margin-block-end: 2.5rem;
    list-style-type: features-symbols;
    list-style-position: outside;
    padding-inline-start: 2em;

    & li:not(:last-of-type) {
      margin-block-end: 0.5em;
    }
  }

  .create-account {
    margin-block-start: 1rem;
    text-align: center;
  }
</style>