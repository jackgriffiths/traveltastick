<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { fade, slide, type FadeParams } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { Alert, Confirm, Dialog } from '$lib/components';
  import { postJson, readError } from "$lib/fetch";
  import { getStickerImageUrl } from '$lib/stickers';
  import Countdown from './Countdown.svelte';

  export let data;
  export let form;

  type Sticker = typeof data.deck[0];

  let alert: Alert;
  let confirm: Confirm;

  let menu: Dialog;
  let menuSticker: Sticker | null = null;

  let flippedStickers = new Set<number>();
  const stickerFadeInDuration = 1000;
  
  // Stickers should only fade in after opening a packet.
  // The 3 stickers from the packet will be at the top.
  const getFadeInParams = (index: number): FadeParams => {

    if (index <= 2) {
      // Stagger the transitions
      return {
        delay: index * stickerFadeInDuration,
        duration: stickerFadeInDuration,
        easing: cubicInOut,
      }
    } else {
      // There might be an extra new sticker if the user received a sticker
      // from a friend but hadn't refreshed the page yet. This sticker will
      // not be faded in because we only want to fade in the stickers from
      // the packet.
      return {
        delay: 0,
        duration: 0,
      }
    }
  }

  let tradeDialog: Dialog;
  let tradeOwnedStickerId: number | null | undefined;
  let tradeUserId: number | null | undefined;

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

    menu.close();
  }

  const addStickerToAlbum = async () => {
    if (menuSticker === null) {
      return;
    }

    const response = await postJson("/api/deck/add-to-album", {
      ownedStickerId: menuSticker.ownedStickerId,
    });

    if (response.ok) {
      menu.close();

      const responseJson = await response.json();

      if (responseJson.isDuplicate) {
        alert.show("Oh!", "You've already got this sticker in your album. Maybe you can trade it for one you need.");
      } else {
        await invalidateAll();
      }
    } else {
      alert.show("Error", await readError(response));
    }
  }

  const confirmDiscardSticker = async () => {
    if (menuSticker === null) {
      return;
    }

    // Capture this before the menu is closed.
    const ownedStickerId = menuSticker.ownedStickerId;
    menu.close();

    confirm.show({
      titleIcon: null,
      title: "Discard",
      message: "Are you sure you want to discard this sticker?",
      confirmButtonIcon: "🗑️",
      confirmButtonText: "Discard",
      cancelButtonIcon: null,
      cancelButtonText: "Cancel",
      onConfirm: async () => {
        await discardSticker(ownedStickerId);
      },
      onCancel: null
    });
  }

  const discardSticker = async (ownedStickerId: number) => {
    const response = await postJson("/api/deck/discard", {
      ownedStickerId: ownedStickerId,
    });

    if (response.ok) {
      await invalidateAll();
      menu.close();
    } else {
      alert.show("Error", await readError(response));
    }
  }

  const showTradeDialog = () => {
    if (menuSticker === null) {
      return;
    }

    // Capture this before the menu is closed.
    tradeOwnedStickerId = menuSticker.ownedStickerId;
    menu.close();

    tradeDialog.showModal();
  }

  const onTradeDialogClosed = async (e: CustomEvent<{ returnValue: string }>) => {
    if (e.detail.returnValue === "confirm" && tradeOwnedStickerId != null && tradeUserId != null) {
      await trade(tradeOwnedStickerId, tradeUserId);
    }

    tradeOwnedStickerId = null;
    tradeUserId = null;
  }

  const trade = async (ownedStickerId: number, userId: number) => {
    const response = await postJson("/api/deck/trade", {
      ownedStickerId: ownedStickerId,
      recipientUserId: userId,
    });

    if (response.ok) {
      await invalidateAll();
      menu.close();
    } else {
      alert.show("Error", await readError(response));
    }
  }
</script>

<svelte:head>
  <title>Deck | Traveltastick</title>
</svelte:head>

<h1>Deck</h1>

{#if data.canOpenPacket}

  <form method="post" action="?/openPacket" class="packet-form" use:enhance>
    <button type="submit" class="open-packet-button">
      <img src="/packet.jpg" alt="Packet" />
    </button>

    {#if form && form.success == false}
      <p class="error">
        {form.message}
      </p>
    {/if}
  </form>

{:else}

  <div class="packets-info" in:slide={{ delay: (3 * stickerFadeInDuration) + 400 }}>
    <p>Next packet</p>
    <Countdown countdownTo={data.nextPacket} />
  </div>

{/if}

<div class="deck">
  {#each data.deck as sticker, index (sticker.ownedStickerId)}
    <div class="sticker-wrapper" in:fade={getFadeInParams(index)}>
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
<Confirm bind:this={confirm} />

<Dialog bind:this={menu} on:close={onMenuClosed}>
  <div id="menu-dialog-content">
    <button type="button" on:click={() => menu.close()}>
      <span aria-hidden="true">✖️</span> Cancel
    </button>

    <button type="button" on:click={flipSticker}>
      <span aria-hidden="true">🙃</span> Flip sticker
    </button>

    <button type="button" on:click={addStickerToAlbum}>
      <span aria-hidden="true">✅</span> Add to album
    </button>

    <button type="button" on:click={showTradeDialog}>
      <span aria-hidden="true">🤝</span> Send to a friend
    </button>

    <button type="button" on:click={confirmDiscardSticker}>
      <span aria-hidden="true">🗑️</span> Discard
    </button>
  </div>
</Dialog>

<Dialog bind:this={tradeDialog} on:close={onTradeDialogClosed}>
  <div id="trade-dialog-content">
    <p class="title">Send to a friend</p>
    <p>Your friend can find their User ID from the Account page.</p>
  
    <form method="dialog">
      <div>
        <label for="user-id">User ID</label>
        <input bind:value={tradeUserId} id="user-id" type="number" required min="1" autocomplete="off" />
      </div>
  
      <div class="trade-actions">
        <button type="button" on:click={() => tradeDialog.close("cancel")}>
          Cancel
        </button>
        <button type="submit" value="confirm">
          <span aria-hidden="true">📩</span> Send
        </button>
      </div>
    </form>
  </div>
</Dialog>

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
    inline-size: 100%;
    cursor: pointer;
    border-radius: 0;
    padding: 0;
    background: white;
    border: none;
    outline-offset: 5px;
    animation: 5s wiggle linear infinite;
    box-sizing: content-box;
    aspect-ratio: var(--sticker-image-aspect-ratio);

    & > img {
      width: 100%;
      height: 100%;
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
      border-width: 3.5cqi;
      border-style: solid;
    }

    & .front {
      inline-size: 100%;
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
        animation: 8s shine ease-in-out alternate infinite;
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

  #menu-dialog-content {
    display: grid;
    gap: 1rem;

    & > button {
      text-align: start;
    }
  }

  #trade-dialog-content {
    & p {
      margin: 0;
      max-width: 30ch;
    }

    & .title {
      font-size: 1.5rem;
      font-weight: var(--fw-bold);
      margin-block-end: 0.25rem;
    }

    & form {
      margin-block-start: 1.5rem;

      & label {
        display: block;
        margin-block-end: 0.25em;
      }

      & input {
        display: block;
        inline-size: 100%;
      }
    }

    & .trade-actions {
      margin-block-start: 1.5rem;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: end;
      gap: 0.5rem;
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