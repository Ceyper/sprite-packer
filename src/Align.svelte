<script>
    import { createEventDispatcher } from "svelte";
    import { align as fallback } from "./store.js";

    export let align = undefined;
    export let setStore = false;

    function getX(x) {
        switch (x) {
            case 0:
                return "left";
            case 1:
                return "center";
            case 2:
                return "right";
        }
    }

    function getY(y) {
        switch (y) {
            case 0:
                return "top";
            case 1:
                return "center";
            case 2:
                return "bottom";
        }
    }

    let a;
    $: a = align || setStore && $fallback;

    function active(x, y) {

        return a.x == getX(x) && a.y == getY(y);
    }

    const dispatch = createEventDispatcher();
    function setActive(x, y) {
        if (setStore) {
            $fallback.x = getX(x);
            $fallback.y = getY(y);
            $fallback = $fallback;
        } else {
            dispatch("change", { align: { x: getX(x), y: getY(y) } });
        }
    }
</script>

<div class="align">
    <div
        class:active={a, active(0, 0)}
        on:click={() => setActive(0, 0)}
    />
    <div
        class:active={a, active(1, 0)}
        on:click={() => setActive(1, 0)}
    />
    <div
        class:active={a, active(2, 0)}
        on:click={() => setActive(2, 0)}
    />

    <div
        class:active={a, active(0, 1)}
        on:click={() => setActive(0, 1)}
    />
    <div
        class:active={a, active(1, 1)}
        on:click={() => setActive(1, 1)}
    />
    <div
        class:active={a, active(2, 1)}
        on:click={() => setActive(2, 1)}
    />

    <div
        class:active={a, active(0, 2)}
        on:click={() => setActive(0, 2)}
    />
    <div
        class:active={a, active(1, 2)}
        on:click={() => setActive(1, 2)}
    />
    <div
        class:active={a, active(2, 2)}
        on:click={() => setActive(2, 2)}
    />
</div>

<style>
    .align {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 0.1em;

        width: 2.1em;
        height: 2.1em;
    }

    .align > div {
        box-sizing: border-box;
        background-color: var(--c150);
        border: 1px solid var(--c300);
    }

    .align > div:nth-child(1) {
        border-top-left-radius: 2px;
    }
    .align > div:nth-child(3) {
        border-top-right-radius: 2px;
    }
    .align > div:nth-child(7) {
        border-bottom-left-radius: 2px;
    }
    .align > div:nth-child(9) {
        border-bottom-right-radius: 2px;
    }

    .align > div:hover {
        background: var(--c200);
    }

    .align .active {
        border-color: var(--c700);
        background-color: var(--c200);
    }
</style>
