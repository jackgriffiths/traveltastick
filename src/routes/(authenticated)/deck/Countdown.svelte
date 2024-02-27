<script lang="ts">
  import { onMount } from "svelte";
  import { getTimeUntil } from "$lib/dates";

  export let countdownTo: Date;

  let now = new Date();
  $: timeUntil = getTimeUntil(now, countdownTo);

  onMount(() => {
    now = new Date();

    const interval = setInterval(() => {
      now = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  });

  const formatTime = (timespan: ReturnType<typeof getTimeUntil>) => {
    const format = (number: number) => number.toString().padStart(2, "0");
    return `${format(timespan.hours)}:${format(timespan.minutes)}:${format(timespan.seconds)}`;
  }
</script>

<p>{formatTime(timeUntil)}</p>

<style>
  p {
    font-size: 2rem;
    font-family: var(--ff-monospace);
    font-weight: var(--fw-bold);
  }
</style>