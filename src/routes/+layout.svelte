<script>
  import './styles.css';
</script>

<div class="page-wrapper">
  <div>
    <slot></slot>
  </div>

  <footer>
    <div class="content">
      <span>Made for Cynnie</span> <span aria-hidden="true">❤️</span> <span lang="es">Hecho para Cynnie</span>
    </div>
  </footer>
</div>

<style>
  .page-wrapper {
    min-height: 100%;
    display: grid;
    grid-template-rows: 1fr auto;
    row-gap: 3rem;
  }

  footer {
    padding-block: 1.5rem;
    padding-inline: var(--page-gutter);

    & > .content {
      max-inline-size: var(--max-inline-content-size);
      margin-inline: auto;
      font-size: 0.875rem;
      text-align: center;
      color: var(--muted-text-color);
    }
  }
</style>