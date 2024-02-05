<script>
  import './styles.css';
</script>

<div class="wrapper">
  <nav>
  </nav>

  <main>
    <slot></slot>
  </main>
</div>

<style>
  .wrapper {
    max-inline-size: 1000px;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
</style>