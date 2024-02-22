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
    padding-block: 2rem;
    padding-inline: 1.5rem;
  }
</style>