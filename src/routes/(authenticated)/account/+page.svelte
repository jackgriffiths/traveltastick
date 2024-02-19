<script>
  export let data;
</script>

<svelte:head>
  <title>Account | StickerAlbum</title>
</svelte:head>

<h1>Account</h1>

<div class="content">
  <p>
    User ID: {data.userId}
  </p>

  <div class="credentials">
    {#each data.credentials as credential, index}
      <div class="credential">
        <p>Passkey #{index + 1}</p>
        <p>Created on {credential.createdUtc.toLocaleString()}</p>
        <p>Last used on {credential.lastUsedUtc.toLocaleString()}</p>
        <p>Backed up? {credential.isBackedUp ? "Yes" : "No"}</p>
        <button>🗑️ Delete</button>
      </div>
    {/each}
  </div>

  <form method="post" action="?/logout">
    <button type="submit">
      👋 Logout
    </button>
  </form>
</div>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 500px;
    margin-inline: auto;
  }

  .credentials {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
</style>