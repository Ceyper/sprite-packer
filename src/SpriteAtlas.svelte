<script>
    import Sprite from "./Sprite.svelte";
    import { fade } from "svelte/transition";
    import { cubicInOut } from 'svelte/easing';

    import { sprites } from "./store.js";
    import { width, height } from "./store.js";
    import { align } from "./store.js";

    let spriteCallbacks = [];

    let spriteRatio = 1;

    let spriteWidth = 16;
    let spriteHeight = 16;

    function recalcSpriteSize(sprites) {
        spriteWidth = 0;
        spriteHeight = 0;
        sprites.forEach((sprite) => {
            spriteWidth = Math.max(spriteWidth, sprite.width || 0);
            spriteHeight = Math.max(spriteHeight, sprite.height || 0);
        });
        spriteRatio = spriteWidth / spriteHeight || 1;
    }

    function reconstructSprites(width, height, copyOld = true) {
        if (!sprites.loaded) return;
        const oldSprites = $sprites;
        let newSprites = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let old = {};
                if (copyOld) {
                    let index = x + y * width;
                    if (index < oldSprites.length) {
                        old.sprite = oldSprites[index].sprite;
                        old.width = oldSprites[index].width;
                        old.height = oldSprites[index].height;
                        old.align = oldSprites[index].align;
                    }
                }
                newSprites.push({ x, y, ...old });
                spriteCallbacks.push({callback: undefined, dropped: undefined});
            }
        }

        $sprites = newSprites;
    }

    $: $sprites, reconstructSprites($width, $height);
    sprites.subscribe((sprites) => {
        recalcSpriteSize(sprites);
    });

    function changeSprites(event) {
        const { origin, files } = event.detail;

        const start = origin.x + origin.y * $width;
        let tmpSprites = $sprites;
        for (let i = 0; i < files.length; i++) {
            if (start + i >= tmpSprites.length) continue;

            let image = files[i];
            let reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = (e) => {
                tmpSprites[start + i].sprite = e.target.result;

                let image = new Image();
                tmpSprites[start + i].width = undefined;
                tmpSprites[start + i].height = undefined;
                tmpSprites[start + i].align = undefined;

                image.onload = (e) => {
                    tmpSprites[start + i].width = image.width;
                    tmpSprites[start + i].height = image.height;

                    spriteCallbacks[start + i].callback();
                    sprites.save();
                    recalcSpriteSize($sprites);
                };
                image.src = e.target.result;
            };
        }
    }

    function updateSprites() {
        sprites.save();
        recalcSpriteSize($sprites);
    }

    export function clear() {
        reconstructSprites($width, $height, false);
    }

    export function download() {
        let canvas = document.createElement("canvas");
        canvas.width = spriteWidth * $width;
        canvas.height = spriteHeight * $height;
        let image = new Image();

        let ctx = canvas.getContext("2d");
        for (let y = 0; y < $height; y++) {
            for (let x = 0; x < $width; x++) {
                const index = x + y * $width;
                const { sprite, width, height } = $sprites[index];
                if (!sprite) continue;

                image.src = sprite;

                let dx = x * spriteWidth;
                let dy = y * spriteHeight;

                let ox = 0, oy = 0;
                let a = $sprites[index].align || $align;
                if (a.x == "left") {
                    ox = 0;
                } else if (a.x == "center") {
                    ox = (spriteWidth - width) / 2;
                } else if (a.x == "right") {
                    ox = spriteWidth - width;
                }

                if (a.y == "top") {
                    oy = 0;
                } else if (a.y == "center") {
                    oy = (spriteHeight - height) / 2;
                } else if (a.y == "bottom") {
                    oy = spriteHeight - height;
                }

                ctx.drawImage(image, dx + ox, dy + oy);
            }
        }

        image = canvas
            .toDataURL("image/png", 1.0)
            .replace("image/png", "image/octet-stream");
        let link = document.createElement("a");
        link.download = "atlas.png";
        link.href = image;
        link.click();
    }

    let current = undefined;
    function dragStart(e, sprite) {
        if (sprite.sprite) {
            current = sprite;
        } else {
            e.preventDefault();
            return false;
        }
    }

    function dragEnd(e, sprite) {
        current = undefined;
    }

    function dragDrop(e, sprite) {
        e.preventDefault();

        spriteCallbacks.forEach((cb) => {
            cb.dropped();
        });

        if (e.dataTransfer.files.length > 0) {
            changeSprites({
                detail: {
                    files: e.dataTransfer.files,
                    origin: {
                        x: sprite.x,
                        y: sprite.y,
                    },
                },
            });

            return;
        }

        let tmp = { ...current };
        current.sprite = sprite.sprite;
        current.width = sprite.width;
        current.height = sprite.height;
        current.align = sprite.align;

        sprite.sprite = tmp.sprite;
        sprite.width = tmp.width;
        sprite.height = tmp.height;
        sprite.align = tmp.align;


        spriteCallbacks[current.x + current.y * width.value].callback();
        spriteCallbacks[sprite.x + sprite.y * width.value].callback();

        current = undefined;
        sprites.save();
    }

    function scaley(node, { duration }) {
		return {
			duration,
			css: t => {
				const eased = cubicInOut(t);

                const baseScale = 0.7;

				return `
                    opacity: ${eased};
                    transform-origin: top center;
					transform: scaleY(${baseScale + eased * (1.0 - baseScale)});`
			}
		};
	}
</script>

<div class="sprite-atlas-container">
{#await sprites.await}
    <div class="loading" transition:fade />
{:then}
    <div
        transition:fade={{duration: 250}}
        class="sprite-atlas"
        style="grid-template-columns: repeat({$width}, 1fr); --ratio: {spriteRatio}"
    >
        {#each $sprites as sprite, i}
            <div
                class="sprite"
                on:dragstart={(e) => dragStart(e, sprite)}
                on:dragend={(e) => dragEnd(e, sprite)}
                on:drop={(e) => dragDrop(e, sprite)}
                ondragover="return false"
                draggable="true"
            >
                <Sprite
                    spriteData={sprite}
                    {spriteWidth}
                    {spriteHeight}
                    align={$align}
                    callbacks={spriteCallbacks[i]}
                    on:changeSprites={changeSprites}
                    on:updateSprites={updateSprites}
                />
            </div>
        {/each}
    </div>
{/await}
</div>

<style>
    .sprite-atlas-container {
        min-height: 80vh;
    }

    .loading {
        height: 100%;
        background: blue;
    }

    .sprite-atlas {
        display: grid;
        gap: 2px;
    }

    .sprite {
        aspect-ratio: var(--ratio);
    }
</style>
