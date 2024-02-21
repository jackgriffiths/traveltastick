<script lang="ts">
  import Dialog from "./Dialog.svelte";

  let dialog: Dialog;

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

  const onClose = (e: CustomEvent<{ returnValue: string }>) => {
    if (e.detail.returnValue === "confirm") {
      if (onConfirm) {
        onConfirm();
      }
    } else if (e.detail.returnValue === "cancel") {
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

<Dialog bind:this={dialog} on:close={onClose}>
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
</Dialog>

<style>
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