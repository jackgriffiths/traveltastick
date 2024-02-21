<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { EventHandler, MouseEventHandler } from "svelte/elements";

  let dialog: HTMLDialogElement;

  const dispatch = createEventDispatcher<{ close: { returnValue: string } }>();

  export const showModal = () => {
    dialog.showModal();
  }

  export const close = (returnValue?: string) => {
    dialog.close(returnValue);
  }

  const onClick: MouseEventHandler<HTMLDialogElement> = (e) => {
    // This only works if the dialog has no padding and
    // the direct child elements have no margins.
    const dialog = e.currentTarget;
    if (e.target === dialog) {
      dialog.close();
    }
  }

  const onClose: EventHandler<Event, HTMLDialogElement> = (e) => {
    dispatch("close", { returnValue: e.currentTarget.returnValue });
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:click={onClick} on:close={onClose}>
  <div>
    <slot />
  </div>
</dialog>

<style>
  dialog > div {
    padding: 1.25rem;
  }
</style>