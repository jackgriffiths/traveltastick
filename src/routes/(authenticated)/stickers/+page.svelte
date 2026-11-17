<script lang="ts">
  import { cubicInOut } from 'svelte/easing';
  import { fade, slide, type FadeParams } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { goto, invalidateAll } from '$app/navigation';
  import { Alert, Confirm, Dialog } from '$lib/components';
  import { postJson, readError } from "$lib/fetch";
  import { getStickerHeadingId, getStickerImageUrl } from '$lib/stickers';
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

  // How long the packet takes to tear open and drop away. Must match the CSS animations.
  const packetOpenDuration = 900;
  let isOpeningPacket = false;

  const openPacket: SubmitFunction = () => {
    isOpeningPacket = true;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const packetOpened = new Promise(resolve => setTimeout(resolve, prefersReducedMotion ? 0 : packetOpenDuration));

    return async ({ update }) => {
      // Let the packet finish tearing open before the stickers replace it.
      await packetOpened;
      await update();
      isOpeningPacket = false;
    };
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

    const ownedStickerId = menuSticker.ownedStickerId;
    const stickerTitle = menuSticker.title;
    const stickerNumber = menuSticker.number;

    const response = await postJson("/api/deck/add-to-album", {
      ownedStickerId: ownedStickerId
    });

    if (response.ok) {
      menu.close();

      const responseJson = await response.json();

      if (responseJson.isDuplicate) {
        alert.show("Oh!", "You've already got this sticker in your album. Maybe you can trade it for one you need.");
      } else {
        await goto(`/?stick=${stickerNumber}#${getStickerHeadingId(stickerTitle)}`);
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
  <title>Stickers | Traveltastick</title>
</svelte:head>

<h1>Stickers</h1>

{#if data.canOpenPacket}

  <form method="post" action="?/openPacket" class="packet-form" use:enhance={openPacket}>
    <button type="submit" class="packet" class:opening={isOpeningPacket} disabled={isOpeningPacket}>
      <span class="packet-crimp packet-crimp-top" aria-hidden="true"></span>
      <span class="packet-body">
        <img src="/packet.jpg" alt="Open packet" />
      </span>
      <span class="packet-crimp packet-crimp-bottom" aria-hidden="true"></span>
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
        <div class="front" class:shiny={sticker.isShiny} style:--glint-delay="{(index % 4) * 1.5}s">
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
        <input bind:value={tradeUserId} id="user-id" type="number" inputmode="numeric" required min="1" autocomplete="off" />
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

  /*
    The packet is drawn to look like a foil wrapper: crimped, heat-sealed ends,
    and puffed-up foil with a glint of light that sweeps across it.

    Everything is painted once. The only things that animate are `transform` and
    `opacity`, which the browser can run on the compositor (GPU) without
    repainting, so it is cheap to run on low-end phones.
  */
  .packet {
    --foil-dark: hsl(210 65% 16%);
    --foil-mid: hsl(205 50% 45%);
    --foil-light: hsl(200 65% 78%);
    --foil-shine: hsl(195 100% 97%);
    --crimp-size: 9cqi;
    --crimp-tooth-size: 3cqi;

    display: grid;
    inline-size: 100%;
    cursor: pointer;
    border: none;
    border-radius: 0;
    padding: 0;
    background: none;
    outline-offset: 5px;

    &:is(:hover, :active, :disabled) {
      background: none;
    }

    &:disabled {
      cursor: default;
    }
  }

  /* TODO: Nesting this inside .packet causes the animation keyframes to not be found. Why? */
  .packet {
    animation: 5s wiggle linear infinite;
  }

  .packet-crimp {
    display: block;
    block-size: var(--crimp-size);
    background:
      /* The ridges pressed into the seal, lit from one side */
      repeating-linear-gradient(
        90deg,
        hsl(0 0% 0% / 0.4) 0,
        hsl(0 0% 100% / 0.35) 1cqi,
        hsl(0 0% 100% / 0) 2cqi,
        hsl(0 0% 0% / 0.4) 3cqi),
      /* Metallic bands of light across the seal */
      linear-gradient(
        180deg,
        var(--foil-dark) 0%,
        var(--foil-shine) 16%,
        var(--foil-mid) 30%,
        var(--foil-dark) 46%,
        var(--foil-light) 62%,
        var(--foil-shine) 74%,
        var(--foil-mid) 87%,
        var(--foil-dark) 100%);

    /* A zig-zag edge, like a seal cut with pinking shears */
    --teeth: conic-gradient(from var(--teeth-angle) at var(--teeth-edge), #0000, #000 1deg 89deg, #0000 90deg)
      var(--teeth-edge) / var(--crimp-tooth-size) calc(var(--crimp-tooth-size) / 2) repeat-x;
    --solid: linear-gradient(#000 0 0) var(--solid-edge) / 100% calc(100% - var(--crimp-tooth-size) / 2) no-repeat;
    -webkit-mask: var(--teeth), var(--solid);
    mask: var(--teeth), var(--solid);
  }

  .packet-crimp-top {
    --teeth-angle: 135deg;
    --teeth-edge: top;
    --solid-edge: bottom;
    transform-origin: 100% 100%;
  }

  .packet-crimp-bottom {
    --teeth-angle: -45deg;
    --teeth-edge: bottom;
    --solid-edge: top;
  }

  .packet-body {
    display: block;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2cqi 4cqi hsl(0 0% 0% / 0.35);

    & > img {
      inline-size: 100%;
      aspect-ratio: var(--sticker-image-aspect-ratio);
      object-fit: cover;
    }

    /* The foil: shading where the packet puffs up, creases from the seals, and a holographic tint */
    &::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        /* A thin bright edge where the foil folds around the sides */
        linear-gradient(90deg, hsl(0 0% 100% / 0.45), transparent 1.2%, transparent 98.8%, hsl(0 0% 100% / 0.45)),
        /* Darker at the edges, where the foil curves away */
        linear-gradient(90deg, hsl(0 0% 0% / 0.4), transparent 9%, transparent 91%, hsl(0 0% 0% / 0.4)),
        linear-gradient(180deg, hsl(0 0% 0% / 0.35), transparent 10%, transparent 90%, hsl(0 0% 0% / 0.35)),
        /* Soft highlights where the foil bulges */
        linear-gradient(100deg, transparent 15%, hsl(0 0% 100% / 0.25) 28%, transparent 40%, transparent 62%, hsl(0 0% 100% / 0.12) 72%, transparent 82%),
        /* Holographic tint */
        linear-gradient(
          115deg,
          hsl(330 90% 70% / 0.14),
          hsl(45 95% 65% / 0.1) 25%,
          hsl(150 80% 60% / 0.1) 50%,
          hsl(195 95% 65% / 0.14) 75%,
          hsl(275 85% 70% / 0.14));
    }

    &::after {
      content: "";
      position: absolute;
      inset-block: -30%;
      inset-inline-start: 0;
      inline-size: 45%;
      background: var(--shiny-sticker-glint);
      pointer-events: none;
      transform: translateX(-150%) rotate(20deg);
      animation: var(--shiny-sticker-glint-animation);
      animation-delay: 1s;
    }
  }

  /*
    Opening the packet: the top seal is torn off, then the packet drops away.
    These durations must add up to `packetOpenDuration` in the script.
  */
  .packet.opening {
    animation: packet-drop-away 400ms 500ms ease-in forwards;
  }

  .packet.opening .packet-crimp-top {
    animation: packet-tear-off 550ms ease-in forwards;
  }

  @keyframes packet-tear-off {
    0% {
      transform: none;
    }
    30% {
      transform: translateY(-15%) rotate(-4deg);
    }
    100% {
      transform: translate(40%, -300%) rotate(-25deg);
      opacity: 0;
    }
  }

  @keyframes packet-drop-away {
    100% {
      transform: translateY(15%) scale(0.92);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .packet,
    .packet.opening,
    .packet.opening .packet-crimp-top {
      animation: none;
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
        /*
          The foil frame is drawn with padding rather than a border (same size),
          so that `overflow: hidden` clips the glint to the edge of the frame.
        */
        position: relative;
        overflow: hidden;
        border-width: 0;
        padding: 3.5cqi;
        /* Chrome rounds border widths down to whole pixels, so do the same to keep shiny and normal stickers exactly the same size. */
        padding: round(down, 3.5cqi, 1px);
        background-color: var(--shiny-sticker-color);
        background-image: var(--shiny-sticker-foil);

        &::after {
          content: "";
          position: absolute;
          inset-block: -30%;
          inset-inline-start: 0;
          inline-size: 45%;
          background: var(--shiny-sticker-glint);
          pointer-events: none;
          transform: translateX(-150%) rotate(20deg);
          animation: var(--shiny-sticker-glint-animation);
          /* Stagger the glint so that shiny stickers in the deck don't all glint at once. */
          animation-delay: var(--glint-delay, 0s);
        }
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

      /* No need to animate the glint while the front of the sticker is hidden. */
      & .front.shiny::after {
        animation: none;
      }
    }
  }
</style>