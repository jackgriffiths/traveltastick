<script lang="ts">
  import Dialog from "./Dialog.svelte";

  let dialog: Dialog;

  let titleIcon = "";
  let title = "";
  let message = "";
  let confirmButtonIcon = "";
  let confirmButtonText = "";
  let cancelButtonIcon = "";
  let cancelButtonText = "";
  let onConfirm: Function | null;
  let onCancel: Function | null;

  export const show = (params: { titleIcon: string | null, title: string, message: string, confirmButtonIcon: string | null, confirmButtonText: string, cancelButtonIcon: string | null, cancelButtonText: string, onConfirm: Function, onCancel: Function | null }) => {
    titleIcon = params.titleIcon || "";
    title = params.title;
    message = params.message;
    confirmButtonIcon = params.confirmButtonIcon || "";
    confirmButtonText = params.confirmButtonText || "Confirm";
    cancelButtonIcon = params.cancelButtonIcon || "";
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
  <p class="title">
    {#if titleIcon !== ""}
      <span aria-hidden="true">{titleIcon}</span>
    {/if}
    {title}
  </p>

  <p>{message}</p>

  <form method="dialog">
    <button type="submit" value="cancel">
      {#if cancelButtonIcon !== ""}
        <span aria-hidden="true">{cancelButtonIcon}</span>
      {/if}
      {cancelButtonText}
    </button>
    <button type="submit" value="confirm">
      {#if confirmButtonIcon !== ""}
        <span aria-hidden="true">{confirmButtonIcon}</span>
      {/if}
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