<script>
  import './styles.css';
</script>

<div class="wrapper">
  <nav>
    <a href="/">Album</a>
    <a href="/deck">Deck</a>
    <a href="/account">Account</a>
  </nav>

  <main>
    <slot></slot>
  </main>
</div>

<style>
  nav {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-block-end: 2rem;
  }

  .wrapper {
    max-inline-size: 1000px;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }
</style>