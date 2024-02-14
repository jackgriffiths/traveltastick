<script>
  import './styles.css';
</script>

<div class="wrapper">
  <slot></slot>
</div>

<style>
  .wrapper {
    max-inline-size: 1000px;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }
</style>