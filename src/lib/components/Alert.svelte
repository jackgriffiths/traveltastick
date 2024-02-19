<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";

  let dialog: HTMLDialogElement;

  const lightDismissDialog: MouseEventHandler<HTMLDialogElement> = (e) => {
    // This only works if the dialog has no padding and
    // the direct child elements have no margins.
    const dialog = e.currentTarget;
    if (e.target === dialog) {
      dialog.close();
    }
  }

  let content = {
    title: "",
    message: ""
  }

  export const show = (title: string, message: string) => {
    content = {
      title: title,
      message: message,
    }

    dialog.showModal();
  }

  const onClose = () => {
    content.title = "";
    content.message = "";
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog bind:this={dialog} on:close={onClose} on:click={lightDismissDialog}>
  <div>
    <p class="title">{content.title}</p>
    <p>{content.message}</p>
  
    <form>
      <button formmethod="dialog">OK</button>
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
    margin-block-start: 2rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: end;
    gap: 0.5rem;
  }
</style>