<script lang="ts">
    import LogView from "$lib/LogView.svelte";
    import Component from "./Component.svelte";
    import { browser } from "$app/environment";
    import { onMount, onDestroy } from "svelte";
    import {log} from '$lib/index.js'


    export let data;
    log({
        message: "Recieved data",
        data
    })

    onMount(async () => {

    });
</script>

<Component/>
<LogView/>
<style>
    .container {
        width: 100%;
        height: 300px;
    }
</style>

