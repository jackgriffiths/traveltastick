<script>
  export let data;
</script>

<h1>Deck</h1>

<form method="post" action="?/openPacket">
  <button type="submit">Open Packet</button>
</form>

<div class="deck">
  {#each data.deck as sticker}
    <section>
      <img src={sticker.imageUrl} />
      <div class="info">
        <h2>{sticker.title}</h2>
        <p>{sticker.location}</p>
      </div>
      <form method="post" action="?/addToAlbum">
        <input type="hidden" name="ownedStickerId" value={sticker.ownedStickerId} />
        <button type="submit">Add to Album</button>
      </form>
    </section>
  {/each}
</div>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  form {
    text-align: center;
    margin-block-end: 2rem;
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