<script>
  import { getStickerImageUrl } from '$lib/stickers';

  export let data;
  $: stickersInAlbum = new Set(data.stickersInAlbum);
</script>

<svelte:head>
  <title>Album | StickerAlbum</title>
</svelte:head>

<h1>Album</h1>

<div class="album">
  {#each data.stickers as sticker}
    <div class="album-row">
      <div class="info">
        <h2>{sticker.title}</h2>
        <p>{sticker.location}</p>
        <p>{sticker.description}</p>
      </div>
  
      {#if stickersInAlbum.has(sticker.stickerId)}
        <div class="sticker-wrapper">
          <div class="sticker" class:shiny={sticker.isShiny}>
            <img src={getStickerImageUrl(sticker.title)} alt={sticker.title} />
          </div>
        </div>
      {:else}
        <div class="slot-wrapper">
          <div class="slot">
            <span class="slot-number">
              {sticker.number}
            </span>
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
    display: grid;
    row-gap: 3rem;
    container: album / inline-size;

    & > .album-row {
      display: grid;
      row-gap: 1rem;

      & h2 {
        font-size: 1.25rem;
        font-weight: var(--fw-bold);
      }
    }
  }

  .sticker-wrapper, .slot-wrapper {
    justify-self: start;
    width: 100%;
    max-width: 350px;
    container-type: inline-size;
  }

  /* TODO: is there a different way to keep the size of the slots the same without setting a border (which for slots is just the same color as the background) */
  .sticker, .slot {
    --border-width: 3cqi;
    border-width: var(--border-width);
    border-style: solid;
  }

  .sticker {
    border-color: var(--sticker-border-color);
    background: var(--sticker-background-color);
    outline-width: 0.5cqi;
    outline-style: solid;
    outline-color: var(--sticker-image-outline-color);
    outline-offset: calc(-1 * var(--border-width));

    &.shiny {
      --shiny-sticker-highlight-color: hsl(0, 0%, 100%);
      --shiny-sticker-border-gradient-start-angle: 30deg;
      --shiny-sticker-border-gradient-angle-shift: 10deg;
      --shiny-sticker-border-gradient-angle: var(--shiny-sticker-border-gradient-start-angle);

      --shiny-sticker-border-gradient: linear-gradient(
        var(--shiny-sticker-border-gradient-angle),
        var(--shiny-sticker-color) 17%,
        var(--shiny-sticker-highlight-color) 22%,
        var(--shiny-sticker-color) 27%,
        var(--shiny-sticker-color) 32%,
        var(--shiny-sticker-highlight-color) 37%,
        var(--shiny-sticker-color) 42%,
        var(--shiny-sticker-color) 62%,
        var(--shiny-sticker-highlight-color) 67%,
        var(--shiny-sticker-color) 72%,
        var(--shiny-sticker-color) 86%,
        var(--shiny-sticker-highlight-color) 89%,
        var(--shiny-sticker-color) 92%);

      border-image-source: var(--shiny-sticker-border-gradient);
      border-image-slice: 1;
      background: var(--shiny-sticker-background-color);
      outline-color: var(--shiny-sticker-image-outline-color);
      animation: 3s shine ease-in-out alternate infinite;
    }

    & > img {
      width: 100%;
      aspect-ratio: var(--sticker-image-aspect-ratio);
      object-fit: cover;
    }
  }

  .slot {
    border-color: var(--sticker-background-color);
    background: var(--sticker-background-color);

    & > .slot-number {
      aspect-ratio: var(--sticker-image-aspect-ratio);
      display: grid;
      place-items: center;
      font-size: 3rem;
      font-weight: var(--fw-bold);

      @media (prefers-color-scheme: light) {
        color: var(--body-text-color);
      }

      @media (prefers-color-scheme: dark) {
        color: var(--body-background-color);
      }
    }
  }

  @container album (width >= 600px) {
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