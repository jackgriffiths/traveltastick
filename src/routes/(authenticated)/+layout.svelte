<nav>
  <a href="/">Album</a>
  <a href="/deck">Deck</a>
  <a href="/account">Account</a>
</nav>

<main>
  <slot></slot>
</main>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 2rem;
    row-gap: 1rem;
    margin-block-end: 2rem;
  }
</style>