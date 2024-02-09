<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data;
  export let form;

  let dialog: HTMLDialogElement;

  let onDialogClosed = () => {
    selected = null;
    isSelectedStickerFlipped = false;
  }

  type Sticker = typeof data.deck[0];
  let selected: Sticker | null = null;
  let isSelectedStickerFlipped = false;

  let openDialog = (sticker: Sticker) => {
    selected = sticker;
    dialog.showModal();
  }

  const addToAlbum = async () => {
    if (selected === null) {
      return;
    }

    const response = await fetch("/api/deck/add-to-album", {
      method: "POST",
      body: JSON.stringify({
        ownedStickerId: selected.ownedStickerId,
      }),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    if (response.ok) {
      await invalidateAll();
      dialog.close();
    } else {
      const message = (await response.json()).message;
      alert(message);
    }
  }
</script>

<h1>Deck</h1>

{#if data.canOpenPacket}

  <form method="post" action="?/openPacket" use:enhance>
    <button type="submit">Open packet</button>

    {#if form && form.success == false}
      <p class="error">
        {form.message}
      </p>
    {/if}
  </form>

{:else}

  <div class="packets-info">
    <p>Next packet in {data.nextPacket}</p>
  </div>

{/if}

<div class="deck">
  {#each data.deck as sticker}
    <button class="sticker" on:click={() => openDialog(sticker)}>
      <img src={sticker.imageUrl} alt={sticker.title} />
    </button>
  {/each}
</div>

<dialog bind:this={dialog} on:close={onDialogClosed}>
  {#if selected != null}

    <div class="selected-sticker two-sided" class:flipped={isSelectedStickerFlipped}>
      <div class="front">
        <img src={selected.imageUrl} alt={selected.title} />
      </div>
      <div class="back">
        <span class="number">{selected.number}</span>
        <span>{selected.title}</span>
      </div>
    </div>

    <div class="actions">
      <button type="button" on:click={() => isSelectedStickerFlipped = !isSelectedStickerFlipped}>
        Flip sticker
      </button>

      <button type="button" on:click={addToAlbum}>
        Add to album
      </button>

      <button type="button" on:click={() => dialog.close()}>
        Close
      </button>
    </div>

  {/if}
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
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    & .error {
      border: 1px solid red;
      padding: 1em;
    }
  }

  button {
    min-width: 70px;
    padding-inline: 1em;
    padding-block: 0.5em;
  }

  .deck {
    max-width: 300px;
    margin-inline: auto;
    margin-block-start: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    /* Stickers are the same width as the deck and use the width to calculate border width */
    container-type: inline-size;
  }

  button.sticker {
    display: block;
    outline-offset: 5px;
    border: 2cqi solid white;
    background: transparent;
    padding: 0;
    aspect-ratio: var(--sticker-aspect-ratio);
    position: relative;
    transition: scale 0.2s linear;

    &:hover {
      scale: 1.05;
    }

    & img {
      /* Without absolutely positioning the image, it makes the sticker too tall. TODO: why */
      position: absolute;
      inset: 0;
      width: 100%;
      object-fit: cover;
    }
  }

  dialog {
    margin: auto;
    background: transparent;
    border: 0;
    /* Prevents clipping during the 3D flip animation */
    overflow: visible;

    &::backdrop {
      background: #000000ee;
    }

    & .actions {
      margin-block-start: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  }

  /* The sticker in the dialog */
  .selected-sticker {
    width: 400px;
    max-width: 100%;
    aspect-ratio: var(--sticker-aspect-ratio);
    container-type: inline-size;

    & .front, .back {
      border: 2cqi solid white;
    }

    & .front > img {
      width: 100%;
      object-fit: cover;
    }

    & .back {
      background: hsl(203, 60%, 14%);
      padding: 3cqi;
      color: white;
      text-align: center;
      display: flex;
      flex-direction: column;
      font-size: 1.5rem;

      & .number {
        font-size: 4rem;
        margin-block: auto;
      }
    }
  }

  /* All styles related to the 3D flipping effect */
  .two-sided {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;

    & .front, .back {
      position: absolute;
      inset: 0;
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