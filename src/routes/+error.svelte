<script>
  import { page } from "$app/stores";
</script>

<h1>Oops</h1>

{#if $page.status === 404}
  <p>That page doesn't exist. Try going back to the <a href="/">home</a> page.</p>
{:else}
  <p>Something went wrong. Please refresh the page and try again.</p>
{/if}

<style>
  h1 {
    font-size: 1.75rem;
    margin-block-end: 0.5em;
  }
</style>