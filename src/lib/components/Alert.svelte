<script lang="ts">
  import Dialog from "./Dialog.svelte";

  let dialog: Dialog;

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

<Dialog bind:this={dialog} on:close={onClose}>
  <p class="title">{content.title}</p>
  <p>{content.message}</p>

  <form>
    <button formmethod="dialog">OK</button>
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
    margin-block-start: 2rem;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: end;
    gap: 0.5rem;
  }
</style>