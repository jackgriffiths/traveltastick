<script lang="ts">
  import type { EventHandler, MouseEventHandler } from "svelte/elements";

  let dialog: HTMLDialogElement;

  const lightDismissDialog: MouseEventHandler<HTMLDialogElement> = (e) => {
    // This only works if the dialog has no padding and
    // the direct child elements have no margins.
    const dialog = e.currentTarget;
    if (e.target === dialog) {
      dialog.close();
    }
  }

  let title = "";
  let message = "";
  let confirmButtonText = "";
  let cancelButtonText = "";
  let onConfirm: Function | null;
  let onCancel: Function | null;

  export const show = (params: { title: string, message: string, confirmButtonText: string, cancelButtonText: string, onConfirm: Function, onCancel: Function | null }) => {
    title = params.title;
    message = params.message;
    confirmButtonText = params.confirmButtonText || "Confirm";
    cancelButtonText = params.cancelButtonText || "Cancel";
    onConfirm = params.onConfirm;
    onCancel = params.onCancel;

    dialog.showModal();
  }

  const onClose: EventHandler<Event, HTMLDialogElement> = (e) => {
    if (e.currentTarget.returnValue === "confirm") {
      if (onConfirm) {
        onConfirm();
      }
    } else if (e.currentTarget.returnValue === "cancel") {
      if (onCancel) {
        onCancel();
      }
    }

    title = "";
    message = "";
    onConfirm = null;
    onCancel = null;
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:close={onClose} on:click={lightDismissDialog}>
  <div>
    <p class="title">{title}</p>
    <p>{message}</p>
    
    <form method="dialog">
      <button type="submit" value="cancel">
        {cancelButtonText}
      </button>
      <button type="submit" value="confirm">
        {confirmButtonText}
      </button>
    </form>
  </div>
</dialog>

<style>
  dialog > div {
    padding: 1.25rem;
  }

  p {
    margin: 0;
  }

  .title {
    font-size: 1.5rem;
    font-weight: var(--fw-bold);
    margin-block-end: 0.25rem;
  }

  form {
    margin-block-start: 1.5rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: end;
    gap: 0.5rem;
  }
</style>