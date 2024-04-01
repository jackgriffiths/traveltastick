<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Dialog } from "$lib/components";
  import { getStickerHeadingId, getStickerImageUrl } from "$lib/stickers";

  export let data;
  $: stickersInAlbum = new Set(data.stickersInAlbum);

  let jumpList: Dialog;

  // This query param is deliberately not accessed in the
  // page's server load function. This prevents the load
  // function from re-running when the value changes.
  // The parameter's value does not affect the loaded data.
  const animateStickerNumber = Number.parseInt($page.url.searchParams.get("stick") || "");

  // This only runs client-side.
  onMount(async () => {
    if (animateStickerNumber) {
      // Immediately remove the query parameter so that
      // the stick animation will not run again if the
      // page is refreshed. Setting this URL does not
      // cause the page to be reloaded or rerendered
      // again, so the animation is not interrupted.
      await goto(`/${$page.url.hash}`, { replaceState: true });
    }
  });
</script>

<svelte:head>
  <title>Album | Traveltastick</title>
</svelte:head>

<h1>Album</h1>

<button type="button" class="jump-list-open-button" on:click={() => jumpList.showModal()}>
  <span aria-hidden="true">🔎</span>
  At a glance...
</button>

<div class="album">
  {#each data.stickers as sticker}
    <div class="album-row">
      <h2 id={getStickerHeadingId(sticker.title)}>
        {sticker.title}
      </h2>
      <p>{sticker.location}</p>

      <div class="slot-container" class:animate-sticker={animateStickerNumber === sticker.number}>
        {#if stickersInAlbum.has(sticker.stickerId)}
          {#if animateStickerNumber === sticker.number}
            <div class="slot" aria-hidden="true">
              <span class="slot-number">
                {sticker.number}
              </span>
            </div>
          {/if}

          <div class="sticker" class:shiny={sticker.isShiny}>
            <img src={getStickerImageUrl(sticker.title)} alt={sticker.title} loading="lazy" />
          </div>

          {#if animateStickerNumber === sticker.number}
            <div class="sticker" class:shiny={sticker.isShiny} aria-hidden="true">
              <img src={getStickerImageUrl(sticker.title)} alt={sticker.title} loading="lazy" />
            </div>
          {/if}
        {:else}
          <div class="slot" aria-hidden="true">
            <span class="slot-number">
              {sticker.number}
            </span>
          </div>
        {/if}
      </div>

      <p class="description">{sticker.description}</p>
    </div>
  {/each}
</div>

<Dialog bind:this={jumpList}>
  <form method="dialog">
    <button type="submit" class="jump-list-close-button">
      <span aria-hidden="true">✖️</span> Close
    </button>
  </form>

  <div class="jump-list">
    {#each data.stickers as sticker}
      <a href={`#${getStickerHeadingId(sticker.title)}`} on:click={() => jumpList.close()}>
        {#if stickersInAlbum.has(sticker.stickerId)}
          <div class="sticker" class:shiny={sticker.isShiny}>
            <img src={getStickerImageUrl(sticker.title)} alt={sticker.title} loading="lazy" />
          </div>
        {:else}
          <div class="slot">
            <span class="slot-number">
              {sticker.number}
            </span>
          </div>
        {/if}
      </a>
    {/each}
  </div>
</Dialog>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
  }

  .jump-list-open-button {
    display: block;
    margin-block: 1.5rem 3rem;
    margin-inline: auto;
  }

  .jump-list-close-button {
    display: block;
    margin-block-end: 1rem;
    margin-inline-start: auto;
  }

  .jump-list {
    display: grid;
    max-inline-size: 800px;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 0.5rem;

    & > a {
      display: block;
      container-type: inline-size;
    }
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
        scroll-margin-block-start: 2em;
      }

      & > .slot-container {
        margin-block: 1rem;
      }
    }
  }

  .slot-container {
    align-self: flex-start;
    justify-self: start;
    width: 100%;
    max-width: 350px;
    container-type: inline-size;
  }

  .slot-container.animate-sticker {
    display: grid;
    perspective: 2000px;
    transform-style: preserve-3d;

    --sticker-x: 0%;
    --sticker-y: 0%;
    --sticker-angle: 45deg;
    --stuck-down: 100%;
    
    --line-up-duration: 1s;
    --stick-down-duration: 1s;

    animation-name: line-up, stick-down;
    animation-duration: var(--line-up-duration), var(--stick-down-duration);
    animation-delay: 0s, var(--line-up-duration);
    animation-timing-function: ease-out, ease-in-out;
    animation-fill-mode: forwards, forwards;

    --top-left: 0% 0%;
    --top-right: 100% 0%;
    --bottom-right: 100% 100%;
    --bottom-left: 0% 100%;

    & > * {
      grid-area: 1 / 1;
    }

    /*
      The sticking of the sticker effect is achieved by animating 2 identical
      instances of a sticker, displayed on top of each other. Each instance
      renders a different part of the sticker, where the proportion is controlled
      by the animation.
      
      The first part begins fully clipped, while the second part begins fully visible.
      The second part is rotated so that the bottom appears to be lifted off the page.
      Gradually, the first part (which is flat on the page) is revealed from top to
      bottom, while the second part is clipped from top to bottom at the same rate.
      This gives the appearance that the sticker is being stuck down from top to bottom.
    */

    & .slot[aria-hidden="true"] {
      /*
        This clip path should not be necessary. It doesn't deliberately clip any part
        of the slot. However, it does appear to clip any subpixels around the slot.
        And because the sticker also has a clip path, it was noticed that the slot's
        subpixels were visible behind the sticker, which created unwanted lines around
        the sticker. By applying this clip path to the slot, both the slot and the
        sticker (after the animation) are clipped to the exact same size.
      */
      clip-path: polygon(var(--top-left), var(--top-right), var(--bottom-right), var(--bottom-left));
    }

    /* The top part of the sticker, displayed flat on the page */
    & .sticker:not([aria-hidden="true"]) {
      /*
        Increase clipped height by 1px so there is never a gap between the two parts of the
        sticker. This can happen when the browser tries to render subpixels. This extra row
        of pixels will either fill in the gap or be obscured by the bottom part of the
        sticker, so it doesn't distort appearance of the sticker.
      */
      --safe-stuck-down: min(var(--stuck-down) + 1px, 100%);

      clip-path: polygon(var(--top-left), var(--top-right), 100% var(--safe-stuck-down), 0% var(--safe-stuck-down));
      translate: var(--sticker-x) var(--sticker-y);
    }
  
    /* The bottom part of the sticker, which is lifted off the page */
    & .sticker[aria-hidden="true"] {
      clip-path: polygon(0% var(--stuck-down), 100% var(--stuck-down), var(--bottom-right), var(--bottom-left));
      transform-origin: 0 var(--stuck-down);
      translate: var(--sticker-x) var(--sticker-y);
      rotate: x var(--sticker-angle);
    }
  }

  @keyframes line-up {
    0% {
      --stuck-down: 0%;
      --sticker-x: 100%;
      --sticker-y: 20%;
      --sticker-angle: 10deg;
    }
    30% {
      --sticker-angle: 10deg;
    }
    100% {
      --stuck-down: 0%;
      --sticker-x: 0%;
      --sticker-y: 0%;
      --sticker-angle: 45deg;
    }
  }

  @keyframes stick-down {
    0% {
      --stuck-down: 0%;
    }
    100% {
      --stuck-down: 100%;
    }
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

    .album > .album-row > .slot-container {
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
      --shiny-sticker-highlight-color: hsl(0, 0%, 80%);
        --shiny-sticker-border-gradient-start-angle: 35deg;
        --shiny-sticker-border-gradient-angle-shift: 20deg;
        --shiny-sticker-border-gradient-angle: var(--shiny-sticker-border-gradient-start-angle);

        --shiny-sticker-border-gradient: linear-gradient(
          var(--shiny-sticker-border-gradient-angle, 30deg),
          var(--shiny-sticker-color) 0%,
          var(--shiny-sticker-color) 10%,
          var(--shiny-sticker-highlight-color) 33%,
          var(--shiny-sticker-color) 45%,
          var(--shiny-sticker-color) 66%,
          var(--shiny-sticker-highlight-color) 77%,
          var(--shiny-sticker-color) 90%,
          var(--shiny-sticker-color) 95%);

      border-image-source: var(--shiny-sticker-border-gradient);
      border-image-slice: 1;
      background: var(--shiny-sticker-background-color);
    }

    & > img {
      width: 100%;
      aspect-ratio: var(--sticker-image-aspect-ratio);
      object-fit: cover;
    }
  }

  /*
    The animation is only played when the shiny is shown in the album.
    In the jump list, the stickers are so small that the animation is
    not worth playing, so not playing it helps improve performance.
  */
  .album .sticker.shiny {
    animation: 8s shine ease-in-out alternate infinite;
  }

  .slot {
    @media (prefers-color-scheme: light) {
      --slot-color: var(--sticker-background-color);
    }
    @media (prefers-color-scheme: dark) {
      --slot-color: hsl(0, 0%, 85%);
    }

    border-color: var(--slot-color);
    background: var(--slot-color);

    & > .slot-number {
      aspect-ratio: var(--sticker-image-aspect-ratio);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(1rem, 14cqi, 5rem);
      font-weight: var(--fw-bold);

      @media (prefers-color-scheme: light) {
        color: var(--body-text-color);
      }

      @media (prefers-color-scheme: dark) {
        color: var(--body-background-color);
      }
    }
  }

  @property --sticker-x {
    initial-value: 0px;
    syntax: "<length-percentage>";
    inherits: true;
  }

  @property --sticker-y {
    initial-value: 0px;
    syntax: "<length-percentage>";
    inherits: true;
  }

  @property --sticker-angle {
    initial-value: 0deg;
    syntax: "<angle>";
    inherits: true;
  }

  @property --stuck-down {
    initial-value: 0%;
    syntax: "<percentage>";
    inherits: true;
  }
</style>