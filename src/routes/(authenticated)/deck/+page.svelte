<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { Alert } from '$lib/components';
  import { getStickerImageUrl } from '$lib/stickers';
  import Countdown from './Countdown.svelte';

  export let data;
  export let form;

  type Sticker = typeof data.deck[0];

  let alert: Alert;

  let menu: HTMLDialogElement;
  let menuSticker: Sticker | null = null;

  let flippedStickers = new Set<number>();

  let tradeDialog: HTMLDialogElement;
  let tradeUserId: number | null | undefined;

  const lightDismissDialog: MouseEventHandler<HTMLDialogElement> = (e) => {
    // This only works if the dialog has no padding and
    // the direct child elements have no margins.
    const dialog = e.currentTarget;
    if (e.target === dialog) {
      dialog.close();
    }
  }

  const openMenu = async (sticker: Sticker) => {
    menuSticker = sticker;
    menu.showModal();
  }

  const onMenuClosed = () => {
    menuSticker = null;
  }

  const flipSticker = () => {
    if (menuSticker === null) {
      return;
    }

    const ownedStickerId = menuSticker.ownedStickerId;

    if (flippedStickers.has(ownedStickerId)) {
      flippedStickers.delete(ownedStickerId);
    } else {
      flippedStickers.add(ownedStickerId);
    }

    // Force Svelte to update the UI
    flippedStickers = flippedStickers;
  }

  const addStickerToAlbum = async () => {
    if (menuSticker === null) {
      return;
    }

    const response = await fetch("/api/deck/add-to-album", {
      method: "POST",
      body: JSON.stringify({
        ownedStickerId: menuSticker.ownedStickerId,
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    if (response.ok) {
      await invalidateAll();
      menu.close();
    } else {
      const message = (await response.json()).message;
      alert.show("Error", message);
    }
  }

  const promptToDiscardSticker = async () => {
    if (menuSticker === null) {
      return;
    }

    const confirmed = confirm("Are you sure you want to discard this sticker?");

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/deck/discard", {
      method: "POST",
      body: JSON.stringify({
        ownedStickerId: menuSticker.ownedStickerId,
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    if (response.ok) {
      await invalidateAll();
      menu.close();
    } else {
      const message = (await response.json()).message;
      alert.show("Error", message);
    }
  }

  const onTradeDialogClosed = async () => {
    if (tradeDialog.returnValue === "confirm" && tradeUserId != null) {
      await trade(tradeUserId)
    }
    tradeUserId = null;
  }

  const trade = async (userId: number) => {
    if (menuSticker === null) {
      return;
    }

    const response = await fetch("/api/deck/trade", {
      method: "POST",
      body: JSON.stringify({
        ownedStickerId: menuSticker.ownedStickerId,
        recipientUserId: userId,
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    if (response.ok) {
      await invalidateAll();
      menu.close();
    } else {
      const message = (await response.json()).message;
      alert.show("Error", message);
    }
  }
</script>

<svelte:head>
  <title>Deck | StickerAlbum</title>
</svelte:head>

<h1>Deck</h1>

{#if data.canOpenPacket}

  <form method="post" action="?/openPacket" class="packet-form" use:enhance>
    <button type="submit" class="open-packet-button">
      <img src="/packet.png" alt="Packet" />
    </button>

    {#if form && form.success == false}
      <p class="error">
        {form.message}
      </p>
    {/if}
  </form>

{:else}

  <div class="packets-info">
    <p>Next packet</p>
    <Countdown countdownTo={data.nextPacket} />
  </div>

{/if}

<div class="deck">
  {#each data.deck as sticker}
    <div class="sticker-wrapper">
      <button class="sticker two-sided" class:flipped={flippedStickers.has(sticker.ownedStickerId)} on:click={() => openMenu(sticker)}>
        <div class="front" class:shiny={sticker.isShiny}>
          <img src={getStickerImageUrl(sticker.title)} alt={sticker.title} />
        </div>
        <div class="back">
          <p class="number">{sticker.number}</p>
          <p>{sticker.title}</p>
        </div>
      </button>
    </div>
  {/each}
</div>

<Alert bind:this={alert} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={menu} id="menu-dialog" on:close={onMenuClosed} on:click={lightDismissDialog}>
  <div class="items">
    <button type="button" on:click={() => menu.close()}>
      ✖️ Cancel
    </button>

    <button type="button" on:click={flipSticker}>
      🙃 Flip sticker
    </button>

    <button type="button" on:click={addStickerToAlbum}>
      ✅ Add to album
    </button>

    <button type="button" on:click={() => tradeDialog.showModal()}>
      🤝 Trade
    </button>

    <button type="button" on:click={promptToDiscardSticker}>
      🗑️ Discard
    </button>
  </div>
</dialog>

<dialog bind:this={tradeDialog} id="trade-dialog" on:close={onTradeDialogClosed}>
  <form method="dialog">
    <div>
      <label for="user-id">User ID</label>
      <input bind:value={tradeUserId} id="user-id" type="number" required min="1" autocomplete="off" />
    </div>

    <div class="trade-actions">
      <button type="submit" value="confirm">✅ Send</button>
      <button type="submit" formnovalidate>❌ Cancel</button>
    </div>
  </form>
</dialog>

<style>
  h1 {
    font-size: 2rem;
    text-align: center;
    margin-block-end: 1.5em;
  }

  .packets-info {
    display: flex;
    flex-direction: column;
    align-items: center;

    & > p {
      margin-block: 0;
    }
  }

  .packet-form {
    max-width: 400px;
    margin-inline: auto;
    container-type: inline-size;

    & .error {
      border: 1px solid red;
      padding: 1em;
    }
  }

  /* TODO: Nesting this inside .packet-form causes the animation keyframes to not be found. Why? */
  .packet-form button {
    cursor: pointer;
    border-radius: 0;
    padding: 0;
    background: white;
    border: 6cqi solid rgb(35, 56, 150);
    outline-offset: 5px;
    animation: 5s wiggle linear infinite;
    box-sizing: content-box;
    aspect-ratio: var(--sticker-image-aspect-ratio);

    & > img {
      width: 100%;
      object-fit: cover;
    }
  }

  @keyframes wiggle {
    0% {
      rotate: 0deg;
    }
    5% {
      rotate: -2deg;
    }
    15% {
      rotate: 2deg;
    }
    25% {
      rotate: 0deg;
    }
    100% {
      rotate: 0deg;
    }
  }

  .deck {
    margin-block-start: 2rem;
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(auto-fit, minmax(0, 350px));
    gap: 2rem;
  }

  .sticker-wrapper {
    container-type: inline-size;
  }

  .sticker {
    /* Prevent layout shift while image is loading */
    inline-size: 100%;

    display: block;
    position: relative;
    cursor: pointer;

    outline-offset: 5px;
    border: 0;
    border-radius: 0;
    padding: 0;
    background: none;

    &:is(:active, :hover) {
      background: none;
    }

    & :is(.front, .back) {
      border-width: 3cqi;
      border-style: solid;
    }

    & .front {
      inline-size: 100%;
      border-color: var(--sticker-border-color);
      background: var(--sticker-background-color);
      outline-width: 1px;
      outline-style: solid;
      outline-color: var(--sticker-image-outline-color);
      outline-offset: calc(-3cqi - 1px);

      &.shiny {
        --shiny-sticker-highlight-color: hsl(0, 0%, 100%);
        --shiny-sticker-border-gradient-start-angle: 30deg;
        --shiny-sticker-border-gradient-angle-shift: 10deg;
        --shiny-sticker-border-gradient-angle: var(--shiny-sticker-border-gradient-start-angle);

        --shiny-sticker-border-gradient: linear-gradient(
          var(--shiny-sticker-border-gradient-angle, 30deg),
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

    & .back {
      /* Remove from normal document flow so it doesn't affect the size of the sticker */
      position: absolute;
      inset: 0;

      border-color: var(--sticker-border-color);
      background: var(--sticker-back-background-color);
      color: var(--sticker-back-text-color);
      padding: 3cqi;

      display: grid;
      place-content: center;

      & > p {
        margin: 0;
        text-align: center;
      }

      & > p.number {
        font-size: 3em;
      }
    }
  }

  #menu-dialog {
    & .items {
      display: grid;
      gap: 1rem;
      padding: 1rem;

      & > button {
        text-align: start;
      }
    }
  }

  #trade-dialog {
    max-inline-size: 300px;

    & form {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      & label {
        display: block;
        margin-block-end: 0.25em;
      }

      & input {
        display: block;
        inline-size: 120px;
      }

      & .trade-actions {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
      }
    }
  }

  /* All styles related to the 3D flipping effect */
  .two-sided {
    transform-style: preserve-3d;
    transition: transform 0.6s ease;

    & .front, .back {
      backface-visibility: hidden;
    }

    & .back {
      transform: rotateY(180deg);
    }

    &.flipped {
      transform: perspective(600px) rotateY(180deg);
    }
  }
</style>