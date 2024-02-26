<script>
  import { getStickerImageUrl } from '$lib/stickers';

  export let data;
  $: stickersInAlbum = new Set(data.stickersInAlbum);
</script>

<svelte:head>
  <title>Album | Traveltastick</title>
</svelte:head>

<h1>Album</h1>

<div class="album">
  {#each data.stickers as sticker}
    <div class="album-row">
      <h2>{sticker.title}</h2>
      <p>{sticker.location}</p>

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

      <p class="description">{sticker.description}</p>
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

      & > h2 {
        font-size: 1.25rem;
        font-weight: var(--fw-bold);
      }

      & > :is(.sticker-wrapper, .slot-wrapper) {
        margin-block: 1rem;
      }
    }
  }

  .sticker-wrapper, .slot-wrapper {
    align-self: flex-start;
    justify-self: start;
    width: 100%;
    max-width: 350px;
    container-type: inline-size;
  }

  /* There might be a bug with Svelte/Vite, because nesting wasn't working inside a container query */
  @container album (width >= 80ch) {
    .album > .album-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.5rem;
    }

    .album > .album-row > :is(h2, p) {
      grid-column: 2;
      justify-self: start;
    }

    .album > .album-row > .description {
      margin-block-start: 0.75rem;
    }

    .album > .album-row > :is(.sticker-wrapper, .slot-wrapper) {
      grid-row: 1 / span 4;
      grid-column: 1;
      margin-block: 0;
      justify-self: end;
    }
  }

  /* TODO: is there a different way to keep the size of the slots the same without setting a border (which for slots is just the same color as the background) */
  .sticker, .slot {
    border-width: 3.5cqi;
    border-style: solid;
  }

  .sticker {
    border-color: var(--sticker-border-color);
    background: var(--sticker-background-color);

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
      animation: 3s shine ease-in-out alternate infinite;
    }

    & > img {
      width: 100%;
      aspect-ratio: var(--sticker-image-aspect-ratio);
      object-fit: cover;
    }
  }

  .slot {
    @media (prefers-color-scheme: light) {
      --slot-color: var(--sticker-background-color);
    }
    @media (prefers-color-scheme: dark) {
      --slot-color: hsl(0, 0%, 95%);
    }

    border-color: var(--slot-color);
    background: var(--slot-color);

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
</style>