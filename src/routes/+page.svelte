<script>
  export let data;
</script>

<h1>Album</h1>

{#each data.stickers as sticker}
  <section>
    <div class="wrapper">
      <div class="info">
        <h2>{sticker.title}</h2>
        <p>{sticker.location}</p>
        <p>{sticker.description}</p>
      </div>
      <img src={sticker.imageUrl} />
    </div>
  </section>
{/each}

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  section {
    container-type: inline-size;
  }

  section:not(:last-of-type) {
    margin-block-end: 3rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: var(--fw-bold);
  }

  .wrapper {
    display: grid;
    row-gap: 1rem;
  }

  img {
    border: 6px solid white;
    width: 300px;
    height: 200px;
    object-fit: cover;
  }

  @container (width >= 600px) {
    .wrapper {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.5rem;
    }

    .wrapper .info {
      grid-row: 1;
      grid-column: 2;
      justify-self: start;
    }

    .wrapper img {
      grid-row: 1;
      grid-column: 1;
      justify-self: end;
    }
  }
</style>