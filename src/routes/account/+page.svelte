<script>
  export let data;
</script>

<h1>Account</h1>

<div class="content">
  <p>
    User ID: {data.userId}
  </p>

  <div class="credentials">
    {#each data.credentials as credential, index}
      <div class="credential">
        <p>Passkey #{index + 1}</p>
        <p>Created {credential.createdUtc.toLocaleString()}</p>
        <p>Last used {credential.lastUsedUtc.toLocaleString()}</p>
        <p>Backed up? {credential.isBackedUp ? "Yes" : "No"}</p>
      </div>
    {/each}
  </div>

  <form method="post" action="?/logout">
    <button type="submit">
      Logout
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
    border: 2px solid gray;
    padding: 1rem;
  }
</style>