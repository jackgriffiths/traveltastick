<nav>
  <div class="links">
    <a href="/">Album</a>
    <a href="/deck">Deck</a>
    <a href="/account">Account</a>
  </div>
</nav>

<main>
  <slot></slot>
</main>

<style>
  nav {
    padding-block: 1.5rem;
    padding-inline: var(--page-gutter);

    & > .links {
      max-inline-size: var(--max-inline-content-size);
      margin-inline: auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: 2rem;
      row-gap: 1rem;
    }

    & a {
      text-underline-offset: 0.25em;

      /* Increase hit target */
      padding: 0.5em;
    }
  }
  
  main {
    max-inline-size: var(--max-inline-content-size);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
  }
</style>