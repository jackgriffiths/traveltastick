<script>
  export let data;

  // TODO: use a set quicker lookup of the stickersInAlbum collection.
</script>

<h1>Album</h1>

<div class="album">
  {#each data.stickers as sticker}
    <div class="album-row">
      <div class="info">
        <h2>{sticker.title}</h2>
        <p>{sticker.location}</p>
        <p>{sticker.description}</p>
      </div>
  
      {#if data.stickersInAlbum.includes(sticker.stickerId)}
        <div class="sticker-wrapper">
          <div class="sticker">
            <img src={sticker.imageUrl} alt={sticker.title} />
          </div>
        </div>
      {:else}
        <div class="slot-wrapper">
          <div class="slot">
            {sticker.number}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>


<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  .album {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    container-type: inline-size;
  }

  .album-row {
    display: grid;
    row-gap: 1rem;

    & h2 {
      font-size: 1.25rem;
      font-weight: var(--fw-bold);
    }
  }

  .sticker-wrapper, .slot-wrapper {
    justify-self: start;
    width: 100%;
    max-width: 300px;
    container-type: inline-size;
  }

  .sticker {
    aspect-ratio: var(--sticker-aspect-ratio);
    border: 2cqi solid white;

    & img {
      width: 100%;
      object-fit: cover;
    }
  }

  .slot {
    aspect-ratio: var(--sticker-aspect-ratio);
    border: 1cqi solid white;
    display: grid;
    place-items: center;
    font-size: 3rem;
    font-weight: var(--fw-bold);
  }

  @container (width >= 600px) {
    .album-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.5rem;
    }

    .album-row .info {
      grid-row: 1;
      grid-column: 2;
      justify-self: start;
    }

    .album-row :is(.sticker-wrapper, .slot-wrapper) {
      grid-row: 1;
      grid-column: 1;
      justify-self: end;
    }
  }
</style>