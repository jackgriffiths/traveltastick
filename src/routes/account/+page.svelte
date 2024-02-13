<script>
  export let data;
</script>

<p>
  User ID: {data.userId}
</p>

<form method="post" action="?/logout">
  <button type="submit">
    Logout
  </button>
</form>