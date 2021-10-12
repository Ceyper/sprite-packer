<script>
    import { createEventDispatcher } from "svelte";
    import Align from "./Align.svelte";

    export let pixelated = true;

    export let spriteData;
    export let spriteWidth, spriteHeight;

    export let align;

    export let callbacks;

    let fileinput;
    const dispatch = createEventDispatcher();
    const onFileSelected = (e) => {
        dispatch("changeSprites", {
            files: e.target.files,
            origin: {
                x: spriteData.x,
                y: spriteData.y,
            },
        });
    };

    let dropOver = false;
    function dragEnter(e) {
        dropOver = true;
    }

    function dragLeave(e) {
        dropOver = false;
    }

    function block(e) {
        e.preventDefault();
        e.stopPropagation();
        return true;
    }

    function clear(e) {
        spriteData.sprite = undefined;
        spriteData.width = undefined;
        spriteData.height = undefined;
        spriteData.align = undefined;

        dispatch("updateSprites");

        block(e);
    }

    callbacks.callback = () => {
        spriteData.sprite = spriteData.sprite;
        spriteData.width = spriteData.width;
        spriteData.height = spriteData.height;
        spriteData.align = spriteData.align;
    };
    callbacks.dropped = () => {
        dropOver = false;
    };

    let size = { x: 1, y: 1 };
    $: spriteData,
        (size = {
            x: spriteData.width / spriteWidth,
            y: spriteData.height / spriteHeight,
        });

    let alignStyle = (align) => {
        return `
            justify-self: ${align.x};
            align-self: ${align.y
                .replace("bottom", "flex-end")
                .replace("top", "flex-start")};`;
    };

    function updateAlignment(event) {
        if (
            spriteData.align?.x === event.detail.align.x &&
            spriteData.align?.y === event.detail.align.y
        ) {
            spriteData.align = undefined;
        } else {
            spriteData.align = event.detail.align;
        }
        spriteData = spriteData;
        dispatch("updateSprites");
    }
</script>

<div
    class="sprite-container"
    class:used={spriteData.sprite}
    class:drop={dropOver}
    on:click={() => {
        fileinput.click();
    }}
    on:dragenter={(e) => dragEnter(e)}
    on:dragleave={(e) => dragLeave(e)}
    on:dragend={(e) => dragLeave(e)}
>
    <input
        style="display:none"
        type="file"
        multiple
        accept=".jpg, .jpeg, .png"
        on:change={(e) => onFileSelected(e)}
        bind:this={fileinput}
    />
    <div class="align" on:click={block}>
        <Align align={spriteData.align} on:change={updateAlignment} />
    </div>
    <span class="delete" on:click={clear} />
    {#if spriteData.sprite}
        <img
            style="width: {100 * size.x}%; height: {100 * size.y}%; {alignStyle(
                spriteData.align || align
            )}"
            class="sprite"
            class:pixelated
            src={spriteData.sprite}
            alt=""
            draggable="false"
        />
    {:else}
        <span class="coordinates">{spriteData.x} - {spriteData.y}</span>
    {/if}
</div>

<style>
    .sprite-container {
        width: 100%;
        height: 100%;
        background-color: #0002;
        position: relative;
        display: grid;
        user-select: none;
        overflow: hidden;
    }

    .sprite-container:hover {
        background-color: #0003;
    }

    .drop {
        background-color: #0004;
    }

    div:hover .delete {
        opacity: 0.5;
    }

    .align {
        position: absolute;
        top: 0.1em;
        left: 0.1em;
        opacity: 0;
        padding: 0.1em;
        border-radius: 2px;
    }

    .used:hover .align {
        opacity: 1;
    }

    .used:hover .align:hover {
        opacity: 1;
    }

    .delete {
        position: absolute;
        top: 0.1em;
        right: 0.1em;

        width: 1em;
        height: 1em;
        padding: 0;
        margin: 0;

        opacity: 0;
        transition: opacity 0.1s 0s ease;
    }

    div .delete:hover {
        opacity: 1;
    }

    .delete:before,
    .delete:after {
        position: absolute;
        content: " ";
        height: 1em;
        width: 1px;
        background-color: var(--t100);
    }
    .delete:before {
        transform: rotate(45deg);
    }
    .delete:after {
        transform: rotate(-45deg);
    }

    .sprite {
        user-select: none;
    }

    .sprite-container:hover .sprite {
        box-shadow: inset 0px 0px 0px 1px hsl(var(--theme-hsl), 25%);
    }

    .pixelated {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .coordinates {
        align-self: center;
        justify-self: center;
        opacity: 0.25;
    }
</style>
