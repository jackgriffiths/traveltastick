<script>
  export let data;
</script>

<h1>Deck</h1>

<div class="deck">
  {#each data.deck as sticker}
    <section>
      <img src={sticker.imageUrl} />
      <div class="info">
        <h2>{sticker.title}</h2>
        <p>{sticker.location}</p>
      </div>
    </section>
  {/each}
</div>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  .deck {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3rem;
  }

  section {
    text-align: center;
  }

  img {
    border: 6px solid white;
    width: 300px;
    height: 200px;
    object-fit: cover;
  }
</style>