<script>
  import { page } from "$app/stores";
</script>

<div>
  <h1>Oops</h1>
  
  {#if $page.status === 404}
    <p>That page doesn't exist. Try going back to the <a href="/">home</a> page.</p>
  {:else}
    <p>Something went wrong. Please refresh the page and try again.</p>
  {/if}
</div>

<style>
  div {
    padding-block: 2rem;
    padding-inline: var(--page-gutter);
  }

  h1 {
    font-size: 1.75rem;
    margin-block-end: 0.5em;
  }
</style>