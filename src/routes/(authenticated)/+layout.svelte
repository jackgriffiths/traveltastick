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
    justify-content: center;
    gap: 2rem;
    margin-block-end: 2rem;
  }
</style>