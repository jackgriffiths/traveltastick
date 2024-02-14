<script lang="ts">
  let dialog: HTMLDialogElement;

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

<dialog bind:this={dialog} on:close={onClose}>
  <p class="title">{content.title}</p>
  <p>{content.message}</p>

  <form>
    <button formmethod="dialog">OK</button>
  </form>
</dialog>

<style>
  dialog {
    padding: 1.25rem;
  }

  .title {
    font-size: 1.5rem;
    font-weight: var(--fw-bold);
  }

  form {
    margin-block-start: 2rem;
  }
</style>